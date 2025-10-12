//api helper
export const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3001";

//JSON fetch with cookies included (for httpOnly JWT cookie)
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try { const body = await res.json(); message = body.error || message; } catch {}
    throw new Error(message);
  }
  return res.json();
}
