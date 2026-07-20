import { FeedingSchedule } from "./types";

interface ScheduleListViewProps {
  schedules: FeedingSchedule[];
  onUpdateSchedule: (schedule: FeedingSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
}

export const ScheduleListView = (props: ScheduleListViewProps) => {
  // TODO: Implement list view with a shadcn/ui Table
  return <div>List View Placeholder</div>;
};