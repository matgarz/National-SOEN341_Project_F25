import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../auth/tokenAuth";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
    studentId: "",
    phone: "",
    website: "",
    department: "",
  });

  const {login} = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    // Prepare payload
    const payload: Record<string, string> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
    };

    // Conditionally add fields
    if (form.role === "STUDENT") payload.studentId = form.studentId;
    if (form.role === "ORGANIZER") {
      payload.phone = form.phone;
      payload.website = form.website;
      payload.department = form.department;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("User created successfully!");
      } else {
        const data = await res.json();
        alert(`Error: ${data.error || "Something went wrong"}`);
      }

      // Step 2: Automatically log in
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrStudentID:
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
      if (user.role === "STUDENT") navigate("/dashboard", { replace: true });
      else if (user.role === "ORGANIZER") navigate("/create-event", { replace: true });
      else navigate("/");

    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" required />

        <select name="role" value={form.role} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="STUDENT">Student</option>
          <option value="ORGANIZER">Organizer</option>
          <option value="ADMIN">Admin</option>
        </select>

        {form.role === "STUDENT" && (
          <input name="studentId" placeholder="Student ID" value={form.studentId} onChange={handleChange} className="w-full p-2 border rounded" required />
        )}

        {form.role === "ORGANIZER" && (
          <>
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input name="website" placeholder="Website" value={form.website} onChange={handleChange} className="w-full p-2 border rounded" />
            <input name="department" placeholder="Department" value={form.department} onChange={handleChange} className="w-full p-2 border rounded" required />
          </>
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Register
        </button>
      </form>
    </div>
  );
}

