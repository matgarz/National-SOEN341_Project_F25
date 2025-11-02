import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface EventAnalyticsCardProps {
  title: string;
  ticketsIssued: number;
  attended: number;
  attendanceRate: string;
  remainingCapacity: number;
}

export function EventAnalyticsCard({
  title,
  ticketsIssued,
  attended,
  attendanceRate,
  remainingCapacity,
}: EventAnalyticsCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <strong>Tickets Issued:</strong> {ticketsIssued}
        </p>
        <p>
          <strong>Attended:</strong> {attended}
        </p>
        <p>
          <strong>Attendance Rate:</strong> {attendanceRate}%
        </p>
        <p>
          <strong>Remaining Capacity:</strong> {remainingCapacity}
        </p>
      </CardContent>
    </Card>
  );
}
