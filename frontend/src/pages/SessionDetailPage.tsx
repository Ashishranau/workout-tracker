import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getSession } from "../api/workouts";
import { listExercises } from "../api/exercises";

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSession(sessionId),
  });
  const { data: exercises } = useQuery({ queryKey: ["exercises"], queryFn: listExercises });

  return (
    <div className="max-w-lg">
      <Link
        to="/"
        className="mb-4 inline-block text-sm text-slate-400 underline hover:text-slate-200"
      >
        ← Back to dashboard
      </Link>

      {isLoading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-400">Could not load this workout.</p>}

      {session && (
        <>
          <h1 className="mb-1 text-2xl font-semibold text-white">{session.date}</h1>
          {session.notes && <p className="mb-6 text-slate-400">{session.notes}</p>}

          {session.sets.length === 0 && (
            <p className="text-slate-500">No sets logged for this workout.</p>
          )}

          <ul className="flex flex-col gap-2">
            {session.sets.map((s) => {
              const exercise = exercises?.find((ex) => ex.id === s.exercise_id);
              return (
                <li
                  key={s.id}
                  className="rounded border border-slate-800 bg-slate-900 p-3 text-sm text-slate-300"
                >
                  <span className="font-medium text-white">
                    {exercise?.name ?? `Exercise #${s.exercise_id}`}
                  </span>
                  {" — "}
                  {s.weight_kg}kg × {s.reps}
                  {s.rpe ? ` @ RPE ${s.rpe}` : " (RPE not logged)"}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
