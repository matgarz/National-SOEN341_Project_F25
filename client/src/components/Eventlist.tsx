// client/src/components/EventList.tsx
import React, { useEffect, useState } from "react";
import type { Event } from "../types/event";

export default function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: Event[]) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">{event.title}</h2>
          <p className="text-sm text-gray-600">
            {new Date(event.date).toLocaleString()}
          </p>
          <p className="text-sm mt-2">{event.location}</p>

          {event.organizer ? (
            <p className="text-sm text-gray-700 mt-2">
              <strong>Organizer:</strong> {event.organizer.name}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-2 italic">
              Organizer not assigned yet
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
