export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "Trial Booked"
  | "Joined"
  | "Not Interested"
  | "Lost";

export interface Enquiry {
  id: number;
  created_at: string;

  Name: string;
  Phone: string;
  Email: string | null;

  Program: string | null;

  Status: EnquiryStatus;

  Follow_up_date: string | null;

  Notes: string | null;

  Source: string | null;
}