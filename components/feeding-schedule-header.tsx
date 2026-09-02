"use client";

import React, { useEffect, useState, useMemo } from "react";
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

import { useAuth } from "@/lib/auth-context";
import { getPonds, Pond } from "@/lib/pond-api";

import {
  FeedingSchedule,
  FeedingStatus,
  ScheduleFrequency,
  MOCK_FEED_TYPES,
  FeedingTime,
} from "./types";
import type { FeedingSchedulePayload } from "@/lib/feeding-schedule-api";

interface FeedingScheduleHeaderProps {
  schedules?: FeedingSchedule[];
  onAddSchedule: (newSchedule: FeedingSchedulePayload) => void | Promise<void>;
}

export const FeedingScheduleHeader = ({
  schedules = [],
  onAddSchedule,
}: FeedingScheduleHeaderProps) => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  // Dynamic Pond state
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [loadingPonds, setLoadingPonds] = useState<boolean>(false);

  // Filter state
  const [filterPondId, setFilterPondId] = React.useState<string>("");

  // Form state for the dialog
  const [pondId, setPondId] = React.useState("");
  const [feedTypeId, setFeedTypeId] = React.useState("");
  const [species, setSpecies] = React.useState<string>("Tilapia");
  const [frequency, setFrequency] = React.useState<ScheduleFrequency>(
    ScheduleFrequency.TwiceDaily
  );
  const [feedingTimes, setFeedingTimes] = React.useState<
    Partial<FeedingTime>[]
  >([
    { time: "08:00", quantity: 0, unit: "kg" },
    { time: "16:00", quantity: 0, unit: "kg" },
  ]);
  const [isActive, setIsActive] = React.useState<boolean>(true);
  const [daysOfWeek, setDaysOfWeek] = React.useState<number[]>([
    0, 1, 2, 3, 4, 5, 6,
  ]);
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [notes, setNotes] = React.useState("");

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Filter top dropdown ponds to only those that match existing schedules
  const pondsWithSchedules = useMemo(() => {
    const scheduledPondNames = new Set(schedules.map((s) => s.pondName));
    return ponds.filter((pond) => scheduledPondNames.has(pond.name));
  }, [ponds, schedules]);

  // Fetch ponds dynamically on component mount / token availability
  useEffect(() => {
    const fetchPonds = async () => {
      if (!token) return;
      setLoadingPonds(true);
      try {
        const pondList = await getPonds(token);
        setPonds(pondList);
      } catch (err: any) {
        toast.error(err.message || "Failed to load ponds list.");
      } finally {
        setLoadingPonds(false);
      }
    };

    fetchPonds();
  }, [token]);

  // Handle pond selection in the modal to automatically pre-fill species
  const handlePondSelect = (selectedId: string | null) => {
    if (!selectedId) return;
    setPondId(selectedId);
    const selectedPond = ponds.find((p) => String(p.id) === String(selectedId));
    if (selectedPond && selectedPond.currentStock?.species) {
      setSpecies(selectedPond.currentStock.species);
    }
  };

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

  const handleSubmit = async () => {
    if (!pondId || !feedTypeId || !startDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const pond = ponds.find((p) => String(p.id) === String(pondId));
    const feedType = MOCK_FEED_TYPES.find((f) => f.id === feedTypeId);

    if (!pond || !feedType) {
      toast.error("Invalid pond or feed type selected.");
      return;
    }

    const totalTargetAmount = feedingTimes.reduce(
      (total, time) => total + Number(time.quantity || 0),
      0
    );

    const newSchedule: FeedingSchedulePayload = {
      pond_name: pond.name,
      species: species,
      feed_type: feedType.name,
      target_amount: totalTargetAmount,
      feeding_time: feedingTimes[0]?.time || "08:00",
      frequency: frequency,
      is_active: isActive,
      note: notes || "",
    };

    try {
      await onAddSchedule(newSchedule);
      toast.success("New feeding schedule has been added successfully.");
      setPondId("");
      setFeedTypeId("");
      setSpecies("Tilapia");
      setFrequency(ScheduleFrequency.TwiceDaily);
      setFeedingTimes([
        { time: "08:00", quantity: 0, unit: "kg" },
        { time: "16:00", quantity: 0, unit: "kg" },
      ]);
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setStartDate(new Date());
      setEndDate(undefined);
      setNotes("");
      setIsActive(true);
      setIsOpen(false);
    } catch (err) {
      // Handled by caller
    }
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
        {/* Top-level Pond Filter - Shows ONLY ponds with schedules */}
        <Select value={filterPondId} onValueChange={(value) => setFilterPondId(value || "")}>
          <SelectTrigger className="w-64 h-11 rounded-sm">
            <SelectValue placeholder={loadingPonds ? "Loading ponds..." : "Filter by Pond/Batch..."} />
          </SelectTrigger>
          <SelectContent>
            {pondsWithSchedules.map((pond) => (
              <SelectItem key={pond.id} value={String(pond.id)}>
                {pond.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl p-6">
            <DialogHeader>
              <DialogTitle>Add New Feeding Schedule</DialogTitle>
              <DialogDescription>
                Fill out the details to create a new schedule.
              </DialogDescription>
            </DialogHeader>
            <div className="gap-4 flex flex-col py-4 max-h-[70vh] overflow-y-auto pr-4">
              {/* Dynamic Pond Selection - Retains ALL ponds so new schedules can be created */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pond" className="text-right">
                  Pond/Batch
                </Label>
                <Select value={pondId} onValueChange={handlePondSelect}>
                  <SelectTrigger className="col-span-3 rounded-sm h-11">
                    <SelectValue placeholder={loadingPonds ? "Loading ponds..." : "Select a pond"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ponds.map((pond) => (
                      <SelectItem key={pond.id} value={String(pond.id)}>
                        {pond.name} {pond.currentStock?.species ? `(${pond.currentStock.species})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Species & Feed Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Species</Label>
                <Input
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="col-span-3 h-11 rounded-sm"
                  placeholder="e.g. Tilapia"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Feed Type</Label>
                <Select value={feedTypeId} onValueChange={(value: any) => setFeedTypeId(value ?? "")}>
                  <SelectTrigger className="col-span-3 rounded-sm h-11">
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_FEED_TYPES.map((feed) => (
                      <SelectItem key={feed.id} value={feed.id}>
                        {feed.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Frequency */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Frequency</Label>
                <Select value={frequency} onValueChange={(value: any) => setFrequency(value as ScheduleFrequency)}>
                  <SelectTrigger className="col-span-3 rounded-sm h-11">
                    <SelectValue placeholder={frequency} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ScheduleFrequency).map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feeding times rows */}
              <div className="col-span-4">
                <Label className="mb-2">Feeding Times</Label>
                <div className="space-y-2">
                  {feedingTimes.map((ft, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="time"
                        value={ft.time || ""}
                        onChange={(e) => handleTimeChange(idx, "time", e.target.value)}
                        className="col-span-4 h-10 px-2 rounded border border-gray-300 bg-transparent text-sm"
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={ft.quantity ?? 0}
                        onChange={(e) => handleTimeChange(idx, "quantity", Number(e.target.value))}
                        className="col-span-4 h-10 px-2 rounded border border-gray-300 bg-transparent text-sm"
                        placeholder="Quantity"
                      />
                      <Select
                        value={ft.unit || "kg"}
                        onValueChange={(v: any) => handleTimeChange(idx, "unit", v)}
                      >
                        <SelectTrigger className="col-span-2 h-10 rounded">
                          <SelectValue placeholder={ft.unit || "kg"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => removeTimeRow(idx)}
                        className="col-span-2 inline-flex items-center justify-center h-10 rounded border border-transparent text-red-600 hover:bg-red-50"
                        title="Remove time"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <Button variant="ghost" onClick={addTimeRow} className="h-9">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add time
                  </Button>
                </div>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Days</Label>
                <div className="col-span-3 grid grid-cols-7 gap-2">
                  {dayLabels.map((label, idx) => (
                    <label key={label} className="flex flex-col items-center">
                      <Checkbox
                        checked={daysOfWeek.includes(idx)}
                        onCheckedChange={(checked) => handleDayChange(idx, Boolean(checked))}
                      />
                      <span className="text-xs mt-1">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start & End Date */}
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">End Date</Label>
                <Popover>
                  <PopoverTrigger>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "col-span-3 justify-start text-left font-normal rounded-sm h-11",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Optional</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Active toggle & Notes */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Active</Label>
                <div className="col-span-3">
                  <label className="inline-flex items-center space-x-2">
                    <Checkbox checked={isActive} onCheckedChange={(c) => setIsActive(Boolean(c))} />
                    <span className="text-sm">Enable this schedule</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="col-span-3 h-24"
                  placeholder="Optional notes or instructions"
                />
              </div>

              {/* Summary: total target */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total Target</Label>
                <div className="col-span-3">
                  <div className="text-sm font-medium">
                    {feedingTimes.reduce((t, f) => t + Number(f.quantity || 0), 0)} kg
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!pondId || !feedTypeId || !startDate || feedingTimes.length === 0}
              >
                Save Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};