import type { Metadata } from "next";

import PublicIntakeForm from "@/components/public-forms/PublicIntakeForm";

export const metadata: Metadata = {
  title: "Enquiry Form",
  description:
    "Enquire about dance and fitness classes at Footloose Alley.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PublicEnquiryFormPage() {
  return <PublicIntakeForm kind="enquiry" />;
}
