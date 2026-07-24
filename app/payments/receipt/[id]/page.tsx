"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  Printer,
  ArrowLeft,
} from "lucide-react";

import { supabase } from "@/lib/supabase";



type ReceiptData = {

  id:number;

  amount:number;

  payment_date:string;

  payment_method:string;

  remarks:string | null;

  received_by:string | null;

  student:{
    Name:string;
    Phone:string;
    membership_plan:string | null;
    Program:string | null;
  } | null;

};






export default function ReceiptPage(){



const params = useParams();

const router = useRouter();



const id =
Number(
params.id
);



const [receipt,setReceipt] =
useState<ReceiptData | null>(null);



const [loading,setLoading] =
useState(true);







useEffect(()=>{

loadReceipt();

},[]);








async function loadReceipt(){



const {

data,

error

}=await supabase


.from("Payments")


.select(`

id,

amount,

payment_date,

payment_method,

remarks,

received_by,

Students!Payments_student_id_fkey(

Name,

Phone,

membership_plan,

Program

)

`)


.eq(
"id",
id
)


.single();






if(error){

console.error(error);

return;

}






setReceipt({

...data,

student:
(data as any).Students ?? null

});



setLoading(false);


}








if(loading){

return (

<main className="p-8">

Loading receipt...

</main>

);

}







if(!receipt){

return (

<main className="p-8">

Receipt not found.

</main>

);

}








return (

<main className="
min-h-screen
bg-slate-100
p-8
">





<div className="
mx-auto
max-w-3xl
">


<div className="
mb-6
flex
justify-between
">


<button

onClick={()=>router.back()}

className="
flex
items-center
gap-2
rounded-xl
bg-white
px-4
py-2
shadow
"

>

<ArrowLeft size={18}/>

Back

</button>





<button

onClick={()=>window.print()}

className="
flex
items-center
gap-2
rounded-xl
bg-indigo-600
px-4
py-2
text-white
"

>

<Printer size={18}/>

Print Receipt

</button>



</div>









<div className="
rounded-3xl
bg-white
p-8
shadow-xl
">





<div className="
border-b
pb-6
text-center
">


<h1 className="
text-3xl
font-bold
text-purple-700
">

FOOTLOOSE ALLEY

</h1>


<p className="
mt-1
text-slate-500
">

Dance & Fitness Studio

</p>


<h2 className="
mt-6
text-xl
font-bold
">

Payment Receipt

</h2>


<p className="
text-sm
text-slate-500
">

Receipt No: #{receipt.id}

</p>


</div>









<div className="
mt-6
space-y-4
">



<ReceiptRow

label="Student"

value={
receipt.student?.Name ?? "-"
}

/>



<ReceiptRow

label="Phone"

value={
receipt.student?.Phone ?? "-"
}

/>



<ReceiptRow

label="Program"

value={
receipt.student?.Program ?? "-"
}

/>



<ReceiptRow

label="Membership"

value={
receipt.student?.membership_plan ?? "-"
}

/>



<ReceiptRow

label="Payment Date"

value={

new Date(
receipt.payment_date
)
.toLocaleDateString()

}

/>



<ReceiptRow

label="Payment Method"

value={
receipt.payment_method
}

/>



<ReceiptRow

label="Received By"

value={
receipt.received_by ?? "-"
}

/>





</div>








<div className="
mt-8
rounded-2xl
bg-purple-50
p-5
text-center
">


<p className="
text-sm
text-slate-500
">

Amount Paid

</p>


<h2 className="
mt-2
text-4xl
font-bold
text-green-600
">

₹{receipt.amount.toLocaleString()}

</h2>


</div>








<div className="
mt-8
border-t
pt-5
text-center
text-sm
text-slate-500
">


Thank you for being part of Footloose Alley ❤️


</div>





</div>


</div>


</main>

);


}








function ReceiptRow({

label,

value,

}:{

label:string;

value:string;

}){


return (

<div className="
flex
justify-between
border-b
py-3
">


<span className="
text-slate-500
">

{label}

</span>



<span className="
font-semibold
">

{value}

</span>



</div>

);


}