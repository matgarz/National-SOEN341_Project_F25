import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
//import type { User } from "../auth/AuthContext";

interface EventForm {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  ticketType: "FREE" | "PAID";
  ticketPrice?: number;
  category: string;
  imageUrl?: string;
}

// Replace this with your actual user context / auth state
const currentUser = {
  id: 3, // logged-in user ID
  organizationId: 1, // logged-in user's organization ID
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export default function OrganizerCreateEvent() {
  const [form, setForm] = useState<EventForm>({
    title: "",
    description: "",
    date: "",
    location: "",
    capacity: 0,
    ticketType: "FREE",
    ticketPrice: undefined,
    category: "",
    imageUrl: "",
  });
  const { user } = useAuth();

  currentUser.id = user?.id ?? 3; // logged-in user ID

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "capacity" || name === "ticketPrice" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Prepare payload matching validator expectations
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(), // Ensure ISO8601 string
        ticketPrice: form.ticketType === "PAID" ? form.ticketPrice : undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        creatorId: currentUser.id,
        organizationId: currentUser.organizationId,
      };

      const res = await fetch(`${API}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || `HTTP ${res.status}`);
      }

      setSuccess("Event created successfully!");
      setForm({
        title: "",
        description: "",
        date: "",
        location: "",
        capacity: 0,
        ticketType: "FREE",
        ticketPrice: undefined,
        category: "",
        imageUrl: "",
      });
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6 text-left">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>

      {success && <div className="text-green-600 mb-4">{success}</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            rows={4}
            required
          />
        </div>

        {/* Date and Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="block font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              required
            />
          </div>
        </div>

        {/* Capacity and Ticket Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              min={0}
              required
            />
          </div>
          <div>
            <label className="block font-medium">Ticket Type</label>
            <select
              name="ticketType"
              value={form.ticketType}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
            >
              <option value="FREE">FREE</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
        </div>

        {/* Ticket Price */}
        {form.ticketType === "PAID" && (
          <div>
            <label className="block font-medium">Ticket Price</label>
            <input
              type="number"
              name="ticketPrice"
              value={form.ticketPrice || ""}
              onChange={handleChange}
              className="w-full border rounded p-2 mt-1"
              min={0}
              step={0.01}
              required
            />
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block font-medium">Image URL (optional)</label>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Creating�" : "Create Event"}
        </button>
      </form>
    </div>
  );
}
