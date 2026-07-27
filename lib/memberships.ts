import { supabase } from "@/lib/supabase";



export async function getMemberships(){

  const {
    data,
    error,

  } = await supabase

    .from("Memberships")

    .select("*")

    .order(
      "created_at",
      {
        ascending:false
      }
    );


  if(error){

    console.error(
      "Membership fetch error:",
      error
    );

    throw error;

  }


  return data ?? [];

}







export async function addMembership(

membership:any

){


const {

data,

error,

}=await supabase

.from("Memberships")

.insert([membership])

.select()

.single();



if(error){

console.error(
"Add membership error:",
error
);

throw error;

}


return data;

}







export async function deleteMembership(
id:number
){

const {
error

}=await supabase

.from("Memberships")

.delete()

.eq(
"id",
id
);



if(error){

throw error;

}

}







export async function renewMembership(

studentId:number,

plan:string,

amount:number,

months:number

){



const start =
new Date();



const expiry =
new Date();


expiry.setMonth(
expiry.getMonth()+months
);






// create membership

const {

error:membershipError

}=await supabase

.from("Memberships")

.insert([

{

student_id:
studentId,

plan,

amount,

start_date:
start.toISOString().split("T")[0],

expiry_date:
expiry.toISOString().split("T")[0],

status:
"Active",

payment_status:
"Paid",

}

]);





if(membershipError){

throw membershipError;

}







// create payment

const {

error:paymentError

}=await supabase

.from("Payments")

.insert([

{

student_id:
studentId,

amount,

payment_date:
start.toISOString().split("T")[0],

payment_method:
"Cash",

remarks:
`${plan} membership renewal`

}

]);





if(paymentError){

throw paymentError;

}






// update student

const {

error:updateError

}=await supabase

.from("Students")

.update({

membership_plan:
plan,

Fees:
amount,

Fees_due:
0,

Status:
"Active",

})

.eq(
"id",
studentId
);





if(updateError){

throw updateError;

}


}