import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/Button";
import { useNavigate } from "react-router-dom";

interface EventAnalyticsCardProps {
  id: string;
  title: string;
  ticketsIssued: number;
  attended: number;
  attendanceRate: string;
  remainingCapacity: number;
}

export function EventAnalyticsCard({
  id,
  title,
  ticketsIssued,
  attended,
  attendanceRate,
  remainingCapacity,
}: EventAnalyticsCardProps) {
  const navigate = useNavigate();

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
