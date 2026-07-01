import { useState } from "react";
import { SubjectBadge } from "./SubjectBadge";
import { formatShort, formatMedium, isPast } from "../lib/dates";
import { Check, Clock, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

export const RevisionCard = ({
  chapter,
  revisionIndex,
  onMarkDone,
  onUndo,
  variant = "today", // 'today' | 'overdue' | 'done' | 'day'
}) => {
  const [expanded, setExpanded] = useState(false);
  const rev = chapter.revisions[revisionIndex];
  const overdue = variant === "overdue";
  const done = variant === "done";

  const cardBase =
    "rounded-[12px] bg-surface border border-line shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4 sm:p-5 transition-all";
  const cardStyle = overdue
    ? "!bg-danger-bg !border-danger/30"
    : done
      ? "opacity-70"
      : "hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]";

  return (
    <div
      data-testid={`revision-card-${chapter.id}-${revisionIndex}`}
      className={`${cardBase} ${cardStyle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <SubjectBadge subject={chapter.subject} size="sm" />
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${
                overdue ? "text-danger" : "text-muted2"
              }`}
            >
              {overdue ? (
                <AlertTriangle className="h-3 w-3" strokeWidth={2} />
              ) : done ? (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <Clock className="h-3 w-3" strokeWidth={2} />
              )}
              {rev.label} revision
            </span>
          </div>
          <h3
            className={`font-display font-bold text-[17px] leading-snug ${
              done ? "line-through text-muted2" : "text-ink"
            }`}
          >
            {chapter.chapterName}
          </h3>
          <div className="mt-1 text-xs text-muted2 tabular">
            {overdue ? (
              <span className="text-danger font-semibold">
                Was due {formatMedium(rev.dueDate)} · Studied {formatShort(chapter.dateStudied)}
              </span>
            ) : done ? (
              <span>
                Completed {rev.completedOn ? formatMedium(rev.completedOn) : "today"}
              </span>
            ) : (
              <span>Studied on {formatMedium(chapter.dateStudied)}</span>
            )}
          </div>

          {chapter.notes && !done && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              data-testid={`toggle-notes-${chapter.id}-${revisionIndex}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-hover"
            >
              {expanded ? "Hide notes" : "Show notes"}
              {expanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
          {expanded && chapter.notes && (
            <div className="mt-2 rounded-md bg-canvas border border-line p-3 text-sm text-ink/80 whitespace-pre-wrap animate-fade-slide-in">
              {chapter.notes}
            </div>
          )}
        </div>

        <div className="shrink-0">
          {done ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onUndo?.(chapter.id, revisionIndex)}
              data-testid={`undo-btn-${chapter.id}-${revisionIndex}`}
              className="h-9 px-3 text-xs font-semibold text-muted2 hover:text-ink"
            >
              Undo
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => onMarkDone?.(chapter.id, revisionIndex)}
              data-testid={`mark-done-btn-${chapter.id}-${revisionIndex}`}
              className={`h-11 px-4 rounded-[10px] font-display font-bold text-sm text-white flex items-center gap-1.5 transition-transform active:scale-95 ${
                overdue
                  ? "bg-danger hover:bg-[#a02929]"
                  : "bg-success hover:bg-[#175b3d]"
              }`}
            >
              <Check className="h-4 w-4" strokeWidth={2.5} />
              Mark Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevisionCard;
