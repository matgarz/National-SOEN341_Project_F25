import { useState, useEffect } from "react";
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
import { getAuthHeader } from "../auth/tokenAuth";

interface EventPerformance {
  name: string;
  attendees: number;
  capacity: number;
  revenue: number;
  organization: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface AnalyticsProps {
  userRole: "organizer" | "admin";
}

interface AnalyticsData {
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  avgAttendance: string;
  eventsByCategory: Array<{ name: string; value: number }>;
  topEvents: Array<{
    name: string;
    attendees: number;
    capacity: number;
    revenue: number;
    organization: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    eventCount: number;
    attendees: number;
  }>;
}

const CATEGORY_COLORS: Record<string, string> = {
  Academic: "#3B82F6",
  Social: "#10B981",
  Sports: "#F59E0B",
  Cultural: "#8B5CF6",
  Career: "#6B7280",
  Workshop: "#EC4899",
  Networking: "#14B8A6",
  Entertainment: "#F97316",
};

export function Analytics({ userRole }: AnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/analytics/comprehensive`,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    if (!analyticsData) return;

    const csvData = analyticsData.topEvents
      .map(
        (event: EventPerformance) =>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">
          Unable to load analytics data
        </div>
      </div>
    );
  }

  // Prepare category data with colors
  const categoryDataWithColors = analyticsData.eventsByCategory.map(
    (cat: { name: string; value: number }): CategoryData => ({
      ...cat,
      color: CATEGORY_COLORS[cat.name] || "#6B7280",
    }),
  );

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
            <div className="text-2xl font-bold">
              {analyticsData.totalEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
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
              {analyticsData.totalTickets.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Tickets claimed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From paid events</p>
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
            <div className="text-2xl font-bold">
              {analyticsData.avgAttendance}%
            </div>
            <p className="text-xs text-muted-foreground">Of total capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Events by Attendance</CardTitle>
            <CardDescription>
              Most popular events by ticket count
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.topEvents.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.topEvents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendees" fill="#3B82F6" name="Attendees" />
                  <Bar dataKey="capacity" fill="#E5E7EB" name="Capacity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No event data available
              </div>
            )}
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
            {categoryDataWithColors.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDataWithColors}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props) => {
                      const { name, value } = props as any;
                      const total = categoryDataWithColors.reduce(
                        (sum: number, cat: CategoryData) => sum + cat.value,
                        0,
                      );
                      const percent = ((value / total) * 100).toFixed(0);
                      return `${name} ${percent}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDataWithColors.map(
                      (entry: CategoryData, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ),
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
          <CardDescription>
            Events and attendance trends over recent months
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.monthlyTrends &&
          analyticsData.monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="eventCount"
                  stroke="#3B82F6"
                  name="Events"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="attendees"
                  stroke="#10B981"
                  name="Attendees"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Events Details */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Events</CardTitle>
          <CardDescription>
            Detailed metrics for most popular events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.topEvents.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.topEvents.map(
                (event: EventPerformance, index: number) => {
                  const attendanceRate =
                    event.capacity > 0
                      ? (event.attendees / event.capacity) * 100
                      : 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{event.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{event.organization}</span>
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
                },
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No event performance data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
