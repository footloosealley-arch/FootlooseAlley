export interface Student {
  id: number;
  created_at: string;

  Name: string | null;
  Phone: string | null;
  Email: string | null;

  Program: string | null;

  Fees: number | null;
  Fees_due: number | null;

  Status: string | null;

  Address: string | null;
  Emergency_contact: string | null;

  photo_url: string | null;

  membership_plan: string | null;

  join_date: string | null;

  date_of_birth: string | null;

  gender: string | null;

  next_due_date: string | null;

  last_payment_date: string | null;

  fee_status: string | null;

  student_code: string | null;

  batch: string | null;

  instructor_id: number | null;

  medical_notes: string | null;

  attendance_percentage: number | null;

  whatsapp_enabled: boolean | null;

  notes: string | null;

  referred_by: string | null;

  membership_frozen: boolean | null;

  last_attendance: string | null;

  class_id: number | null;
}

export interface Payment {
  id: number;

  created_at: string;

  student_id: number;

  amount: number;

  payment_date: string;

  payment_method: string | null;

  remarks: string | null;

  received_by: string | null;

  invoice_number: string | null;

  payment_status: string | null;

  reference_number: string | null;
}

export interface PaymentWithStudent extends Payment {
  student: Pick<
    Student,
    | "id"
    | "Name"
    | "Phone"
    | "student_code"
    | "Program"
    | "Fees"
    | "Fees_due"
    | "fee_status"
  > | null;
}

export interface CreatePaymentInput {
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  remarks?: string | null;
  received_by?: string | null;
  invoice_number?: string | null;
  payment_status?: string | null;
  reference_number?: string | null;
}

export interface PaymentSummary {
  totalCollected: number;
  monthCollected: number;
  todayCollected: number;
  pendingAmount: number;
  paymentCount: number;
}

export interface Attendance {
  id: number;

  student_id: number | null;

  date: string | null;

  status: string | null;

  class_id: number | null;

  instructor_id: number | null;

  check_in_time: string | null;

  check_out_time: string | null;

  remarks: string | null;

  marked_by: string | null;

  session_name: string | null;

  marked_at: string | null;

  attendance_mode: string | null;
}

export interface Enquiry {
  id: number;

  created_at: string;

  Name: string;

  Phone: string;

  Email: string | null;

  Program: string | null;

  Status: string | null;

  Follow_up_date: string | null;

  Notes: string | null;

  source: string | null;

  assigned_to: string | null;

  last_contacted: string | null;

  trial_date: string | null;
}

export interface Instructor {
  id: number;

  created_at: string;

  name: string | null;

  phone: string | null;

  specialization: string | null;

  status: string | null;
}

export interface StudioClass {
  id: number;

  created_at: string;

  class_name: string | null;

  program: string | null;

  day: string | null;

  start_time: string | null;

  end_time: string | null;

  instructor_id: number | null;

  status: string | null;

  max_capacity: number | null;
}

export interface Membership {
  id: number;

  created_at: string;

  student_id: number;

  plan: string | null;

  amount: number | null;

  start_date: string | null;

  expiry_date: string | null;

  status: string | null;

  payment_status: string | null;

  renewal_date: string | null;

  renewed_from: number | null;

  invoice_number: string | null;

  discount: number | null;

  payment_id: number | null;
}

export interface DashboardStats {
  totalStudents: number;

  activeStudents: number;

  frozenStudents: number;

  newEnquiries: number;

  todayAttendance: number;

  monthRevenue: number;

  feesDue: number;
}