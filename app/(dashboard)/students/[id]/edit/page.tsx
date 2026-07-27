"use client";

import {
  useParams,
  usePathname,
  useRouter,
} from "next/navigation";

import ErrorCard from "@/components/common/ErrorCard";
import LoadingCard from "@/components/common/LoadingCard";
import StudentProfile from "@/components/students/StudentProfile";
import StudentProfileActions from "@/components/students/StudentProfileActions";

import { useAsync } from "@/hooks/useAsync";
import { studentsService } from "@/services/students.service";

function getStudentId(
  parameterValue:
    | string
    | string[]
    | undefined,
  pathname: string
): number | null {
  let rawId: string | undefined;

  if (
    typeof parameterValue ===
    "string"
  ) {
    rawId = parameterValue;
  } else if (
    Array.isArray(
      parameterValue
    )
  ) {
    rawId =
      parameterValue[0];
  }

  if (!rawId) {
    const pathParts =
      pathname
        .split("/")
        .filter(Boolean);

    const studentsIndex =
      pathParts.indexOf(
        "students"
      );

    if (
      studentsIndex >= 0 &&
      pathParts[
        studentsIndex + 1
      ]
    ) {
      rawId =
        pathParts[
          studentsIndex + 1
        ];
    }
  }

  const parsedId =
    Number(rawId);

  if (
    !Number.isInteger(
      parsedId
    ) ||
    parsedId <= 0
  ) {
    return null;
  }

  return parsedId;
}

export default function StudentProfilePage() {
  const params =
    useParams();

  const pathname =
    usePathname();

  const router =
    useRouter();

  const studentId =
    getStudentId(
      params?.id as
        | string
        | string[]
        | undefined,
      pathname
    );

  const {
    data,
    loading,
    error,
    refresh,
  } = useAsync(
    async () => {
      if (!studentId) {
        throw new Error(
          "Invalid student ID."
        );
      }

      return studentsService.getStudentProfile(
        studentId
      );
    },
    [studentId]
  );

  async function handleRefresh() {
    await refresh();
  }

  if (loading) {
    return (
      <LoadingCard title="Loading Student Profile..." />
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Unable to load student profile"
        message={
          error.message
        }
        onRetry={() => {
          void refresh();
        }}
      />
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border bg-background p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">
          Student Not Found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          This student may have been removed or the link may be incorrect.
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/students"
            )
          }
          className="mt-5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Return to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StudentProfileActions
        student={
          data.student
        }
        onRefresh={
          handleRefresh
        }
      />

      <StudentProfile
        profile={data}
      />
    </div>
  );
}