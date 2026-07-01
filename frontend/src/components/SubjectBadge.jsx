import { SUBJECT_COLORS } from "../lib/subjects";

export const SubjectBadge = ({ subject, size = "md" }) => {
  const c = SUBJECT_COLORS[subject] || SUBJECT_COLORS.Math;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      data-testid={`subject-badge-${subject}`}
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold uppercase tracking-wider ${pad}`}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: c.dot }}
      />
      {subject === "GK" ? "GK" : subject}
    </span>
  );
};

export const SubjectDot = ({ subject, size = 6 }) => {
  const c = SUBJECT_COLORS[subject] || SUBJECT_COLORS.Math;
  return (
    <span
      className="inline-block rounded-full"
      style={{
        backgroundColor: c.dot,
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};
