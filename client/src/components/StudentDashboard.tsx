import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "./ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { EventCard, type Event as EventCardEvent } from "./eventCard";

type TicketType = "FREE" | "PAID";
type EventStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED";

type ApiEvent = {
  id: number;
  title: string;
  description: string;
  date: string;                // ISO
  location: string;
  capacity: number;
  ticketType: TicketType;
  ticketPrice?: string | number | null; // Prisma Decimal often strings
  category?: string | null;
  imageUrl?: string | null;
  status: EventStatus;
  organization?: { id: number; name: string | null };
  creator?: { id: number; name: string | null; email: string };
  _count?: { tickets: number };        // if you included this in the backend
};

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

/** Map API events → EventCard props */
const toCard = (e: ApiEvent): EventCardEvent => {
  const d = new Date(e.date);
  return {
    id: String(e.id),
    title: e.title,
    description: e.description ?? "",
    date: e.date,
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: e.location ?? "TBA",
    organizer: e.organization?.name ?? "Unknown",
    category: e.category ?? "General",
    ticketType: e.ticketType === "FREE" ? "free" : "paid",
    price: e.ticketType === "PAID" ? Number(e.ticketPrice ?? 0) : undefined,
    capacity: e.capacity ?? 0,
    attendees: e._count?.tickets ?? 0,
    image: e.imageUrl ?? "https://via.placeholder.com/640x360?text=Event",
    tags: e.category ? [e.category] : [],
    isBookmarked: false,
    hasTicket: false,
  };
};

export default function StudentDashboard() {
  const [events, setEvents] = useState<EventCardEvent[]>([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState<EventCardEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const url = searchQuery.trim()
          ? `${API}/api/events/search?keyword=${encodeURIComponent(searchQuery.trim())}`
          : `${API}/api/events`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiEvent[] = await res.json();
        setEvents(data.map(toCard));
        setBookmarkedEvents([]); // replace when you add a real "saved events" endpoint
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [searchQuery]);

  // client-side filter (your server already supports ?keyword=)
  const filtered = useMemo(() => {
    if (!searchQuery) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.organizer.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  const now = Date.now();
  const upcoming = filtered.filter(e => new Date(e.date).getTime() > now);
  const past = filtered.filter(e => new Date(e.date).getTime() <= now);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search events…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filters</Button>
      </div>

      {error && <div className="text-red-600 text-sm">Error: {error}</div>}
      {loading && <div className="text-sm opacity-70">Loading…</div>}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map(ev => (
              <EventCard
                key={ev.id}
                event={ev}
                userRole="student"
                onBookmark={(id) => console.log("bookmark", id)}
                onClaimTicket={(id) => console.log("claim/buy", id)}
                onViewDetails={(id) => console.log("details", id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {past.map(ev => (
              <EventCard
                key={ev.id}
                event={ev}
                userRole="student"
                onViewDetails={(id) => console.log("details", id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookmarked">
          {bookmarkedEvents.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {bookmarkedEvents.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  userRole="student"
                  onViewDetails={(id) => console.log("details", id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm opacity-70">No bookmarks yet.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
