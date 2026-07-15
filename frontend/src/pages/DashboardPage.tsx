import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listSessions } from "../api/workouts";
import { BodyweightWidget } from "../components/BodyweightWidget";

export function DashboardPage() {
  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery({ queryKey: ["sessions"], queryFn: listSessions });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Your Workouts</h1>
        <Link
          to="/log"
          className="rounded bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400"
        >
          Log a Workout
        </Link>
      </div>

      <div className="mb-6">
        <BodyweightWidget />
      </div>

      {isLoading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-400">Failed to load sessions.</p>}
      {sessions && sessions.length === 0 && (
        <p className="text-slate-500">No workouts logged yet.</p>
      )}

      <ul className="flex flex-col gap-3">
        {sessions
          ?.slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((session) => (
            <li key={session.id}>
              <Link
                to={`/sessions/${session.id}`}
                className="block rounded border border-slate-800 bg-slate-900 p-4 hover:border-slate-600"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{session.date}</span>
                  <span className="text-sm text-slate-500">{session.sets.length} sets</span>
                </div>
                {session.notes && (
                  <p className="mt-1 text-sm text-slate-400">{session.notes}</p>
                )}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
