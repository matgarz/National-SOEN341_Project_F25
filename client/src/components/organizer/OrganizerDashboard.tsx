import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Button } from "../ui/Button";
import { EventAnalyticsCard } from "../event/EventAnalyticsCard";
import { useAuth } from "../../auth/AuthContext";

type AnalyticsData = {
  eventId: number;
  title: string;
  date: string;
  ticketsIssued: number;
  attended: number;
  attendanceRate: string;
  remainingCapacity: number;
};

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // const organizerId = 2; // John Smith's (organizer1@concordia.ca) current ID --> Hardcoded --> Useful to debug --> Check prisma studio

  const organizerId = user?.id;

  if (!user) {
    return <div className="p-4">Loading organizer data…</div>;
  }

  if (user.role !== "ORGANIZER") {
    return <div>Unauthorized: Organizer access only</div>;
  }

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const url = `/api/events/organizer/${organizerId}/analytics`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: AnalyticsData[] = await res.json();
        setAnalytics(data);
      } catch (e: any) {
        if (e.name !== "AbortError") setError(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [organizerId]);

  // Separate into upcoming/past events based on a UTC-safe date comparison --> Maybe we should not use UTC anywhere?
  const filteredAnalytics = useMemo(() => {
    const now = new Date(); // current moment (in local time of machine)
    const nowTime = now.getTime(); // convert to epoch milliseconds (UTC-safe)

    return analytics
      .filter((a) => {
        const eventTime = new Date(a.date).getTime();
        const isUpcoming = eventTime >= nowTime; // compare in UTC-safe milliseconds
        return filter === "upcoming" ? isUpcoming : !isUpcoming;
      })
      .filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [analytics, filter, searchQuery]);

  // Compute summary stats
  const summary = useMemo(() => {
    if (filteredAnalytics.length === 0) return null;
    const totalTickets = filteredAnalytics.reduce(
      (sum, a) => sum + a.ticketsIssued,
      0,
    );
    const totalAttended = filteredAnalytics.reduce(
      (sum, a) => sum + a.attended,
      0,
    );
    const avgAttendanceRate =
      totalTickets > 0
        ? ((totalAttended / totalTickets) * 100).toFixed(1)
        : "0";
    return { totalTickets, totalAttended, avgAttendanceRate };
  }, [filteredAnalytics]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Event Analytics</h2>
        <Button
          onClick={() => navigate("/create-event")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
        >
          + Create Event
        </Button>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList className="grid grid-cols-2 w-full mb-4 space-x-7">
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
        </TabsList>

        <Input
          placeholder="Search your events…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md mb-4"
        />

        <TabsContent value={filter}>
          {loading && (
            <div className="text-sm opacity-70">Loading analytics…</div>
          )}
          {error && <div className="text-red-600 text-sm">Error: {error}</div>}

          {/* Summary section */}
          {summary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-100 rounded-lg shadow">
                <h3 className="font-semibold text-gray-700">Tickets Issued</h3>
                <p className="text-xl font-bold">{summary.totalTickets}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg shadow">
                <h3 className="font-semibold text-gray-700">Attendees</h3>
                <p className="text-xl font-bold">{summary.totalAttended}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-lg shadow">
                <h3 className="font-semibold text-gray-700">Avg Attendance</h3>
                <p className="text-xl font-bold">
                  {summary.avgAttendanceRate}%
                </p>
              </div>
            </div>
          )}

          {/* List of analytics cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAnalytics.map((a) => (
              <EventAnalyticsCard
                key={a.eventId}
                id={String(a.eventId)}
                title={a.title}
                date={a.date}
                ticketsIssued={a.ticketsIssued}
                attended={a.attended}
                attendanceRate={a.attendanceRate}
                remainingCapacity={a.remainingCapacity}
              />
            ))}
            {filteredAnalytics.length === 0 && !loading && (
              <div className="text-sm opacity-70">No events found.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
