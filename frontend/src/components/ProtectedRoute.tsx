import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps routes that require login. Outlet renders whichever nested route
// matched; redirecting to /login happens here in one place instead of being
// repeated inside every page component.
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p className="mt-24 text-center text-zinc-500">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
