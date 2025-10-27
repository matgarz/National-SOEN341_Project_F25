import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    password: "",
    email: "",
    role: "student", // default
    studentId: "",
    organizationId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare payload to send
      const payload: any = { ...form };
      if (form.role === "student") payload.organizationId = undefined;
      if (form.role === "organizer") payload.studentId = undefined;

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Auto-login after register
      login(data);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Username"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
        <select
          title="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="student">Student</option>
          <option value="organizer">Organizer</option>
        </select>

        {form.role === "student" && (
          <input
            name="studentId"
            placeholder="Student ID"
            value={form.studentId}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        )}

        {form.role === "organizer" && (
          <input
            name="organizationId"
            placeholder="Organization ID"
            value={form.organizationId}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
