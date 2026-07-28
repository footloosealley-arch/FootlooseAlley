# Footloose Alley Studio Manager v3.10.5

## Private student photos

- Made the `student-photos` bucket private while leaving `event-images` unchanged.
- Restricted student-photo reads to active admin and receptionist accounts.
- Store stable object paths in student records and create short-lived signed URLs only in the browser for display.
- Added safe compatibility for legacy public student-photo URLs.
- Retained JPG, PNG, and WebP validation and the 5 MB upload limit.
