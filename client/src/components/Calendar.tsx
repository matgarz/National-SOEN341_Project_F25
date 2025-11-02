import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { getAuthHeader } from "../auth/tokenAuth";
import "@schedule-x/theme-shadcn/dist/index.css";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createDragAndDropPlugin } from "@schedule-x/drag-and-drop";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";

interface CalendarAppProps {
  showAllEvents?: boolean;
}

export default function CalendarApp({
  showAllEvents = false,
}: CalendarAppProps) {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    plugins: [eventsService, createDragAndDropPlugin, createEventModalPlugin],
  });

  useEffect(() => {
    const loadAdminEvents = async () => {
      if (user?.role !== "ADMIN") {
        setError("Calendar is only available for admin users");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
        const url = showAllEvents
          ? `${API_BASE_URL}/api/admin/events`
          : `${API_BASE_URL}/api/admin/events?status=APPROVED`;
        const response = await fetch(url, {
          headers: getAuthHeader(),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response body:", errorText);

          if (response.status === 403) {
            throw new Error(
              "Access denied. Please ensure you're logged in as an admin.",
            );
          } else if (response.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else {
            throw new Error(
              `Failed to fetch events (${response.status}): ${response.statusText}`,
            );
          }
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Invalid response format:", data);
          throw new Error("Invalid response format from server");
        }
        const events = data;
        const currentEvents = calendar.events.getAll();
        currentEvents.forEach((event) => {
          calendar.events.remove(event.id);
        });

        events.forEach((ev: any) => {
          const start = Temporal.Instant.from(ev.date).toZonedDateTimeISO(
            "UTC",
          );
          const end = start.add({ hours: 2 });

          let backgroundColor = "#3b82f6"; //Blue
          let titlePrefix = "";

          switch (ev.status) {
            case "PENDING":
              backgroundColor = "#f59e0b"; //Orange
              if (showAllEvents) titlePrefix = "[PENDING] ";
              break;
            case "APPROVED":
              backgroundColor = "#10b981"; //Green
              if (showAllEvents) titlePrefix = "[APPROVED] ";
              break;
            case "REJECTED":
              backgroundColor = "#ef4444"; //Red
              if (showAllEvents) titlePrefix = "[REJECTED] ";
              break;
            case "CANCELLED":
              backgroundColor = "#6b7280"; //Gray
              if (showAllEvents) titlePrefix = "[CANCELLED] ";
              break;
            case "COMPLETED":
              backgroundColor = "#8b5cf6"; //Purple
              if (showAllEvents) titlePrefix = "[COMPLETED] ";
              break;
          }

          const calendarEvent = {
            id: ev.id.toString(),
            title: titlePrefix + ev.title,
            start,
            end,
            calendarId: "default",
            backgroundColor,
            description: `Status: ${ev.status}\nOrganization: ${ev.organization?.name || "N/A"}\nLocation: ${ev.location}`,
          };
          if (calendar?.events?.add) {
            calendar.events.add(calendarEvent);
          }
        });
      } catch (err: any) {
        console.error("Error loading admin events:", err);
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    if (calendar && user) {
      loadAdminEvents();
    }
  }, [calendar, user, showAllEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">
            Error Loading Calendar
          </h3>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          {error.includes("Access denied") && (
            <div className="text-sm text-gray-600 mt-3">
              <p className="font-semibold mb-1">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Verify you're logged in with an admin account</li>
                <li>Try logging out and logging back in</li>
                <li>Check that your session hasn't expired</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="calendario" className="p-4">
      {showAllEvents && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">All Events Calendar</h3>
          <p className="text-sm text-gray-600 mb-3">
            Viewing all events regardless of status. Events are color-coded:
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#f59e0b" }}
              ></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#10b981" }}
              ></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#ef4444" }}
              ></div>
              <span>Rejected</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#6b7280" }}
              ></div>
              <span>Cancelled</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "#8b5cf6" }}
              ></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      )}

      {!showAllEvents && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            Approved Events Calendar
          </h3>
          <p className="text-sm text-gray-600">Viewing only approved events</p>
        </div>
      )}
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
