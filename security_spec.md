# Security Specification: Study Routine & Habit Tracker

## 1. Data Invariants
1. **Ownership Isolation**: All user-specific sub-collections (`daily_logs`, `sessions`, `tasks`) and the core `users` documents are strictly isolated. A user can only read and write their own documents. There are no public profile reads or shared write permissions.
2. **Schema Verification on Creation**: Creating records must match the exact structures of their schema models, with size checks on strings and bounds on numeric properties (e.g., focus minutes cannot be negative, is completed must be a boolean, priority must be low/medium/high).
3. **Temporal Invariance**: Creation time (`createdAt`) and update time (`updatedAt`) must align with standard system timestamps (`request.time`). A user cannot spoof historical entries using modern client-side timestamps.
4. **Authenticity Guard**: All actions are bounded by the user's active session where the incoming document author ID matches `request.auth.uid`. Anonymous authentication is disallowed unless configured; here, we check for authenticated state.

---

## 2. The "Dirty Dozen" Malicious Payloads (Vulnerability Scenarios)
These scenarios attempt to breach the data safety rules and must result in `PERMISSION_DENIED`:

1. **User Profile Hijack**: Authenticated User `A` tries to modify the theme or CGPA of User `B`'s profile at `/users/B`.
2. **Unauthenticated Read**: An anonymous (unauthenticated) client tries to inspect logs at `/users/A/daily_logs/2026-06-14`.
3. **Ghost Field Write**: User `A` writes to their profile at `/users/A` injecting a malicious `isSystemAdmin: true` field.
4. **Historical Spoof (createdAt)**: User `A` creates a daily log with a back-dated `createdAt` timestamp indicating the year 2020.
5. **Malicious ID Injection**: A client attempts to create a task with an ID consisting of a 2KB junk character string at `/users/A/tasks/{HUGE_STRING}` to raise database overhead.
6. **Task Category Hijack**: User `A` specifies an invalid priority level like "ultra-high" or a list of categories containing 10,000 items.
7. **Cross-User Session Logging**: User `A` logs a Focus Session under User `B`'s collection `/users/B/sessions/session123`.
8. **Negative Focus Duration**: User `A` logs a Focus Session with a negative timer duration (`duration: -45`) or extremely massive minutes to blow up the stats analyzer.
9. **Update-Gap Immutable Field Alteration**: User `A` tries to mutate `createdAt` or `userId` on an existing Daily Log.
10. **Target ID Poisoning via Path Segment**: Inserting control characters or path pointers (`../../admin`) into the custom task ID.
11. **Malicious Log Completes Array Attack**: Injecting a massive array of 5,000 tasks inside `completedTasks` inside `/users/A/daily_logs/2026-06-14` to trigger Out Of Memory.
12. **Status Locking Short-circuit**: Bypassing task priority validation on update by supplying null or empty strings.

---

## 3. The Test Rules Verification Configuration
We will write secure Firestore rules to catch and deny all these payloads. Let's describe the test outline:
- Every query must enforce ownership alignment: `resource.data.userId == request.auth.uid` (or mapping collection segments).
- Creating/updating requires verification of incoming data fields.
- String fields are bounded by `.size()`.
