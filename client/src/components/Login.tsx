import { useState } from "react";
import { setTokens } from "../auth/tokenAuth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";


export default function Login() {

const navigate = useNavigate();
  const [form, setForm] = useState({
    emailOrStudentID: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || `Login failed (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Login success:", data);

      alert("Login successful!");

      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      login(data.userPublic);

      const user = data.userPublic;
      if (user.role === "STUDENT") navigate("/dashboard", { replace: true });
      else if (user.role === "ORGANIZER") navigate("/create-event", { replace: true });
      else navigate("/");
      
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error — backend may be offline.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="emailOrStudentID"
          placeholder="Email or Student ID"
          value={form.emailOrStudentID}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
