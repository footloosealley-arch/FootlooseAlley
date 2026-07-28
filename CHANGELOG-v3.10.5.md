# Footloose Alley Studio Manager v3.10.5

## Private student photos

- Made the `student-photos` bucket private while leaving `event-images` unchanged.
- Restricted student-photo reads to active admin and receptionist accounts.
- Store stable object paths in student records and create short-lived signed URLs only in the browser for display.
- Added safe compatibility for legacy public student-photo URLs.
- Retained JPG, PNG, and WebP validation and the 5 MB upload limit.
- Deferred replacement and removal cleanup so editing or cancelling a student form never deletes an object still referenced by the saved record; orphaned private objects can be handled by a later admin cleanup process.
- Refresh five-minute student-photo display URLs approximately every four minutes while the photo remains mounted.
