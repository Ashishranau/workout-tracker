import { apiClient } from "./client";
import type { Sex, Token, User } from "./types";

export async function register(email: string, password: string, sex: Sex): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", { email, password, sex });
  return data;
}

export async function login(email: string, password: string): Promise<Token> {
  // The backend's OAuth2PasswordRequestForm expects form-encoded data with a
  // "username" field (a spec convention) - not JSON, and not "email".
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);

  const { data } = await apiClient.post<Token>("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/users/me");
  return data;
}
