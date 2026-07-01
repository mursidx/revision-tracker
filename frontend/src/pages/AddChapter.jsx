import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useChapters } from "../hooks/useChapters";
import { SUBJECTS, SUBJECT_COLORS, SUBJECT_LABELS } from "../lib/subjects";
import {
  todayISO,
  buildRevisions,
  formatMedium,
  relativeLabel,
} from "../lib/dates";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Check, Calendar as CalIcon } from "lucide-react";

const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function AddChapter() {
  const navigate = useNavigate();
  const { chapters, addChapter } = useChapters();

  const [subject, setSubject] = useState("Math");
  const [chapterName, setChapterName] = useState("");
  const [dateStudied, setDateStudied] = useState(todayISO());
  const [difficulty, setDifficulty] = useState("medium");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [showDupWarn, setShowDupWarn] = useState(false);
  const [success, setSuccess] = useState(null);

  const previewRevisions = useMemo(
    () => (dateStudied ? buildRevisions(dateStudied) : []),
    [dateStudied],
  );

  const validate = () => {
    const e = {};
    if (!subject) e.subject = "Pick a subject";
    if (!chapterName.trim()) e.chapterName = "Chapter name is required";
    if (!dateStudied) e.dateStudied = "Pick a date";
    if (dateStudied > todayISO())
      e.dateStudied = "Date cannot be in the future";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const hasDuplicate = () =>
    chapters.some(
      (c) =>
        c.subject === subject &&
        c.chapterName.trim().toLowerCase() === chapterName.trim().toLowerCase() &&
        c.dateStudied === dateStudied,
    );

  const commit = () => {
    const chapter = addChapter({
      subject,
      chapterName,
      dateStudied,
      difficulty,
      notes,
    });
    setSuccess(chapter);
    toast.success("Chapter added");
    // auto-navigate after 2.5s
    setTimeout(() => navigate("/"), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (hasDuplicate()) {
      setShowDupWarn(true);
      return;
    }
    commit();
  };

  if (success) {
    const c = SUBJECT_COLORS[success.subject];
    return (
      <div
        data-testid="add-chapter-success"
        className="max-w-[560px] mx-auto animate-fade-slide-in"
      >
        <div className="rounded-[16px] bg-surface border border-line p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <span
              className="h-11 w-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: c.bg }}
            >
              <Check
                className="h-5 w-5"
                strokeWidth={2.5}
                style={{ color: c.text }}
              />
            </span>
            <div>
              <h1 className="font-display font-black text-2xl tracking-tight text-ink">
                Chapter added
              </h1>
              <p className="text-sm text-muted2">
                Your revision schedule for{" "}
                <span className="font-semibold text-ink">
                  {success.chapterName}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {success.revisions.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-[10px] bg-canvas border border-line px-4 py-3"
                data-testid={`success-slot-${r.label.replace(" ", "-")}`}
              >
                <div className="flex items-center gap-3">
                  <CalIcon className="h-4 w-4 text-brand" strokeWidth={1.75} />
                  <span className="font-display font-bold text-ink text-sm">
                    {r.label}
                  </span>
                </div>
                <div className="text-right tabular">
                  <div className="font-display font-semibold text-ink text-sm">
                    {formatMedium(r.dueDate)}
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-muted2 font-semibold">
                    {relativeLabel(r.dueDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              type="button"
              onClick={() => navigate("/")}
              data-testid="success-go-today-btn"
              className="flex-1 h-12 bg-brand hover:bg-brand-hover text-white font-display font-bold rounded-[10px]"
            >
              Go to Today
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSuccess(null);
                setChapterName("");
                setNotes("");
              }}
              data-testid="success-add-another-btn"
              className="h-12 px-5 border-line text-ink font-display font-semibold rounded-[10px] hover:bg-canvas"
            >
              Add another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="add-chapter-screen"
      className="max-w-[560px] mx-auto animate-fade-slide-in"
    >
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted2 mb-2">
          New entry
        </p>
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-ink">
          Log a chapter
        </h1>
        <p className="text-sm text-muted2 mt-2">
          We&apos;ll build your revision schedule automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Subject */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted2 mb-3">
            Subject
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const active = subject === s;
              const c = SUBJECT_COLORS[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  data-testid={`subject-pill-${s}`}
                  className={`h-11 px-4 rounded-full font-display font-semibold text-sm border-2 transition-all ${
                    active
                      ? "text-white border-transparent shadow-sm"
                      : "bg-surface text-muted2 border-line hover:border-ink/40 hover:text-ink"
                  }`}
                  style={
                    active
                      ? { backgroundColor: c.text, borderColor: c.text }
                      : undefined
                  }
                >
                  {SUBJECT_LABELS[s]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter name */}
        <div>
          <label
            htmlFor="chapterName"
            className="block text-xs font-bold uppercase tracking-widest text-muted2 mb-3"
          >
            Chapter name
          </label>
          <Input
            id="chapterName"
            data-testid="chapter-name-input"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value.slice(0, 80))}
            placeholder="e.g. Percentage, Tenses, Blood Relations"
            className="h-12 bg-surface border-line rounded-[10px] text-ink font-medium placeholder:text-muted2/60 focus-visible:ring-brand/30 focus-visible:border-brand"
          />
          <div className="flex justify-between mt-1.5">
            {errors.chapterName ? (
              <span className="text-xs text-danger font-semibold">
                {errors.chapterName}
              </span>
            ) : (
              <span />
            )}
            <span className="text-[11px] text-muted2 tabular">
              {chapterName.length}/80
            </span>
          </div>
        </div>

        {/* Date studied */}
        <div>
          <label
            htmlFor="dateStudied"
            className="block text-xs font-bold uppercase tracking-widest text-muted2 mb-3"
          >
            Date studied
          </label>
          <Input
            id="dateStudied"
            type="date"
            data-testid="date-studied-input"
            value={dateStudied}
            max={todayISO()}
            onChange={(e) => setDateStudied(e.target.value)}
            className="h-12 bg-surface border-line rounded-[10px] text-ink font-medium tabular focus-visible:ring-brand/30 focus-visible:border-brand"
          />
          {errors.dateStudied && (
            <span className="text-xs text-danger font-semibold mt-1.5 block">
              {errors.dateStudied}
            </span>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-muted2 mb-3">
            Difficulty
          </label>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  data-testid={`difficulty-pill-${d.value}`}
                  className={`flex-1 h-11 rounded-full font-display font-semibold text-sm border-2 transition-all ${
                    active
                      ? "bg-ink text-white border-ink"
                      : "bg-surface text-muted2 border-line hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-xs font-bold uppercase tracking-widest text-muted2 mb-3"
          >
            Notes <span className="text-muted2/60 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <Textarea
            id="notes"
            data-testid="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 300))}
            placeholder="Any formula, shortcut, or mistake to remember"
            className="min-h-[110px] bg-surface border-line rounded-[10px] text-ink font-medium placeholder:text-muted2/60 focus-visible:ring-brand/30 focus-visible:border-brand"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-muted2 tabular">
              {notes.length}/300
            </span>
          </div>
        </div>

        {/* Preview */}
        {previewRevisions.length > 0 && (
          <div className="rounded-[12px] bg-canvas border border-line p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted2 mb-3">
              Revision schedule preview
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {previewRevisions.map((r) => (
                <div
                  key={r.label}
                  className="rounded-md bg-surface border border-line px-3 py-2"
                >
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand">
                    {r.label}
                  </div>
                  <div className="text-xs font-display font-semibold text-ink mt-0.5 tabular">
                    {formatMedium(r.dueDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            data-testid="add-chapter-submit-btn"
            className="flex-1 h-12 bg-brand hover:bg-brand-hover text-white font-display font-bold rounded-[10px]"
          >
            Save chapter
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            data-testid="add-chapter-cancel-btn"
            className="h-12 px-5 border-line text-ink font-display font-semibold rounded-[10px] hover:bg-canvas"
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Duplicate warning */}
      <Dialog open={showDupWarn} onOpenChange={setShowDupWarn}>
        <DialogContent data-testid="duplicate-dialog" className="rounded-[14px]">
          <DialogHeader>
            <DialogTitle className="font-display">Already logged</DialogTitle>
            <DialogDescription>
              You already logged{" "}
              <span className="font-semibold text-ink">&ldquo;{chapterName}&rdquo;</span> under{" "}
              <span className="font-semibold text-ink">{subject}</span> on{" "}
              {formatMedium(dateStudied)}. Add anyway?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDupWarn(false)}
              data-testid="dup-cancel-btn"
              className="border-line font-display font-semibold rounded-[10px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-testid="dup-confirm-btn"
              className="bg-brand hover:bg-brand-hover text-white font-display font-bold rounded-[10px]"
              onClick={() => {
                setShowDupWarn(false);
                commit();
              }}
            >
              Add anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
