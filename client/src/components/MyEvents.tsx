import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import QRCode from "./QRCode";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Ticket as TicketIcon,
  Download,
} from "lucide-react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";
import { motion } from "motion/react";

interface TicketData {
  id: number;
  qrCode: string;
  claimed: boolean;
  checkedIn: boolean;
  checkedInAt: string | null;
  paymentStatus: string;
  paymentAmount: number | null;
  createdAt: string;
  event: {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    ticketType: string;
    ticketPrice: number | null;
    organization?: {
      id: number;
      name: string;
    };
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function MyEvents() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const eventsService = useState(() => createEventsServicePlugin())[0];

  const calendar = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    plugins: [eventsService, createEventModalPlugin],
  });

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/events/tickets/${user.id}`);
        if (res.ok) {
          const data: TicketData[] = await res.json();
          // Filter out any tickets with undefined/null event data
          const validTickets = data.filter((ticket) => {
            return (
              ticket &&
              ticket.event &&
              ticket.event.id &&
              ticket.event.title &&
              ticket.event.date &&
              ticket.qrCode
            );
          });
          setTickets(validTickets);

          // Add events to calendar
          if (calendar) {
            validTickets.forEach((ticket) => {
              try {
                const start = Temporal.Instant.from(
                  ticket.event.date,
                ).toZonedDateTimeISO("UTC");
                const end = start.add({ hours: 2 }); // Assume 2-hour events

                const calendarEvent = {
                  id: ticket.event.id.toString(),
                  title: ticket.event.title,
                  start,
                  end,
                };

                if (calendar.events?.add) {
                  calendar.events.add(calendarEvent);
                }
              } catch (err) {
                console.error("Error adding event to calendar:", err);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, calendar]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (ticket: TicketData) => {
    if (ticket.checkedIn) {
      return <Badge className="bg-green-100 text-green-800">Checked In</Badge>;
    }
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    if (eventDate < now) {
      return <Badge className="bg-gray-100 text-gray-800">Past Event</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
  };

  // Separate upcoming and past tickets
  const now = new Date();
  const upcomingTickets = tickets.filter(
    (t) => t && t.event && t.event.date && new Date(t.event.date) > now,
  );
  const pastTickets = tickets.filter(
    (t) => t && t.event && t.event.date && new Date(t.event.date) <= now,
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          My Events
        </h1>
        <p className="text-gray-600">
          View your event calendar and manage your tickets
        </p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <TicketIcon className="h-4 w-4 mr-2" />
            My Tickets ({tickets.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-gray-500">Loading calendar...</p>
                </div>
              ) : (
                <div className="calendar-wrapper">
                  <ScheduleXCalendar calendarApp={calendar} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TicketIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Tickets Yet</h3>
                <p className="text-gray-600">
                  Claim tickets for events to see them here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Tickets */}
              {upcomingTickets.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Upcoming Events
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {upcomingTickets.map((ticket) =>
                      ticket && ticket.event ? (
                        <motion.div
                          key={ticket.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white pb-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-xl font-bold mb-1">
                                    {ticket.event.title}
                                  </h3>
                                  <p className="text-sm opacity-90">
                                    by{" "}
                                    {ticket.event.organization?.name ||
                                      "Unknown"}
                                  </p>
                                </div>
                                {getStatusBadge(ticket)}
                              </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                              <div className="grid gap-3">
                                <div className="flex items-start gap-3">
                                  <CalendarIcon className="h-5 w-5 text-gray-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium">
                                      {formatDate(ticket.event.date)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {formatTime(ticket.event.date)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
                                  <p className="font-medium">
                                    {ticket.event.location}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-4 border-t">
                                <p className="text-sm text-gray-600 mb-3">
                                  Your Ticket QR Code
                                </p>
                                <div className="flex justify-center">
                                  <QRCode
                                    link={ticket.qrCode}
                                    size={192}
                                    title={`Ticket for ${ticket.event.title}`}
                                  />
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-3">
                                  Show this QR code at the event entrance
                                </p>
                              </div>

                              {ticket.event.ticketType === "PAID" &&
                                ticket.event.ticketPrice && (
                                  <div className="pt-3 border-t">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">
                                        Amount Paid:
                                      </span>
                                      <span className="font-bold text-lg">
                                        $
                                        {Number(
                                          ticket.event.ticketPrice,
                                        ).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : null,
                    )}
                  </div>
                </div>
              )}

              {/* Past Tickets */}
              {pastTickets.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Past Events</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {pastTickets.map((ticket) =>
                      ticket && ticket.event ? (
                        <Card
                          key={ticket.id}
                          className="opacity-75 hover:opacity-100 transition-opacity"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold">
                                  {ticket.event.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {formatDate(ticket.event.date)}
                                </p>
                              </div>
                              {getStatusBadge(ticket)}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{ticket.event.location}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null,
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
