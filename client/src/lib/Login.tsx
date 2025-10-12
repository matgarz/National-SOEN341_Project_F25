import { useState } from "react";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      // on success, go home (or wherever)
      window.location.href = "/";
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <form onSubmit={onSubmit} style={{ width: "100%", maxWidth: 420, border: "1px solid #ddd", borderRadius: 16, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Sign in</h1>

        {error && (
          <div style={{ color: "#b91c1c", fontSize: 14, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@school.ca"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Password</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc", background: "#f8f8f8", cursor: "pointer" }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #111", background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div style={{ fontSize: 13, marginTop: 12, color: "#555" }}>
          Don’t have an account? <a href="/register">Register</a>
        </div>
      </form>
    </div>
  );
}
