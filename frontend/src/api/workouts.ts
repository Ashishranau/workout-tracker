import { apiClient } from "./client";
import type {
  WorkoutSession,
  WorkoutSessionCreate,
  WorkoutSessionUpdate,
  WorkoutSet,
  WorkoutSetCreate,
  WorkoutSetUpdate,
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

export async function updateSession(
  id: number,
  payload: WorkoutSessionUpdate
): Promise<WorkoutSession> {
  const { data } = await apiClient.patch<WorkoutSession>(`/sessions/${id}`, payload);
  return data;
}

export async function deleteSession(id: number): Promise<void> {
  await apiClient.delete(`/sessions/${id}`);
}

export async function addSet(
  sessionId: number,
  payload: WorkoutSetCreate
): Promise<WorkoutSet> {
  const { data } = await apiClient.post<WorkoutSet>(`/sessions/${sessionId}/sets`, payload);
  return data;
}

export async function updateSet(
  sessionId: number,
  setId: number,
  payload: WorkoutSetUpdate
): Promise<WorkoutSet> {
  const { data } = await apiClient.patch<WorkoutSet>(
    `/sessions/${sessionId}/sets/${setId}`,
    payload
  );
  return data;
}

export async function deleteSet(sessionId: number, setId: number): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}/sets/${setId}`);
}
