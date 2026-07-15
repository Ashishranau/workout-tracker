import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <Link to="/" className="font-semibold text-gray-900">
        Strength Analytics
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/log" className="text-gray-600 hover:text-gray-900">
            Log Workout
          </Link>
          <Link to="/progress" className="text-gray-600 hover:text-gray-900">
            Progress
          </Link>
          <span className="text-gray-400">{user.email}</span>
          <button onClick={logout} className="text-gray-600 hover:text-gray-900">
            Log out
          </button>
        </div>
      )}
    </nav>
  );
}
