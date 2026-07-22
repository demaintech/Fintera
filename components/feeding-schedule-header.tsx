"use client";

import React from "react";
import { PlusCircle, Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  FeedingSchedule,
  FeedingStatus,
  ScheduleFrequency,
  MOCK_PONDS,
  MOCK_FEED_TYPES,
  FeedingTime,
} from "./types";

interface FeedingScheduleHeaderProps {
  onAddSchedule: (newSchedule: Omit<FeedingSchedule, "id">) => void;
}

export const FeedingScheduleHeader = ({
  onAddSchedule,
}: FeedingScheduleHeaderProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  // A real implementation would use a multi-select component library or build one on top of shadcn
  const [selectedPonds, setSelectedPonds] = React.useState<string[]>([]);

  // Form state for the dialog
  const [pondId, setPondId] = React.useState("");
  const [feedTypeId, setFeedTypeId] = React.useState("");
  const [frequency, setFrequency] = React.useState<ScheduleFrequency>(
    ScheduleFrequency.TwiceDaily
  );
  const [feedingTimes, setFeedingTimes] = React.useState<
    Partial<FeedingTime>[]
  >([
    { time: "08:00", quantity: 0, unit: "kg" },
    { time: "16:00", quantity: 0, unit: "kg" },
  ]);
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [notes, setNotes] = React.useState("");

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayChange = (dayIndex: number, checked: boolean) => {
    if (checked) {
      setDaysOfWeek((prev) => [...prev, dayIndex].sort());
    } else {
      setDaysOfWeek((prev) => prev.filter((d) => d !== dayIndex));
    }
  };

  const handleTimeChange = (index: number, field: string, value: any) => {
    const newTimes = [...feedingTimes];
    (newTimes[index] as any)[field] = value;
    setFeedingTimes(newTimes);
  };

  const addTimeRow = () => {
    setFeedingTimes([...feedingTimes, { time: "", quantity: 0, unit: "kg" }]);
  };

  const removeTimeRow = (index: number) => {
    setFeedingTimes(feedingTimes.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!pondId || !feedTypeId || !startDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const pond = MOCK_PONDS.find((p) => p.id === pondId);
    const feedType = MOCK_FEED_TYPES.find((f) => f.id === feedTypeId);

    if (!pond || !feedType) {
      toast.error("Invalid pond or feed type selected.");
      return;
    }

    const newSchedule: Omit<FeedingSchedule, "id"> = {
      pondId,
      pondName: pond.name,
      feedTypeId,
      feedTypeName: feedType.name,
      frequency,
      feedingTimes: feedingTimes.map((ft, i) => ({
        id: `new-t-${i}`,
        time: ft.time || "00:00",
        quantity: ft.quantity || 0,
        unit: ft.unit || "kg",
      })),
      daysOfWeek,
      startDate,
      endDate,
      notes,
      status: FeedingStatus.Active,
    };

    // TODO: API call to create schedule
    onAddSchedule(newSchedule);
    toast.success("New feeding schedule has been added successfully.");
    setIsOpen(false);
    // Reset form state here if needed
  };

  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Feeding Schedule</h2>
        <p className="text-muted-foreground">
          Manage and monitor feeding schedules for all ponds.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        {/* This would be a multi-select component in a real app */}
        <Select>
          <SelectTrigger className="w-64 h-11 rounded-sm">
            <SelectValue placeholder="Filter by Pond/Batch..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_PONDS.map((pond) => (
              <SelectItem key={pond.id} value={pond.id}>
                {pond.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>
              <PlusCircle className="mr-2 h-11 w-4" /> Add New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle>Add New Feeding Schedule</DialogTitle>
              <DialogDescription>
                Fill out the details to create a new schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              {/* Form fields go here */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pond" className="text-right">
                  Pond/Batch
                </Label>
                <Select onValueChange={(value: any) => setPondId(value ?? "")}>
                  <SelectTrigger className="col-span-3 rounded-sm h-11">
                    <SelectValue placeholder="Select a pond" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PONDS.map((pond) => (
                      <SelectItem key={pond.id} value={pond.id}>
                        {pond.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* ... other form fields like feed type, frequency, etc. */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Start Date</Label>
                <Popover>
                  <PopoverTrigger>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal rounded-sm h-11",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit}>
                Save Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};