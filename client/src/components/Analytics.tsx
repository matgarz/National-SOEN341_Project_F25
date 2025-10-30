import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/Button";
import { Download, Users, Calendar, Ticket, TrendingUp } from "lucide-react";
import { type Event } from "./EventCard";

interface AnalyticsProps {
  userRole: "organizer" | "admin";
  events?: Event[];
}

export function Analytics({ userRole/*, events = [] */}: AnalyticsProps) {
  // Sample analytics data - in a real app, this would come from the backend
  const eventPerformanceData = [
    { name: "Tech Workshop", attendees: 85, capacity: 100, revenue: 0 },
    { name: "Spring Concert", attendees: 450, capacity: 500, revenue: 2250 },
    { name: "Career Fair", attendees: 320, capacity: 400, revenue: 0 },
    { name: "Film Screening", attendees: 95, capacity: 120, revenue: 475 },
    { name: "Sports Meet", attendees: 180, capacity: 200, revenue: 900 },
  ];

  const categoryData = [
    { name: "Academic", value: 35, color: "#3B82F6" },
    { name: "Social", value: 25, color: "#10B981" },
    { name: "Sports", value: 20, color: "#F59E0B" },
    { name: "Cultural", value: 15, color: "#8B5CF6" },
    { name: "Career", value: 5, color: "#6B7280" },
  ];

  const monthlyTrends = [
    { month: "Jan", events: 12, attendees: 890 },
    { month: "Feb", events: 15, attendees: 1200 },
    { month: "Mar", events: 18, attendees: 1450 },
    { month: "Apr", events: 22, attendees: 1680 },
    { month: "May", events: 25, attendees: 1920 },
  ];

  const totalEvents = userRole === "admin" ? 92 : 12;
  const totalAttendees = userRole === "admin" ? 8140 : 1250;
  const totalRevenue = userRole === "admin" ? 15420 : 3625;
  const avgAttendance = userRole === "admin" ? 88.5 : 85.2;

  const handleExportData = () => {
    // Mock export functionality
    const csvData = eventPerformanceData
      .map(
        (event) =>
          `${event.name},${event.attendees},${event.capacity},${event.revenue}`,
      )
      .join("\n");

    const blob = new Blob(
      [`Event Name,Attendees,Capacity,Revenue\n${csvData}`],
      { type: "text/csv" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            {userRole === "admin" ? "Platform Analytics" : "Event Analytics"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {userRole === "admin"
              ? "Overview of platform-wide event metrics and trends"
              : "Performance insights for your events"}
          </p>
        </div>
        <Button
          onClick={handleExportData}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Attendees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAttendees.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Event Performance</CardTitle>
            <CardDescription>
              Attendance vs capacity for recent events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendees" fill="#3B82F6" name="Attendees" />
                <Bar dataKey="capacity" fill="#E5E7EB" name="Capacity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Event Categories</CardTitle>
            <CardDescription>
              Distribution of events by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => {
                    const { name, percent } = props as any;
                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>
            Events and attendance trends over the past 5 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar
                yAxisId="left"
                dataKey="events"
                fill="#3B82F6"
                name="Events"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="attendees"
                stroke="#10B981"
                name="Attendees"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Events Performance */}
      {userRole === "organizer" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              Detailed performance metrics for your latest events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventPerformanceData.slice(0, 3).map((event, index) => {
                const attendanceRate = (event.attendees / event.capacity) * 100;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          {event.attendees}/{event.capacity} attendees
                        </span>
                        <Badge
                          variant={
                            attendanceRate > 80
                              ? "default"
                              : attendanceRate > 60
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {attendanceRate.toFixed(1)}% capacity
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {event.revenue > 0 ? `$${event.revenue}` : "Free"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Revenue
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
