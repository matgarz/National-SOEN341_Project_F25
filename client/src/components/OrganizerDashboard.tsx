import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/Button";
import { EventCard, type Event as EventCardEvent } from "./EventCard";
import { EventAnalyticsCard } from "./EventAnalyticsCard";
import { useAuth } from "../auth/AuthContext";


const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type AnalyticsData = {
    eventId: number;
    title: string;
    ticketsIssued: number;
    attended: number;
    attendanceRate: string;
    remainingCapacity: number;
};

export default function OrganizerDashboard() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<EventCardEvent[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
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
                const url = `${API}/api/events/organizer/${organizerId}/analytics`;
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Organizer Dashboard</h2>
                <Button
                    onClick={() => navigate("/create-event")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                    + Create Event
                </Button>
            </div>

            <Input
                placeholder="Search your events…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((ev) => (
                            <EventCard
                                key={ev.id}
                                event={ev}
                                userRole="organizer"
                                onViewDetails={(id) => console.log("details", id)}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="past">
                    <div className="text-sm opacity-70">Past events coming soon…</div>
                </TabsContent>

                <TabsContent value="analytics">
                    {loading && <div className="text-sm opacity-70">Loading analytics…</div>}
                    {error && <div className="text-red-600 text-sm">Error: {error}</div>}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                        {analytics.map((a) => (
                            <EventAnalyticsCard key={a.eventId} {...a} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
