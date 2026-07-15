"""Seeds the curated exercise catalog. Safe to re-run - skips exercises that already exist."""

from app.database import SessionLocal
from app.models.exercise import Exercise, ExerciseCategory

EXERCISES = [
    # Barbell lifts with strength-standard tiers defined in cpp_engine/strength_standard.cpp -
    # names must match exactly, do not rename these five.
    ("Barbell Back Squat", ExerciseCategory.barbell, "legs"),
    ("Barbell Bench Press", ExerciseCategory.barbell, "chest"),
    ("Conventional Deadlift", ExerciseCategory.barbell, "back"),
    ("Overhead Press", ExerciseCategory.barbell, "shoulders"),
    ("Barbell Row", ExerciseCategory.barbell, "back"),
    # Additional barbell
    ("Front Squat", ExerciseCategory.barbell, "legs"),
    ("Romanian Deadlift", ExerciseCategory.barbell, "hamstrings"),
    ("Sumo Deadlift", ExerciseCategory.barbell, "legs"),
    ("Incline Bench Press", ExerciseCategory.barbell, "chest"),
    ("Close-Grip Bench Press", ExerciseCategory.barbell, "triceps"),
    ("Push Press", ExerciseCategory.barbell, "shoulders"),
    ("Barbell Hip Thrust", ExerciseCategory.barbell, "glutes"),
    ("Barbell Curl", ExerciseCategory.barbell, "biceps"),
    # Dumbbell
    ("Dumbbell Bench Press", ExerciseCategory.dumbbell, "chest"),
    ("Dumbbell Shoulder Press", ExerciseCategory.dumbbell, "shoulders"),
    ("Dumbbell Row", ExerciseCategory.dumbbell, "back"),
    ("Dumbbell Incline Bench Press", ExerciseCategory.dumbbell, "chest"),
    ("Dumbbell Lateral Raise", ExerciseCategory.dumbbell, "shoulders"),
    ("Dumbbell Bicep Curl", ExerciseCategory.dumbbell, "biceps"),
    ("Dumbbell Romanian Deadlift", ExerciseCategory.dumbbell, "hamstrings"),
    ("Goblet Squat", ExerciseCategory.dumbbell, "legs"),
    ("Dumbbell Lunge", ExerciseCategory.dumbbell, "legs"),
    ("Dumbbell Fly", ExerciseCategory.dumbbell, "chest"),
    # Machine / cable
    ("Leg Press", ExerciseCategory.machine, "legs"),
    ("Lat Pulldown", ExerciseCategory.machine, "back"),
    ("Leg Curl", ExerciseCategory.machine, "hamstrings"),
    ("Leg Extension", ExerciseCategory.machine, "quads"),
    ("Cable Tricep Pushdown", ExerciseCategory.machine, "triceps"),
    ("Cable Fly", ExerciseCategory.machine, "chest"),
    ("Seated Cable Row", ExerciseCategory.machine, "back"),
    ("Chest Press Machine", ExerciseCategory.machine, "chest"),
    ("Shoulder Press Machine", ExerciseCategory.machine, "shoulders"),
    ("Cable Bicep Curl", ExerciseCategory.machine, "biceps"),
    # Bodyweight
    ("Pull-Up", ExerciseCategory.bodyweight, "back"),
    ("Chin-Up", ExerciseCategory.bodyweight, "back"),
    ("Push-Up", ExerciseCategory.bodyweight, "chest"),
    ("Dip", ExerciseCategory.bodyweight, "triceps"),
]


def seed():
    db = SessionLocal()
    try:
        existing_names = {name for (name,) in db.query(Exercise.name).all()}
        added = 0
        for name, category, muscle_group in EXERCISES:
            if name in existing_names:
                continue
            db.add(Exercise(name=name, category=category, primary_muscle_group=muscle_group))
            added += 1
        db.commit()
        print(f"Seeded {added} new exercise(s); {len(existing_names)} already present.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
