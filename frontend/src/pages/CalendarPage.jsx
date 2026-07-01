import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { useChapters } from "../hooks/useChapters";
import { RevisionCard } from "../components/RevisionCard";
import { SUBJECTS, SUBJECT_COLORS } from "../lib/subjects";
import {
  todayISO,
  toISO,
  monthMatrix,
  formatLong,
  formatMedium,
  isPast,
} from "../lib/dates";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/button";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const { chapters, markRevisionDone, undoRevision } = useChapters();
  const [viewMonth, setViewMonth] = useState(() =>
    dayjs().startOf("month").format("YYYY-MM-DD"),
  );
  const [selectedDate, setSelectedDate] = useState(todayISO());

  // Map: dueDate -> [{ chapter, index, subject }]
  const dueMap = useMemo(() => {
    const map = new Map();
    for (const c of chapters) {
      c.revisions.forEach((r, idx) => {
        if (r.completedOn) return;
        const key = r.dueDate;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push({ chapter: c, index: idx, subject: c.subject });
      });
    }
    return map;
  }, [chapters]);

  const cells = useMemo(() => monthMatrix(viewMonth), [viewMonth]);

  const monthLabel = dayjs(viewMonth).format("MMMM YYYY");

  const goPrev = () =>
    setViewMonth(dayjs(viewMonth).subtract(1, "month").format("YYYY-MM-DD"));
  const goNext = () =>
    setViewMonth(dayjs(viewMonth).add(1, "month").format("YYYY-MM-DD"));
  const goToday = () => {
    const t = todayISO();
    setViewMonth(dayjs(t).startOf("month").format("YYYY-MM-DD"));
    setSelectedDate(t);
  };

  const selectedItems = dueMap.get(selectedDate) || [];

  const handleMarkDone = (chapterId, revIdx) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    const label = chapter?.revisions[revIdx]?.label;
    markRevisionDone(chapterId, revIdx);
    toast.success(`${chapter?.chapterName} — ${label} marked complete`);
  };

  return (
    <div
      data-testid="calendar-screen"
      className="animate-fade-slide-in space-y-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted2 mb-2">
          Month view
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1
            data-testid="calendar-month-label"
            className="font-display font-black text-3xl sm:text-4xl tracking-tight text-ink tabular"
          >
            {monthLabel}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              data-testid="calendar-prev-btn"
              className="h-10 w-10 rounded-full border border-line bg-surface flex items-center justify-center text-ink hover:bg-canvas transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={goToday}
              data-testid="calendar-today-btn"
              className="h-10 px-4 rounded-full border border-line bg-surface text-ink font-display font-semibold text-xs uppercase tracking-widest hover:bg-canvas transition-colors"
            >
              Today
            </button>
            <button
              onClick={goNext}
              data-testid="calendar-next-btn"
              className="h-10 w-10 rounded-full border border-line bg-surface flex items-center justify-center text-ink hover:bg-canvas transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {SUBJECTS.map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SUBJECT_COLORS[s].dot }}
            />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted2">
              {s === "GK" ? "GK" : s}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* Grid */}
        <div className="rounded-[14px] bg-surface border border-line p-3 sm:p-4">
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-[10px] font-bold uppercase tracking-widest text-muted2 py-1"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((iso) => {
              const inMonth = dayjs(iso).isSame(viewMonth, "month");
              const isToday = iso === todayISO();
              const isSelected = iso === selectedDate;
              const items = dueMap.get(iso) || [];
              const uniqueSubjects = [
                ...new Set(items.map((i) => i.subject)),
              ];
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  data-testid={`calendar-cell-${iso}`}
                  className={`relative aspect-square rounded-md flex flex-col items-center justify-start pt-1.5 gap-1 transition-all ${
                    isSelected
                      ? "bg-brand text-white shadow-sm"
                      : isToday
                        ? "bg-canvas ring-2 ring-ink text-ink"
                        : inMonth
                          ? "hover:bg-canvas text-ink"
                          : "text-muted2/50"
                  }`}
                >
                  <span
                    className={`text-xs font-display font-semibold tabular ${
                      isSelected ? "text-white" : ""
                    }`}
                  >
                    {dayjs(iso).format("D")}
                  </span>
                  {items.length > 0 && (
                    <div className="flex items-center gap-0.5">
                      {uniqueSubjects.length === 1 ? (
                        <>
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: isSelected
                                ? "#fff"
                                : SUBJECT_COLORS[uniqueSubjects[0]].dot,
                            }}
                          />
                          {items.length > 1 && (
                            <span
                              className={`text-[9px] font-bold tabular ${
                                isSelected ? "text-white" : "text-muted2"
                              }`}
                            >
                              {items.length}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {uniqueSubjects.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor: isSelected
                                  ? "#fff"
                                  : SUBJECT_COLORS[s].dot,
                              }}
                            />
                          ))}
                          {uniqueSubjects.length > 3 && (
                            <span
                              className={`text-[9px] font-bold tabular ${
                                isSelected ? "text-white" : "text-muted2"
                              }`}
                            >
                              +
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day detail */}
        <div className="space-y-4">
          <div className="rounded-[14px] bg-surface border border-line p-4 sm:p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted2">
              {selectedDate === todayISO()
                ? "Today"
                : isPast(selectedDate)
                  ? "Past date"
                  : "Upcoming"}
            </p>
            <h2
              data-testid="calendar-selected-date"
              className="font-display font-black text-xl tracking-tight text-ink tabular mt-1"
            >
              {formatMedium(selectedDate)}
            </h2>
            <p className="text-xs text-muted2 mt-1 tabular">
              {selectedItems.length} pending revision
              {selectedItems.length === 1 ? "" : "s"}
            </p>
          </div>

          {selectedItems.length === 0 ? (
            <div className="rounded-[12px] bg-surface border border-line p-5 text-center">
              <p className="text-sm text-muted2">
                No revisions due on this day.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedItems.map(({ chapter, index }) => {
                const overdue = isPast(selectedDate);
                return (
                  <RevisionCard
                    key={`${chapter.id}-${index}`}
                    chapter={chapter}
                    revisionIndex={index}
                    variant={overdue ? "overdue" : "today"}
                    onMarkDone={handleMarkDone}
                    onUndo={undoRevision}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
