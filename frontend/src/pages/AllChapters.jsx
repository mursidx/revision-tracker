import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useChapters } from "../hooks/useChapters";
import { SubjectBadge } from "../components/SubjectBadge";
import { SUBJECTS } from "../lib/subjects";
import {
  formatShort,
  formatMedium,
  isPast,
  todayISO,
} from "../lib/dates";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Check,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Search,
  Plus,
} from "lucide-react";

const nextPendingRevision = (chapter) => {
  const pending = chapter.revisions
    .map((r, idx) => ({ ...r, idx }))
    .filter((r) => !r.completedOn);
  if (pending.length === 0) return null;
  return pending.reduce((a, b) => (a.dueDate <= b.dueDate ? a : b));
};

const chapterCompleteCount = (c) =>
  c.revisions.filter((r) => r.completedOn).length;

export default function AllChapters() {
  const { chapters, deleteChapter, markRevisionDone, undoRevision, updateNotes } =
    useChapters();

  const [subjectFilter, setSubjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("next"); // 'next' | 'subject' | 'studied'
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    let list = [...chapters];
    if (subjectFilter !== "All")
      list = list.filter((c) => c.subject === subjectFilter);
    if (statusFilter !== "All") {
      list = list.filter((c) => {
        const done = chapterCompleteCount(c) === 4;
        return statusFilter === "Complete" ? done : !done;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.chapterName.toLowerCase().includes(q));
    }
    if (sortBy === "next") {
      list.sort((a, b) => {
        const an = nextPendingRevision(a);
        const bn = nextPendingRevision(b);
        if (!an && !bn) return b.dateStudied.localeCompare(a.dateStudied);
        if (!an) return 1;
        if (!bn) return -1;
        return an.dueDate.localeCompare(bn.dueDate);
      });
    } else if (sortBy === "subject") {
      list.sort(
        (a, b) =>
          a.subject.localeCompare(b.subject) ||
          a.chapterName.localeCompare(b.chapterName),
      );
    } else {
      list.sort((a, b) => b.dateStudied.localeCompare(a.dateStudied));
    }
    return list;
  }, [chapters, subjectFilter, statusFilter, search, sortBy]);

  const startEdit = (chapter) => {
    setEditingId(chapter.id);
    setEditValue(chapter.notes || "");
  };

  const saveEdit = (id) => {
    updateNotes(id, editValue);
    setEditingId(null);
    toast.success("Notes updated");
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteChapter(deleteId);
    setDeleteId(null);
    toast("Chapter deleted");
  };

  const pillClass = (active) =>
    `h-9 px-4 rounded-full font-display font-semibold text-xs uppercase tracking-widest border transition-all shrink-0 ${
      active
        ? "bg-ink text-white border-ink"
        : "bg-surface text-muted2 border-line hover:border-ink/40 hover:text-ink"
    }`;

  return (
    <div
      data-testid="all-chapters-screen"
      className="animate-fade-slide-in space-y-6"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted2 mb-2">
          Your ledger
        </p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-ink">
            All chapters
          </h1>
          <p className="text-sm text-muted2 tabular">
            {chapters.length} chapter{chapters.length === 1 ? "" : "s"} · {" "}
            {chapters.filter((c) => chapterCompleteCount(c) === 4).length} complete
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted2"
          strokeWidth={1.75}
        />
        <Input
          data-testid="chapters-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chapter names..."
          className="h-12 pl-11 bg-surface border-line rounded-[10px] text-ink font-medium placeholder:text-muted2/60 focus-visible:ring-brand/30 focus-visible:border-brand"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
          <button
            data-testid="filter-subject-All"
            onClick={() => setSubjectFilter("All")}
            className={pillClass(subjectFilter === "All")}
          >
            All subjects
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s}
              data-testid={`filter-subject-${s}`}
              onClick={() => setSubjectFilter(s)}
              className={pillClass(subjectFilter === s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
          {["All", "In Progress", "Complete"].map((s) => (
            <button
              key={s}
              data-testid={`filter-status-${s.replace(" ", "-")}`}
              onClick={() => setStatusFilter(s)}
              className={pillClass(statusFilter === s)}
            >
              {s}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted2 shrink-0">
              Sort
            </span>
            <select
              data-testid="chapters-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 bg-surface border border-line rounded-full px-3 pr-8 text-xs font-display font-semibold text-ink focus:outline-none focus:border-brand"
            >
              <option value="next">Next revision</option>
              <option value="subject">Subject</option>
              <option value="studied">Study date</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          data-testid="chapters-empty"
          className="rounded-[16px] bg-surface border border-line p-8 text-center"
        >
          <p className="text-muted2 text-sm mb-4">
            {chapters.length === 0
              ? "No chapters yet. Add your first one."
              : "No chapters match your filters."}
          </p>
          {chapters.length === 0 && (
            <Link to="/add">
              <Button className="h-11 bg-brand hover:bg-brand-hover text-white font-display font-bold rounded-[10px]">
                <Plus className="h-4 w-4 mr-1.5" strokeWidth={2.5} />
                Add chapter
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const doneCount = chapterCompleteCount(c);
            const complete = doneCount === 4;
            const next = nextPendingRevision(c);
            const nextOverdue = next && isPast(next.dueDate);
            const expanded = expandedId === c.id;
            return (
              <div
                key={c.id}
                data-testid={`chapter-card-${c.id}`}
                className="rounded-[12px] bg-surface border border-line shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                  data-testid={`chapter-expand-${c.id}`}
                  className="w-full text-left p-4 sm:p-5 hover:bg-canvas/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <SubjectBadge subject={c.subject} size="sm" />
                        {complete && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-success bg-success/10 px-2 py-0.5 rounded-md">
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                            Complete
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted2 bg-canvas px-2 py-0.5 rounded-md border border-line">
                          {c.difficulty}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-ink text-base leading-snug">
                        {c.chapterName}
                      </h3>
                      <div className="mt-1 text-xs text-muted2 tabular">
                        Studied {formatMedium(c.dateStudied)}
                      </div>

                      {/* Progress */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex gap-1 flex-1 max-w-[180px]">
                          {c.revisions.map((r, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full ${
                                r.completedOn
                                  ? "bg-success"
                                  : isPast(r.dueDate)
                                    ? "bg-danger/40"
                                    : "bg-line"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted2 tabular">
                          {doneCount}/4 done
                        </span>
                      </div>

                      {/* Next */}
                      <div className="mt-2 text-xs tabular">
                        {complete ? (
                          <span className="text-success font-semibold">
                            All done ✓
                          </span>
                        ) : (
                          <span
                            className={
                              nextOverdue
                                ? "text-danger font-semibold"
                                : "text-muted2"
                            }
                          >
                            {nextOverdue ? "Overdue: " : "Next: "}
                            {next.label} on {formatMedium(next.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 pt-1">
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted2" />
                      )}
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-line/70 bg-canvas/40 space-y-4 animate-fade-slide-in">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted2 mb-2">
                        Revision timeline
                      </h4>
                      <div className="space-y-2">
                        {c.revisions.map((r, i) => {
                          const overdue = !r.completedOn && isPast(r.dueDate);
                          const isDueToday = r.dueDate === todayISO() && !r.completedOn;
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-md bg-surface border border-line px-3 py-2.5"
                              data-testid={`timeline-slot-${c.id}-${i}`}
                            >
                              <div className="flex items-center gap-2.5">
                                {r.completedOn ? (
                                  <Check
                                    className="h-4 w-4 text-success"
                                    strokeWidth={2.5}
                                  />
                                ) : overdue ? (
                                  <AlertTriangle
                                    className="h-4 w-4 text-danger"
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <Clock
                                    className="h-4 w-4 text-muted2"
                                    strokeWidth={1.75}
                                  />
                                )}
                                <div>
                                  <div className="font-display font-bold text-sm text-ink">
                                    {r.label}
                                  </div>
                                  <div className="text-[11px] text-muted2 tabular">
                                    Due {formatMedium(r.dueDate)}
                                    {r.completedOn && (
                                      <>
                                        {" "}
                                        · Done {formatShort(r.completedOn)}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {r.completedOn ? (
                                <button
                                  type="button"
                                  onClick={() => undoRevision(c.id, i)}
                                  data-testid={`timeline-undo-${c.id}-${i}`}
                                  className="text-[11px] font-semibold text-muted2 hover:text-ink uppercase tracking-widest"
                                >
                                  Undo
                                </button>
                              ) : (
                                (overdue || isDueToday) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      markRevisionDone(c.id, i);
                                      toast.success(
                                        `${c.chapterName} — ${r.label} marked complete`,
                                      );
                                    }}
                                    data-testid={`timeline-mark-${c.id}-${i}`}
                                    className={`h-8 px-3 rounded-md font-display font-bold text-[11px] uppercase tracking-widest text-white ${
                                      overdue
                                        ? "bg-danger hover:bg-[#a02929]"
                                        : "bg-success hover:bg-[#175b3d]"
                                    }`}
                                  >
                                    Mark done
                                  </button>
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted2">
                          Notes
                        </h4>
                        {editingId !== c.id && (
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            data-testid={`edit-notes-btn-${c.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand-hover uppercase tracking-widest"
                          >
                            <Pencil className="h-3 w-3" strokeWidth={2} />
                            Edit
                          </button>
                        )}
                      </div>
                      {editingId === c.id ? (
                        <div className="space-y-2">
                          <Textarea
                            data-testid={`edit-notes-textarea-${c.id}`}
                            value={editValue}
                            onChange={(e) =>
                              setEditValue(e.target.value.slice(0, 300))
                            }
                            className="min-h-[90px] bg-surface border-line rounded-[10px] text-sm text-ink"
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-muted2 tabular">
                              {editValue.length}/300
                            </span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                data-testid={`edit-cancel-${c.id}`}
                                className="h-9 px-3 text-xs font-semibold text-muted2"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={() => saveEdit(c.id)}
                                data-testid={`edit-save-${c.id}`}
                                className="h-9 px-4 bg-brand hover:bg-brand-hover text-white font-display font-semibold text-xs rounded-[8px]"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-ink/80 whitespace-pre-wrap">
                          {c.notes || (
                            <span className="italic text-muted2">
                              No notes yet.
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="pt-3 border-t border-line/70 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setDeleteId(c.id)}
                        data-testid={`delete-chapter-btn-${c.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger hover:text-[#8f1d1d] uppercase tracking-widest"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Delete chapter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent data-testid="delete-dialog" className="rounded-[14px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete this chapter?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the chapter and all four revision slots. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel" className="rounded-[10px]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-testid="delete-confirm"
              onClick={handleDelete}
              className="bg-danger hover:bg-[#a02929] text-white font-display font-bold rounded-[10px]"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
