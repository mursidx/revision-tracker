import { buildRevisions } from "./dates";

const CHAPTERS_KEY = "revision_tracker_chapters";
const LAST_OPENED_KEY = "revision_tracker_last_opened";
const NOTIF_KEY = "revision_tracker_notif_state"; // { asked: bool, lastNotifiedISO: string }

const isValidChapter = (c) =>
  c &&
  typeof c === "object" &&
  typeof c.id === "string" &&
  typeof c.subject === "string" &&
  typeof c.chapterName === "string" &&
  typeof c.dateStudied === "string" &&
  Array.isArray(c.revisions);

export const loadChapters = () => {
  try {
    const raw = localStorage.getItem(CHAPTERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidChapter);
  } catch {
    return [];
  }
};

export const saveChapters = (list) => {
  try {
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save chapters:", e);
  }
};

const uuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const createChapter = ({
  subject,
  chapterName,
  dateStudied,
  difficulty = "medium",
  notes = "",
}) => ({
  id: uuid(),
  subject,
  chapterName: chapterName.trim(),
  dateStudied,
  revisions: buildRevisions(dateStudied),
  notes: notes.trim(),
  difficulty,
});

export const getLastOpened = () => {
  try {
    return localStorage.getItem(LAST_OPENED_KEY);
  } catch {
    return null;
  }
};

export const setLastOpened = (iso) => {
  try {
    localStorage.setItem(LAST_OPENED_KEY, iso);
  } catch (e) {
    console.error(e);
  }
};

export const getNotifState = () => {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (!raw) return { asked: false, lastNotifiedISO: null };
    return JSON.parse(raw);
  } catch {
    return { asked: false, lastNotifiedISO: null };
  }
};

export const setNotifState = (state) => {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(state));
  } catch (e) {
    console.error(e);
  }
};
