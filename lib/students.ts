import { supabase } from "@/lib/supabase";
import type { Student } from "@/types/student";



function calculateNextDueDate(
  membership_plan?: string,
  join_date?: string
) {


  if(!membership_plan || !join_date){
    return "";
  }



  const date = new Date(join_date);



  const plan =
    membership_plan.toLowerCase();



  if(plan.includes("monthly")){

    date.setMonth(
      date.getMonth()+1
    );

  }


  else if(
    plan.includes("3")
  ){

    date.setMonth(
      date.getMonth()+3
    );

  }


  else if(
    plan.includes("6")
  ){

    date.setMonth(
      date.getMonth()+6
    );

  }


  else if(
    plan.includes("year")
  ){

    date.setFullYear(
      date.getFullYear()+1
    );

  }


  else{

    return "";

  }




  return date
    .toISOString()
    .split("T")[0];

}









export async function getStudentById(
  id:number
):Promise<Student | null>{


const {
data,
error
}=await supabase

.from("Students")

.select("*")

.eq(
"id",
id
)

.single();




if(error){

console.error(
"Student fetch error:",
error
);

return null;

}



return data as Student;


}









export async function updateStudent(

id:number,

updates:Partial<Student>

):Promise<Student>{



const updatedData = {

...updates,


next_due_date:

updates.next_due_date ||

calculateNextDueDate(

updates.membership_plan,

updates.join_date

)

};






const {
data,
error
}=await supabase

.from("Students")

.update(updatedData)

.eq(
"id",
id
)

.select()

.single();





if(error){

console.error(
"Student update error:",
error
);

throw error;

}



return data as Student;


}









export async function addStudent(

student:Omit<Student,"id"|"created_at">

){



const studentData = {


...student,


next_due_date:

student.next_due_date ||

calculateNextDueDate(

student.membership_plan,

student.join_date

),



fee_status:

student.fee_status ||

(
Number(student.Fees_due ?? 0) > 0
?
"Due Soon"
:
"Paid"
),


};







const {
data,
error
}=await supabase

.from("Students")

.insert([studentData])

.select()

.single();





if(error){

console.error(
"Student insert error:",
error
);

throw error;

}



return data as Student;


}









export async function getStudents()
:Promise<Student[]>{



const {
data,
error
}=await supabase

.from("Students")

.select("*")

.order("Name");





if(error){

console.error(
"Students fetch error:",
error
);

throw error;

}



return (data as Student[]) ?? [];


}









export async function deleteStudent(
id:number
){



const {
error
}=await supabase

.from("Students")

.delete()

.eq(
"id",
id
);




if(error){

console.error(
"Student delete error:",
error
);

throw error;

}


}