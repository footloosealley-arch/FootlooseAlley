export const ENQUIRY_STATUSES = [
  "New",
  "Contacted",
  "Follow-up",
  "Trial Scheduled",
  "Trial Completed",
  "Joined",
  "Not Interested",
] as const;

export const ENQUIRY_SOURCES = [
  "Instagram",
  "Facebook",
  "Google",
  "Walk-in",
  "Referral",
  "WhatsApp",
  "Existing Student",
  "Other",
] as const;

export const ENQUIRY_GENDERS = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
] as const;

export type EnquiryStatus =
  (typeof ENQUIRY_STATUSES)[number];

export type EnquirySource =
  (typeof ENQUIRY_SOURCES)[number];

export type EnquiryGender =
  (typeof ENQUIRY_GENDERS)[number];

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  gender: EnquiryGender | null;
  age: number | null;
  interested_in: string;
  source: EnquirySource;
  status: EnquiryStatus;
  enquiry_date: string;
  follow_up_date: string | null;
  trial_date: string | null;
  assigned_to: string | null;
  notes: string | null;
  converted_student_id: number | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEnquiryInput {
  name: string;
  phone: string;
  email?: string | null;
  gender?: EnquiryGender | null;
  age?: number | null;
  interested_in: string;
  source?: EnquirySource;
  status?: EnquiryStatus;
  enquiry_date?: string;
  follow_up_date?: string | null;
  trial_date?: string | null;
  assigned_to?: string | null;
  notes?: string | null;
}

export interface UpdateEnquiryInput {
  name?: string;
  phone?: string;
  email?: string | null;
  gender?: EnquiryGender | null;
  age?: number | null;
  interested_in?: string;
  source?: EnquirySource;
  status?: EnquiryStatus;
  enquiry_date?: string;
  follow_up_date?: string | null;
  trial_date?: string | null;
  assigned_to?: string | null;
  notes?: string | null;
  converted_student_id?: number | null;
  converted_at?: string | null;
}

export type EnquiryFollowUpFilter =
  | "All"
  | "Today"
  | "Overdue"
  | "Upcoming";

export interface EnquiryFilters {
  search?: string;
  status?: EnquiryStatus | "All";
  source?: EnquirySource | "All";
  followUp?: EnquiryFollowUpFilter;
}

export interface EnquirySummary {
  total: number;
  new: number;
  contacted: number;
  followUpsToday: number;
  overdueFollowUps: number;
  trialsScheduled: number;
  joined: number;
  notInterested: number;
  conversionRate: number;
}