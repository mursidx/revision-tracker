import { getNotifState, setNotifState } from "./storage";
import { todayISO } from "./dates";

export const notificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const requestNotifPermissionIfNeeded = async () => {
  if (!notificationsSupported()) return "unsupported";
  const state = getNotifState();
  // Only ask once ever
  if (state.asked) return Notification.permission;
  if (Notification.permission === "default") {
    try {
      const result = await Notification.requestPermission();
      setNotifState({ ...state, asked: true });
      return result;
    } catch {
      setNotifState({ ...state, asked: true });
      return "denied";
    }
  }
  setNotifState({ ...state, asked: true });
  return Notification.permission;
};

export const maybeShowDailyReminder = (dueCount) => {
  if (!notificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  if (dueCount <= 0) return;
  const today = todayISO();
  const state = getNotifState();
  if (state.lastNotifiedISO === today) return;
  try {
    new Notification("Revise — Today's Revisions", {
      body: `You have ${dueCount} revision${dueCount === 1 ? "" : "s"} due today.`,
      tag: "revise-daily-reminder",
    });
    setNotifState({ ...state, lastNotifiedISO: today });
  } catch (e) {
    console.error("Notification failed:", e);
  }
};
