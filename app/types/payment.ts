export interface Payment {
  id: number;
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  remarks: string;
  received_by: string;
  Students?: {
    Name: string;
    Fees?: number;
    Fees_due?: number;
    Status?: string;
  };
}

export interface PaymentFormData {
  student_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  remarks: string;
  received_by: string;
}