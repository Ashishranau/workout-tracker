import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listExercises } from "../api/exercises";
import {
  getCurrentStrengthStandard,
  getPlateau,
  getStrengthStandard,
} from "../api/analytics";
import type { OneRepMaxHistoryPoint, StrengthStandardResult } from "../api/types";

const inputClass =
  "mt-1 block rounded border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: OneRepMaxHistoryPoint }>;
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded border border-slate-700 bg-slate-800 p-3 text-sm shadow-lg">
      <p className="font-medium text-white">{point.date}</p>
      <p className="text-slate-300">Est. 1RM: {point.estimated_one_rep_max.toFixed(1)}kg</p>
      <p className="text-slate-400">RPE: {point.rpe ?? "not logged"}</p>
      <p className="text-slate-400">
        Bodyweight: {point.bodyweight_kg !== null ? `${point.bodyweight_kg}kg` : "not logged"}
      </p>
    </div>
  );
}

export function ProgressPage() {
  const { data: exercises } = useQuery({ queryKey: ["exercises"], queryFn: listExercises });
  const [exerciseId, setExerciseId] = useState<number | "">("");

  const plateauQuery = useQuery({
    queryKey: ["plateau", exerciseId],
    queryFn: () => getPlateau(exerciseId as number),
    enabled: exerciseId !== "",
    retry: false,
  });

  const currentStandardQuery = useQuery({
    queryKey: ["currentStrengthStandard", exerciseId],
    queryFn: () => getCurrentStrengthStandard(exerciseId as number),
    enabled: exerciseId !== "",
    retry: false,
  });

  const [weightKg, setWeightKg] = useState("");
  const [reps, setReps] = useState("");
  const [standard, setStandard] = useState<StrengthStandardResult | null>(null);
  const [standardError, setStandardError] = useState<string | null>(null);

  async function handleCheckLift(e: FormEvent) {
    e.preventDefault();
    if (exerciseId === "") return;
    setStandardError(null);
    setStandard(null);
    try {
      const result = await getStrengthStandard(exerciseId, Number(weightKg), Number(reps));
      setStandard(result);
    } catch {
      setStandardError(
        "Could not classify this lift - log a bodyweight entry first, or this exercise has no defined standard."
      );
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-white">Progress</h1>

      <label className="mb-6 block text-sm text-slate-400">
        Exercise
        <select
          value={exerciseId}
          onChange={(e) => {
            setExerciseId(Number(e.target.value));
            setStandard(null);
            setStandardError(null);
          }}
          className={`${inputClass} w-full max-w-xs`}
        >
          <option value="" disabled>
            Select an exercise...
          </option>
          {exercises?.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </label>

      {exerciseId !== "" && (
        <>
          <section className="mb-6 rounded border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">Estimated 1RM Trend</h2>

            {plateauQuery.isLoading && <p className="text-sm text-slate-500">Loading...</p>}

            {plateauQuery.isError && (
              <p className="text-sm text-slate-500">
                Not enough qualifying sets for this exercise yet - log at least 3 sessions
                (1-12 reps, RPE 8+ or unlogged) to see a trend.
              </p>
            )}

            {plateauQuery.data && (
              <>
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      plateauQuery.data.is_plateaued
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {plateauQuery.data.is_plateaued ? "Plateaued" : "Improving"}
                  </span>
                  <span className="text-sm text-slate-400">
                    {plateauQuery.data.percent_change_per_week.toFixed(2)}% / week ·{" "}
                    {plateauQuery.data.sessions_used} sessions
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={plateauQuery.data.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      stroke="#475569"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      stroke="#475569"
                      domain={["dataMin - 5", "dataMax + 5"]}
                      tickFormatter={(value: number) => Math.round(value).toString()}
                      unit="kg"
                      width={70}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#475569" }} />
                    <Line
                      type="monotone"
                      dataKey="estimated_one_rep_max"
                      stroke="#818cf8"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#818cf8" }}
                      name="Estimated 1RM (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="mt-2 text-xs text-slate-500">
                  Hover a point to see the RPE and bodyweight behind it.
                </p>
              </>
            )}
          </section>

          <section className="mb-6 rounded border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">Current Strength Tier</h2>
            {currentStandardQuery.isLoading && (
              <p className="text-sm text-slate-500">Loading...</p>
            )}
            {currentStandardQuery.isError && (
              <p className="text-sm text-slate-500">
                No qualifying set logged yet for this exercise, or bodyweight hasn't been
                logged.
              </p>
            )}
            {currentStandardQuery.data && (
              <div className="text-sm text-slate-300">
                <p>
                  Tier:{" "}
                  <span className="font-semibold text-white">
                    {currentStandardQuery.data.tier}
                  </span>
                </p>
                <p>
                  Estimated 1RM: {currentStandardQuery.data.estimated_one_rep_max.toFixed(1)}kg
                  · Ratio: {currentStandardQuery.data.bodyweight_ratio.toFixed(2)}×
                </p>
                <p className="text-xs text-slate-500">
                  As of your {currentStandardQuery.data.as_of_date} session (
                  {currentStandardQuery.data.bodyweight_kg}kg bodyweight)
                </p>
              </div>
            )}
          </section>

          <section className="rounded border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">Check a Hypothetical Lift</h2>
            <form onSubmit={handleCheckLift} className="flex flex-wrap items-end gap-3">
              <label className="text-sm text-slate-400">
                Weight (kg)
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  required
                  className={`${inputClass} w-24`}
                />
              </label>
              <label className="text-sm text-slate-400">
                Reps
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  required
                  className={`${inputClass} w-20`}
                />
              </label>
              <button
                type="submit"
                className="rounded bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400"
              >
                Check
              </button>
            </form>

            {standardError && <p className="mt-3 text-sm text-red-400">{standardError}</p>}

            {standard && (
              <div className="mt-4 text-sm text-slate-300">
                <p>
                  Tier: <span className="font-semibold text-white">{standard.tier}</span>
                </p>
                <p>Estimated 1RM: {standard.estimated_one_rep_max.toFixed(1)}kg</p>
                <p>
                  Bodyweight ratio: {standard.bodyweight_ratio.toFixed(2)}× (at{" "}
                  {standard.bodyweight_kg}kg bodyweight)
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
