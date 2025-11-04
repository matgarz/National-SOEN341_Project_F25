import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../auth/tokenAuth";
import { useAuth } from "../auth/AuthContext";

type Role = "STUDENT" | "ORGANIZER";

interface Organization {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

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
    organizationId: "",
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isStudent = form.role === "STUDENT";
  const isOrganizer = form.role === "ORGANIZER";

  useEffect(() => {
    if (isOrganizer && organizations.length === 0) {
      fetchOrganizations();
    }
  }, [isOrganizer]);

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const response = await fetch("/api/organizations/public");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        setError("Failed to load organizations");
      }
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError("Failed to load organizations");
    } finally {
      setLoadingOrgs(false);
    }
  };

  const isValid = useMemo(() => {
    if (!form.firstName || !form.lastName) return false;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) return false;
    if (form.password.length < 6) return false;

    if (form.role === "STUDENT") {
      if (!/^\d{6,}$/.test(form.studentId)) return false;
    }
    if (form.role === "ORGANIZER") {
      if (!form.organizationId || form.organizationId === "") return false;
    }
    return true;
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValid) {
      setError("Please complete all required fields.");
      return;
    }

    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    if (isStudent) payload.studentId = form.studentId.trim();
    if (isOrganizer) {
      payload.organizationID = parseInt(form.organizationId);
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

      setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      login(data.userPublic);

      const user = data.userPublic;
      if (user.role === "STUDENT")
        navigate("/student-dashboard", { replace: true });
      else if (user.role === "ORGANIZER")
        navigate("/organizer-dashboard", { replace: true });
      else if (user.role === "ADMIN")
        navigate("/admin-dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 560,
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
          Create your account
        </h1>

        {error && (
          <div style={{ color: "#b91c1c", fontSize: 14, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div
          style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
        >
          <label>
            <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              First name
            </span>
            <input
              required
              value={form.firstName}
              onChange={set("firstName")}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            />
          </label>
          <label>
            <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Last name
            </span>
            <input
              required
              value={form.lastName}
              onChange={set("lastName")}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            />
          </label>
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
            Email
          </span>
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
            Password (min 6 chars)
          </span>
          <input
            type="password"
            required
            value={form.password}
            onChange={set("password")}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "block", marginTop: 12 }}>
          <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
            Role
          </span>
          <select
            value={form.role}
            onChange={set("role")}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
            }}
          >
            <option value="STUDENT">STUDENT</option>
            <option value="ORGANIZER">ORGANIZER</option>
          </select>
        </label>

        {isStudent && (
          <label style={{ display: "block", marginTop: 12 }}>
            <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Student ID
            </span>
            <input
              required
              value={form.studentId}
              onChange={set("studentId")}
              placeholder="40XXXXXX"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
              }}
            />
          </label>
        )}

        {isOrganizer && (
          <label style={{ display: "block", marginTop: 12 }}>
            <span style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Organization <span style={{ color: "#dc2626" }}>*</span>
            </span>
            {loadingOrgs ? (
              <div
                style={{
                  padding: "10px 12px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Loading organizations...
              </div>
            ) : (
              <select
                required
                value={form.organizationId}
                onChange={set("organizationId")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select your organization</option>
                {organizations
                  .filter((org) => org.isActive)
                  .map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
              </select>
            )}
            {organizations.length === 0 && !loadingOrgs && (
              <div
                style={{
                  fontSize: 12,
                  color: "#dc2626",
                  marginTop: 4,
                }}
              >
                No active organizations available. Please contact an
                administrator.
              </div>
            )}
          </label>
        )}

        <button
          type="submit"
          disabled={loading || !isValid}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
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
