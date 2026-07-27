"use client";

import {
<<<<<<< HEAD
  useMemo,
  useState,
} from "react";

import PageHeader from "@/components/layout/PageHeader";

import AddStudentDialog from "@/components/students/AddStudentDialog";
import StudentFilters, {
  type StudentFilterValues,
} from "@/components/students/StudentFilters";
import StudentPagination from "@/components/students/StudentPagination";
import StudentTable from "@/components/students/StudentTable";
import StudentToolbar from "@/components/students/StudentToolbar";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";

import { useAsync } from "@/hooks/useAsync";
import { studentsService } from "@/services/students.service";

type StudentSortField =
  | "created_at"
  | "Name"
  | "Fees_due"
  | "join_date";

type StudentSortOrder =
  | "asc"
  | "desc";

const VALID_SORT_FIELDS: StudentSortField[] = [
  "created_at",
  "Name",
  "Fees_due",
  "join_date",
];

function normalizeSortField(
  value: string
): StudentSortField {
  if (
    VALID_SORT_FIELDS.includes(
      value as StudentSortField
    )
  ) {
    return value as StudentSortField;
  }

  return "Name";
}

function normalizeSortOrder(
  value: string
): StudentSortOrder {
  return value === "desc"
    ? "desc"
    : "asc";
}

export default function StudentsPage() {
  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(20);

  const [
    addStudentOpen,
    setAddStudentOpen,
  ] = useState(false);

  const [filters, setFilters] =
    useState<StudentFilterValues>({
      status: "",
      classId: "",
      instructorId: "",
      sortBy: "Name",
      sortOrder: "asc",
    });

  const status =
    filters.status;

  const classId =
    filters.classId;

  const instructorId =
    filters.instructorId;

  const sortBy =
    normalizeSortField(
      filters.sortBy
    );

  const sortOrder =
    normalizeSortOrder(
      filters.sortOrder
    );

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsync(
    async () => {
      const [
        students,
        classes,
        instructors,
      ] = await Promise.all([
        studentsService.getStudents({
          page,
          pageSize,
          search:
            search.trim(),

          status:
            status ||
            undefined,

          classId:
            classId
              ? Number(classId)
              : undefined,

          instructorId:
            instructorId
              ? Number(
                  instructorId
                )
              : undefined,

          sortBy,
          sortOrder,
        }),

        studentsService.getClasses(),

        studentsService.getInstructors(),
      ]);

      return {
        students,
        classes,
        instructors,
      };
    },
    [
      page,
      pageSize,
      search,
      status,
      classId,
      instructorId,
      sortBy,
      sortOrder,
    ]
  );

  const total =
    data?.students.total ?? 0;

  const students =
    data?.students.data ?? [];

  const classes =
    data?.classes ?? [];

  const instructors =
    data?.instructors ?? [];

  const pageCount = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(
        total / pageSize
      )
    );
  }, [
    total,
    pageSize,
  ]);

  function handleFilterChange(
    key: keyof StudentFilterValues,
    value: string
  ) {
    setPage(1);

    setFilters(
      (previousFilters) => ({
        ...previousFilters,
        [key]: value,
      })
    );
  }

  function handleSearchChange(
    value: string
  ) {
    setPage(1);
    setSearch(value);
  }

  function handleRefresh() {
    void refresh();
  }

  function handleExport() {
    alert(
      "Excel export will be added later."
    );
  }

  function handleAddStudent() {
    setAddStudentOpen(true);
  }

  async function handleStudentAdded() {
    setPage(1);

    await refresh();
  }

  function handlePageChange(
    newPage: number
  ) {
    if (
      newPage < 1 ||
      newPage > pageCount
    ) {
      return;
    }

    setPage(newPage);
  }

  function handlePageSizeChange(
    size: number
  ) {
    setPage(1);
    setPageSize(size);
  }

  return (
    <>
      <PageHeader
        title="Students"
        description="Manage all studio students"
      />

      <StudentToolbar
        search={search}
        onSearchChange={
          handleSearchChange
        }
        onRefresh={
          handleRefresh
        }
        onExport={
          handleExport
        }
        onAddStudent={
          handleAddStudent
        }
      />

      <StudentFilters
        filters={filters}
        classes={classes}
        instructors={
          instructors
        }
        onChange={
          handleFilterChange
        }
      />

      {loading && (
        <LoadingCard title="Loading Students..." />
      )}

      {!loading &&
        error && (
          <ErrorCard
            title="Unable to load students"
            message={
              error.message
            }
            onRetry={
              handleRefresh
            }
          />
        )}

      {!loading &&
        !error &&
        data && (
          <>
            <StudentTable
              students={
                students
              }
            />

            <StudentPagination
              page={page}
              pageSize={
                pageSize
              }
              total={total}
              onPageChange={
                handlePageChange
              }
              onPageSizeChange={
                handlePageSizeChange
              }
            />
          </>
        )}

      <AddStudentDialog
        open={
          addStudentOpen
        }
        onOpenChange={
          setAddStudentOpen
        }
        onStudentAdded={
          handleStudentAdded
        }
      />
    </>
  );
=======
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Search,
  Plus,
  MessageCircle,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";

import { supabase } from "@/lib/supabase";





type Student = {

id:number;

Name:string | null;

Phone:string | null;

Program:string | null;

Fees:number | null;

Fees_due:number | null;

Status:string | null;

membership_plan:string | null;

next_due_date:string | null;

fee_status:string | null;

};









export default function StudentsPage(){



const [students,setStudents] =

useState<Student[]>([]);



const [loading,setLoading] =

useState(true);



const [search,setSearch] =

useState("");



const [filter,setFilter] =

useState("All");









useEffect(()=>{

loadStudents();

},[]);









async function loadStudents(){


try{


const {

data,

error

}=await supabase

.from("Students")

.select(`

id,

Name,

Phone,

Program,

Fees,

Fees_due,

Status,

membership_plan,

next_due_date,

fee_status

`)

.order(

"id",

{

ascending:false

}

);





if(error)

throw error;



setStudents(

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









function getFeeStatus(student:Student){



const due =

Number(student.Fees_due ?? 0);





if(due===0){

return "Paid";

}







if(!student.next_due_date){

return "Overdue";

}





const today = new Date();



const dueDate =

new Date(

student.next_due_date

);





const difference =

Math.ceil(

(

dueDate.getTime()

-

today.getTime()

)

/

(

1000 *

60 *

60 *

24

)

);







if(difference < 0){

return "Overdue";

}





if(difference <= 7){

return "Due Soon";

}





return "Pending";


}









const filteredStudents =

students.filter(student=>{



const name =

(student.Name ?? "")

.toLowerCase();



const phone =

student.Phone ?? "";





const matchesSearch =

name.includes(

search.toLowerCase()

)

||

phone.includes(search);





const status =

getFeeStatus(student);





const matchesFilter =

filter==="All"

||

filter===status;





return (

matchesSearch

&&

matchesFilter

);


});









if(loading){

return (

<main className="p-8">

Loading students...

</main>

);

}

return (

<main className="space-y-8">



<PageHeader

title="Students"

description="Manage students, fees and membership details."

/>









<div className="
flex
flex-col
gap-4
md:flex-row
md:items-center
md:justify-between
">



<Link

href="/students/add"

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

Add Student

</Link>








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

placeholder="Search student..."

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
flex
flex-wrap
gap-3
">


{

[

"All",

"Paid",

"Due Soon",

"Overdue"

]

.map(item=>(


<button

key={item}

onClick={()=>setFilter(item)}

className={`

rounded-xl

px-4

py-2

font-semibold

${

filter===item

?

"bg-purple-600 text-white"

:

"bg-white"

}

`}

>

{item}

</button>


))


}


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

Program

</th>


<th className="p-4 text-left">

Fees Due

</th>


<th className="p-4 text-left">

Due Date

</th>


<th className="p-4 text-left">

Status

</th>


<th className="p-4 text-left">

Action

</th>


</tr>


</thead>








<tbody>


{

filteredStudents.map(student=>(


<tr

key={student.id}

className="border-b"

>


<td className="p-4">


<Link

href={`/students/${student.id}`}

className="
font-semibold
text-purple-600
"

>

{student.Name ?? "-"}

</Link>


</td>








<td className="p-4">

{student.Phone ?? "-"}

</td>








<td className="p-4">

{student.Program ?? "-"}

</td>








<td className="
p-4
font-semibold
">

₹{student.Fees_due ?? 0}

</td>








<td className="p-4">

{

student.next_due_date

?

new Date(

student.next_due_date

)

.toLocaleDateString()

:

"-"

}

</td>








<td className="p-4">


<StatusBadge

status={getFeeStatus(student)}

/>


</td>








<td className="p-4">


<div className="
flex
items-center
gap-2
">





<Link

href={`/students/${student.id}`}

className="
rounded-xl
bg-purple-100
px-3
py-2
font-semibold
text-purple-700
"

>

View

</Link>








<a

href={`https://wa.me/91${student.Phone ?? ""}`}

target="_blank"

className="
flex
items-center
gap-2
rounded-xl
bg-green-100
px-3
py-2
font-semibold
text-green-700
"

>

<MessageCircle size={16}/>

WhatsApp

</a>





</div>


</td>






</tr>


))


}








{

filteredStudents.length===0 &&


<tr>


<td

colSpan={7}

className="
p-8
text-center
text-slate-500
"

>

No students found.

</td>


</tr>


}



</tbody>


</table>


</div>


</main>

);


}









function StatusBadge({

status

}:{

status:string;

}){


let style = "";



if(status==="Paid"){

style="bg-green-100 text-green-700";

}

else if(status==="Due Soon"){

style="bg-yellow-100 text-yellow-700";

}

else if(status==="Overdue"){

style="bg-red-100 text-red-700";

}

else{

style="bg-slate-100 text-slate-700";

}




return (

<span

className={`

rounded-full

px-3

py-1

text-sm

font-semibold

${style}

`}

>

{status}

</span>

);


>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}