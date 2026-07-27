"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

import { supabase } from "@/lib/supabase";





type Instructor = {

id:number;

name:string;

phone:string | null;

specialization:string | null;

status:string | null;

};







export default function InstructorsPage(){



const [instructors,setInstructors] =

useState<Instructor[]>([]);



const [loading,setLoading] =

useState(true);



const [search,setSearch] =

useState("");



const [modalOpen,setModalOpen] =

useState(false);



const [editingId,setEditingId] =

useState<number | null>(null);



const [saving,setSaving] =

useState(false);






const [form,setForm] =

useState({

name:"",

phone:"",

specialization:"",

status:"Active",

});








useEffect(()=>{

loadInstructors();

},[]);







async function loadInstructors(){


try{


const {

data,

error

}=await supabase

.from("Instructors")

.select("*")

.order(

"id",

{

ascending:false

}

);




if(error)

throw error;



setInstructors(

data ?? []

);



}

catch(error){

console.error(error);

}

finally{

setLoading(false);

}


}









async function saveInstructor(){



try{


setSaving(true);



if(editingId){



const {

error

}=await supabase

.from("Instructors")

.update(form)

.eq(

"id",

editingId

);



if(error)

throw error;



}

else{



const {

error

}=await supabase

.from("Instructors")

.insert(form);



if(error)

throw error;



}






setModalOpen(false);

setEditingId(null);



setForm({

name:"",

phone:"",

specialization:"",

status:"Active",

});



loadInstructors();



}

catch(error){

console.error(error);

alert(
"Unable to save instructor"
);

}

finally{

setSaving(false);

}


}









async function deleteInstructor(id:number){


const confirmDelete =

confirm(

"Delete this instructor?"

);



if(!confirmDelete)

return;





const {

error

}=await supabase

.from("Instructors")

.delete()

.eq(

"id",

id

);





if(error){

console.error(error);

return;

}



loadInstructors();


}








function openEdit(instructor:Instructor){


setEditingId(

instructor.id

);



setForm({

name:

instructor.name,

phone:

instructor.phone ?? "",

specialization:

instructor.specialization ?? "",

status:

instructor.status ?? "Active",

});



setModalOpen(true);


}







const filteredInstructors =

instructors.filter(item=>


item.name

.toLowerCase()

.includes(

search.toLowerCase()

)

||

(item.phone ?? "")

.includes(search)


);







if(loading){

return (

<main className="p-8">

Loading instructors...

</main>

);

}
return (

<main className="space-y-8">



<PageHeader

title="Instructors"

description="Manage Footloose Alley instructors."

/>








<div className="
flex
flex-col
gap-4
md:flex-row
md:items-center
md:justify-between
">


<button

onClick={()=>{

setEditingId(null);

setForm({

name:"",

phone:"",

specialization:"",

status:"Active",

});

setModalOpen(true);

}}

className="
flex
items-center
gap-2
rounded-xl
bg-purple-600
px-5
py-3
font-semibold
text-white
"

>

<Plus size={18}/>

Add Instructor

</button>






<div className="
relative
">


<Search

size={18}

className="
absolute
left-3
top-3
text-slate-400
"

/>


<input

placeholder="Search instructor..."

value={search}

onChange={e=>

setSearch(e.target.value)

}

className="
rounded-xl
border
py-3
pl-10
pr-4
"

/>



</div>


</div>









<div className="
overflow-x-auto
rounded-2xl
bg-white
shadow
">


<table className="
min-w-full
">


<thead className="bg-slate-100">


<tr>


<th className="p-4 text-left">

Name

</th>



<th className="p-4 text-left">

Phone

</th>



<th className="p-4 text-left">

Specialization

</th>



<th className="p-4 text-left">

Status

</th>



<th className="p-4 text-left">

Actions

</th>



</tr>


</thead>







<tbody>


{

filteredInstructors.map(instructor=>(


<tr

key={instructor.id}

className="
border-b
"

>


<td className="
p-4
font-semibold
">

{instructor.name}

</td>



<td className="p-4">

{instructor.phone ?? "-"}

</td>



<td className="p-4">

{instructor.specialization ?? "-"}

</td>




<td className="p-4">


<span className="
rounded-full
bg-green-100
px-3
py-1
text-sm
font-semibold
text-green-700
">

{instructor.status}

</span>


</td>





<td className="
p-4
">

<div className="
flex
gap-2
">



<button

onClick={()=>openEdit(instructor)}

className="
rounded-lg
bg-blue-100
p-2
text-blue-700
"

>

<Pencil size={16}/>

</button>







<button

onClick={()=>deleteInstructor(instructor.id)}

className="
rounded-lg
bg-red-100
p-2
text-red-700
"

>

<Trash2 size={16}/>

</button>





</div>


</td>





</tr>


))


}





{

filteredInstructors.length===0 &&


<tr>


<td

colSpan={5}

className="
p-8
text-center
text-slate-500
"

>

No instructors found.

</td>


</tr>


}




</tbody>


</table>


</div>
{
modalOpen &&

<div className="
fixed
inset-0
z-50
flex
items-center
justify-center
bg-black/40
">


<div className="
w-full
max-w-md
rounded-2xl
bg-white
p-6
shadow-xl
">



<div className="
mb-5
flex
items-center
justify-between
">


<h2 className="
text-xl
font-bold
">

{

editingId

?

"Edit Instructor"

:

"Add Instructor"

}

</h2>



<button

onClick={()=>setModalOpen(false)}

>

<X/>

</button>



</div>








<div className="
space-y-4
">



<input

placeholder="Instructor Name"

value={form.name}

onChange={e=>

setForm({

...form,

name:e.target.value

})

}

className="
w-full
rounded-xl
border
p-3
"

/>







<input

placeholder="Phone"

value={form.phone}

onChange={e=>

setForm({

...form,

phone:e.target.value

})

}

className="
w-full
rounded-xl
border
p-3
"

/>







<input

placeholder="Specialization"

value={form.specialization}

onChange={e=>

setForm({

...form,

specialization:e.target.value

})

}

className="
w-full
rounded-xl
border
p-3
"

/>







<select

value={form.status}

onChange={e=>

setForm({

...form,

status:e.target.value

})

}

className="
w-full
rounded-xl
border
p-3
"

>


<option value="Active">

Active

</option>


<option value="Inactive">

Inactive

</option>



</select>







<button

onClick={saveInstructor}

disabled={saving}

className="
w-full
rounded-xl
bg-purple-600
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

"Save Instructor"

}


</button>






</div>


</div>


</div>

}


</main>

);


}