import { useEffect, useState, useCallback } from "react";
import { loadChapters, saveChapters, createChapter } from "../lib/storage";
import { todayISO } from "../lib/dates";

const STORAGE_EVENT = "revision-tracker-updated";

export const useChapters = () => {
  const [chapters, setChapters] = useState(() => loadChapters());

  useEffect(() => {
    const refresh = () => setChapters(loadChapters());
    window.addEventListener(STORAGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const persist = useCallback((next) => {
    saveChapters(next);
    setChapters(next);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const addChapter = useCallback(
    (input) => {
      const chapter = createChapter(input);
      const next = [...loadChapters(), chapter];
      persist(next);
      return chapter;
    },
    [persist],
  );

  const deleteChapter = useCallback(
    (id) => {
      const next = loadChapters().filter((c) => c.id !== id);
      persist(next);
    },
    [persist],
  );

  const markRevisionDone = useCallback(
    (chapterId, revisionIndex) => {
      const list = loadChapters();
      const next = list.map((c) => {
        if (c.id !== chapterId) return c;
        const revisions = c.revisions.map((r, i) =>
          i === revisionIndex && !r.completedOn
            ? { ...r, completedOn: todayISO() }
            : r,
        );
        return { ...c, revisions };
      });
      persist(next);
    },
    [persist],
  );

  const undoRevision = useCallback(
    (chapterId, revisionIndex) => {
      const list = loadChapters();
      const next = list.map((c) => {
        if (c.id !== chapterId) return c;
        const revisions = c.revisions.map((r, i) =>
          i === revisionIndex ? { ...r, completedOn: null } : r,
        );
        return { ...c, revisions };
      });
      persist(next);
    },
    [persist],
  );

  const updateNotes = useCallback(
    (chapterId, notes) => {
      const list = loadChapters();
      const next = list.map((c) =>
        c.id === chapterId ? { ...c, notes: notes.slice(0, 300) } : c,
      );
      persist(next);
    },
    [persist],
  );

  return {
    chapters,
    addChapter,
    deleteChapter,
    markRevisionDone,
    undoRevision,
    updateNotes,
  };
};
