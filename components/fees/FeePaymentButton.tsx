"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

import AddPaymentModal from "@/components/payments/AddPaymentModal";



type Props = {

  studentId:number;

  onSuccess:()=>void;

};




export default function FeePaymentButton({

studentId,

onSuccess,

}:Props){


const [open,setOpen] =
useState(false);





return (

<>

<button

onClick={()=>setOpen(true)}

className="
flex
items-center
gap-2
rounded-xl
bg-purple-600
px-4
py-2
text-white
transition
hover:bg-purple-700
"

>

<CreditCard size={18}/>

Add Payment

</button>





{

open && (

<AddPaymentModal

studentId={studentId}

onClose={()=>setOpen(false)}

onSuccess={()=>{

onSuccess();

setOpen(false);

}}

/>

)

}



</>

);


}