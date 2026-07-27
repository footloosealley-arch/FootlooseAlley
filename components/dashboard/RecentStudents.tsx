"use client";

type RecentStudent = {
  id: number;
  Name?: string;
  Program?: string;
  Phone?: string;
};


type Props = {
  students?: RecentStudent[];
};


export default function RecentStudents({
  students = [],
}: Props) {

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <h2 className="mb-6 text-2xl font-bold">
        👨‍🎓 Recent Students
      </h2>


      {students.length === 0 ? (

        <p className="text-gray-500">
          No students found.
        </p>

      ) : (

        <div className="space-y-4">

          {students.map((student) => (

            <div
              key={student.id}
              className="
              rounded-xl
              border
              border-gray-100
              p-4
              transition
              hover:bg-gray-50
              "
            >

              <div className="flex items-center justify-between">


                <div>

                  <h3 className="text-lg font-semibold">
                    {student.Name ?? "Unknown"}
                  </h3>


                  <p className="text-gray-500">
                    {student.Program ?? "-"}
                  </p>


                  <p className="mt-1 text-sm text-gray-400">
                    📞 {student.Phone ?? "-"}
                  </p>


                </div>


                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-purple-600
                  text-lg
                  font-bold
                  text-white
                ">
                  {(student.Name ?? "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>


              </div>


            </div>

          ))}

        </div>

      )}

    </div>
  );
}