import { supabase } from "@/lib/supabase";



export async function getPayments(
  studentId:number
) {


  const {
    data,
    error,

  } = await supabase

    .from("Payments")

    .select("*")

    .eq(
      "student_id",
      studentId
    )

    .order(
      "id",
      {
        ascending:false,
      }
    );



  if(error){

    console.error(
      "Payment fetch error:",
      error
    );

  }



  return {

    data:data ?? [],

    error,

  };

}








export async function addPayment(

payment:{

  student_id:number;

  amount:number;

  payment_date?:string;

  method?:string;

  remarks?:string;

  received_by?:string;

}

){



const paymentDate =

payment.payment_date ??

new Date()
.toISOString()
.split("T")[0];







// Add payment record


const {

data,

error,

}=await supabase

.from("Payments")

.insert([

{

student_id:
payment.student_id,


amount:
Number(payment.amount),


payment_date:
paymentDate,


payment_method:
payment.method ?? "Cash",


remarks:
payment.remarks ?? "",


received_by:
payment.received_by ?? "",


}

])

.select();








if(error){

console.error(
"Add payment error:",
error
);

throw error;

}









// Get current student fee details


const {

data:student,

error:studentError

}=await supabase

.from("Students")

.select(
"Fees_due,next_due_date"
)

.eq(
"id",
payment.student_id
)

.single();






if(studentError){

throw studentError;

}









const currentDue =

Number(
student?.Fees_due ?? 0
);





const newDue =

Math.max(

currentDue -

Number(payment.amount),

0

);









// Decide fee status automatically


let feeStatus =
"Paid";



if(newDue > 0){


feeStatus =
"Due Soon";


}







if(
student?.next_due_date
){

const today =
new Date();


const dueDate =
new Date(
student.next_due_date
);



if(
dueDate < today
&& newDue > 0
){

feeStatus =
"Overdue";

}


}









// Update student fee details


const {

error:updateError

}=await supabase

.from("Students")

.update({

Fees_due:newDue,


last_payment_date:
paymentDate,


fee_status:
feeStatus,


})

.eq(
"id",
payment.student_id
);







if(updateError){

throw updateError;

}









return {

data:data ?? [],

error:null,

};


}