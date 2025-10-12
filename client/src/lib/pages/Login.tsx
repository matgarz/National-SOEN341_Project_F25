import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: call API when backend is ready
    // e.g., wait api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    window.location.href = "/"; // temp redirect on “success”
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <form onSubmit={onSubmit} style={{ width: 360, border: "1px solid #ddd", padding: 20, borderRadius: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Sign in</h1>

        <label style={{ display: "block", marginBottom: 10 }}>
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}/>
        </label>

        <label style={{ display: "block", marginBottom: 16 }}>
          <span>Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}/>
        </label>

        <button style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #111", background: "#111", color: "#fff" }}>
          Sign in
        </button>
      </form>
    </div>
  );
}
