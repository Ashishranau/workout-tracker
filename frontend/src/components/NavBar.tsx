import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-zinc-800 bg-black px-6 py-4">
      <Link to="/" className="font-semibold text-white">
        Strength Analytics
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/log" className="text-zinc-400 hover:text-emerald-400">
            Log Workout
          </Link>
          <Link to="/progress" className="text-zinc-400 hover:text-emerald-400">
            Progress
          </Link>
          <span className="text-zinc-500">{user.email}</span>
          <button onClick={logout} className="text-zinc-400 hover:text-emerald-400">
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
