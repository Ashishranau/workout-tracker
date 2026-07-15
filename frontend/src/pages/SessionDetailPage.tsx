import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteSession,
  deleteSet,
  getSession,
  updateSession,
  updateSet,
} from "../api/workouts";
import { listExercises } from "../api/exercises";
import type { Exercise, WorkoutSet } from "../api/types";

const inputClass =
  "mt-1 block rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none";

interface SetRowProps {
  sessionId: number;
  set: WorkoutSet;
  exercises: Exercise[] | undefined;
  onChanged: () => void;
}

function SetRow({ sessionId, set, exercises, onChanged }: SetRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [exerciseId, setExerciseId] = useState(set.exercise_id);
  const [weightKg, setWeightKg] = useState(String(set.weight_kg));
  const [reps, setReps] = useState(String(set.reps));
  const [rpe, setRpe] = useState(set.rpe !== null ? String(set.rpe) : "");

  const updateMutation = useMutation({
    mutationFn: () =>
      updateSet(sessionId, set.id, {
        exercise_id: exerciseId,
        weight_kg: Number(weightKg),
        reps: Number(reps),
        rpe: rpe ? Number(rpe) : null,
      }),
    onSuccess: () => {
      setIsEditing(false);
      onChanged();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSet(sessionId, set.id),
    onSuccess: onChanged,
  });

  const exercise = exercises?.find((ex) => ex.id === set.exercise_id);

  if (isEditing) {
    return (
      <li className="rounded border border-zinc-800 bg-zinc-900 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(Number(e.target.value))}
            className={inputClass}
          >
            {exercises?.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className={`${inputClass} w-20`}
          />
          <input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className={`${inputClass} w-16`}
          />
          <input
            type="number"
            step="0.5"
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            placeholder="RPE"
            className={`${inputClass} w-16`}
          />
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="rounded bg-emerald-500 px-3 py-2 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-zinc-400 underline hover:text-white"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">
      <span>
        <span className="font-medium text-white">
          {exercise?.name ?? `Exercise #${set.exercise_id}`}
        </span>
        {" — "}
        {set.weight_kg}kg × {set.reps}
        {set.rpe ? ` @ RPE ${set.rpe}` : ""}
      </span>
      <span className="flex gap-3 text-xs">
        <button
          onClick={() => setIsEditing(true)}
          className="text-zinc-400 underline hover:text-white"
        >
          Edit
        </button>
        <button
          onClick={() => {
            if (window.confirm("Delete this set?")) deleteMutation.mutate();
          }}
          className="text-red-400 underline hover:text-red-300"
        >
          Delete
        </button>
      </span>
    </li>
  );
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId),
  });
  const { data: exercises } = useQuery({ queryKey: ["exercises"], queryFn: listExercises });

  const [isEditingSession, setIsEditingSession] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");

  function startEditingSession() {
    if (!session) return;
    setEditDate(session.date);
    setEditNotes(session.notes ?? "");
    setIsEditingSession(true);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  }

  const updateSessionMutation = useMutation({
    mutationFn: () => updateSession(sessionId, { date: editDate, notes: editNotes || null }),
    onSuccess: () => {
      setIsEditingSession(false);
      invalidate();
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: () => deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      navigate("/");
    },
  });

  return (
    <div className="max-w-lg">
      <Link
        to="/"
        className="mb-4 inline-block text-sm text-zinc-400 underline hover:text-white"
      >
        ← Back to dashboard
      </Link>

      {isLoading && <p className="text-zinc-500">Loading...</p>}
      {error && <p className="text-red-400">Could not load this workout.</p>}

      {session && (
        <>
          {isEditingSession ? (
            <div className="mb-6 flex flex-wrap items-end gap-3">
              <label className="text-sm text-zinc-400">
                Date
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm text-zinc-400">
                Notes
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className={inputClass}
                />
              </label>
              <button
                onClick={() => updateSessionMutation.mutate()}
                disabled={updateSessionMutation.isPending}
                className="rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingSession(false)}
                className="text-sm text-zinc-400 underline hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">{session.date}</h1>
                {session.notes && <p className="text-zinc-400">{session.notes}</p>}
              </div>
              <div className="flex gap-3 text-sm">
                <button
                  onClick={startEditingSession}
                  className="text-zinc-400 underline hover:text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Delete this entire workout and all its sets?")) {
                      deleteSessionMutation.mutate();
                    }
                  }}
                  className="text-red-400 underline hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {session.sets.length === 0 && (
            <p className="text-zinc-500">No sets logged for this workout.</p>
          )}

          <ul className="flex flex-col gap-2">
            {session.sets.map((s) => (
              <SetRow
                key={s.id}
                sessionId={sessionId}
                set={s}
                exercises={exercises}
                onChanged={invalidate}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
