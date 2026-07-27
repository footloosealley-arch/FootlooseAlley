export type Payment = {
  id: number;

  created_at?: string;

  student_id: number;

  amount: number;

  payment_date: string;

  payment_method: string;

  remarks?: string;

  received_by?: string;
};