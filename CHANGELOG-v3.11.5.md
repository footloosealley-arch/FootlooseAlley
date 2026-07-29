# Footloose Alley Studio Manager v3.11.5

## React lifecycle and lint cleanup

- Reworked initial dashboard data loading effects to use explicit asynchronous initialization lifecycles while retaining refresh, loading, success, empty, and error behavior.
- Reset enquiry and fee-due dialogs through initialized state and keyed dialog lifecycles, preserving Add/Edit/Convert/Mark Paid values and clean validation state on reopen.
- Replaced effect-driven mobile breakpoint state with a hydration-safe `useSyncExternalStore` media-query subscription.
- Made `useAsync` dependency tracking statically verifiable while retaining automatic execution, refresh, loading, data, error, stale-request, and unmount protections.
- Safely handled missing membership dates in Studio Assistant renewal priority calculations.
- Removed unused imports and obsolete lint suppression, and corrected JSX apostrophe escaping without changing visible copy.
- Updated the application version to 3.11.5.
