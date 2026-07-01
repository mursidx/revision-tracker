# Revise — SSC CGL Spaced Repetition Revision Tracker

## Problem Statement (original)
Build a React web app that tracks study chapters and automatically schedules spaced repetition revisions on Day 1, Day 3, Day 7 and Day 30 after a chapter is first studied. Target user: a solo SSC CGL aspirant. Must be dead simple, mobile-first, offline-capable, and 100% localStorage-based (no backend, no auth). Four screens: Today, Add Chapter, All Chapters, Calendar.

## User Choices (locked)
- Storage: localStorage only (no backend, no sync)
- Notifications: browser Notification API — ask once, daily reminder on open
- Design: follow spec palette exactly (calm planner aesthetic)

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui + Sonner (toasts) + lucide-react (icons) + dayjs (date math)
- **Fonts**: Chivo (display) + Karla (body) — loaded via Google Fonts
- **Persistence**: `localStorage` keys — `revision_tracker_chapters`, `revision_tracker_last_opened`, `revision_tracker_notif_state`
- **State**: `useChapters` hook — cross-tab sync via `storage` event + custom `revision-tracker-updated` event
- **Backend**: unused (server.py left untouched)

## User Personas
- **Solo SSC CGL Aspirant** — studies 4 subjects (Math / English / Reasoning / GK) daily, needs a low-effort, reliable revision schedule; opens the app every morning to see exactly what to revise; not a developer.

## Core Requirements (static)
1. Log chapter with subject, name, study date (default today, no future), difficulty, notes
2. Auto-schedule 4 fixed revision slots (Day 1/3/7/30) from study date — never rescheduled
3. Today screen shows overdue + due-today grouped by subject + completed-today
4. Mark Done records today's ISO date in `completedOn` for that slot
5. All Chapters: search, subject/status filter pills, sort, expandable timeline, edit notes, delete
6. Calendar month view with subject-colored dots per day, tap to see due items
7. Date math correct across month/year boundaries
8. Graceful handling of corrupted localStorage
9. Mobile bottom tab bar, desktop top nav, min 44px tap targets

## What's Been Implemented (2026-07-01)
- `App.js` — router with `Layout` shell + Sonner Toaster
- `components/Layout.jsx` — desktop top nav + mobile bottom tab bar (4 tabs)
- `pages/Today.jsx` — long date header, notif-permission prompt, overdue section (red-tinted), due-today grouped by subject, completed-today collapsible, empty states
- `pages/AddChapter.jsx` — subject pills, name, native date input (max=today), difficulty pills, notes, live 4-slot schedule preview, duplicate-guard dialog, success screen with 4-slot summary + auto-navigate
- `pages/AllChapters.jsx` — search, subject/status filter pills, sort selector, expandable chapter card with revision timeline, edit-notes inline, delete-with-confirm dialog, progress bar, next-revision indicator, "Complete" badge
- `pages/CalendarPage.jsx` — month grid (Mon-start), subject-colored dots, today ring, selectable day, side panel with due items and inline Mark Done, prev/next/Today controls, legend
- `lib/dates.js` — `SLOT_OFFSETS`, `buildRevisions`, `addDaysISO`, formatters, `monthMatrix`
- `lib/storage.js` — load/save chapters with shape validation, `createChapter` with UUID, last-opened + notif-state helpers
- `lib/notifications.js` — permission request (asked-once), daily reminder gated by `lastNotifiedISO`
- `lib/subjects.js` — 4 subjects with exact hex tokens (Math #5B4FCF, English #C0415A, Reasoning #1A7A5E, GK #C07800)
- `hooks/useChapters.js` — CRUD + mark-done + undo + update-notes with cross-tab persistence
- `components/RevisionCard.jsx` — reusable card used in Today + Calendar with today/overdue/done variants
- Tailwind config extended with custom tokens (canvas / surface / ink / muted2 / line / brand / success / danger)

## Testing (iteration_1)
- Frontend testing agent: ~90% primary flows verified, no blocking bugs
- Only LOW priority notes: validation text selector convention (cosmetic), toast overlay intercepts rapid clicks (real users unaffected)

## Prioritized Backlog
- **P1** — Verify edit-notes + delete + timeline mark/undo + calendar-with-data + month-boundary date math via a follow-up automated pass
- **P2** — Import / export JSON (backup / restore across devices)
- **P2** — Streaks / weekly summary (opt-in; keep the calm aesthetic)
- **P2** — Bulk-add chapters (paste list, one per line)
- **P3** — Optional SW-based reliable daily reminder (currently reminders only fire when the app is opened)
- **P3** — Reschedule a single slot (currently forbidden by design)

## Next Tasks
1. Follow-up testing on deferred flows (P1)
2. Import/export in Settings (P2)
