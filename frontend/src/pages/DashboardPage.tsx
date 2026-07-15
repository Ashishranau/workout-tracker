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
        <h1 className="text-2xl font-semibold text-gray-900">Your Workouts</h1>
        <Link to="/log" className="rounded bg-gray-900 px-4 py-2 text-sm text-white">
          Log a Workout
        </Link>
      </div>

      <div className="mb-6">
        <BodyweightWidget />
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">Failed to load sessions.</p>}
      {sessions && sessions.length === 0 && (
        <p className="text-gray-500">No workouts logged yet.</p>
      )}

      <ul className="flex flex-col gap-3">
        {sessions
          ?.slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((session) => (
            <li key={session.id} className="rounded border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{session.date}</span>
                <span className="text-sm text-gray-500">{session.sets.length} sets</span>
              </div>
              {session.notes && <p className="mt-1 text-sm text-gray-600">{session.notes}</p>}
            </li>
          ))}
      </ul>
    </div>
  );
}
