import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Sex } from "../api/types";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sex, setSex] = useState<Sex>("male");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(email, password, sex);
      navigate("/");
    } catch {
      setError("Could not register - email may already be in use");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-white">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <select
          value={sex}
          onChange={(e) => setSex(e.target.value as Sex)}
          className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <p className="-mt-2 text-xs text-zinc-500">
          Used for bodyweight-relative strength standards.
        </p>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-emerald-500 py-2 text-black font-medium hover:bg-emerald-400 disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-400">
        Already have an account?{" "}
        <Link to="/login" className="text-emerald-400 underline hover:text-emerald-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
