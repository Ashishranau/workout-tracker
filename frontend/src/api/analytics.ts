import { apiClient } from "./client";
import type { OneRepMaxResult, PlateauResult, StrengthStandardResult } from "./types";

export async function estimateOneRepMax(
  weightKg: number,
  reps: number
): Promise<OneRepMaxResult> {
  const { data } = await apiClient.post<OneRepMaxResult>("/analytics/one-rep-max", {
    weight_kg: weightKg,
    reps,
  });
  return data;
}

export async function getPlateau(exerciseId: number): Promise<PlateauResult> {
  const { data } = await apiClient.get<PlateauResult>(`/analytics/plateau/${exerciseId}`);
  return data;
}

export async function getStrengthStandard(
  exerciseId: number,
  weightKg: number,
  reps: number
): Promise<StrengthStandardResult> {
  const { data } = await apiClient.post<StrengthStandardResult>(
    "/analytics/strength-standard",
    { exercise_id: exerciseId, weight_kg: weightKg, reps }
  );
  return data;
}
