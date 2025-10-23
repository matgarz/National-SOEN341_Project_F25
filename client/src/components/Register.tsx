

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../auth/tokenAuth";
import { useAuth } from "../auth/AuthContext";

type Role = "STUDENT" | "ORGANIZER" | "ADMIN";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT" as Role,

    //student only
    studentId: "",

    //organizer only
    phone: "",
    website: "",
    department: "",
  });

  const {login} = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudent = form.role === "STUDENT";
  const isOrganizer = form.role === "ORGANIZER";
  const isAdmin = form.role === "ADMIN";

  const isValid = useMemo(() => {
    if (!form.firstName || !form.lastName) return false;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) return false;
    if (form.password.length < 6) return false;

    if (form.role === "STUDENT") {
      if (!/^\d{6,}$/.test(form.studentId)) return false;
    }
    if (form.role === "ORGANIZER") {
      if (!/^\d{3}-?\d{3}-?\d{4}$/.test(form.phone)) return false; //10 digit
      if (!(form.website.startsWith("http://") || form.website.startsWith("https://"))) return false;
      if (!form.department) return false;
    }
    return true;
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValid) { setError("Please complete all required fields."); return; }

    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    if (isStudent) payload.studentId = form.studentId.trim();
    if (isOrganizer) {
      payload.phone = form.phone.trim();
      payload.website = form.website.trim();
      payload.department = form.department.trim();
    }

    try {
        setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(`Error: ${data.error || "Something went wrong"}`);
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrStudentId:
            form.role === "STUDENT" ? form.studentId || form.email : form.email,
          password: form.password,
        }),
      });

      const data = await loginRes.json();
      if (!loginRes.ok) throw new Error(data.error || "Auto-login failed");

      // Step 3: Store tokens + user
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      login(data.userPublic);

      const user = data.userPublic;
      if (user.role === "STUDENT") navigate("/student-dashboard", { replace: true });
      else if (user.role === "ORGANIZER") navigate("/organizer-dashboard", { replace: true });
      else if (user.role === "ADMIN") navigate("/admin-dashboard", { replace: true });
      
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally{
        setLoading(false);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <form
        onSubmit={onSubmit}
        style={{ width: "100%", maxWidth: 560, border: "1px solid #ddd", borderRadius: 16, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Create your account</h1>

        {error && <div style={{ color: "#b91c1c", fontSize: 14, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <label>
            <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>First name</span>
            <input required value={form.firstName} onChange={set("firstName")} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
          </label>
          <label>
            <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Last name</span>
            <input required value={form.lastName} onChange={set("lastName")} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Email</span>
          <input type="email" required value={form.email} onChange={set("email")} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Password (min 6 chars)</span>
          <input type="password" required value={form.password} onChange={set("password")} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Role</span>
          <select value={form.role} onChange={set("role")} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }}>
            <option value="STUDENT">STUDENT</option>
            <option value="ORGANIZER">ORGANIZER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>

        {isStudent && (
          <label style={{ display: "block", marginTop: 12 }}>
            <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Student ID</span>
            <input required value={form.studentId} onChange={set("studentId")} placeholder="40XXXXXX" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
          </label>
        )}

        {isOrganizer && (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label>
              <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Phone (10 digits)</span>
              <input required value={form.phone} onChange={set("phone")} placeholder="514-555-1212" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
            </label>
            <label>
              <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Website (http/https)</span>
              <input required value={form.website} onChange={set("website")} placeholder="https://example.com" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>
              <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>Department</span>
              <input required value={form.department} onChange={set("department")} placeholder="Marketing" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ccc" }} />
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          style={{ width: "100%", marginTop: 16, padding: "10px 12px", borderRadius: 12, border: "1px solid #111", background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <div style={{ fontSize: 13, marginTop: 12, color: "#555" }}>
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </form>
    </div>
  );
}