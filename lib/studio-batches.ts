export const STUDIO_COURSES = [
  "Fitness",
  "Kids' Weekday Dance Class",
  "Kids' Weekend Dance Class",
  "Adults' Weekend Dance Class",
  "Adults' Weekend Salsa Class",
] as const;

export type StudioCourse =
  (typeof STUDIO_COURSES)[number];

export type StudioBatchOption = {
  course: StudioCourse;
  batch: string;
  schedule: string;
};

export const STUDIO_BATCH_OPTIONS: StudioBatchOption[] = [
  {
    course: "Fitness",
    batch: "Fitness · Weekdays · 6:00 AM - 7:00 AM",
    schedule: "Weekdays · 6:00 AM - 7:00 AM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Weekdays · 7:15 AM - 8:15 AM",
    schedule: "Weekdays · 7:15 AM - 8:15 AM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Weekdays · 8:30 AM - 9:30 AM",
    schedule: "Weekdays · 8:30 AM - 9:30 AM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Weekdays · 10:00 AM - 11:00 AM",
    schedule: "Weekdays · 10:00 AM - 11:00 AM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Weekdays · 5:30 PM - 6:30 PM",
    schedule: "Weekdays · 5:30 PM - 6:30 PM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Weekdays · 6:30 PM - 7:30 PM",
    schedule: "Weekdays · 6:30 PM - 7:30 PM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Weekdays · 7:30 PM - 8:30 PM",
    schedule: "Weekdays · 7:30 PM - 8:30 PM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Saturday · 8:00 AM - 9:00 AM",
    schedule: "Saturday · 8:00 AM - 9:00 AM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Saturday · 6:00 PM - 7:00 PM",
    schedule: "Saturday · 6:00 PM - 7:00 PM",
  },
  {
    course: "Fitness",
    batch: "Fitness · Sunday · 9:00 AM - 10:00 AM",
    schedule: "Sunday · 9:00 AM - 10:00 AM",
  },
  {
    course: "Kids' Weekday Dance Class",
    batch:
      "Kids' Weekday Dance Class · Monday & Wednesday · 4:30 PM - 5:30 PM",
    schedule: "Monday & Wednesday · 4:30 PM - 5:30 PM",
  },
  {
    course: "Kids' Weekday Dance Class",
    batch:
      "Kids' Weekday Dance Class · Tuesday & Friday · 4:30 PM - 5:30 PM",
    schedule: "Tuesday & Friday · 4:30 PM - 5:30 PM",
  },
  {
    course: "Kids' Weekend Dance Class",
    batch: "Kids' Weekend Dance Class · Saturday · 4:00 PM - 5:00 PM",
    schedule: "Saturday · 4:00 PM - 5:00 PM",
  },
  {
    course: "Kids' Weekend Dance Class",
    batch: "Kids' Weekend Dance Class · Sunday · 10:00 AM - 11:00 AM",
    schedule: "Sunday · 10:00 AM - 11:00 AM",
  },
  {
    course: "Adults' Weekend Dance Class",
    batch: "Adults' Weekend Dance Class · Saturday · 5:00 PM - 6:00 PM",
    schedule: "Saturday · 5:00 PM - 6:00 PM",
  },
  {
    course: "Adults' Weekend Dance Class",
    batch: "Adults' Weekend Dance Class · Sunday · 11:00 AM - 12:00 PM",
    schedule: "Sunday · 11:00 AM - 12:00 PM",
  },
  {
    course: "Adults' Weekend Salsa Class",
    batch: "Adults' Weekend Salsa Class · Saturday · 7:00 PM - 8:00 PM",
    schedule: "Saturday · 7:00 PM - 8:00 PM",
  },
  {
    course: "Adults' Weekend Salsa Class",
    batch: "Adults' Weekend Salsa Class · Sunday · 12:00 PM - 1:00 PM",
    schedule: "Sunday · 12:00 PM - 1:00 PM",
  },
];

export function serializeBatchAssignments(
  batches: string[]
): string | null {
  const uniqueBatches = [...new Set(
    batches.map((batch) => batch.trim()).filter(Boolean)
  )];

  return uniqueBatches.length > 0
    ? JSON.stringify(uniqueBatches)
    : null;
}

export function parseBatchAssignments(
  value: string | null | undefined
): string[] {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return [];
  }

  if (trimmedValue.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmedValue);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((batch): batch is string =>
            typeof batch === "string"
          )
          .map((batch) => batch.trim())
          .filter(Boolean);
      }
    } catch {
      // Preserve older free-text values below.
    }
  }

  return [trimmedValue];
}

export function getCoursesForBatches(
  batches: string[]
): StudioCourse[] {
  const courses = new Set<StudioCourse>();

  for (const batch of batches) {
    const option = STUDIO_BATCH_OPTIONS.find(
      (item) => item.batch === batch
    );

    if (option) {
      courses.add(option.course);
    }
  }

  return [...courses];
}

export function formatBatchAssignments(
  value: string | null | undefined
): string {
  const batches = parseBatchAssignments(value);

  return batches.length > 0
    ? batches.join(", ")
    : "No batch assigned";
}
