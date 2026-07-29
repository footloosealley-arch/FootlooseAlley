# Footloose Alley Studio Manager v3.11.3

## Payment receipt printing

- Replaced printing from the positioned payment dialog with a standalone print window containing only the receipt.
- Preserved the application styles and receipt branding while removing modal borders, shadows, rounded clipping, and overflow constraints from the printed page.
- Added A4 page sizing, reliable image loading before printing, print-colour preservation, and automatic print-window cleanup.
- Added a clear in-dialog message when the browser blocks the print window.

## Preserved behavior

- The on-screen desktop and mobile receipt preview is unchanged.
- Payment data remains inside the authenticated application; no public receipt route was added.
- Existing security headers, Supabase configuration, and database/RLS behavior are unchanged.
