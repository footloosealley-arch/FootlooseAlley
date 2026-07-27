"use client";

import {
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";
import { toast } from "sonner";

import type { Student } from "@/types/student";

import {
  addStudent,
  updateStudent,
} from "@/lib/students";



type Props = {

  student?: Student | null;

  onClose: () => void;

  onAdded: () => void;

};







export default function AddStudentModal({

  student,

  onClose,

  onAdded,

}: Props) {



const [saving,setSaving] =
useState(false);






const [form,setForm] =
useState<Omit<Student,"id">>({

Name:"",

Phone:"",

Email:"",

Address:"",

Emergency_contact:"",

Program:"",

Fees:0,

Fees_due:0,

Status:"Active",

photo_url:"",

membership_plan:"",

join_date:"",

date_of_birth:"",

gender:"",


fee_status:"Paid",

next_due_date:"",

last_payment_date:"",

});









useEffect(()=>{


if(student){


setForm({

Name:student.Name ?? "",

Phone:student.Phone ?? "",

Email:student.Email ?? "",

Address:student.Address ?? "",

Emergency_contact:
student.Emergency_contact ?? "",

Program:
student.Program ?? "",

Fees:
student.Fees ?? 0,

Fees_due:
student.Fees_due ?? 0,

Status:
student.Status ?? "Active",

photo_url:
student.photo_url ?? "",

membership_plan:
student.membership_plan ?? "",

join_date:
student.join_date ?? "",

date_of_birth:
student.date_of_birth ?? "",

gender:
student.gender ?? "",


fee_status:
student.fee_status ?? "Paid",


next_due_date:
student.next_due_date ?? "",


last_payment_date:
student.last_payment_date ?? "",


});

}


},[student]);









function updateField(

key:keyof typeof form,

value:any

){


setForm(prev=>({

...prev,

[key]:value,

}));

}









async function handleSave(){


if(!form.Name || !form.Phone){


toast.error(
"Name and phone are required"
);


return;


}



try{


setSaving(true);



if(student){


await updateStudent(

student.id,

form

);


toast.success(
"Student updated successfully"
);


}

else{


await addStudent(form);


toast.success(
"Student added successfully"
);


}



onAdded();

onClose();



}

catch(error){


console.error(error);


toast.error(
"Unable to save student"
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
max-w-3xl
max-h-[90vh]
overflow-y-auto
rounded-3xl
bg-white
p-6
shadow-xl
">





<div className="
mb-6
flex
items-center
justify-between
">


<h2 className="
text-2xl
font-bold
text-slate-800
">

{
student
?
"Edit Student"
:
"Add New Student"
}

</h2>


<button

onClick={onClose}

className="
rounded-lg
p-2
hover:bg-slate-100
"

>

<X/>

</button>


</div>









<div className="
grid
gap-4
md:grid-cols-2
">






{

[

["Name","Name"],

["Phone","Phone"],

["Email","Email"],

["Address","Address"],

["Emergency_contact","Emergency Contact"],

["Program","Program"],

["membership_plan","Membership Plan"],

["join_date","Join Date"],

["date_of_birth","Date of Birth"],

["gender","Gender"],

["next_due_date","Next Due Date"],

["photo_url","Photo URL"],


].map(([key,label])=>(


<div key={key}>


<label className="
mb-1
block
text-sm
font-medium
text-slate-700
">

{label}

</label>


<input

type={
key==="next_due_date"
?
"date"
:
"text"
}

className="
w-full
rounded-xl
border
p-3
"

value={
(form as any)[key] ?? ""
}


onChange={(e)=>

updateField(

key as keyof typeof form,

e.target.value

)

}


/>


</div>


))

}









<div>


<label className="
mb-1
block
text-sm
font-medium
">

Fees

</label>


<input

type="number"

className="
w-full
rounded-xl
border
p-3
"

value={form.Fees}

onChange={(e)=>

updateField(
"Fees",
Number(e.target.value)
)

}


/>


</div>









<div>


<label className="
mb-1
block
text-sm
font-medium
">

Fees Due

</label>


<input

type="number"

className="
w-full
rounded-xl
border
p-3
"

value={form.Fees_due}

onChange={(e)=>

updateField(
"Fees_due",
Number(e.target.value)
)

}


/>


</div>









<div>


<label className="
mb-1
block
text-sm
font-medium
">

Status

</label>


<select

className="
w-full
rounded-xl
border
p-3
"

value={form.Status}

onChange={(e)=>

updateField(
"Status",
e.target.value
)

}

>


<option>
Active
</option>


<option>
Inactive
</option>


</select>


</div>









<div>


<label className="
mb-1
block
text-sm
font-medium
">

Fee Status

</label>


<select

className="
w-full
rounded-xl
border
p-3
"

value={form.fee_status}

onChange={(e)=>

updateField(
"fee_status",
e.target.value
)

}

>


<option>
Paid
</option>


<option>
Due Soon
</option>


<option>
Overdue
</option>


</select>


</div>







</div>









<div className="
mt-6
flex
justify-end
gap-3
">


<button

onClick={onClose}

className="
rounded-xl
bg-slate-200
px-5
py-3
"

>

Cancel

</button>






<button

disabled={saving}

onClick={handleSave}

className="
rounded-xl
bg-indigo-600
px-5
py-3
font-semibold
text-white
"

>

{

saving
?
"Saving..."
:
student
?
"Update Student"
:
"Add Student"

}


</button>





</div>






</div>


</div>

);


}