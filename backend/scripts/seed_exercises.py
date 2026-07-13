"""Seeds the curated exercise catalog. Safe to re-run - skips exercises that already exist."""

from app.database import SessionLocal
from app.models.exercise import Exercise, ExerciseCategory

EXERCISES = [
    ("Barbell Back Squat", ExerciseCategory.barbell, "legs"),
    ("Barbell Bench Press", ExerciseCategory.barbell, "chest"),
    ("Conventional Deadlift", ExerciseCategory.barbell, "back"),
    ("Overhead Press", ExerciseCategory.barbell, "shoulders"),
    ("Barbell Row", ExerciseCategory.barbell, "back"),
    ("Pull-Up", ExerciseCategory.bodyweight, "back"),
    ("Dumbbell Bench Press", ExerciseCategory.dumbbell, "chest"),
    ("Dumbbell Shoulder Press", ExerciseCategory.dumbbell, "shoulders"),
    ("Leg Press", ExerciseCategory.machine, "legs"),
    ("Lat Pulldown", ExerciseCategory.machine, "back"),
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
