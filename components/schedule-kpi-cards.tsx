import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  Fish,
} from "lucide-react";
import { FeedingSchedule, Pond, FeedingStatus } from "./types";

interface ScheduleKpiCardsProps {
  schedules: FeedingSchedule[];
  allPonds: Pond[];
}

export const ScheduleKpiCards = ({
  schedules,
  allPonds,
}: ScheduleKpiCardsProps) => {
  const activeSchedules = schedules.filter(
    (s) => s.status === FeedingStatus.Active
  );

  const today = new Date().getDay(); // 0 for Sunday, 6 for Saturday

  const feedingsDueToday = activeSchedules.reduce((count, schedule) => {
    if (schedule.daysOfWeek.includes(today)) {
      return count + schedule.feedingTimes.length;
    }
    return count;
  }, 0);

  const totalDailyFeedQty = activeSchedules.reduce((total, schedule) => {
    if (schedule.daysOfWeek.includes(today)) {
      const dailyQty = schedule.feedingTimes.reduce((sum, feeding) => {
        // Normalize to kg
        const quantityInKg =
          feeding.unit === "g" ? feeding.quantity / 1000 : feeding.quantity;
        return sum + quantityInKg;
      }, 0);
      return total + dailyQty;
    }
    return total;
  }, 0);

  const scheduledPondIds = new Set(schedules.map((s) => s.pondId));
  const pondsWithoutSchedule = allPonds.filter(
    (pond) => !scheduledPondIds.has(pond.id)
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSchedules.length}</div>
          <p className="text-xs text-muted-foreground">
            Total schedules currently running
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Feedings Due Today</CardTitle>
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{feedingsDueToday}</div>
          <p className="text-xs text-muted-foreground">
            Across all active ponds
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Daily Feed</CardTitle>
          <Fish className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDailyFeedQty.toFixed(2)} kg</div>
          <p className="text-xs text-muted-foreground">Estimated for today</p>
        </CardContent>
      </Card>
      <Card className={pondsWithoutSchedule > 0 ? "border-destructive/50" : ""}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ponds Without Schedule</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${pondsWithoutSchedule > 0 ? "text-destructive" : "text-muted-foreground"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${pondsWithoutSchedule > 0 ? "text-destructive" : ""}`}>{pondsWithoutSchedule}</div>
          <p className="text-xs text-muted-foreground">Ponds missing a feeding plan</p>
        </CardContent>
      </Card>
    </div>
  );
};