"use client";

import { useState } from "react";
import {
  Calendar,
  BadgeCheck,
  BookOpen,
  RefreshCcw,
} from "lucide-react";

import { toast } from "sonner";

import { renewMembership } from "@/lib/memberships";

import type { Student } from "@/types/student";


type Props = {
  student: Student;
  onUpdated?: () => void;
};



const plans = [

  {
    name:"Monthly",
    amount:2500,
    months:1,
  },

  {
    name:"3 Months",
    amount:6000,
    months:3,
  },

  {
    name:"6 Months",
    amount:10000,
    months:6,
  },

  {
    name:"Yearly",
    amount:18000,
    months:12,
  },

];





export default function MembershipCard({

  student,

  onUpdated,

}: Props) {



  const [open,setOpen] =
    useState(false);



  const [selectedPlan,setSelectedPlan] =
    useState("Monthly");



  const [saving,setSaving] =
    useState(false);







  async function handleRenew(){


    const plan =
      plans.find(
        item =>
        item.name === selectedPlan
      );



    if(!plan){

      return;

    }





    try{


      setSaving(true);



      await renewMembership(

        student.id,

        plan.name,

        plan.amount,

        plan.months

      );



      toast.success(
        "Membership renewed successfully"
      );



      setOpen(false);



      onUpdated?.();



    }

    catch(error){

      console.error(
        error
      );


      toast.error(
        "Renewal failed"
      );


    }

    finally{

      setSaving(false);

    }


  }









return (

<>

<div className="
rounded-2xl
bg-white
p-6
shadow-lg
">


<h2 className="
mb-6
text-xl
font-bold
text-slate-800
">

Membership Details

</h2>





<div className="space-y-5">






<div className="
flex
items-start
gap-3
">

<BadgeCheck
className="mt-1 text-indigo-600"
size={18}
/>


<div>

<p className="
text-sm
text-slate-500
">

Membership Plan

</p>


<span className="
mt-1
inline-flex
rounded-full
bg-indigo-100
px-3
py-1
text-sm
font-semibold
text-indigo-700
">

{
student.membership_plan ??
"Not Assigned"
}

</span>


</div>


</div>








<div className="
flex
items-start
gap-3
">

<BookOpen
className="mt-1 text-indigo-600"
size={18}
/>


<div>

<p className="
text-sm
text-slate-500
">

Program

</p>


<p className="
font-medium
text-slate-800
">

{
student.Program ??
"Not Assigned"
}

</p>


</div>


</div>









<div className="
flex
items-start
gap-3
">

<Calendar
className="mt-1 text-indigo-600"
size={18}
/>


<div>

<p className="
text-sm
text-slate-500
">

Joined On

</p>


<p className="
font-medium
text-slate-800
">

{
student.join_date ??
"Not Available"
}

</p>


</div>


</div>









<button

onClick={()=>
setOpen(true)
}

className="
mt-4
flex
items-center
gap-2
rounded-xl
bg-purple-600
px-5
py-3
font-semibold
text-white
hover:bg-purple-700
"

>

<RefreshCcw size={18}/>

Renew Membership

</button>







</div>


</div>








{
open && (

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
rounded-2xl
bg-white
p-6
">


<h2 className="
mb-5
text-xl
font-bold
">

Renew Membership

</h2>






<select

className="
w-full
rounded-xl
border
p-3
"

value={selectedPlan}

onChange={
e=>
setSelectedPlan(
e.target.value
)
}

>


{
plans.map(plan=>(

<option

key={plan.name}

value={plan.name}

>

{plan.name} - ₹{plan.amount}

</option>

))

}


</select>






<button

onClick={handleRenew}

disabled={saving}

className="
mt-5
w-full
rounded-xl
bg-green-600
p-3
font-semibold
text-white
"

>

{
saving
?
"Saving..."
:
"Confirm Renewal"
}

</button>







<button

onClick={()=>
setOpen(false)
}

className="
mt-3
w-full
rounded-xl
bg-slate-200
p-3
"

>

Cancel

</button>





</div>


</div>

)

}


</>

);


}