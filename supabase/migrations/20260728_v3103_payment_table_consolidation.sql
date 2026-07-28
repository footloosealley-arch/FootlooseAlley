-- Consolidate application payment data in the canonical, case-sensitive table.
-- The source table is intentionally retained for historical safety.

BEGIN;

INSERT INTO public."Payments" (
  created_at,
  student_id,
  amount,
  payment_date,
  payment_method,
  remarks,
  received_by,
  invoice_number,
  payment_status,
  reference_number
)
SELECT
  source.created_at,
  source.student_id,
  source.amount,
  source.payment_date,
  source.payment_method,
  source.remarks,
  source.received_by,
  source.invoice_number,
  source.payment_status,
  source.reference_number
FROM public.payments AS source
WHERE NOT EXISTS (
  SELECT 1
  FROM public."Payments" AS destination
  WHERE destination.created_at IS NOT DISTINCT FROM source.created_at
);

ALTER TABLE public."Payments"
  DROP CONSTRAINT IF EXISTS "Payments_student_id_fkey";

ALTER TABLE public."Payments"
  ADD CONSTRAINT "Payments_student_id_fkey"
  FOREIGN KEY (student_id)
  REFERENCES public."Students" (id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public."Payments"'::regclass
      AND conname = 'Payments_amount_positive_check'
  ) THEN
    ALTER TABLE public."Payments"
      ADD CONSTRAINT "Payments_amount_positive_check"
      CHECK (amount > 0);
  END IF;
END
$$;

COMMIT;
