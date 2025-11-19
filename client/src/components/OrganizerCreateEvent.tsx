// Allow access to global "puter" --> AI Image Generation Tool
declare global {
    interface Window {
        puter: any;
    }
}


import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { uploadToImgBB } from "./utils/uploadToImgBB";


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

export default function OrganizerCreateEvent() {
  const { user } = useAuth();
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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // AI Image Generation State
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiGeneratedUrl, setAiGeneratedUrl] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const [aiUploadLoading, setAiUploadLoading] = useState(false);
    const [aiUploadError, setAiUploadError] = useState<string | null>(null);


    const MAX_PROMPT_LENGTH = 150;

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

      // SAFETY CHECK — prevent submitting base64 --> This happened a couple times
      if (form.imageUrl?.startsWith("data:image")) {
          setError("Please upload the AI image before submitting the event.");
          setLoading(false);
          return;
      }

    try {
      // Prepare payload matching validator expectations
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(), // Ensure ISO8601 string
        ticketPrice: form.ticketType === "PAID" ? form.ticketPrice : undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        creatorId: user?.id,
        organizationId: user?.organizationId,
      };

      const res = await fetch(`/api/events`, {
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

    const handleAIGenerate = async () => {
        setAiError(null);

        if (!aiPrompt.trim()) {
            setAiError("Please enter a prompt first.");
            return;
        }

        if (aiPrompt.length > MAX_PROMPT_LENGTH) {
            setAiError(`Prompt too long (max ${MAX_PROMPT_LENGTH} characters).`);
            return;
        }

        try {
            setAiLoading(true);

            // Call puter.js
            const imageElement = await window.puter.ai.txt2img(aiPrompt, {
                model: "gpt-image-1",
                quality: "medium",
            });

            // The image is an HTMLImageElement → extract base64 URL
            const url = imageElement.src;

            setAiGeneratedUrl(url);

            // Auto-fill the event's image URL field
            setForm((prev) => ({
                ...prev,
                imageUrl: url,
            }));
        } catch (err: any) {
            console.error(err);
            setAiError("Failed to generate image. Try a simpler prompt.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleAISaveToImgBB = async () => {
        if (!aiGeneratedUrl) {
            setAiUploadError("No generated image to upload.");
            return;
        }

        try {
            setAiUploadError(null);
            setAiUploadLoading(true);

            // aiGeneratedUrl is a base64 data URL → pass to uploader
            const cleanUrl = await uploadToImgBB(aiGeneratedUrl);

            // Update the form with final hosted URL
            setForm(prev => ({
                ...prev,
                imageUrl: cleanUrl,
            }));

            // Update the preview to the new hosted URL
            setAiGeneratedUrl(cleanUrl);

        } catch (err: any) {
            console.error(err);
            setAiUploadError("Failed to upload image to ImgBB.");
        } finally {
            setAiUploadLoading(false);
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
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded p-2 mt-1"
            required
          >
            <option value="">Select a category</option>
            <option value="Academic">Academic</option>
            <option value="Social">Social</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Career">Career</option>
            <option value="Workshop">Workshop</option>
          </select>
        </div>

              {/* AI Image Generator */}
              <div className="border p-4 rounded-lg bg-gray-50">
                  <label className="block font-semibold mb-2">
                      Generate Event Image with AI
                  </label>

                  <textarea
                      className="w-full border rounded p-2"
                      rows={2}
                      placeholder="Describe the image you want (e.g., 'a neon poster for a night festival with purple sky')"
                      value={aiPrompt}
                      maxLength={MAX_PROMPT_LENGTH}
                      onChange={(e) => setAiPrompt(e.target.value)}
                  ></textarea>

                  <div className="text-sm text-gray-500 mb-2">
                      {aiPrompt.length}/{MAX_PROMPT_LENGTH} characters
                  </div>

                  {aiError && <div className="text-red-600 text-sm mb-2">{aiError}</div>}

                  <button
                      type="button"
                      onClick={handleAIGenerate}
                      disabled={aiLoading}
                      className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
                  >
                      {aiLoading ? "Generating..." : "Generate Image"}
                  </button>

                  {aiGeneratedUrl && (
                      <div className="mt-4">
                          <p className="font-medium mb-2">Preview:</p>
                          <img
                              src={aiGeneratedUrl}
                              alt="Generated event"
                              className="w-full h-auto rounded shadow"
                          />

                          {/* Upload Button */}
                          <button
                              type="button"
                              onClick={handleAISaveToImgBB}
                              disabled={aiUploadLoading}
                              className="bg-blue-600 text-white px-3 py-2 mt-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
                          >
                              {aiUploadLoading ? "Uploading…" : "Save to ImgBB & Use Image"}
                          </button>

                          {aiUploadError && (
                              <div className="text-red-600 text-sm mt-2">{aiUploadError}</div>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                              After saving, the base64 image will be replaced with a clean hosted URL.
                          </p>
                      </div>
                  )}
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
