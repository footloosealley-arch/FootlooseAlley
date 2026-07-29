import type { Metadata } from "next";

import PublicIntakeForm from "@/components/public-forms/PublicIntakeForm";

export const metadata: Metadata = {
  title: "Student Registration",
  description:
    "Register as a student at Footloose Alley Dance and Fitness Studio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicStudentFormPage() {
  return <PublicIntakeForm kind="student" />;
}
