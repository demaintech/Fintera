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
    const fetchSchedules = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
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
    const createdSchedule: FeedingSchedule = {
      ...newSchedule,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [createdSchedule, ...prev]);
  };

  const handleUpdateSchedule = (updatedSchedule: FeedingSchedule) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-destructive font-medium">
        {error}
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <FeedingScheduleHeader onAddSchedule={handleAddSchedule} />

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <ScheduleKpiCards schedules={schedules} allPonds={MOCK_PONDS} />

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <section className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">All Feeding Schedules</h2>
              <ScheduleListView
                schedules={schedules}
                onUpdateSchedule={handleUpdateSchedule}
                onDeleteSchedule={handleDeleteSchedule}
              />
            </section>

            <aside className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight">Today's Checklist</h2>
              <TodaysFeedingChecklist schedules={schedules} />
            </aside>
          </div>
        </>
      )}
      <Toaster />
    </main>
  );
};

// Required default export for Next.js App Router pages
export default FeedingSchedulePage;