import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

interface EventAnalyticsCardProps {
  id: string;
  title: string;
  date: string;
  ticketsIssued: number;
  attended: number;
  attendanceRate: string;
  remainingCapacity: number;
}

export function EventAnalyticsCard({
  id,
  title,
  date,
  ticketsIssued,
  attended,
  attendanceRate,
  remainingCapacity,
}: EventAnalyticsCardProps) {
  const navigate = useNavigate();

  // Format date to display it nicely
  const formattedDate = new Date(date).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="shadow-md hover:shadow-lg transition">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <p className="text-sm text-gray-500">📅 {formattedDate}</p>
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
      <CardFooter className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => navigate(`/organizer/event/${id}/analytics`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
