import sys
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


def estimate_one_rep_max(weight_kg: float, reps: int) -> dict:
    result = _engine.estimate_one_rep_max(weight_kg, reps)
    return {
        "epley": result.epley,
        "brzycki": result.brzycki,
        "average": result.average,
    }


def analyze_plateau(
    db: Session,
    user_id: int,
    exercise_id: int,
    threshold_percent_per_week: float = 0.5,
) -> dict:
    rows = (
        db.query(WorkoutSession.date, WorkoutSet.weight_kg, WorkoutSet.reps)
        .join(WorkoutSet, WorkoutSet.session_id == WorkoutSession.id)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSet.exercise_id == exercise_id,
        )
        .order_by(WorkoutSession.date)
        .all()
    )
    rows = [row for row in rows if row.reps in _RELIABLE_REP_RANGE]

    if not rows:
        raise ValueError("No sets in the 1-12 rep range logged for this exercise")

    best_per_day: dict = {}
    for session_date, weight_kg, reps in rows:
        estimate = _engine.estimate_one_rep_max(float(weight_kg), reps).average
        if session_date not in best_per_day or estimate > best_per_day[session_date]:
            best_per_day[session_date] = estimate

    sorted_dates = sorted(best_per_day)
    first_date = sorted_dates[0]
    days = [(d - first_date).days for d in sorted_dates]
    one_rep_maxes = [best_per_day[d] for d in sorted_dates]

    result = _engine.detect_plateau(days, one_rep_maxes, threshold_percent_per_week)
    return {
        "is_plateaued": result.is_plateaued,
        "slope_per_week": result.slope_per_week,
        "percent_change_per_week": result.percent_change_per_week,
        "sessions_used": result.sessions_used,
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