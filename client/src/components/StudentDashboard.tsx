import { useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "./ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { EventCard, type Event as EventCardEvent } from "./EventCard";
import { FilterSidebar, type FilterState } from "./FilterSidebar";
import { EventDetailsModal, type EventDetails } from "./EventDetailsModal";
import { useAuth } from "../auth/AuthContext";
import { Check, AlertCircle } from "lucide-react";

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
  _count?: { ticket: number }; // if you included this in the backend
};

/** Map API events → EventCard props */
const toCard = (
  e: ApiEvent,
  bookmarkedIds: Set<string>,
  ticketIds: Set<string>,
): EventCardEvent => {
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
    attendees: e._count?.ticket ?? 0,
    image: e.imageUrl ?? "https://via.placeholder.com/640x360?text=Event",
    tags: e.category ? [e.category] : [],
    isBookmarked: bookmarkedIds.has(String(e.id)),
    hasTicket: ticketIds.has(String(e.id)),
  };
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventCardEvent[]>([]);
  const [bookmarkedEventIds, setBookmarkedEventIds] = useState<Set<string>>(
    new Set(),
  );
  const [claimedTicketIds, setClaimedTicketIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch bookmarked events and tickets on mount
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserData = async () => {
      try {
        // Fetch bookmarked events
        const bookmarksRes = await fetch(`/api/events/saved/${user.id}`);
        if (bookmarksRes.ok) {
          const data: ApiEvent[] = await bookmarksRes.json();
          const ids = new Set(data.map((e) => String(e.id)));
          setBookmarkedEventIds(ids);
        }

        // Fetch claimed tickets
        const ticketsRes = await fetch(`/api/events/tickets/${user.id}`);
        if (ticketsRes.ok) {
          const tickets = await ticketsRes.json();
          const ticketEventIds = new Set(
            tickets.map((t: any) => String(t.eventId)),
          );
          setClaimedTicketIds(ticketEventIds);
        }
      } catch (e) {
        console.error("Failed to fetch user data:", e);
      }
    };

    fetchUserData();
  }, [user]);

  // Fetch events from API
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const url = searchQuery.trim()
          ? `/api/events/search?keyword=${encodeURIComponent(searchQuery.trim())}`
          : `/api/events`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiEvent[] = await res.json();
        setEvents(
          data.map((e) => toCard(e, bookmarkedEventIds, claimedTicketIds)),
        );
      } catch (e: unknown) {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message ?? String(e));
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [searchQuery, bookmarkedEventIds, claimedTicketIds]);

  // Handle bookmark toggle
  const handleBookmark = async (eventId: string) => {
    if (!user?.id) return;

    const isCurrentlyBookmarked = bookmarkedEventIds.has(eventId);

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const res = await fetch(`/api/events/${eventId}/save`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        if (res.ok) {
          setBookmarkedEventIds((prev) => {
            const next = new Set(prev);
            next.delete(eventId);
            return next;
          });
          // Update events to reflect bookmark change
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId ? { ...e, isBookmarked: false } : e,
            ),
          );
        }
      } else {
        // Add bookmark
        const res = await fetch(`/api/events/${eventId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        if (res.ok) {
          setBookmarkedEventIds((prev) => new Set(prev).add(eventId));
          // Update events to reflect bookmark change
          setEvents((prev) =>
            prev.map((e) =>
              e.id === eventId ? { ...e, isBookmarked: true } : e,
            ),
          );
        }
      }
    } catch (e) {
      console.error("Failed to toggle bookmark:", e);
    }
  };

  // Handle view details
  const handleViewDetails = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsDetailsModalOpen(true);
    }
  };

  // Handle claim ticket
  const handleClaimTicket = async (eventId: string) => {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/events/${eventId}/ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setClaimedTicketIds((prev) => new Set(prev).add(eventId));
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, hasTicket: true } : e)),
        );
        showNotification(
          "Ticket claimed successfully! Check 'My Events' to view your ticket.",
          "success",
        );
      } else {
        const error = await res.json();
        showNotification(error.error || "Failed to claim ticket", "error");
      }
    } catch (e) {
      console.error("Failed to claim ticket:", e);
      showNotification("Failed to claim ticket. Please try again.", "error");
    }
  };

  // Show notification
  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Split events into upcoming and past, then apply filters
  const now = Date.now();
  const upcomingEvents = useMemo(() => {
    const applyFiltersLocal = (eventsToFilter: EventCardEvent[]) => {
      const filtered = eventsToFilter.filter((ev) => {
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(ev.category)
        ) {
          return false;
        }
        if (
          filters.ticketTypes.length > 0 &&
          !filters.ticketTypes
            .map((t) => t.toLowerCase())
            .includes(ev.ticketType)
        ) {
          return false;
        }
        const eventDate = new Date(ev.date);
        const nowDate = new Date();
        if (filters.dateRange !== "all") {
          const isToday = eventDate.toDateString() === nowDate.toDateString();
          const isThisWeek =
            eventDate <= new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const isThisMonth =
            eventDate.getMonth() === nowDate.getMonth() &&
            eventDate.getFullYear() === nowDate.getFullYear();
          const isNextMonth =
            eventDate.getMonth() === (nowDate.getMonth() + 1) % 12 &&
            (eventDate.getMonth() === 0
              ? eventDate.getFullYear() === nowDate.getFullYear() + 1
              : eventDate.getFullYear() === nowDate.getFullYear());

          if (
            (filters.dateRange === "today" && !isToday) ||
            (filters.dateRange === "this-week" && !isThisWeek) ||
            (filters.dateRange === "this-month" && !isThisMonth) ||
            (filters.dateRange === "next-month" && !isNextMonth)
          ) {
            return false;
          }
        }
        if (
          filters.location &&
          !ev.location.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "date-asc":
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case "date-desc":
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case "popularity":
            return b.attendees / b.capacity - a.attendees / a.capacity;
          case "alphabetical":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      return filtered;
    };

    const upcoming = events.filter((e) => new Date(e.date).getTime() > now);
    return applyFiltersLocal(upcoming);
  }, [events, filters, now]);

  const pastEvents = useMemo(() => {
    const applyFiltersLocal = (eventsToFilter: EventCardEvent[]) => {
      const filtered = eventsToFilter.filter((ev) => {
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(ev.category)
        ) {
          return false;
        }
        if (
          filters.ticketTypes.length > 0 &&
          !filters.ticketTypes
            .map((t) => t.toLowerCase())
            .includes(ev.ticketType)
        ) {
          return false;
        }
        const eventDate = new Date(ev.date);
        const nowDate = new Date();
        if (filters.dateRange !== "all") {
          const isToday = eventDate.toDateString() === nowDate.toDateString();
          const isThisWeek =
            eventDate <= new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const isThisMonth =
            eventDate.getMonth() === nowDate.getMonth() &&
            eventDate.getFullYear() === nowDate.getFullYear();
          const isNextMonth =
            eventDate.getMonth() === (nowDate.getMonth() + 1) % 12 &&
            (eventDate.getMonth() === 0
              ? eventDate.getFullYear() === nowDate.getFullYear() + 1
              : eventDate.getFullYear() === nowDate.getFullYear());

          if (
            (filters.dateRange === "today" && !isToday) ||
            (filters.dateRange === "this-week" && !isThisWeek) ||
            (filters.dateRange === "this-month" && !isThisMonth) ||
            (filters.dateRange === "next-month" && !isNextMonth)
          ) {
            return false;
          }
        }
        if (
          filters.location &&
          !ev.location.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "date-asc":
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case "date-desc":
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case "popularity":
            return b.attendees / b.capacity - a.attendees / a.capacity;
          case "alphabetical":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      return filtered;
    };

    const past = events.filter((e) => new Date(e.date).getTime() <= now);
    return applyFiltersLocal(past);
  }, [events, filters, now]);

  const bookmarkedEvents = useMemo(() => {
    const applyFiltersLocal = (eventsToFilter: EventCardEvent[]) => {
      const filtered = eventsToFilter.filter((ev) => {
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(ev.category)
        ) {
          return false;
        }
        if (
          filters.ticketTypes.length > 0 &&
          !filters.ticketTypes
            .map((t) => t.toLowerCase())
            .includes(ev.ticketType)
        ) {
          return false;
        }
        const eventDate = new Date(ev.date);
        const nowDate = new Date();
        if (filters.dateRange !== "all") {
          const isToday = eventDate.toDateString() === nowDate.toDateString();
          const isThisWeek =
            eventDate <= new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          const isThisMonth =
            eventDate.getMonth() === nowDate.getMonth() &&
            eventDate.getFullYear() === nowDate.getFullYear();
          const isNextMonth =
            eventDate.getMonth() === (nowDate.getMonth() + 1) % 12 &&
            (eventDate.getMonth() === 0
              ? eventDate.getFullYear() === nowDate.getFullYear() + 1
              : eventDate.getFullYear() === nowDate.getFullYear());

          if (
            (filters.dateRange === "today" && !isToday) ||
            (filters.dateRange === "this-week" && !isThisWeek) ||
            (filters.dateRange === "this-month" && !isThisMonth) ||
            (filters.dateRange === "next-month" && !isNextMonth)
          ) {
            return false;
          }
        }
        if (
          filters.location &&
          !ev.location.toLowerCase().includes(filters.location.toLowerCase())
        ) {
          return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "date-asc":
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case "date-desc":
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case "popularity":
            return b.attendees / b.capacity - a.attendees / a.capacity;
          case "alphabetical":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      return filtered;
    };

    const bookmarked = events.filter((e) => e.isBookmarked);
    return applyFiltersLocal(bookmarked);
  }, [events, filters]);

  return (
    <div className="space-y-6 relative">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {notification.type === "success" ? (
                <Check className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <AnimatePresence>
          {showFilters && (
            <div className="flex-row justify-center">
              <FilterSidebar
                filters={filters}
                onFiltersChange={(newFilters) => setFilters(newFilters)}
              />
            </div>
          )}
        </AnimatePresence>
        <div className="flex-1">
          {error && <div className="text-red-600 text-sm">Error: {error}</div>}
          {loading && <div className="text-sm opacity-70">Loading…</div>}

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3 space-x-7">
              <TabsTrigger
                className="bg-gray-200  hover:cursor-pointer"
                value="upcoming"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                className="bg-gray-200  hover:cursor-pointer"
                value="past"
              >
                Past
              </TabsTrigger>
              <TabsTrigger
                className="bg-gray-200  hover:cursor-pointer"
                value="bookmarked"
              >
                Bookmarked
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingEvents.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      userRole="student"
                      onBookmark={handleBookmark}
                      onClaimTicket={handleClaimTicket}
                      onViewDetails={handleViewDetails}
                      ispassed={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No upcoming events found. Try adjusting your filters.
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastEvents.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pastEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      userRole="student"
                      onBookmark={handleBookmark}
                      onViewDetails={handleViewDetails}
                      ispassed={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No past events found.
                </div>
              )}
            </TabsContent>

            <TabsContent value="bookmarked">
              {bookmarkedEvents.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {bookmarkedEvents.map((ev) => (
                    <EventCard
                      key={ev.id}
                      event={ev}
                      userRole="student"
                      onBookmark={handleBookmark}
                      onClaimTicket={(id) => console.log("claim/buy", id)}
                      onViewDetails={(id) => console.log("details", id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No bookmarked events yet.</p>
                  <p className="text-sm">
                    Click the heart icon on any event card to bookmark it!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onClaimTicket={handleClaimTicket}
          userRole="student"
        />
      )}
    </div>
  );
}
