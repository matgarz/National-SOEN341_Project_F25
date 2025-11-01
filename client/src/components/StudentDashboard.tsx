import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "./ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { EventCard, type Event as EventCardEvent } from "./EventCard";
import { FilterSidebar, type FilterState } from "./FilterSidebar";

// Initial filter state
const initialFilters: FilterState = {
  categories: [],
  ticketTypes: [],
  dateRange: "all",
  location: "",
  sortBy: "date-asc",
};

type TicketType = "FREE" | "PAID";
type EventStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type ApiEvent = {
  id: number;
  title: string;
  description: string;
  date: string; // ISO
  location: string;
  capacity: number;
  ticketType: TicketType;
  ticketPrice?: string | number | null; // Prisma Decimal often strings
  category?: string | null;
  imageUrl?: string | null;
  status: EventStatus;
  organization?: { id: number; name: string | null };
  Organizer?: { id: number; name: string | null };
  creator?: { id: number; name: string | null; email: string };
  _count?: { tickets: number }; // if you included this in the backend
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
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState(initialFilters);

  // Apply filters and sorting
  const applyFilters = (eventsToFilter: EventCardEvent[]) => {
    return eventsToFilter.filter((ev) => {
      // Categories
      if (
        filters.categories.length > 0 &&
        (!ev.category || !filters.categories.includes(ev.category))
      ) {
        return false;
      }
      // Ticket Types (convert Free/Paid to lowercase to match ev.ticketType)
      if (
        filters.ticketTypes.length > 0 &&
        !filters.ticketTypes.map(t => t.toLowerCase()).includes(ev.ticketType)
      ) {
        return false;
      }
      // Date range
      const eventDate = new Date(ev.date);
      const now = new Date();
      if (filters.dateRange !== "all") {
        const isToday = eventDate.toDateString() === now.toDateString();
        const isThisWeek = eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const isThisMonth = eventDate.getMonth() === now.getMonth();
        const isNextMonth = eventDate.getMonth() === (now.getMonth() + 1) % 12;

        if (
          (filters.dateRange === "today" && !isToday) ||
          (filters.dateRange === "this-week" && !isThisWeek) ||
          (filters.dateRange === "this-month" && !isThisMonth) ||
          (filters.dateRange === "next-month" && !isNextMonth)
        ) {
          return false;
        }
      }
      // Location
      if (
        filters.location &&
        !ev.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  };

  // Filtered events (client-side filtering)
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Categories
      if (
        filters.categories.length > 0 &&
        (!ev.category || !filters.categories.includes(ev.category))
      ) {
        return false;
      }
      // Ticket Types
      if (
        filters.ticketTypes.length > 0 &&
        !filters.ticketTypes.includes(ev.ticketType)
      ) {
        return false;
      }
      // Date range (example for "today", "this-week", etc.)
      const eventDate = new Date(ev.date);
      const now = new Date();
      if (filters.dateRange === "today") {
        const isToday = eventDate.toDateString() === now.toDateString();
        if (!isToday) return false;
      }
      // Location
      if (
        filters.location &&
        !ev.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [events, filters]);


  const sortedEvents = useMemo(() => {
    const arr = [...filteredEvents];
    if (filters.sortBy === "date-asc") {
      arr.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    } else if (filters.sortBy === "date-desc") {
      arr.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
    }
    // Add more sort logic as needed
    return arr;
  }, [filteredEvents, filters.sortBy]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
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
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q),
    );
  }, [events, searchQuery]);

  const now = Date.now();
  const upcoming = filtered.filter((e) => new Date(e.date).getTime() > now);
  const past = filtered.filter((e) => new Date(e.date).getTime() <= now);

  // Apply filters and sorting
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events.filter((ev) => {
      // Categories
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(ev.category)
      ) {
        return false;
      }
      // Ticket Types (convert Free/Paid to lowercase to match ev.ticketType)
      if (
        filters.ticketTypes.length &&
        !filters.ticketTypes.map(t => t.toLowerCase()).includes(ev.ticketType)
      ) {
        return false;
      }
      // Date range
      const eventDate = new Date(ev.date);
      const now = new Date();
      if (filters.dateRange !== "all") {
        const isToday = eventDate.toDateString() === now.toDateString();
        const isThisWeek = eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const isThisMonth = eventDate.getMonth() === now.getMonth();
        const isNextMonth = eventDate.getMonth() === (now.getMonth() + 1) % 12;

        if (
          (filters.dateRange === "today" && !isToday) ||
          (filters.dateRange === "this-week" && !isThisWeek) ||
          (filters.dateRange === "this-month" && !isThisMonth) ||
          (filters.dateRange === "next-month" && !isNextMonth)
        ) {
          return false;
        }
      }
      // Location
      if (
        filters.location &&
        !ev.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'popularity':
          return (b.attendees / b.capacity) - (a.attendees / a.capacity);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, filters]);


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Button 
          variant="default" 
          className="bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-5 w-8 mr-1" />
          Filters
        </Button>
        <Input 
          className="rounded-2xl text-center text-2xl text-purple-800 border-gray-300 border-b-2 placeholder:text-pretty placeholder:opacity-60 placeholder:italic placeholder:text-purple-700 placeholder:text-lg"
          placeholder="Search events…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-row flex justify-between gap-5">
        {showFilters && ( 
        <div className="flex-row justify-center">
          <FilterSidebar
            filters={filters}
            onFiltersChange={(newFilters) => setFilters(newFilters)} 
          />
        </div>
        )}
        <div>
          {error && <div className="text-red-600 text-sm">Error: {error}</div>}
          {loading && <div className="text-sm opacity-70">Loading…</div>}

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3 space-x-7">
              <TabsTrigger className="bg-gray-200  hover:cursor-pointer" value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger className="bg-gray-200  hover:cursor-pointer" value="past">Past</TabsTrigger>
              <TabsTrigger className="bg-gray-200  hover:cursor-pointer" value="bookmarked">Bookmarked</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((ev) => (
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
                {past.map((ev) => (
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
                  {bookmarkedEvents.map((ev) => (
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
      </div>
    </div>
  )
}
