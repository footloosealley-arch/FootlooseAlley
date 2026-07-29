export const STUDIO_BATCHES = [
  "Fitness",
  "Kids' Weekday Dance Class",
  "Kids' Weekend Dance Class",
  "Adults' Weekend Dance Class",
  "Adults' Weekend Salsa Class",
] as const;

export type StudioBatch =
  (typeof STUDIO_BATCHES)[number];

const FITNESS_PROGRAMS = new Set([
  "abs",
  "aerobics",
  "dance fitness",
  "fitness",
  "medicine ball",
  "pilates",
  "resistance band",
  "steppers",
  "strength and toning",
  "strength training",
  "strengthening & toning",
  "strengthening and toning",
  "strong nation",
  "toning",
  "yoga",
  "zumba",
]);

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function getStudioBatch(
  batch: string | null | undefined,
  program?: string | null
): string | null {
  const selectedValue = batch?.trim() || program?.trim();

  if (!selectedValue) {
    return null;
  }

  const normalizedValue = normalize(selectedValue);
  const normalizedProgram = program
    ? normalize(program)
    : "";

  if (
    [normalizedValue, normalizedProgram].some(
      (value) =>
        FITNESS_PROGRAMS.has(value) ||
        [...FITNESS_PROGRAMS].some((fitnessProgram) =>
          value.includes(fitnessProgram)
        )
    )
  ) {
    return "Fitness";
  }

  const configuredBatch = STUDIO_BATCHES.find(
    (option) =>
      normalize(option) === normalizedValue
  );

  return configuredBatch ?? selectedValue;
}
