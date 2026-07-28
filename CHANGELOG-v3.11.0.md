# Footloose Alley Studio Manager v3.11.0

## Payment receipts

- Added database-generated, unique `FA-RCP-000001` receipt numbers for canonical `public."Payments"` records.
- Added deterministic receipt-number backfill for historical payments without changing invoice numbers or payment data.
- Added authenticated payment receipt previews using the official Footloose Alley branding.
- Added native browser printing and Save as PDF support with a compact A4 layout.
- Added receipt numbers to payment history, search, and newly recorded payment results.
- Preserved payment totals, filters, fee-balance updates, deletion behavior, RLS, and legacy payment data.
