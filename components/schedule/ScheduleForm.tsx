"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  User,
  Calendar,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";

import type { Schedule } from "@/types/schedule";

type Props = {
  onSave: (
    schedule: Omit<Schedule, "id" | "created_at">
  ) => Promise<void>;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PROGRAMS = [
  "Zumba",
  "Dance Fitness",
  "Bollywood",
  "Hip Hop",
  "Kids Dance",
  "Personal Training",
];

export default function ScheduleForm({ onSave }: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    class_name: "",
    instructor: "",
    program: "",
    day: "Monday",
    start_time: "",
    end_time: "",
    capacity: 30,
    status: "Active",
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.class_name.trim() ||
      !form.program ||
      !form.start_time ||
      !form.end_time
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (form.start_time >= form.end_time) {
      toast.error("End time must be after start time.");
      return;
    }

    try {
      setLoading(true);

      await onSave(form);

      toast.success("Class added successfully.");

      setForm({
        class_name: "",
        instructor: "",
        program: "",
        day: "Monday",
        start_time: "",
        end_time: "",
        capacity: 30,
        status: "Active",
      });
    } catch (error) {
      console.error(error);
      toast.error("Unable to save class.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-slate-800">
        Add New Class
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <BookOpen size={18} />
            Class Name
          </label>

          <input
            value={form.class_name}
            onChange={(e) =>
              update("class_name", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
            placeholder="Morning Zumba"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <User size={18} />
            Instructor
          </label>

          <input
            value={form.instructor}
            onChange={(e) =>
              update("instructor", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
            placeholder="Henry Vincent"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <BookOpen size={18} />
            Program
          </label>

          <select
            value={form.program}
            onChange={(e) =>
              update("program", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select Program</option>

            {PROGRAMS.map((program) => (
              <option key={program}>
                {program}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <Calendar size={18} />
            Day
          </label>

          <select
            value={form.day}
            onChange={(e) =>
              update("day", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          >
            {DAYS.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <Clock size={18} />
            Start Time
          </label>

          <input
            type="time"
            value={form.start_time}
            onChange={(e) =>
              update("start_time", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <Clock size={18} />
            End Time
          </label>

          <input
            type="time"
            value={form.end_time}
            onChange={(e) =>
              update("end_time", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <Users size={18} />
            Capacity
          </label>

          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) =>
              update("capacity", Number(e.target.value))
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 font-medium">
            <CheckCircle size={18} />
            Status
          </label>

          <select
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value)
            }
            className="w-full rounded-xl border p-3 focus:border-indigo-500 focus:outline-none"
          >
            <option>Active</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Class"}
        </button>
      </div>
    </form>
  );
}