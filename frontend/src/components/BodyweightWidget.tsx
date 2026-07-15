import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listBodyweight, logBodyweight } from "../api/bodyweight";

export function BodyweightWidget() {
  const queryClient = useQueryClient();
  const { data: logs } = useQuery({ queryKey: ["bodyweight"], queryFn: listBodyweight });
  const [weightKg, setWeightKg] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      logBodyweight({
        date: new Date().toISOString().slice(0, 10),
        weight_kg: Number(weightKg),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bodyweight"] });
      setWeightKg("");
    },
  });

  const latest = logs?.[0];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (weightKg) mutation.mutate();
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="mb-2 text-sm font-semibold text-white">Bodyweight</h2>
      {latest ? (
        <p className="mb-3 text-sm text-zinc-400">
          Latest: <span className="font-medium text-zinc-100">{latest.weight_kg}kg</span> on{" "}
          {latest.date}
        </p>
      ) : (
        <p className="mb-3 text-sm text-zinc-500">
          No bodyweight logged yet - needed for strength standards.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          step="0.1"
          placeholder="kg today"
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          className="w-28 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded bg-emerald-500 px-3 py-1 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          Log
        </button>
      </form>
    </div>
  );
}
