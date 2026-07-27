import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type { Student } from "@/types/student";
import { getAttendanceByStudent } from "@/lib/attendance";


type Props = {
  student: Student;
};


export default async function AttendanceCard({
  student,
}: Props) {


  const attendance =
    await getAttendanceByStudent(student.id);



  const present =
    attendance.filter(
      (record) =>
        record.status === "Present"
    ).length;



  const absent =
    attendance.filter(
      (record) =>
        record.status === "Absent"
    ).length;



  const total =
    attendance.length;



  const percentage =
    total > 0
      ? Math.round(
          (present / total) * 100
        )
      : 0;



  return (

    <div className="rounded-2xl border bg-white p-6 shadow-lg">


      <div className="mb-6 flex items-center gap-3">

        <CalendarCheck
          className="h-6 w-6 text-indigo-600"
        />


        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Attendance
          </h2>

          <p className="text-sm text-slate-500">
            Student attendance overview
          </p>

        </div>

      </div>




      <div className="mb-6 grid gap-4 md:grid-cols-4">


        <div className="rounded-xl bg-slate-100 p-4">

          <p className="text-sm text-slate-500">
            Total Classes
          </p>

          <p className="mt-2 text-3xl font-bold">
            {total}
          </p>

        </div>



        <div className="rounded-xl bg-green-50 p-4">

          <p className="text-sm text-slate-500">
            Present
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {present}
          </p>

        </div>



        <div className="rounded-xl bg-red-50 p-4">

          <p className="text-sm text-slate-500">
            Absent
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {absent}
          </p>

        </div>



        <div className="rounded-xl bg-indigo-50 p-4">

          <p className="text-sm text-slate-500">
            Attendance %
          </p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {percentage}%
          </p>

        </div>


      </div>




      <div className="mb-8">


        <div className="mb-2 flex justify-between text-sm text-slate-500">

          <span>
            Overall Attendance
          </span>

          <span>
            {percentage}%
          </span>

        </div>



        <div className="h-3 overflow-hidden rounded-full bg-slate-200">

          <div

            className="
            h-full
            rounded-full
            bg-indigo-600
            transition-all
            duration-500
            "

            style={{
              width: `${percentage}%`,
            }}

          />

        </div>


      </div>




      {attendance.length > 0 ? (

        <div className="space-y-3">


          {attendance
            .slice(0, 10)
            .map((record) => (


            <div

              key={record.id}

              className="
              flex
              items-center
              justify-between
              rounded-xl
              border
              p-4
              "

            >


              <div>

                <p className="font-medium text-slate-800">

                  {new Date(
                    record.date
                  ).toLocaleDateString()}

                </p>

              </div>




              {record.status === "Present" ? (

                <span
                  className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  bg-green-100
                  px-3
                  py-1
                  text-sm
                  font-medium
                  text-green-700
                  "
                >

                  <CheckCircle2 size={16}/>

                  Present

                </span>


              ) : (


                <span
                  className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  bg-red-100
                  px-3
                  py-1
                  text-sm
                  font-medium
                  text-red-700
                  "
                >

                  <XCircle size={16}/>

                  Absent

                </span>


              )}


            </div>


          ))}


        </div>


      ) : (


        <div
          className="
          rounded-xl
          border
          border-dashed
          p-10
          text-center
          "
        >

          <CalendarCheck
            className="
            mx-auto
            mb-3
            h-10
            w-10
            text-slate-300
            "
          />


          <p className="font-semibold text-slate-700">
            No attendance records found
          </p>


          <p className="mt-2 text-sm text-slate-500">
            Attendance history will appear here once classes are marked.
          </p>


        </div>


      )}


    </div>

  );

}