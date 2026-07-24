"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

import { supabase } from "@/lib/supabase";



type Instructor = {

id:number;

name:string;

};



type ClassItem = {

id:number;

class_name:string;

program:string;

day:string;

start_time:string;

end_time:string;

instructor_id:number;

status:string;

instructor?:Instructor;

};







export default function SchedulePage(){



const [classes,setClasses] =

useState<ClassItem[]>([]);



const [instructors,setInstructors] =

useState<Instructor[]>([]);



const [loading,setLoading] =

useState(true);



const [modalOpen,setModalOpen] =

useState(false);



const [editingId,setEditingId] =

useState<number | null>(null);



const [saving,setSaving] =

useState(false);







const [form,setForm] =

useState({

class_name:"",

program:"",

day:"Monday",

start_time:"",

end_time:"",

instructor_id:"",

status:"Active",

});







useEffect(()=>{

loadData();

},[]);









async function loadData(){


try{


const {

data:instructorData,

error:instructorError

}=await supabase

.from("Instructors")

.select(`

id,

name

`)

.order(

"name"

);





if(instructorError)

throw instructorError;



setInstructors(

instructorData ?? []

);








const {

data:classData,

error:classError

}=await supabase

.from("Classes")

.select(`

id,

class_name,

program,

day,

start_time,

end_time,

instructor_id,

status,

Instructors(

id,

name

)

`)

.order(

"id",

{

ascending:true

}

);






if(classError)

throw classError;



setClasses(

(classData ?? []) as ClassItem[]

);



}

catch(error){

console.error(error);

}

finally{

setLoading(false);

}


}









async function saveClass(){


try{


setSaving(true);



const payload={


class_name:

form.class_name,


program:

form.program,


day:

form.day,


start_time:

form.start_time,


end_time:

form.end_time,


instructor_id:

Number(form.instructor_id),


status:

form.status,


};






if(editingId){


const {

error

}=await supabase

.from("Classes")

.update(payload)

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

.from("Classes")

.insert(payload);



if(error)

throw error;



}






setModalOpen(false);

setEditingId(null);



resetForm();



loadData();



}

catch(error){

console.error(error);

alert(
"Unable to save class"
);

}

finally{

setSaving(false);

}


}








function resetForm(){


setForm({

class_name:"",

program:"",

day:"Monday",

start_time:"",

end_time:"",

instructor_id:"",

status:"Active",

});


}








async function deleteClass(id:number){


if(

!confirm(
"Delete this class?"
)

)

return;





const {

error

}=await supabase

.from("Classes")

.delete()

.eq(

"id",

id

);





if(error){

console.error(error);

return;

}



loadData();


}









function openEdit(item:ClassItem){


setEditingId(

item.id

);



setForm({

class_name:item.class_name,

program:item.program,

day:item.day,

start_time:item.start_time,

end_time:item.end_time,

instructor_id:String(item.instructor_id),

status:item.status,

});



setModalOpen(true);


}









if(loading){

return (

<main className="p-8">

Loading schedule...

</main>

);

}

return (

<main className="space-y-8">



<PageHeader

title="Class Schedule"

description="Manage Footloose Alley classes and timings."

/>








<button

onClick={()=>{

setEditingId(null);

resetForm();

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

Add Class

</button>









{

[

"Monday",

"Tuesday",

"Wednesday",

"Thursday",

"Friday",

"Saturday",

"Sunday"

]

.map(day=>(


<div

key={day}

className="
rounded-2xl
bg-white
p-6
shadow
"

>


<h2 className="
mb-5
text-xl
font-bold
">

{day}

</h2>







<div className="
grid
gap-4
md:grid-cols-2
lg:grid-cols-3
">







{

classes

.filter(

item=>

item.day===day

)

.map(item=>(



<div

key={item.id}

className="
rounded-xl
border
p-5
"

>



<div className="
flex
justify-between
"

>


<div>


<h3 className="
text-lg
font-bold
">

{item.class_name}

</h3>



<p className="
text-slate-500
">

{item.program}

</p>


</div>







<div className="
flex
gap-2
">


<button

onClick={()=>openEdit(item)}

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

onClick={()=>deleteClass(item.id)}

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



</div>









<div className="
mt-4
space-y-2
text-sm
">


<p>

🕒 {item.start_time} - {item.end_time}

</p>




<p>

👨‍🏫 {item.instructor?.name ?? "No Instructor"}

</p>





<span className="
rounded-full
bg-green-100
px-3
py-1
text-green-700
"

>

{item.status}

</span>



</div>




</div>



))


}







{

classes.filter(

item=>

item.day===day

).length===0 &&


<p className="
text-slate-500
">

No classes scheduled.

</p>


}




</div>



</div>


))


}

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
max-w-lg
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

"Edit Class"

:

"Add Class"

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

placeholder="Class Name"

value={form.class_name}

onChange={e=>

setForm({

...form,

class_name:e.target.value

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

placeholder="Program"

value={form.program}

onChange={e=>

setForm({

...form,

program:e.target.value

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

value={form.day}

onChange={e=>

setForm({

...form,

day:e.target.value

})

}

className="
w-full
rounded-xl
border
p-3
"

>


{

[

"Monday",

"Tuesday",

"Wednesday",

"Thursday",

"Friday",

"Saturday",

"Sunday"

]

.map(day=>(


<option

key={day}

value={day}

>

{day}

</option>


))


}


</select>









<div className="
grid
grid-cols-2
gap-3
">


<input

type="time"

value={form.start_time}

onChange={e=>

setForm({

...form,

start_time:e.target.value

})

}

className="
rounded-xl
border
p-3
"

/>





<input

type="time"

value={form.end_time}

onChange={e=>

setForm({

...form,

end_time:e.target.value

})

}

className="
rounded-xl
border
p-3
"

/>


</div>








<select

value={form.instructor_id}

onChange={e=>

setForm({

...form,

instructor_id:e.target.value

})

}

className="
w-full
rounded-xl
border
p-3
"

>


<option value="">

Select Instructor

</option>




{

instructors.map(instructor=>(


<option

key={instructor.id}

value={instructor.id}

>

{instructor.name}

</option>


))


}



</select>








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

onClick={saveClass}

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

"Save Class"

}


</button>






</div>


</div>


</div>


}



</main>

);


}