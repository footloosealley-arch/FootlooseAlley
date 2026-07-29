# Footloose Alley Studio Manager v3.11.1

## Payment receipts

- Enlarged the official Footloose Alley logo on payment receipts while preserving the complete source artwork and responsive header layout.
- Preserved the compact, single-receipt print layout for clear browser printing and Save as PDF output.

## Database security

- Removed all access to the payment receipt number sequence from the anonymous role.
- Limited authenticated and service roles to `USAGE` and `SELECT` on the receipt number sequence without changing payment data, receipt numbers, table privileges, or Payments RLS.
