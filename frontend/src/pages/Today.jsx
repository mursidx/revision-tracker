import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useChapters } from "../hooks/useChapters";
import { RevisionCard } from "../components/RevisionCard";
import { SUBJECTS, SUBJECT_COLORS } from "../lib/subjects";
import { formatLong, todayISO, isPast } from "../lib/dates";
import {
  getLastOpened,
  setLastOpened,
  getNotifState,
} from "../lib/storage";
import {
  notificationsSupported,
  requestNotifPermissionIfNeeded,
  maybeShowDailyReminder,
} from "../lib/notifications";
import { Bell, ChevronDown, ChevronUp, Sparkles, Plus } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Today() {
  const { chapters, markRevisionDone, undoRevision } = useChapters();
  const [showCompleted, setShowCompleted] = useState(false);
  const [notifPerm, setNotifPerm] = useState(
    notificationsSupported() ? Notification.permission : "unsupported",
  );

  // New day detection
  useEffect(() => {
    const today = todayISO();
    const last = getLastOpened();
    if (last !== today) setLastOpened(today);
  }, []);

  const { overdue, dueToday, completedToday } = useMemo(() => {
    const overdue = [];
    const dueToday = [];
    const completedToday = [];
    const today = todayISO();
    for (const c of chapters) {
      c.revisions.forEach((r, idx) => {
        if (r.completedOn === today) {
          completedToday.push({ chapter: c, index: idx });
        } else if (!r.completedOn) {
          if (r.dueDate === today) dueToday.push({ chapter: c, index: idx });
          else if (isPast(r.dueDate))
            overdue.push({ chapter: c, index: idx });
        }
      });
    }
    // Sort overdue by due date ascending
    overdue.sort((a, b) =>
      a.chapter.revisions[a.index].dueDate.localeCompare(
        b.chapter.revisions[b.index].dueDate,
      ),
    );
    return { overdue, dueToday, completedToday };
  }, [chapters]);

  // Fire daily reminder notification once per day if there are dues
  useEffect(() => {
    maybeShowDailyReminder(overdue.length + dueToday.length);
  }, [overdue.length, dueToday.length]);

  const askNotifPerm = async () => {
    const res = await requestNotifPermissionIfNeeded();
    setNotifPerm(res);
    if (res === "granted") {
      toast.success("Reminders enabled");
      maybeShowDailyReminder(overdue.length + dueToday.length);
    } else if (res === "denied") {
      toast("Reminders declined. You can change this in browser settings.");
    }
  };

  const handleMarkDone = (chapterId, revIdx) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const label = chapter?.revisions[revIdx]?.label;
    markRevisionDone(chapterId, revIdx);
    toast.success(`${chapter?.chapterName} — ${label} revision marked complete`);
  };

  const handleUndo = (chapterId, revIdx) => {
    undoRevision(chapterId, revIdx);
    toast("Revision restored");
  };

  const dueCount = overdue.length + dueToday.length;
  const hasChapters = chapters.length > 0;
  const notifState = getNotifState();
  const showNotifPrompt =
    notificationsSupported() &&
    notifPerm === "default" &&
    !notifState.asked &&
    hasChapters;

  const dueBySubject = useMemo(() => {
    const grouped = {};
    for (const s of SUBJECTS) grouped[s] = [];
    for (const item of dueToday) {
      const s = item.chapter.subject;
      if (!grouped[s]) grouped[s] = [];
      grouped[s].push(item);
    }
    return grouped;
  }, [dueToday]);

  return (
    <div data-testid="today-screen" className="space-y-8 animate-fade-slide-in">
      {/* Header */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted2 mb-2">
          {dueCount === 0 && hasChapters
            ? "Nothing due today"
            : dueCount === 0
              ? "Welcome"
              : `${dueCount} revision${dueCount === 1 ? "" : "s"} due today`}
        </p>
        <h1
          data-testid="today-heading"
          className="font-display font-black text-3xl sm:text-4xl tracking-tight text-ink leading-tight tabular"
        >
          {formatLong(todayISO())}
        </h1>
      </section>

      {/* Notifications prompt */}
      {showNotifPrompt && (
        <div
          data-testid="notif-prompt"
          className="rounded-[12px] bg-surface border border-line p-4 sm:p-5 flex items-start gap-4"
        >
          <span className="h-10 w-10 shrink-0 rounded-full bg-brand/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-brand" strokeWidth={1.75} />
          </span>
          <div className="flex-1">
            <h3 className="font-display font-bold text-ink text-base">
              Enable daily reminders
            </h3>
            <p className="text-sm text-muted2 mt-0.5">
              Get a browser notification when you have revisions due.
            </p>
          </div>
          <Button
            type="button"
            onClick={askNotifPerm}
            data-testid="enable-notifications-btn"
            className="h-10 px-4 bg-ink hover:bg-ink/90 text-white font-display font-semibold text-sm rounded-[8px]"
          >
            Enable
          </Button>
        </div>
      )}

      {/* Empty state — no chapters */}
      {!hasChapters && (
        <div
          data-testid="empty-no-chapters"
          className="rounded-[16px] bg-surface border border-line p-8 sm:p-10 text-center"
        >
          <div className="mx-auto h-14 w-14 rounded-full bg-brand/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-brand" strokeWidth={1.75} />
          </div>
          <h2 className="font-display font-black text-2xl text-ink mb-2">
            Welcome to Revise
          </h2>
          <p className="text-muted2 text-sm max-w-sm mx-auto mb-6">
            Log your first chapter and we&apos;ll schedule Day 1, Day 3, Day 7 and Day 30
            revisions automatically.
          </p>
          <Link to="/add" data-testid="empty-add-chapter-link">
            <Button className="h-12 px-6 bg-brand hover:bg-brand-hover text-white font-display font-bold rounded-[10px]">
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
              Add first chapter
            </Button>
          </Link>
        </div>
      )}

      {/* Empty state — no dues */}
      {hasChapters && dueCount === 0 && (
        <div
          data-testid="empty-nothing-due"
          className="rounded-[16px] bg-surface border border-line p-8 text-center"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-success" strokeWidth={1.75} />
          </div>
          <h2 className="font-display font-bold text-xl text-ink mb-1">
            All caught up
          </h2>
          <p className="text-muted2 text-sm mb-5">
            No revisions due today. Good time to study a new chapter.
          </p>
          <Link to="/add" data-testid="nothing-due-add-link">
            <Button
              variant="outline"
              className="h-11 px-5 border-line text-ink font-display font-semibold rounded-[10px] hover:bg-canvas"
            >
              <Plus className="h-4 w-4 mr-1.5" strokeWidth={2} />
              Add chapter studied today
            </Button>
          </Link>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <section data-testid="overdue-section" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display font-bold text-danger text-lg tracking-tight">
              Overdue
            </h2>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-danger">
              {overdue.length} item{overdue.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="space-y-3">
            {overdue.map(({ chapter, index }) => (
              <RevisionCard
                key={`${chapter.id}-${index}`}
                chapter={chapter}
                revisionIndex={index}
                variant="overdue"
                onMarkDone={handleMarkDone}
              />
            ))}
          </div>
        </section>
      )}

      {/* Due today grouped by subject */}
      {dueToday.length > 0 && (
        <section data-testid="due-today-section" className="space-y-5">
          <h2 className="font-display font-bold text-ink text-lg tracking-tight">
            Today
          </h2>
          {SUBJECTS.filter((s) => dueBySubject[s].length > 0).map((subject) => (
            <div key={subject} className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: SUBJECT_COLORS[subject].dot }}
                />
                <h3 className="font-display font-bold text-sm uppercase tracking-widest text-muted2">
                  {subject === "GK" ? "GK / Current Affairs" : subject}
                </h3>
                <span className="text-xs text-muted2 font-medium">
                  · {dueBySubject[subject].length}
                </span>
              </div>
              <div className="space-y-3">
                {dueBySubject[subject].map(({ chapter, index }) => (
                  <RevisionCard
                    key={`${chapter.id}-${index}`}
                    chapter={chapter}
                    revisionIndex={index}
                    variant="today"
                    onMarkDone={handleMarkDone}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Completed today */}
      {completedToday.length > 0 && (
        <section data-testid="completed-today-section" className="space-y-3">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            data-testid="toggle-completed-today"
            className="w-full flex items-center justify-between py-2 group"
          >
            <div className="flex items-baseline gap-2">
              <h2 className="font-display font-bold text-ink text-lg tracking-tight">
                Completed today
              </h2>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-success">
                {completedToday.length}
              </span>
            </div>
            {showCompleted ? (
              <ChevronUp className="h-4 w-4 text-muted2" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted2" />
            )}
          </button>
          {showCompleted && (
            <div className="space-y-3">
              {completedToday.map(({ chapter, index }) => (
                <RevisionCard
                  key={`${chapter.id}-${index}`}
                  chapter={chapter}
                  revisionIndex={index}
                  variant="done"
                  onUndo={handleUndo}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
