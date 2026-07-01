import dayjs from "dayjs";

export const SLOT_OFFSETS = [
  { days: 1, label: "Day 1" },
  { days: 3, label: "Day 3" },
  { days: 7, label: "Day 7" },
  { days: 30, label: "Day 30" },
];

export const todayISO = () => dayjs().format("YYYY-MM-DD");

export const toISO = (d) => dayjs(d).format("YYYY-MM-DD");

export const addDaysISO = (iso, n) =>
  dayjs(iso).add(n, "day").format("YYYY-MM-DD");

export const isPast = (iso) => dayjs(iso).isBefore(dayjs(), "day");
export const isToday = (iso) => dayjs(iso).isSame(dayjs(), "day");
export const isFuture = (iso) => dayjs(iso).isAfter(dayjs(), "day");

export const formatLong = (iso) => dayjs(iso).format("dddd, D MMMM YYYY");
export const formatShort = (iso) => dayjs(iso).format("D MMM");
export const formatMedium = (iso) => dayjs(iso).format("D MMM YYYY");

export const relativeLabel = (iso) => {
  const d = dayjs(iso).startOf("day");
  const t = dayjs().startOf("day");
  const diff = d.diff(t, "day");
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
};

export const buildRevisions = (studyDateISO) =>
  SLOT_OFFSETS.map((s) => ({
    dueDate: addDaysISO(studyDateISO, s.days),
    label: s.label,
    completedOn: null,
  }));

export const monthMatrix = (viewISO) => {
  // Returns 6x7 grid of ISO date strings for the month containing viewISO,
  // starting Monday.
  const first = dayjs(viewISO).startOf("month");
  // dayjs: 0=Sunday. We want Monday-start.
  const dow = (first.day() + 6) % 7; // 0..6 Mon..Sun
  const start = first.subtract(dow, "day");
  const cells = [];
  for (let i = 0; i < 42; i++) {
    cells.push(start.add(i, "day").format("YYYY-MM-DD"));
  }
  return cells;
};
