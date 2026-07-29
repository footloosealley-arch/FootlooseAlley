export type StudentIntakeStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export interface StudentIntakeSubmission {
  id: number;
  created_at: string;
  updated_at: string;
  google_form_response_id: string;
  source: string;
  status: StudentIntakeStatus;
  Name: string;
  Phone: string;
  normalized_phone: string;
  Email: string | null;
  Program: string | null;
  date_of_birth: string | null;
  gender: string | null;
  Address: string | null;
  Emergency_contact: string | null;
  photo_path: string | null;
  medical_notes: string | null;
  batch: string | null;
  whatsapp_enabled: boolean;
  notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  student_id: number | null;
}
