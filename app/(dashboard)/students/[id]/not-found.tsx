import Link from "next/link";
import { ArrowLeft, UserX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-8">
      <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
        <UserX className="mx-auto h-16 w-16 text-slate-300" />

        <h1 className="mt-6 text-3xl font-bold text-slate-800">
          Student Not Found
        </h1>

        <p className="mt-3 text-slate-500">
          The student you're looking for doesn't exist or may have been removed.
        </p>

        <Link
          href="/students"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={18} />
          Back to Students
        </Link>
      </div>
    </main>
  );
}