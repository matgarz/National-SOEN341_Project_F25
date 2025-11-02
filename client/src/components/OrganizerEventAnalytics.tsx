import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useAuth } from "../auth/AuthContext";
import jsQR from "jsqr";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

interface Attendee {
  id: number;
  name: string;
  email: string;
  checkedIn: boolean;
}

interface EventDetails {
  id: number;
  title: string;
  date: string;
  capacity: number;
  ticketsIssued: number;
  attended: number;
  attendanceRate: string;
}

export default function OrganizerEventAnalytics() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const ctrl = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/events/${id}/details`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setEvent(data.event);
        setAttendees(data.attendees);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [id]);

  const handleExportCSV = () => {
    if (!attendees.length) return;

    const csvHeader = "ID,Name,Email,Checked In\n";
    const csvRows = attendees
      .map(
        (a) => `${a.id},"${a.name}","${a.email}",${a.checkedIn ? "Yes" : "No"}`,
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${event?.title ?? "attendees"}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        // Draw image to a canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return alert("Canvas not supported.");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Extract pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Decode QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (!code) {
          alert("❌ No QR code detected in the image.");
          return;
        }

        const qrCode = code.data.trim();
        console.log("Decoded QR code:", qrCode);

        try {
          const res = await fetch(`${API}/api/events/validate-ticket`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qrCode }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
          }

          const data = await res.json();
          alert(
            `✅ Ticket validated: ${data.ticket?.user?.name || "Unknown user"}`,
          );

          // Optional: refresh attendees after successful check-in
          setAttendees((prev) =>
            prev.map((a) =>
              a.email === data.ticket.user.email
                ? { ...a, checkedIn: true }
                : a,
            ),
          );
        } catch (err: any) {
          alert(`❌ Validation failed: ${err.message}`);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  };

  if (loading) return <div className="p-4">Loading event details...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!event) return <div className="p-4">Event not found.</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{event.title}</h2>
        <Button
          onClick={handleExportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Export Attendees (CSV)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Date:</strong> {new Date(event.date).toLocaleString()}
          </p>
          <p>
            <strong>Capacity:</strong> {event.capacity}
          </p>
          <p>
            <strong>Tickets Issued:</strong> {event.ticketsIssued}
          </p>
          <p>
            <strong>Attended:</strong> {event.attended}
          </p>
          <p>
            <strong>Attendance Rate:</strong> {event.attendanceRate}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendee List</CardTitle>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <p>No attendees found.</p>
          ) : (
            <table className="min-w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Checked In</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((a) => (
                  <tr key={a.id}>
                    <td className="border p-2">{a.name}</td>
                    <td className="border p-2">{a.email}</td>
                    <td className="border p-2 text-center">
                      {a.checkedIn ? "✅" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>QR Ticket Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm opacity-80">
            Upload a QR code image to validate a ticket.
          </p>

          <div className="flex items-center gap-3">
            <input
              id="qrFile"
              type="file"
              accept="image/*"
              onChange={(e) => {
                handleQRUpload(e);
                const fileName = e.target.files?.[0]?.name;
                if (fileName) setLastFile(fileName);
              }}
              className="hidden"
            />

            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              onClick={() => document.getElementById("qrFile")?.click()}
            >
              Choose File
            </Button>

            {lastFile && (
              <span className="text-sm text-gray-600">
                Last file selected: <strong>{lastFile}</strong>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
