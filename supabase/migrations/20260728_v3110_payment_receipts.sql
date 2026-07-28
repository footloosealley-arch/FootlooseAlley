-- Add concurrency-safe receipt numbers to the canonical payment table.
BEGIN;

ALTER TABLE public."Payments"
  ADD COLUMN IF NOT EXISTS receipt_number text;

CREATE SEQUENCE IF NOT EXISTS public.payment_receipt_number_seq
  AS bigint
  START WITH 1
  INCREMENT BY 1
  MINVALUE 1
  NO CYCLE;

-- Trigger execution uses the inserting role, so authenticated staff and
-- service operations need access to nextval without broadening Payments RLS.
GRANT USAGE, SELECT ON SEQUENCE public.payment_receipt_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.payment_receipt_number_seq TO service_role;

CREATE OR REPLACE FUNCTION public.assign_payment_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.receipt_number IS NULL THEN
    NEW.receipt_number := 'FA-RCP-' || lpad(
      nextval('public.payment_receipt_number_seq')::text,
      6,
      '0'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_payment_receipt_number_trigger
  ON public."Payments";
CREATE TRIGGER assign_payment_receipt_number_trigger
  BEFORE INSERT ON public."Payments"
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_payment_receipt_number();

-- First move the sequence past all already-issued generated numbers. This makes
-- reruns and partially migrated databases safe before filling any gaps.
DO $$
DECLARE
  maximum_number bigint;
  sequence_value bigint;
  sequence_called boolean;
BEGIN
  SELECT max(substring(receipt_number FROM '^FA-RCP-([0-9]+)$')::bigint)
  INTO maximum_number
  FROM public."Payments"
  WHERE receipt_number ~ '^FA-RCP-[0-9]+$';

  SELECT last_value, is_called
  INTO sequence_value, sequence_called
  FROM public.payment_receipt_number_seq;

  IF maximum_number IS NOT NULL
     AND (maximum_number > sequence_value OR NOT sequence_called) THEN
    PERFORM setval('public.payment_receipt_number_seq', maximum_number, true);
  END IF;
END
$$;

-- A row-by-row ordered backfill guarantees deterministic assignment by id.
DO $$
DECLARE
  payment_row record;
BEGIN
  FOR payment_row IN
    SELECT id
    FROM public."Payments"
    WHERE receipt_number IS NULL
    ORDER BY id
    FOR UPDATE
  LOOP
    UPDATE public."Payments"
    SET receipt_number = 'FA-RCP-' || lpad(
      nextval('public.payment_receipt_number_seq')::text,
      6,
      '0'
    )
    WHERE id = payment_row.id
      AND receipt_number IS NULL;
  END LOOP;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS payments_receipt_number_unique_idx
  ON public."Payments" (receipt_number)
  WHERE receipt_number IS NOT NULL;

-- Finish beyond every generated value, including values added before a rerun.
DO $$
DECLARE
  maximum_number bigint;
  sequence_value bigint;
  sequence_called boolean;
BEGIN
  SELECT max(substring(receipt_number FROM '^FA-RCP-([0-9]+)$')::bigint)
  INTO maximum_number
  FROM public."Payments"
  WHERE receipt_number ~ '^FA-RCP-[0-9]+$';

  SELECT last_value, is_called
  INTO sequence_value, sequence_called
  FROM public.payment_receipt_number_seq;

  IF maximum_number IS NOT NULL
     AND (maximum_number > sequence_value OR NOT sequence_called) THEN
    PERFORM setval('public.payment_receipt_number_seq', maximum_number, true);
  END IF;
END
$$;

COMMIT;
