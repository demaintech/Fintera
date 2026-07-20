import { FeedingSchedule, Pond } from "./types";

interface ScheduleAlertsProps {
  schedules: FeedingSchedule[];
  allPonds: Pond[];
}

export const ScheduleAlerts = ({ schedules, allPonds }: ScheduleAlertsProps) => {
  // TODO: Implement alerts for schedules ending soon or ponds without schedules
  return <div>Alerts Placeholder</div>;
};