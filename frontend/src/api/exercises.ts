import { apiClient } from "./client";
import type { Exercise, ExerciseCreate } from "./types";

export async function listExercises(): Promise<Exercise[]> {
  const { data } = await apiClient.get<Exercise[]>("/exercises");
  return data;
}

export async function createExercise(payload: ExerciseCreate): Promise<Exercise> {
  const { data } = await apiClient.post<Exercise>("/exercises", payload);
  return data;
}
