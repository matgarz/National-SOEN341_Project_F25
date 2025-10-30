import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
// import { Button } from '@/components/ui/button';
import "@schedule-x/theme-shadcn/dist/index.css";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
// import { createCalendar } from '@schedule-x/calendar';
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

export default function CalendarApp() {
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const { user } = useAuth();
  //const [events, setEvents] = useState([]);
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
      if (user?.role !== "ADMIN") return;

      try {
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(
          `${API_BASE_URL}/api/admin/events?status=APPROVED`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (response.ok) {
          const events = await response.json();

          events.forEach((ev: any) => {
            const start = Temporal.Instant.from(ev.date).toZonedDateTimeISO(
              "UTC",
            );
            const end = start.add({ hours: 2 });

            const calendarEvent = {
              id: ev.id.toString(),
              title: ev.title,
              start,
              end,
            };

            if (calendar?.events?.add) {
              calendar.events.add(calendarEvent);
            }
          });
        }
      } catch (error) {
        console.error("Error loading admin events:", error);
      }
    };

    if (calendar && user) {
      loadAdminEvents();
    }
  }, [calendar, user]);

  return (
    <div id="calendario">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
