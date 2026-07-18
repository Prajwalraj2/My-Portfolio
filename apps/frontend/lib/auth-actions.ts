// Browser auth calls (through the BFF proxy; the sid cookie is relayed to this origin).
import { apiFetch } from "./api.client";

export function login(email: string, password: string) {
  return apiFetch("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(email: string, password: string, name?: string) {
  return apiFetch("auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export function logout() {
  return apiFetch("auth/logout", { method: "POST" });
}
