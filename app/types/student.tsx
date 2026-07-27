type Student = {
  id: number;
  Name: string;
  Phone: string;
  Email: string;
  Address: string;
  Emergency_contact: string;
  Program: string;
  Fees: number;
  Fees_due: number;
  Due_date: string;
  Status: string;
  photo_url?: string;
};

type Props = {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
};

export default function StudentTable({
  students,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold">Students</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-slate-100">
            <tr>
              <th className="border p-3 text-left">Student</th>
              <th className="border p-3 text-left">Phone</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Address</th>
              <th className="border p-3 text-left">Emergency Contact</th>
              <th className="border p-3 text-left">Program</th>
              <th className="border p-3 text-left">Fees</th>
              <th className="border p-3 text-left">Fees Due</th>
              <th className="border p-3 text-left">Due Date</th>
              <th className="border p-3 text-left">Status</th>
              <th className="border p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="border p-4 text-center text-gray-500"
                >
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="border p-3">
                    <div className="flex items-center gap-3">
                      {student.photo_url ? (
                        <img
                          src={student.photo_url}
                          alt={student.Name}
                          className="h-12 w-12 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                          {student.Name.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold">{student.Name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="border p-3">{student.Phone}</td>
                  <td className="border p-3">{student.Email}</td>
                  <td className="border p-3">{student.Address}</td>
                  <td className="border p-3">{student.Emergency_contact}</td>
                  <td className="border p-3">{student.Program}</td>
                  <td className="border p-3">₹{student.Fees}</td>
                  <td className="border p-3">₹{student.Fees_due}</td>
                  <td className="border p-3">{student.Due_date}</td>

                  <td className="border p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        student.Status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.Status}
                    </span>
                  </td>

                  <td className="border p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(student.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}