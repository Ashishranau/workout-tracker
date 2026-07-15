import bisect
import sys
from datetime import date
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.bodyweight import BodyweightLog
from app.models.exercise import Exercise
from app.models.user import User
from app.models.workout import WorkoutSession, WorkoutSet

# The C++ engine is built separately (see cpp_engine/CMakeLists.txt) and produces
# a compiled extension module (.pyd on Windows, .so on Linux) that isn't a normal
# installed package - so we add its build output directory to sys.path directly.
_CPP_BUILD_DIR = Path(__file__).resolve().parents[3] / "cpp_engine" / "build" / "Release"
if str(_CPP_BUILD_DIR) not in sys.path:
    sys.path.insert(0, str(_CPP_BUILD_DIR))

import analytics_engine as _engine  # noqa: E402

# 1RM formulas are only reliable in this rep range - sets outside it are excluded
# from any trend/estimate computation rather than silently distorting the result.
_RELIABLE_REP_RANGE = range(1, 13)

# A set only counts toward the 1RM trend if it was a genuine effort. RPE 8+
# (2 or fewer reps in reserve) qualifies; missing RPE is treated as qualifying
# too, since most logged sets so far have no RPE recorded at all - explicitly
# logged low-RPE sets (warmups, deload work) are what actually gets excluded.
_MIN_QUALIFYING_RPE = 8.0


def estimate_one_rep_max(weight_kg: float, reps: int) -> dict:
    result = _engine.estimate_one_rep_max(weight_kg, reps)
    return {
        "epley": result.epley,
        "brzycki": result.brzycki,
        "average": result.average,
    }


def _rpe_qualifies(rpe) -> bool:
    return rpe is None or float(rpe) >= _MIN_QUALIFYING_RPE


def _best_sets_by_day(db: Session, user_id: int, exercise_id: int) -> dict:
    """Best (highest estimated 1RM) qualifying set per day for an exercise.

    Returns {date: {"weight_kg", "reps", "rpe", "estimate"}}. A set qualifies
    if its reps are in the reliable estimation range and its RPE doesn't mark
    it as a deliberately submaximal effort (see _rpe_qualifies).
    """
    rows = (
        db.query(WorkoutSession.date, WorkoutSet.weight_kg, WorkoutSet.reps, WorkoutSet.rpe)
        .join(WorkoutSet, WorkoutSet.session_id == WorkoutSession.id)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSet.exercise_id == exercise_id,
        )
        .order_by(WorkoutSession.date)
        .all()
    )

    best_per_day: dict = {}
    for session_date, weight_kg, reps, rpe in rows:
        if reps not in _RELIABLE_REP_RANGE or not _rpe_qualifies(rpe):
            continue
        weight_kg = float(weight_kg)
        estimate = _engine.estimate_one_rep_max(weight_kg, reps).average
        current_best = best_per_day.get(session_date)
        if current_best is None or estimate > current_best["estimate"]:
            best_per_day[session_date] = {
                "weight_kg": weight_kg,
                "reps": reps,
                "rpe": float(rpe) if rpe is not None else None,
                "estimate": estimate,
            }
    return best_per_day


def _sorted_bodyweight(db: Session, user_id: int) -> tuple[list, list]:
    logs = (
        db.query(BodyweightLog.date, BodyweightLog.weight_kg)
        .filter(BodyweightLog.user_id == user_id)
        .order_by(BodyweightLog.date)
        .all()
    )
    dates = [d for d, _ in logs]
    weights = [float(w) for _, w in logs]
    return dates, weights


def _bodyweight_as_of(dates: list, weights: list, target_date: date) -> float | None:
    """Most recent logged bodyweight on or before target_date, or None if
    nothing was logged that early yet."""
    idx = bisect.bisect_right(dates, target_date) - 1
    if idx < 0:
        return None
    return weights[idx]


def analyze_plateau(
    db: Session,
    user_id: int,
    exercise_id: int,
    threshold_percent_per_week: float = 0.5,
) -> dict:
    best_per_day = _best_sets_by_day(db, user_id, exercise_id)
    if not best_per_day:
        raise ValueError(
            "No qualifying sets for this exercise (1-12 reps, RPE 8+ or unlogged)"
        )

    sorted_dates = sorted(best_per_day)
    first_date = sorted_dates[0]
    days = [(d - first_date).days for d in sorted_dates]
    one_rep_maxes = [best_per_day[d]["estimate"] for d in sorted_dates]

    bodyweight_dates, bodyweight_values = _sorted_bodyweight(db, user_id)

    result = _engine.detect_plateau(days, one_rep_maxes, threshold_percent_per_week)
    return {
        "is_plateaued": result.is_plateaued,
        "slope_per_week": result.slope_per_week,
        "percent_change_per_week": result.percent_change_per_week,
        "sessions_used": result.sessions_used,
        "history": [
            {
                "date": d,
                "estimated_one_rep_max": best_per_day[d]["estimate"],
                "rpe": best_per_day[d]["rpe"],
                "bodyweight_kg": _bodyweight_as_of(bodyweight_dates, bodyweight_values, d),
            }
            for d in sorted_dates
        ],
    }


def classify_strength_standard(
    db: Session,
    user: User,
    exercise_id: int,
    weight_kg: float,
    reps: int,
) -> dict:
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if exercise is None:
        raise ValueError("Exercise not found")

    latest_bodyweight = (
        db.query(BodyweightLog)
        .filter(BodyweightLog.user_id == user.id)
        .order_by(BodyweightLog.date.desc())
        .first()
    )
    if latest_bodyweight is None:
        raise ValueError("Log your bodyweight before requesting a strength standard")

    one_rep_max = _engine.estimate_one_rep_max(weight_kg, reps).average
    bodyweight_kg = float(latest_bodyweight.weight_kg)
    result = _engine.classify_strength_standard(
        exercise.name, user.sex.value, one_rep_max, bodyweight_kg
    )
    if not result.supported:
        raise ValueError(f"No strength standard defined for '{exercise.name}'")

    return {
        "tier": result.tier,
        "bodyweight_ratio": result.bodyweight_ratio,
        "bodyweight_kg": bodyweight_kg,
        "estimated_one_rep_max": one_rep_max,
    }


def get_current_strength_standard(db: Session, user: User, exercise_id: int) -> dict:
    """Strength standard from the most recent qualifying set for this exercise -
    no manual weight/reps entry needed."""
    best_per_day = _best_sets_by_day(db, user.id, exercise_id)
    if not best_per_day:
        raise ValueError(
            "No qualifying sets for this exercise yet (1-12 reps, RPE 8+ or unlogged)"
        )

    most_recent_date = max(best_per_day)
    best_set = best_per_day[most_recent_date]
    result = classify_strength_standard(
        db, user, exercise_id, best_set["weight_kg"], best_set["reps"]
    )
    result["as_of_date"] = most_recent_date
    return result
