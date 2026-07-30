"use client";

export interface StudentFilterValues {
  status: string;
  classId: string;
  instructorId: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface Option {
  id: number;
  name: string;
}

interface ClassOption {
  id: number;
  class_name: string;
}

interface StudentFiltersProps {
  filters: StudentFilterValues;
  classes: ClassOption[];
  instructors: Option[];
  onChange: (
    key: keyof StudentFilterValues,
    value: string
  ) => void;
}

export default function StudentFilters({
  filters,
  classes,
  instructors,
  onChange,
}: StudentFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 rounded-xl border bg-background p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
      <div>
        <label htmlFor="student-status-filter" className="mb-2 block text-sm font-medium">
          Status
        </label>

        <select
          id="student-status-filter"
          value={filters.status}
          onChange={(e) =>
            onChange("status", e.target.value)
          }
          className="h-11 w-full rounded-lg border bg-background px-3 md:h-auto md:py-2"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Frozen">Frozen</option>
        </select>
      </div>

      <div>
        <label htmlFor="student-class-filter" className="mb-2 block text-sm font-medium">
          Class
        </label>

        <select
          id="student-class-filter"
          value={filters.classId}
          onChange={(e) =>
            onChange("classId", e.target.value)
          }
          className="h-11 w-full rounded-lg border bg-background px-3 md:h-auto md:py-2"
        >
          <option value="">All Classes</option>

          {classes.map((cls) => (
            <option
              key={cls.id}
              value={cls.id}
            >
              {cls.class_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="student-instructor-filter" className="mb-2 block text-sm font-medium">
          Instructor
        </label>

        <select
          id="student-instructor-filter"
          value={filters.instructorId}
          onChange={(e) =>
            onChange(
              "instructorId",
              e.target.value
            )
          }
          className="h-11 w-full rounded-lg border bg-background px-3 md:h-auto md:py-2"
        >
          <option value="">
            All Instructors
          </option>

          {instructors.map((instructor) => (
            <option
              key={instructor.id}
              value={instructor.id}
            >
              {instructor.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="student-sort-filter" className="mb-2 block text-sm font-medium">
          Sort By
        </label>

        <select
          id="student-sort-filter"
          value={filters.sortBy}
          onChange={(e) =>
            onChange("sortBy", e.target.value)
          }
          className="h-11 w-full rounded-lg border bg-background px-3 md:h-auto md:py-2"
        >
          <option value="Name">Name</option>
          <option value="join_date">
            Join Date
          </option>
          <option value="Fees_due">
            Fees Due
          </option>
          <option value="created_at">
            Created Date
          </option>
        </select>
      </div>

      <div>
        <label htmlFor="student-sort-order" className="mb-2 block text-sm font-medium">
          Order
        </label>

        <select
          id="student-sort-order"
          value={filters.sortOrder}
          onChange={(e) =>
            onChange(
              "sortOrder",
              e.target.value
            )
          }
          className="h-11 w-full rounded-lg border bg-background px-3 md:h-auto md:py-2"
        >
          <option value="asc">
            Ascending
          </option>

          <option value="desc">
            Descending
          </option>
        </select>
      </div>
    </div>
  );
}