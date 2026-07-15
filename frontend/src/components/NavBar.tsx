import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
      <Link to="/" className="font-semibold text-white">
        Strength Analytics
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/log" className="text-slate-400 hover:text-white">
            Log Workout
          </Link>
          <Link to="/progress" className="text-slate-400 hover:text-white">
            Progress
          </Link>
          <span className="text-slate-500">{user.email}</span>
          <button onClick={logout} className="text-slate-400 hover:text-white">
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
