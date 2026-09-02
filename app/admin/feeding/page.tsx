"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';

import { MOCK_PONDS } from '@/components/types';
import { FeedingScheduleHeader } from '@/components/feeding-schedule-header';
import { ScheduleKpiCards } from '@/components/schedule-kpi-cards';

import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  FeedingScheduleItem,
  FeedingSchedulePayload,
} from '@/lib/feeding-schedule-api';
import {
  FeedingStatus,
  ScheduleFrequency,
  type FeedingSchedule,
} from '@/components/types';

const FeedingSchedulePage = () => {
  const [schedules, setSchedules] = useState<FeedingScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inline table edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<FeedingSchedulePayload>>({});
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchSchedulesData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSchedules();
      setSchedules(response.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch feeding schedules.');
      toast.error(err?.message || 'Failed to load feeding schedules.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedulesData();
  }, [fetchSchedulesData]);

  // Handler for Modal Submission
  const handleAddSchedule = async (newSchedule: FeedingSchedulePayload) => {
    try {
      const created = await createSchedule(newSchedule);
      setSchedules((prev) => [created, ...prev]);
      toast.success('Feeding schedule created successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create schedule.');
      throw err;
    }
  };

  // Row edit toggle functions
  const handleStartEdit = (schedule: FeedingScheduleItem) => {
    setEditingId(schedule.id);
    setEditForm({ ...schedule });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // PATCH request handler
  const handleSaveEdit = async (scheduleId: number) => {
    setIsUpdating(true);
    try {
      const updated = await updateSchedule(scheduleId, editForm);
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, ...updated } : s))
      );
      toast.success('Schedule updated successfully!');
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update schedule.');
    } finally {
      setIsUpdating(false);
    }
  };

  // DELETE request handler
  const handleDelete = async (scheduleId: number) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    setDeletingId(scheduleId);
    try {
      await deleteSchedule(scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      toast.success('Schedule deleted successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete schedule.');
    } finally {
      setDeletingId(null);
    }
  };

  if (error && schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-red-500 font-medium space-y-4">
        <p>{error}</p>
        <button
          onClick={fetchSchedulesData}
          className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const formattedSchedules: FeedingSchedule[] = schedules.map((schedule, index) => ({
    id: String(schedule.id),
    pondId: `pond-${index + 1}`,
    pondName: schedule.pond_name,
    feedTypeId: schedule.feed_type,
    feedTypeName: schedule.feed_type,
    frequency: schedule.frequency as ScheduleFrequency,
    feedingTimes: [
      {
        id: `feeding-${schedule.id}`,
        time: schedule.feeding_time,
        quantity: Number(schedule.target_amount || 0),
        unit: 'kg' as const,
      },
    ],
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startDate: new Date(),
    endDate: undefined,
    notes: schedule.note || '',
    status: schedule.is_active ? FeedingStatus.Active : FeedingStatus.Paused,
  }));

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
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <ScheduleKpiCards schedules={formattedSchedules} allPonds={MOCK_PONDS} />

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              All Feeding Schedules
            </h2>

            {/* Management Table */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
                  <thead className="text-xs text-gray-700 dark:text-slate-400 uppercase bg-gray-100/80 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3">Pond Name</th>
                      <th className="px-4 py-3">Species</th>
                      <th className="px-4 py-3">Feed Type</th>
                      <th className="px-4 py-3 text-right">Target (kg)</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Frequency</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                    {schedules.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          No feeding schedules found. Click above to create one.
                        </td>
                      </tr>
                    ) : (
                      schedules.map((schedule) => {
                        const isEditing = editingId === schedule.id;

                        return (
                          <tr
                            key={schedule.id}
                            className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40"
                          >
                            <td className="px-4 py-3  font-medium text-gray-900 dark:text-slate-100">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.pond_name || ''}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      pond_name: e.target.value,
                                    }))
                                  }
                                  className="w-full h-8 px-2 border rounded border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                                />
                              ) : (
                                schedule.pond_name
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.species || ''}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      species: e.target.value,
                                    }))
                                  }
                                  className="w-full h-8 px-2 border rounded border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                                />
                              ) : (
                                schedule.species
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.feed_type || ''}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      feed_type: e.target.value,
                                    }))
                                  }
                                  className="w-full h-8 px-2 border rounded border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                                />
                              ) : (
                                schedule.feed_type
                              )}
                            </td>

                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.1"
                                  value={editForm.target_amount ?? 0}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      target_amount: Number(e.target.value),
                                    }))
                                  }
                                  className="w-20 h-8 px-2 border rounded border-gray-300 dark:border-slate-700 bg-transparent text-sm text-right"
                                />
                              ) : (
                                `${schedule.target_amount} kg`
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.feeding_time || ''}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      feeding_time: e.target.value,
                                    }))
                                  }
                                  className="w-full h-8 px-2 border rounded border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                                />
                              ) : (
                                schedule.feeding_time
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editForm.frequency || ''}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      frequency: e.target.value,
                                    }))
                                  }
                                  className="w-full h-8 px-2 border rounded border-gray-300 dark:border-slate-700 bg-transparent text-sm"
                                />
                              ) : (
                                schedule.frequency
                              )}
                            </td>

                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editForm.is_active ?? true}
                                  onChange={(e) =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      is_active: e.target.checked,
                                    }))
                                  }
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              ) : (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    schedule.is_active
                                      ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                  }`}
                                >
                                  {schedule.is_active ? 'Active' : 'Inactive'}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleSaveEdit(schedule.id)}
                                    disabled={isUpdating}
                                    className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                                    title="Save"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleStartEdit(schedule)}
                                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(schedule.id)}
                                    disabled={deletingId === schedule.id}
                                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                                    title="Delete"
                                  >
                                    {deletingId === schedule.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
      <Toaster />
    </main>
  );
};

export default FeedingSchedulePage;