"use client";

<<<<<<< HEAD
import Image from "next/image";
=======
>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
import Link from "next/link";

import {
  Eye,
<<<<<<< HEAD
  MessageCircle,
  Pencil,
  Phone,
} from "lucide-react";

import EmptyState from "@/components/common/EmptyState";
import LoadingCard from "@/components/common/LoadingCard";
import StatusBadge from "@/components/common/StatusBadge";

import type { Student } from "@/types/database";

interface StudentTableProps {
  students: Student[];
  loading?: boolean;
}

function getInitials(
  name: string | null | undefined
) {
  if (!name?.trim()) {
    return "?";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getWhatsAppNumber(
  phone: string | null | undefined
) {
  if (!phone) {
    return "";
  }

  const cleanedPhone =
    phone.replace(/\D/g, "");

  if (!cleanedPhone) {
    return "";
  }

  if (cleanedPhone.startsWith("91")) {
    return cleanedPhone;
  }

  return `91${cleanedPhone}`;
}

function formatJoinDate(
  value: string | null | undefined
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export default function StudentTable({
  students,
  loading = false,
}: StudentTableProps) {
  if (loading) {
    return (
      <LoadingCard title="Loading students..." />
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        title="No Students Found"
        description="No students match your current filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Student
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Contact
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Program
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-4 py-3 text-right text-sm font-semibold">
                Fees Due
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold">
                Joined
              </th>

              <th className="px-4 py-3 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const profileUrl =
                `/students/${student.id}`;

              const whatsappNumber =
                getWhatsAppNumber(
                  student.Phone
                );

              return (
                <tr
                  key={student.id}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={profileUrl}
                      className="group flex w-fit items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      title="View student profile"
                    >
                      {student.photo_url ? (
                        <Image
                          src={student.photo_url}
                          alt={
                            student.Name ??
                            "Student photograph"
                          }
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover transition group-hover:opacity-90"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground transition group-hover:opacity-90">
                          {getInitials(
                            student.Name
                          )}
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-foreground transition-colors group-hover:text-primary group-hover:underline">
                          {student.Name ??
                            "Unnamed Student"}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {student.student_code ??
                            "No Code"}
                        </p>
                      </div>
                    </Link>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p>
                        {student.Phone ?? "-"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {student.Email ?? "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p>
                        {student.Program ?? "-"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {student.batch ?? "-"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge
                      status={
                        student.Status ??
                        "Inactive"
                      }
                    />
                  </td>

                  <td className="px-4 py-4 text-right font-semibold">
                    ₹
                    {Number(
                      student.Fees_due ?? 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td className="px-4 py-4">
                    {formatJoinDate(
                      student.join_date
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={profileUrl}
                        className="rounded-md border p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="View Profile"
                        aria-label={`View ${
                          student.Name ??
                          "student"
                        } profile`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/students/${student.id}/edit`}
                        className="rounded-md border p-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title="Edit Student"
                        aria-label={`Edit ${
                          student.Name ??
                          "student"
                        }`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      {student.whatsapp_enabled &&
                        whatsappNumber && (
                          <a
                            href={`https://wa.me/${whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border p-2 text-green-600 transition-colors hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                            title="WhatsApp"
                            aria-label={`Send WhatsApp message to ${
                              student.Name ??
                              "student"
                            }`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}

                      {student.Phone && (
                        <a
                          href={`tel:${student.Phone}`}
                          className="rounded-md border p-2 text-blue-600 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          title="Call Student"
                          aria-label={`Call ${
                            student.Name ??
                            "student"
                          }`}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {students.length}
          </span>{" "}
          student
          {students.length !== 1
            ? "s"
            : ""}
        </p>

        <p className="text-xs text-muted-foreground">
          Footloose Alley Studio Manager
        </p>
      </div>
    </div>
  );
=======
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

import type { Student } from "@/types/student";



type Props = {

  students: Student[];

  onEdit: (student: Student) => void;

  onDelete: (id:number)=>void;

};







export default function StudentTable({

students,

onEdit,

onDelete,

}:Props){






function getFeeStatus(student:Student){


const due =
Number(
student.Fees_due ?? 0
);




if(due <= 0){

return (

<span className="
rounded-full
bg-green-100
px-3
py-1
text-xs
font-semibold
text-green-700
">

Paid

</span>

);


}



return (

<span className="
rounded-full
bg-yellow-100
px-3
py-1
text-xs
font-semibold
text-yellow-700
">

Pending

</span>

);


}







return (

<div className="
overflow-hidden
rounded-3xl
border
border-slate-100
bg-white
shadow-lg
">





<div className="
border-b
px-6
py-6
">


<h2 className="
text-2xl
font-bold
text-slate-800
">

Student Directory

</h2>


<p className="
mt-1
text-sm
text-slate-500
">

{students.length} member{students.length !== 1 ? "s":""}

</p>



</div>







<div className="
overflow-x-auto
">


<table className="
min-w-full
">


<thead className="
bg-slate-50
">


<tr className="
text-left
text-sm
font-semibold
text-slate-600
">


<th className="px-6 py-4">
Student
</th>


<th className="px-6 py-4">
Program
</th>


<th className="px-6 py-4">
Contact
</th>


<th className="px-6 py-4">
Fees
</th>


<th className="px-6 py-4">
Status
</th>


<th className="
px-6
py-4
text-center
">

Actions

</th>


</tr>


</thead>








<tbody>


{
students.length===0

?


<tr>

<td

colSpan={6}

className="
py-12
text-center
text-slate-500
"

>

No students found

</td>

</tr>


:


students.map((student)=>(



<tr

key={student.id}

className="
border-t
transition
hover:bg-indigo-50/40
"

>








<td className="
px-6
py-5
">


<div className="
flex
items-center
gap-4
">



{
student.photo_url

?


<img

src={student.photo_url}

alt={student.Name}

className="
h-14
w-14
rounded-full
border-2
border-indigo-100
object-cover
"

/>


:


<div className="
flex
h-14
w-14
items-center
justify-center
rounded-full
bg-gradient-to-br
from-indigo-600
to-purple-600
text-lg
font-bold
text-white
">

{
student.Name
?.charAt(0)
.toUpperCase()
}

</div>


}





<div>


<Link

href={`/students/${student.id}`}

className="
font-semibold
text-slate-800
hover:text-indigo-600
"

>

{student.Name}

</Link>




<div className="
mt-1
flex
items-center
gap-1
text-sm
text-slate-500
">

<MapPin size={14}/>

{student.Address ?? "-"}

</div>


</div>



</div>



</td>









<td className="
px-6
py-5
">


<span className="
rounded-full
bg-indigo-100
px-3
py-1
text-sm
font-medium
text-indigo-700
">

{student.Program ?? "-"}

</span>


</td>









<td className="
px-6
py-5
">


<div className="
space-y-2
text-sm
">


<div className="
flex
items-center
gap-2
">

<Phone size={14}/>

{student.Phone}


</div>




<div className="
flex
items-center
gap-2
text-slate-500
">

<Mail size={14}/>

{student.Email ?? "-"}


</div>



</div>


</td>









<td className="
px-6
py-5
">


<p className="
font-bold
text-slate-800
">

₹{Number(student.Fees ?? 0).toLocaleString()}

</p>


<p className="
text-sm
text-red-500
">

Due ₹{Number(student.Fees_due ?? 0).toLocaleString()}

</p>


</td>









<td className="
px-6
py-5
">


<div className="
space-y-2
">


{getFeeStatus(student)}



<span

className={`
block
w-fit
rounded-full
px-3
py-1
text-xs
font-semibold
${
student.Status==="Active"

?

"bg-green-100 text-green-700"

:

"bg-red-100 text-red-700"

}
`}

>

{student.Status ?? "Inactive"}

</span>


</div>


</td>









<td className="
px-6
py-5
">


<div className="
flex
justify-center
gap-2
">



<Link

href={`/students/${student.id}`}

className="
rounded-xl
bg-indigo-100
p-2
text-indigo-700
transition
hover:bg-indigo-200
"

title="View"

>

<Eye size={18}/>

</Link>





<button

onClick={()=>onEdit(student)}

className="
rounded-xl
bg-blue-100
p-2
text-blue-700
transition
hover:bg-blue-200
"

title="Edit"

>

<Pencil size={18}/>

</button>





<button

onClick={()=>onDelete(student.id)}

className="
rounded-xl
bg-red-100
p-2
text-red-700
transition
hover:bg-red-200
"

title="Delete"

>

<Trash2 size={18}/>

</button>





</div>


</td>









</tr>



))

}



</tbody>


</table>


</div>






</div>


);


>>>>>>> 9479299bf50418452d20e09ba5a619f3e7c42b9a
}