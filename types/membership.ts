export type MembershipStatus =
  | "Active"
  | "Expired"
  | "Cancelled";


export type PaymentStatus =
  | "Paid"
  | "Pending";


export type Membership = {

  id:number;

  created_at?:string;


  student_id:number;


  plan:string;


  amount:number;


  start_date:string;


  expiry_date:string;


  status:MembershipStatus;


  payment_status:PaymentStatus;

};