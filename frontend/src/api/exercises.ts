import { apiClient } from "./client";
import type { Exercise } from "./types";

export async function listExercises(): Promise<Exercise[]> {
  const { data } = await apiClient.get<Exercise[]>("/exercises");
  return data;
}
