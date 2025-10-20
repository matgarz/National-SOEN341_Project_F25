import { useEffect, useState } from "react";
import axios from "axios";
import { EventCard } from "../components/EventCard"; 
import type { Event } from "../components/EventCard";

interface BrowseEventsProps {
  onAddToCalendar: (event: Event) => void;
  events?: Event[];
}

interface EventFromBackend {
  id: string;
  title: string;
  date: string; // start date/time
  description: string;
  location: string;
  ticketType: string;
  ticketPrice?: string | null;
  capacity: number;
  _count: { ticket: number };
  creator: { name: string };
  category?: string | null;
  imageUrl?: string | null;
}

export default function BrowseEvents({ onAddToCalendar, events: propEvents }: BrowseEventsProps) {
  const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);

  useEffect(() => {
    if(!propEvents) {
      axios
       .get("http://localhost:3001/api/events")
       .then((res) => {
          const mapped: Event[] = res.data.map((ev: EventFromBackend) => ({
            id: ev.id,
            title: ev.title,
            description: ev.description,
            date: ev.date,
            start: new Date(ev.date).toISOString(),
            location: ev.location,
            organizer: ev.creator.name,
            category: ev.category || "Other",
            ticketType: ev.ticketType.toLowerCase() === "free" ? "free" : "paid",
            price: ev.ticketPrice ? Number(ev.ticketPrice) : undefined,
            capacity: ev.capacity,
            attendees: ev._count.ticket,
            image: ev.imageUrl || "",
            tags: [],
          }));
          setFetchedEvents(mapped);
        })
        .catch((err) => console.error(err));
      }
    }, [propEvents]);

  const displayedEvents: Event[] = propEvents || fetchedEvents;

  const handleAddToCalendar = ( event: Event ) => {
    onAddToCalendar(event);
    setFetchedEvents((prev) => prev.filter((e) => e.id !== event.id));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
      {displayedEvents.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div className="grid gap-4">
          {displayedEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                userRole="student"
                onAddToCalendar = {handleAddToCalendar}
                onBookmark={(id) => console.log("Bookmark", id)}
                onClaimTicket={(id) => console.log("Claim ticket", id)}
                onViewDetails={(id) => console.log("View details", id)}
              />
          ))}
        </div>
      )}
    </div>
  );
}