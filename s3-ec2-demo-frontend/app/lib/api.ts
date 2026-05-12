import { getToken } from "./auth";

export type Post = {
  id: number;
  title: string;
  description: string;
  file_url: string | null;
  file_type: string | null;
  author: string;
  created_at: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // Don't set Content-Type for FormData — browser sets it with the boundary
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`/api${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  register: (data: { username: string; email: string; password: string }) =>
    request<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { username: string; password: string }) =>
    request<{ access_token: string; token_type: string; username: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request<AuthUser>("/me"),

  getPosts: () => request<Post[]>("/posts"),

  createPost: (formData: FormData) =>
    request<Post>("/posts", { method: "POST", body: formData }),
};
