"use client";

import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedingSchedule, MOCK_SCHEDULES, MOCK_PONDS } from "@/components/types";
import { FeedingScheduleHeader } from "@/components/feeding-schedule-header";
import { ScheduleKpiCards } from "@/components/schedule-kpi-cards";
import { TodaysFeedingChecklist } from "@/components/todays-feeding-checklist";
import { ScheduleListView } from "@/components/schedule-list-view";

const FeedingSchedulePage = () => {
  const [schedules, setSchedules] = useState<FeedingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: API call to fetch feeding schedules
    // Simulating API call
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        setSchedules(MOCK_SCHEDULES);
        setError(null);
      } catch (err) {
        setError("Failed to fetch feeding schedules.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const handleAddSchedule = (newSchedule: Omit<FeedingSchedule, "id">) => {
    // TODO: API call to create a new schedule
    console.log("Adding new schedule:", newSchedule);
    const createdSchedule: FeedingSchedule = {
      ...newSchedule,
      id: `sch-${Date.now()}`, // Mock ID generation
    };
    setSchedules((prev) => [...prev, createdSchedule]);
  };

  const handleUpdateSchedule = (updatedSchedule: FeedingSchedule) => {
    // TODO: API call to update a schedule
    console.log("Updating schedule:", updatedSchedule);
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    // TODO: API call to delete a schedule
    console.log("Deleting schedule:", scheduleId);
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <FeedingScheduleHeader onAddSchedule={handleAddSchedule} />

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Skeleton className="h-[400px] lg:col-span-2" />
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        ) : (
          <>
            <ScheduleKpiCards schedules={schedules} allPonds={MOCK_PONDS} />
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4">All Feeding Schedules</h3>
                <ScheduleListView schedules={schedules} onUpdateSchedule={handleUpdateSchedule} onDeleteSchedule={handleDeleteSchedule} />
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Today's Checklist</h3>
                <TodaysFeedingChecklist schedules={schedules} />
              </div>
            </div>
          </>
        )}
      </div>
      <Toaster />
    </>
  );
};

export default FeedingSchedulePage;