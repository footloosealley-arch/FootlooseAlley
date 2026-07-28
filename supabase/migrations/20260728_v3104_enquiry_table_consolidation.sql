-- Consolidate enquiry data in the canonical, case-sensitive table.
-- The legacy lowercase table is intentionally retained for historical safety.

BEGIN;

ALTER TABLE public."Enquiries"
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS enquiry_date date,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

INSERT INTO public."Enquiries" (
  created_at,
  "Name",
  "Phone",
  "Email",
  gender,
  age,
  "Program",
  source,
  "Status",
  enquiry_date,
  "Follow_up_date",
  trial_date,
  assigned_to,
  "Notes",
  converted_student_id,
  converted_at,
  updated_at
)
SELECT
  legacy.created_at,
  legacy.name,
  legacy.phone,
  legacy.email,
  legacy.gender,
  legacy.age,
  legacy.interested_in,
  legacy.source,
  CASE legacy.status
    WHEN 'Follow-up' THEN 'Follow Up'
    WHEN 'Trial Scheduled' THEN 'Trial Booked'
    WHEN 'Not Interested' THEN 'Closed'
    ELSE legacy.status
  END,
  COALESCE(legacy.enquiry_date, legacy.created_at::date),
  legacy.follow_up_date,
  legacy.trial_date,
  legacy.assigned_to,
  legacy.notes,
  legacy.converted_student_id,
  legacy.converted_at,
  COALESCE(legacy.updated_at, legacy.created_at)
FROM public.enquiries AS legacy
WHERE NOT EXISTS (
  SELECT 1
  FROM public."Enquiries" AS canonical
  WHERE canonical.created_at IS NOT DISTINCT FROM legacy.created_at
);

UPDATE public."Enquiries"
SET enquiry_date = created_at::date
WHERE enquiry_date IS NULL;

UPDATE public."Enquiries"
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE public."Enquiries"
  ALTER COLUMN enquiry_date SET DEFAULT CURRENT_DATE,
  ALTER COLUMN updated_at SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public."Enquiries"'::regclass
      AND conname = 'Enquiries_age_valid_check'
  ) THEN
    ALTER TABLE public."Enquiries"
      ADD CONSTRAINT "Enquiries_age_valid_check"
      CHECK (age IS NULL OR age BETWEEN 1 AND 120);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public."Enquiries"'::regclass
      AND conname = 'Enquiries_gender_valid_check'
  ) THEN
    ALTER TABLE public."Enquiries"
      ADD CONSTRAINT "Enquiries_gender_valid_check"
      CHECK (
        gender IS NULL
        OR gender IN ('Male', 'Female', 'Other', 'Prefer not to say')
      );
  END IF;
END
$$;

-- Recreate only when necessary, retaining the relationship while guaranteeing
-- that deleting a converted student clears the link rather than the enquiry.
DO $$
DECLARE
  existing_constraint record;
BEGIN
  SELECT con.conname, con.confdeltype
  INTO existing_constraint
  FROM pg_constraint AS con
  WHERE con.conrelid = 'public."Enquiries"'::regclass
    AND con.contype = 'f'
    AND con.conkey = ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid = 'public."Enquiries"'::regclass
         AND attname = 'converted_student_id')
    ]::smallint[]
  LIMIT 1;

  IF existing_constraint.conname IS NULL THEN
    ALTER TABLE public."Enquiries"
      ADD CONSTRAINT "Enquiries_converted_student_id_fkey"
      FOREIGN KEY (converted_student_id)
      REFERENCES public."Students" (id)
      ON DELETE SET NULL;
  ELSIF existing_constraint.confdeltype <> 'n' THEN
    EXECUTE format(
      'ALTER TABLE public."Enquiries" DROP CONSTRAINT %I',
      existing_constraint.conname
    );
    ALTER TABLE public."Enquiries"
      ADD CONSTRAINT "Enquiries_converted_student_id_fkey"
      FOREIGN KEY (converted_student_id)
      REFERENCES public."Students" (id)
      ON DELETE SET NULL;
  END IF;
END
$$;

COMMIT;
