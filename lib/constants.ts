export const APP = {
  NAME: "Footloose Alley Studio Manager",
  SHORT_NAME: "Footloose Alley",
  VERSION: "2.0.0",
} as const;

export const STUDENT_STATUS = [
  "Active",
  "Inactive",
  "Frozen",
] as const;

export const ENQUIRY_STATUS = [
  "New",
  "Follow Up",
  "Trial",
  "Joined",
  "Closed",
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "Card",
  "Bank Transfer",
] as const;

export const ATTENDANCE_STATUS = [
  "Present",
  "Absent",
  "Late",
] as const;