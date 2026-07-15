import { apiClient } from "./client";
import type {
  WorkoutSession,
  WorkoutSessionCreate,
  WorkoutSet,
  WorkoutSetCreate,
} from "./types";

export async function listSessions(): Promise<WorkoutSession[]> {
  const { data } = await apiClient.get<WorkoutSession[]>("/sessions");
  return data;
}

export async function createSession(payload: WorkoutSessionCreate): Promise<WorkoutSession> {
  const { data } = await apiClient.post<WorkoutSession>("/sessions", payload);
  return data;
}

export async function getSession(id: number): Promise<WorkoutSession> {
  const { data } = await apiClient.get<WorkoutSession>(`/sessions/${id}`);
  return data;
}

export async function addSet(
  sessionId: number,
  payload: WorkoutSetCreate
): Promise<WorkoutSet> {
  const { data } = await apiClient.post<WorkoutSet>(`/sessions/${sessionId}/sets`, payload);
  return data;
}
