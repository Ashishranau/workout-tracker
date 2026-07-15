import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createExercise, listExercises } from "../api/exercises";
import { addSet, createSession } from "../api/workouts";
import type { ExerciseCategory, WorkoutSession } from "../api/types";

const inputClass =
  "mt-1 block rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none";

const NEW_EXERCISE_VALUE = "__new__";

export function LogWorkoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: exercises } = useQuery({ queryKey: ["exercises"], queryFn: listExercises });

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [exerciseId, setExerciseId] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [setError, setSetError] = useState<string | null>(null);

  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseCategory, setNewExerciseCategory] = useState<ExerciseCategory>("barbell");
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState("");
  const [newExerciseError, setNewExerciseError] = useState<string | null>(null);

  const createExerciseMutation = useMutation({
    mutationFn: () =>
      createExercise({
        name: newExerciseName,
        category: newExerciseCategory,
        primary_muscle_group: newExerciseMuscleGroup || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      setExerciseId(created.id);
      setIsAddingExercise(false);
      setNewExerciseName("");
      setNewExerciseMuscleGroup("");
      setNewExerciseError(null);
    },
    onError: () => {
      setNewExerciseError("Could not create exercise - that name may already exist");
    },
  });

  async function handleCreateSession(e: FormEvent) {
    e.preventDefault();
    const created = await createSession({ date, notes: notes || undefined });
    setSession(created);
  }

  async function handleAddSet(e: FormEvent) {
    e.preventDefault();
    if (!session || exerciseId === "") return;
    setSetError(null);
    try {
      const newSet = await addSet(session.id, {
        exercise_id: exerciseId,
        set_number: session.sets.length + 1,
        weight_kg: Number(weightKg),
        reps: Number(reps),
        rpe: rpe ? Number(rpe) : undefined,
      });
      setSession({ ...session, sets: [...session.sets, newSet] });
      setWeightKg("");
      setReps("");
      setRpe("");
    } catch {
      setSetError("Could not add set - check the values and try again");
    }
  }

  if (!session) {
    return (
      <div className="max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-white">Start a workout</h1>
        <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
          <label className="text-sm text-zinc-400">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={`${inputClass} w-full`}
            />
          </label>
          <label className="text-sm text-zinc-400">
            Notes (optional)
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. leg day"
              className={`${inputClass} w-full`}
            />
          </label>
          <button
            type="submit"
            className="rounded bg-emerald-500 py-2 text-black font-medium hover:bg-emerald-400"
          >
            Start
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-2xl font-semibold text-white">{session.date}</h1>
      {session.notes && <p className="mb-6 text-zinc-400">{session.notes}</p>}

      {isAddingExercise ? (
        <div className="mb-4 rounded border border-zinc-800 bg-zinc-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">Add new exercise</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-zinc-400">
              Name
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="e.g. Trap Bar Deadlift"
                className={`${inputClass} w-56`}
              />
            </label>
            <label className="text-sm text-zinc-400">
              Category
              <select
                value={newExerciseCategory}
                onChange={(e) => setNewExerciseCategory(e.target.value as ExerciseCategory)}
                className={inputClass}
              >
                <option value="barbell">Barbell</option>
                <option value="dumbbell">Dumbbell</option>
                <option value="machine">Machine</option>
                <option value="bodyweight">Bodyweight</option>
              </select>
            </label>
            <label className="text-sm text-zinc-400">
              Muscle group (optional)
              <input
                type="text"
                value={newExerciseMuscleGroup}
                onChange={(e) => setNewExerciseMuscleGroup(e.target.value)}
                placeholder="e.g. legs"
                className={`${inputClass} w-32`}
              />
            </label>
            <button
              type="button"
              onClick={() => createExerciseMutation.mutate()}
              disabled={!newExerciseName || createExerciseMutation.isPending}
              className="rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingExercise(false);
                setNewExerciseError(null);
              }}
              className="text-sm text-zinc-400 underline hover:text-white"
            >
              Cancel
            </button>
          </div>
          {newExerciseError && (
            <p className="mt-2 text-sm text-red-400">{newExerciseError}</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleAddSet} className="mb-4 flex flex-wrap items-end gap-3">
          <label className="text-sm text-zinc-400">
            Exercise
            <select
              value={exerciseId}
              onChange={(e) => {
                if (e.target.value === NEW_EXERCISE_VALUE) {
                  setIsAddingExercise(true);
                  return;
                }
                setExerciseId(Number(e.target.value));
              }}
              required
              className={inputClass}
            >
              <option value="" disabled>
                Select...
              </option>
              {exercises?.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                  {ex.is_custom ? " (custom)" : ""}
                </option>
              ))}
              <option value={NEW_EXERCISE_VALUE}>+ Add new exercise...</option>
            </select>
          </label>
          <label className="text-sm text-zinc-400">
            Weight (kg)
            <input
              type="number"
              step="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              required
              className={`${inputClass} w-24`}
            />
          </label>
          <label className="text-sm text-zinc-400">
            Reps
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
              className={`${inputClass} w-20`}
            />
          </label>
          <label className="text-sm text-zinc-400">
            RPE
            <input
              type="number"
              step="0.5"
              value={rpe}
              onChange={(e) => setRpe(e.target.value)}
              className={`${inputClass} w-20`}
            />
          </label>
          <button
            type="submit"
            className="rounded bg-emerald-500 px-4 py-2 text-black font-medium hover:bg-emerald-400"
          >
            Add set
          </button>
        </form>
      )}
      {setError && <p className="mb-4 text-sm text-red-400">{setError}</p>}

      <ul className="flex flex-col gap-2">
        {session.sets.map((s) => {
          const exercise = exercises?.find((ex) => ex.id === s.exercise_id);
          return (
            <li
              key={s.id}
              className="rounded border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300"
            >
              <span className="font-medium text-white">
                {exercise?.name ?? `Exercise #${s.exercise_id}`}
              </span>
              {" — "}
              {s.weight_kg}kg × {s.reps}
              {s.rpe ? ` @ RPE ${s.rpe}` : ""}
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => navigate("/")}
        className="mt-6 text-sm text-zinc-400 underline hover:text-white"
      >
        Done - back to dashboard
      </button>
    </div>
  );
}
