export type Pond = {
  id: string;
  name: string;
};

export type Species = {
  id: string;
  commonName: string;
  scientificName?: string;
  description?: string;
  color?: string;
  totalStock: number;
  pondsCurrentlyUsing: string[];
};

export type FeedType = {
  id: string;
  name: string;
  protein_percentage: number;
  costPerKg: number;
};

export enum ScheduleFrequency {
  OnceDaily = "Once Daily",
  TwiceDaily = "Twice Daily",
  ThriceDaily = "Thrice Daily",
  Custom = "Custom",
}

export enum FeedingStatus {
  Active = "Active",
  Paused = "Paused",
  Completed = "Completed",
  Upcoming = "Upcoming",
}

export type FeedingTime = {
  id: string;
  time: string; // "HH:MM"
  quantity: number;
  unit: "kg" | "g";
};

export type FeedingSchedule = {
  id: string;
  pondId: string;
  pondName: string;
  feedTypeId: string;
  feedTypeName: string;
  frequency: ScheduleFrequency;
  feedingTimes: FeedingTime[];
  daysOfWeek: number[]; // 0 for Sunday, 1 for Monday, etc.
  startDate: Date;
  endDate?: Date;
  notes?: string;
  status: FeedingStatus;
};

export const MOCK_PONDS: Pond[] = [
  { id: "pond-01", name: "Pond A1" },
  { id: "pond-02", name: "Pond A2" },
  { id: "pond-03", name: "Pond B1 (Broodstock)" },
  { id: "pond-04", name: "Nursery Pond N1" },
  { id: "pond-05", name: "Grow-out Pond G1" },
];

export const MOCK_FEED_TYPES: FeedType[] = [
  { id: "feed-01", name: "Starter Mash (45%)", protein_percentage: 45, costPerKg: 1.20 },
  { id: "feed-02", name: "Grower Pellet (35%)", protein_percentage: 35, costPerKg: 0.95 },
  { id: "feed-03", name: "Finisher Pellet (28%)", protein_percentage: 28, costPerKg: 0.75 },
  { id: "feed-04", name: "High-Protein Fry Feed", protein_percentage: 50, costPerKg: 2.50 },
];

export const MOCK_SCHEDULES: FeedingSchedule[] = [
  {
    id: "sch-001",
    pondId: "pond-01",
    pondName: "Pond A1",
    feedTypeId: "feed-02",
    feedTypeName: "Grower Pellet (35%)",
    frequency: ScheduleFrequency.TwiceDaily,
    feedingTimes: [
      { id: "t-1", time: "08:00", quantity: 5, unit: "kg" },
      { id: "t-2", time: "16:00", quantity: 5.5, unit: "kg" },
    ],
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // All days
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    status: FeedingStatus.Active,
    notes: "Standard feeding protocol for tilapia grow-out.",
  },
  {
    id: "sch-002",
    pondId: "pond-04",
    pondName: "Nursery Pond N1",
    feedTypeId: "feed-04",
    feedTypeName: "High-Protein Fry Feed",
    frequency: ScheduleFrequency.ThriceDaily,
    feedingTimes: [
      { id: "t-3", time: "07:00", quantity: 500, unit: "g" },
      { id: "t-4", time: "12:00", quantity: 500, unit: "g" },
      { id: "t-5", time: "17:00", quantity: 500, unit: "g" },
    ],
    daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 60)),
    status: FeedingStatus.Active,
    notes: "Temporary high-frequency feeding for new fry.",
  },
  // ... more mock schedules can be added here
];