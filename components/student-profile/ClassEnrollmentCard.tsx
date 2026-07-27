"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getSchedules } from "@/lib/schedule";
import {
  getStudentSchedules,
  saveStudentSchedules,
} from "@/lib/studentSchedule";

import type { Schedule } from "@/types/schedule";

type Props = {
  studentId: number;
};

export default function ClassEnrollmentCard({
  studentId,
}: Props) {
  const [classes, setClasses] = useState<Schedule[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [scheduleData, enrolledData] = await Promise.all([
        getSchedules(),
        getStudentSchedules(studentId),
      ]);

      setClasses(scheduleData);
      setSelected(enrolledData.map((item: any) => item.schedule_id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load class enrollments.");
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  async function handleSave() {
    setSaving(true);

    try {
      await saveStudentSchedules(studentId, selected);
      toast.success("Class enrollments updated.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to save enrollments.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">
        Enrolled Classes
      </h2>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : classes.length === 0 ? (
        <p className="text-slate-500">
          No classes have been created yet.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {classes.map((cls) => (
              <label
                key={cls.id}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(cls.id)}
                  onChange={() => toggle(cls.id)}
                />

                <div>
                  <div className="font-medium">
                    {cls.class_name}
                  </div>

                  <div className="text-sm text-slate-500">
                    {cls.day} • {cls.start_time} - {cls.end_time}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Classes"}
          </button>
        </>
      )}
    </div>
  );
}