import { apiClient } from "./client";
import type { BodyweightLog, BodyweightLogCreate } from "./types";

export async function listBodyweight(): Promise<BodyweightLog[]> {
  const { data } = await apiClient.get<BodyweightLog[]>("/users/me/bodyweight");
  return data;
}

export async function logBodyweight(payload: BodyweightLogCreate): Promise<BodyweightLog> {
  const { data } = await apiClient.post<BodyweightLog>("/users/me/bodyweight", payload);
  return data;
}
