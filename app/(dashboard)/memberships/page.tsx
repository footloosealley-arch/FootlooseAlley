"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import {
  getMemberships,
  addMembership,
  deleteMembership,
} from "@/lib/memberships";

import { supabase } from "@/lib/supabase";

import type { Membership } from "@/types/membership";


type Student = {
  id:number;
  Name:string;
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



export default function MembershipsPage(){


  const [memberships,setMemberships]
    = useState<Membership[]>([]);


  const [students,setStudents]
    = useState<Student[]>([]);


  const [loading,setLoading]
    = useState(true);



  const [form,setForm] = useState({

    student_id:"",

    plan:"Monthly",

    amount:2500,

    start_date:
      new Date()
      .toISOString()
      .split("T")[0],

  });





  useEffect(()=>{

    loadData();

  },[]);





  async function loadData(){

    try{

      setLoading(true);


      const membershipData =
        await getMemberships();


      setMemberships(
        membershipData
      );



      const {data,error} =
        await supabase

        .from("Students")

        .select(
          "id, Name"
        )

        .eq(
          "Status",
          "Active"
        )

        .order(
          "Name"
        );



      if(error)
        throw error;


      setStudents(
        data ?? []
      );



    }catch(error){

      console.error(error);

      toast.error(
        "Failed loading memberships"
      );

    }
    finally{

      setLoading(false);

    }

  }







  function calculateExpiry(
    start:string,
    months:number
  ){

    const date =
      new Date(start);


    date.setMonth(
      date.getMonth()+months
    );


    return date
      .toISOString()
      .split("T")[0];

  }







  async function handleSave(){


    const selected =
      plans.find(
        p=>p.name===form.plan
      );



    if(!selected)
      return;



    if(!form.student_id){

      toast.error(
        "Select student"
      );

      return;

    }



    const membership = {

      student_id:
        Number(form.student_id),

      plan:
        selected.name,

      amount:
        selected.amount,

      start_date:
        form.start_date,

      expiry_date:
        calculateExpiry(
          form.start_date,
          selected.months
        ),

      status:
        "Active" as const,

      payment_status:
        "Paid" as const,

    };




    try{


      await addMembership(
        membership
      );


      toast.success(
        "Membership added"
      );


      loadData();



    }catch(error){

      console.error(error);

      toast.error(
        "Unable to add membership"
      );

    }


  }







  async function handleDelete(
    id:number
  ){

    if(
      !confirm(
        "Delete membership?"
      )
    )
      return;



    await deleteMembership(id);


    toast.success(
      "Membership deleted"
    );


    loadData();

  }







  return (

<main className="space-y-8">


<div className="
rounded-3xl
bg-gradient-to-r
from-purple-600
to-pink-500
p-8
text-white
shadow-xl
">


<h1 className="
text-4xl
font-bold
">

Membership Management

</h1>


<p className="mt-2">

Manage plans, renewals and expiry dates.

</p>


</div>





<div className="
rounded-2xl
bg-white
p-6
shadow
space-y-5
">


<h2 className="
text-xl
font-bold
">

Add Membership

</h2>





<select

className="w-full rounded-xl border p-3"

value={form.student_id}

onChange={
e=>setForm({
...form,
student_id:e.target.value
})
}

>

<option value="">

Select Student

</option>


{students.map(student=>(

<option
key={student.id}
value={student.id}
>

{student.Name}

</option>

))}


</select>





<select

className="w-full rounded-xl border p-3"

value={form.plan}

onChange={
e=>{

const plan =
plans.find(
p=>p.name===e.target.value
);


setForm({

...form,

plan:e.target.value,

amount:
plan?.amount ?? 0

});

}

}

>


{plans.map(plan=>(

<option
key={plan.name}
>

{plan.name}

</option>

))}


</select>





<input

type="date"

className="w-full rounded-xl border p-3"

value={form.start_date}

onChange={
e=>setForm({
...form,
start_date:e.target.value
})
}

/>





<button

onClick={handleSave}

className="
flex
items-center
gap-2
rounded-xl
bg-purple-600
px-6
py-3
font-semibold
text-white
"

>

<Plus size={18}/>

Add Membership

</button>


</div>








<div className="
rounded-2xl
bg-white
shadow
overflow-hidden
">


<table className="min-w-full">


<thead className="bg-slate-50">

<tr>

<th className="p-4 text-left">
Student ID
</th>

<th className="p-4">
Plan
</th>

<th className="p-4">
Amount
</th>

<th className="p-4">
Expiry
</th>

<th className="p-4">
Status
</th>

<th className="p-4">
Action
</th>

</tr>

</thead>



<tbody>


{loading ? (

<tr>
<td
colSpan={6}
className="p-10 text-center"
>
Loading...
</td>
</tr>

):

memberships.map(member=>(


<tr
key={member.id}
className="border-t"
>


<td className="p-4">

{member.student_id}

</td>


<td className="p-4">

{member.plan}

</td>


<td className="p-4">

₹{member.amount}

</td>


<td className="p-4">

{member.expiry_date}

</td>


<td className="p-4">

<span className="
rounded-full
bg-green-100
px-3
py-1
text-green-700
">

{member.status}

</span>

</td>


<td className="p-4">

<button

onClick={()=>
handleDelete(member.id)
}

className="
rounded-lg
bg-red-100
p-2
text-red-700
"

>

<Trash2 size={18}/>

</button>

</td>


</tr>


))


}


</tbody>


</table>


</div>



</main>

  );

}