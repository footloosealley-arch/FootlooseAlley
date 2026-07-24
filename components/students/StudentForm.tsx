"use client";

import { useState } from "react";
import type { Student } from "@/types/student";

export type StudentData = {
  Name: string;
  Phone: string;
  Email: string;
  Address: string;
  Emergency_contact: string;
  Program: string;
  Fees: number;
  membership_plan?: string;
  join_date?: string;
  date_of_birth?: string;
  gender?: string;
  photo_url?: string;
};

type StudentFormProps = {
  student?: Student | null;
  onSave: (student: StudentData) => void;
  onCancel: () => void;
};

export default function StudentForm({
  student,
  onSave,
  onCancel,
}: StudentFormProps) {
  const [formData, setFormData] = useState<StudentData>({
    Name: student?.Name ?? "",
    Phone: student?.Phone ?? "",
    Email: student?.Email ?? "",
    Address: student?.Address ?? "",
    Emergency_contact: student?.Emergency_contact ?? "",
    Program: student?.Program ?? "",
    Fees: student?.Fees ?? 0,
    membership_plan: student?.membership_plan ?? "Monthly",
    join_date: student?.join_date ?? "",
    date_of_birth: student?.date_of_birth ?? "",
    gender: student?.gender ?? "",
    photo_url: student?.photo_url ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "Fees" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.Name.trim()) {
      alert("Student name is required.");
      return;
    }

    if (!formData.Phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    if (formData.Fees < 0) {
      alert("Fees cannot be negative.");
      return;
    }

    onSave(formData);
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-8 text-2xl font-bold text-slate-800">
        {student ? "Edit Student" : "Add New Student"}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 md:grid-cols-2"
      >
        <input
          name="Name"
          placeholder="Full Name *"
          value={formData.Name}
          onChange={handleChange}
          className="rounded-xl border p-3"
          required
        />

        <input
          name="Phone"
          placeholder="Phone Number *"
          value={formData.Phone}
          onChange={handleChange}
          className="rounded-xl border p-3"
          required
        />

        <input
          type="email"
          name="Email"
          placeholder="Email"
          value={formData.Email}
          onChange={handleChange}
          className="rounded-xl border p-3"
        />

        <input
          name="Address"
          placeholder="Address"
          value={formData.Address}
          onChange={handleChange}
          className="rounded-xl border p-3"
        />

        <input
          name="Emergency_contact"
          placeholder="Emergency Contact"
          value={formData.Emergency_contact}
          onChange={handleChange}
          className="rounded-xl border p-3"
        />

        <select
          name="Program"
          value={formData.Program}
          onChange={handleChange}
          className="rounded-xl border p-3"
        >
          <option value="">Select Program</option>
          <option>Zumba</option>
          <option>Dance Fitness</option>
          <option>Bollywood</option>
          <option>Hip Hop</option>
          <option>Kids Dance</option>
          <option>Personal Training</option>
        </select>

        <input
          type="number"
          min="0"
          name="Fees"
          placeholder="Fees"
          value={formData.Fees}
          onChange={handleChange}
          className="rounded-xl border p-3"
        />

        <select
          name="membership_plan"
          value={formData.membership_plan}
          onChange={handleChange}
          className="rounded-xl border p-3"
        >
          <option>Monthly</option>
          <option>3 Months</option>
          <option>6 Months</option>
          <option>Yearly</option>
        </select>

        <input
          type="date"
          name="join_date"
          value={formData.join_date}
          onChange={handleChange}
          className="rounded-xl border p-3"
        />

        <input
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="rounded-xl border p-3"
        />

        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="rounded-xl border p-3"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input
          name="photo_url"
          placeholder="Photo URL"
          value={formData.photo_url}
          onChange={handleChange}
          className="rounded-xl border p-3"
        />

        <div className="md:col-span-2 mt-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border px-6 py-3 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            {student ? "Update Student" : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}