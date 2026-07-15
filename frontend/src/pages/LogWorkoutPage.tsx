import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { listExercises } from "../api/exercises";
import { addSet, createSession } from "../api/workouts";
import type { WorkoutSession } from "../api/types";

export function LogWorkoutPage() {
  const navigate = useNavigate();
  const { data: exercises } = useQuery({ queryKey: ["exercises"], queryFn: listExercises });

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  const [exerciseId, setExerciseId] = useState<number | "">("");
  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState("");
  const [setError, setSetError] = useState<string | null>(null);

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
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Start a workout</h1>
        <form onSubmit={handleCreateSession} className="flex flex-col gap-4">
          <label className="text-sm text-gray-600">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-gray-600">
            Notes (optional)
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. leg day"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded bg-gray-900 py-2 text-white">
            Start
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">{session.date}</h1>
      {session.notes && <p className="mb-6 text-gray-600">{session.notes}</p>}

      <form onSubmit={handleAddSet} className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-sm text-gray-600">
          Exercise
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(Number(e.target.value))}
            required
            className="mt-1 block rounded border border-gray-300 px-3 py-2"
          >
            <option value="" disabled>
              Select...
            </option>
            {exercises?.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-gray-600">
          Weight (kg)
          <input
            type="number"
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
            className="mt-1 block w-24 rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-gray-600">
          Reps
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
            className="mt-1 block w-20 rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-gray-600">
          RPE
          <input
            type="number"
            step="0.5"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            className="mt-1 block w-20 rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white">
          Add set
        </button>
      </form>
      {setError && <p className="mb-4 text-sm text-red-600">{setError}</p>}

      <ul className="flex flex-col gap-2">
        {session.sets.map((s) => {
          const exercise = exercises?.find((ex) => ex.id === s.exercise_id);
          return (
            <li key={s.id} className="rounded border border-gray-200 p-3 text-sm">
              <span className="font-medium text-gray-900">
                {exercise?.name ?? `Exercise #${s.exercise_id}`}
              </span>
              {" — "}
              {s.weight_kg}kg × {s.reps}
              {s.rpe ? ` @ RPE ${s.rpe}` : ""}
            </li>
          );
        })}
      </ul>

      <button onClick={() => navigate("/")} className="mt-6 text-sm text-gray-600 underline">
        Done - back to dashboard
      </button>
    </div>
  );
}
