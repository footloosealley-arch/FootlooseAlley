BEGIN;

REVOKE ALL PRIVILEGES ON SEQUENCE public.payment_receipt_number_seq FROM anon;
REVOKE ALL PRIVILEGES ON SEQUENCE public.payment_receipt_number_seq FROM authenticated;
REVOKE ALL PRIVILEGES ON SEQUENCE public.payment_receipt_number_seq FROM service_role;

GRANT USAGE, SELECT ON SEQUENCE public.payment_receipt_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.payment_receipt_number_seq TO service_role;

COMMIT;
