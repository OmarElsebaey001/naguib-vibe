/**
 * API client for communicating with the FastAPI backend.
 * Automatically includes JWT token from localStorage.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token invalid/expired — clear and redirect
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 429) {
    throw new Error("You've hit the rate limit. Please wait a moment and try again.");
  }

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "You don't have permission to do this.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────

export interface TokenResponse {
  token: string;
  user_id: string;
  username: string;
}

export interface UserResponse {
  user_id: string;
  username: string;
  tier: string;
  created_at: string;
}

export function register(username: string, password: string) {
  return request<TokenResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function login(username: string, password: string) {
  return request<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function getMe() {
  return request<UserResponse>("/api/auth/me");
}

// ─── Projects ────────────────────────────────────────────────────────

export interface ProjectSummary {
  id: string;
  name: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  config: Record<string, unknown> | null;
  conversation_history: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export function listProjects() {
  return request<ProjectSummary[]>("/api/projects");
}

export function createProject(name: string) {
  return request<ProjectSummary>("/api/projects", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getProject(id: string) {
  return request<ProjectDetail>(`/api/projects/${id}`);
}

export function updateProject(
  id: string,
  data: {
    config?: Record<string, unknown>;
    conversation_history?: Record<string, unknown>[];
    name?: string;
  }
) {
  return request<ProjectDetail>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteProject(id: string) {
  return request<void>(`/api/projects/${id}`, { method: "DELETE" });
}
