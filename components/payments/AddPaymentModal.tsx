"use client";

import { useState } from "react";
import { X, IndianRupee, CalendarDays, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { addPayment } from "@/lib/payments";


type Props = {

  studentId:number;

  onClose:()=>void;

  onSuccess:()=>void;

};




export default function AddPaymentModal({

studentId,

onClose,

onSuccess,

}:Props){



const [amount,setAmount] =
useState("");



const [method,setMethod] =
useState("Cash");



const [date,setDate] =
useState(
new Date()
.toISOString()
.split("T")[0]
);



const [remarks,setRemarks] =
useState("");



const [receivedBy,setReceivedBy] =
useState("");



const [saving,setSaving] =
useState(false);







async function handleSave(){



if(!amount){


toast.error(
"Enter amount"
);


return;


}







try{


setSaving(true);





await addPayment({


student_id:studentId,


amount:Number(amount),


payment_date:date,


method,


remarks,


received_by:receivedBy,


});






toast.success(
"Payment added successfully"
);



onSuccess();


onClose();




}

catch(error){


console.error(error);


toast.error(
"Payment failed"
);


}

finally{


setSaving(false);


}



}









return (

<div className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/40
p-4
">





<div className="
w-full
max-w-md
rounded-3xl
bg-white
shadow-xl
overflow-hidden
">





<div className="
bg-gradient-to-r
from-indigo-700
to-purple-700
p-6
text-white
">


<div className="
flex
items-center
justify-between
">


<div>

<h2 className="
text-2xl
font-bold
">

💰 Record Payment

</h2>


<p className="
mt-1
text-sm
text-white/80
">

Update student payment details

</p>


</div>




<button

onClick={onClose}

className="
rounded-xl
bg-white/20
p-2
hover:bg-white/30
"

>

<X/>

</button>



</div>


</div>








<div className="
space-y-4
p-6
">







<div>


<label className="
mb-1
flex
items-center
gap-2
text-sm
font-medium
">

<IndianRupee size={16}/>

Amount

</label>



<input

type="number"

placeholder="Enter amount"

value={amount}

onChange={
e=>setAmount(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
focus:ring-2
focus:ring-indigo-500
"

/>


</div>








<div>


<label className="
mb-1
flex
items-center
gap-2
text-sm
font-medium
">

<CreditCard size={16}/>

Payment Method

</label>



<select

value={method}

onChange={
e=>setMethod(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
"

>


<option>
Cash
</option>

<option>
UPI
</option>

<option>
Card
</option>

<option>
Online
</option>


</select>


</div>









<div>


<label className="
mb-1
flex
items-center
gap-2
text-sm
font-medium
">

<CalendarDays size={16}/>

Payment Date

</label>



<input

type="date"

value={date}

onChange={
e=>setDate(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
"

/>


</div>









<div>


<label className="
mb-1
flex
items-center
gap-2
text-sm
font-medium
">

<User size={16}/>

Received By

</label>



<input

placeholder="Name"

value={receivedBy}

onChange={
e=>setReceivedBy(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
"

/>


</div>









<div>


<label className="
mb-1
text-sm
font-medium
">

Remarks

</label>



<textarea

placeholder="Optional notes"

value={remarks}

onChange={
e=>setRemarks(e.target.value)
}

className="
w-full
rounded-xl
border
p-3
"

/>


</div>









<button

disabled={saving}

onClick={handleSave}

className="
w-full
rounded-xl
bg-purple-600
p-3
font-semibold
text-white
transition
hover:bg-purple-700
"

>


{
saving
?
"Saving..."
:
"Save Payment"
}


</button>






</div>






</div>





</div>

);

}