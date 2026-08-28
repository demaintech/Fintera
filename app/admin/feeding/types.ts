export enum ScheduleFrequency {
  OnceDaily = "Once Daily",
  TwiceDaily = "Twice Daily",
  ThreeTimesDaily = "3x Daily",
  Custom = "Custom",
}

export interface FeedingTime {
  time: string;
  quantity: number;
  unit: string;
}

export interface Pond {
  id: string;
  name: string;
}

export interface FeedType {
  id: string;
  name: string;
}

export const MOCK_PONDS: Pond[] = [
  { id: "pond-1", name: "Pond A - Nursery" },
  { id: "pond-2", name: "Pond B - Growout 1" },
  { id: "pond-3", name: "Pond C - Growout 2" },
];

export const MOCK_FEED_TYPES: FeedType[] = [
  { id: "feed-1", name: "Starter Pellets 2mm" },
  { id: "feed-2", name: "Grower Pellets 4mm" },
  { id: "feed-3", name: "Finisher Pellets 6mm" },
];