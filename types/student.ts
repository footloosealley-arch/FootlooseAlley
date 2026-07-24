export type Student = {

  id: number;

  created_at?: string;


  Name: string;

  Phone: string;

  Email?: string;

  Address?: string;

  Emergency_contact?: string;


  Program?: string;


  Fees?: number;

  Fees_due?: number;



  // Fee Management

  fee_status?: string;

  next_due_date?: string;

  last_payment_date?: string;




  Status?: string;


  photo_url?: string;


  membership_plan?: string;


  join_date?: string;


  date_of_birth?: string;


  gender?: string;

};