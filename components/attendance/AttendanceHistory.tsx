"use client";

import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type { Attendance } from "@/types/attendance";


type Props = {
  attendance: Attendance[];
};



export default function AttendanceHistory({
  attendance,
}: Props) {


  return (

    <div className="rounded-2xl bg-white p-6 shadow">


      <div className="mb-6 flex items-center gap-3">

        <CalendarCheck
          className="h-6 w-6 text-indigo-600"
        />

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Attendance History
          </h2>

          <p className="text-sm text-slate-500">
            Recent attendance records
          </p>

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

                  <CheckCircle2 size={16} />

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

                  <XCircle size={16} />

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
            Attendance history will appear after marking attendance.
          </p>

        </div>

      )}


    </div>

  );

}