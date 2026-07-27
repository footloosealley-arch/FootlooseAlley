"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  CreditCard,
  IndianRupee,
  CalendarDays,
} from "lucide-react";

import { toast } from "sonner";

import PaymentTable from "@/components/payments/PaymentTable";
import AddPaymentModal from "@/components/payments/AddPaymentModal";

import {
  getPayments,
} from "@/lib/payments";

import type { Payment } from "@/types/payment";


type Props = {
  studentId: number;
  onPaymentAdded?: () => void;
};



export default function PaymentHistory({
  studentId,
  onPaymentAdded,
}: Props) {


  const [payments,setPayments] =
    useState<Payment[]>([]);


  const [loading,setLoading] =
    useState(true);


  const [showModal,setShowModal] =
    useState(false);







  async function loadPayments(){

    try{

      setLoading(true);


      const result =
        await getPayments(studentId);



      if(result.error){

        toast.error(
          "Failed to load payments"
        );

        return;

      }



      setPayments(
        result.data ?? []
      );


    }

    catch(error){

      console.error(error);

      toast.error(
        "Unable to load payments"
      );

    }

    finally{

      setLoading(false);

    }

  }







  useEffect(()=>{

    loadPayments();

  },[studentId]);









  const stats = useMemo(()=>{


    const total =
      payments.reduce(

        (sum,payment)=>

          sum +
          Number(
            payment.amount ?? 0
          ),

        0

      );




    const latest =
      payments.reduce(

        (last,payment)=>{


          if(!last){

            return payment;

          }



          return payment.id > last.id
            ? payment
            : last;


        },

        null as Payment | null

      );





    return {

      total,

      count:
        payments.length,

      latest,

    };


  },[payments]);










  function paymentSuccess(){

    loadPayments();

    onPaymentAdded?.();

  }








return (

<div className="
rounded-2xl
bg-white
p-6
shadow-lg
">






<div className="
mb-6
flex
items-center
justify-between
">


<div>

<h2 className="
text-xl
font-bold
text-slate-800
">

Payment History

</h2>


<p className="
text-sm
text-slate-500
">

Track student payments

</p>


</div>





<button

onClick={()=>
setShowModal(true)
}

className="
flex
items-center
gap-2
rounded-xl
bg-purple-600
px-4
py-2
font-semibold
text-white
hover:bg-purple-700
"

>

<Plus size={18}/>

Add Payment

</button>



</div>








<div className="
mb-6
grid
gap-4
md:grid-cols-3
">



<div className="
rounded-xl
bg-green-50
p-4
">

<div className="
flex
items-center
gap-2
text-green-700
">

<IndianRupee size={18}/>

Total Paid

</div>


<p className="
mt-2
text-2xl
font-bold
">

₹{stats.total.toLocaleString()}

</p>


</div>








<div className="
rounded-xl
bg-blue-50
p-4
">

<div className="
flex
items-center
gap-2
text-blue-700
">

<CreditCard size={18}/>

Payments

</div>


<p className="
mt-2
text-2xl
font-bold
">

{stats.count}

</p>


</div>







<div className="
rounded-xl
bg-orange-50
p-4
">


<div className="
flex
items-center
gap-2
text-orange-700
">

<CalendarDays size={18}/>

Last Payment

</div>



<p className="
mt-2
font-bold
">

{
stats.latest
?
`₹${stats.latest.amount}`
:
"-"
}

</p>


</div>




</div>







{
loading ? (

<p>
Loading payments...
</p>

)

:

(

<PaymentTable

payments={payments}

/>

)

}







{
showModal && (

<AddPaymentModal

studentId={studentId}

onClose={()=>
setShowModal(false)
}

onSuccess={paymentSuccess}

/>

)

}





</div>

);

}