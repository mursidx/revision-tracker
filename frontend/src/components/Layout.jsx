import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, ClipboardList, ListChecks, Plus } from "lucide-react";

const tabs = [
  { to: "/", label: "Today", icon: ListChecks, testid: "tab-today", end: true },
  { to: "/add", label: "Add", icon: Plus, testid: "tab-add" },
  { to: "/chapters", label: "All", icon: ClipboardList, testid: "tab-chapters" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, testid: "tab-calendar" },
];

const desktopLinkClass = ({ isActive }) =>
  `px-3 h-10 flex items-center gap-2 rounded-md font-display font-semibold text-sm transition-colors ${
    isActive
      ? "bg-ink text-white"
      : "text-muted2 hover:text-ink hover:bg-line/50"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors ${
    isActive ? "text-brand" : "text-muted2"
  }`;

export const Layout = () => {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop top nav */}
      <header className="hidden md:block sticky top-0 z-30 bg-canvas/85 backdrop-blur-md border-b border-line">
        <div className="max-w-[720px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-7 w-7 rounded-md bg-brand flex items-center justify-center text-white font-display font-black text-sm"
              aria-hidden
            >
              R
            </span>
            <span className="font-display font-black text-lg tracking-tight text-ink">
              Revise
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-muted2">
              SSC CGL
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                data-testid={`desktop-${t.testid}`}
                className={desktopLinkClass}
              >
                <t.icon className="h-4 w-4" strokeWidth={1.75} />
                {t.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-canvas/95 backdrop-blur-md border-b border-line">
        <div className="px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-6 w-6 rounded-md bg-brand flex items-center justify-center text-white font-display font-black text-xs"
              aria-hidden
            >
              R
            </span>
            <span className="font-display font-black text-base tracking-tight text-ink">
              Revise
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted2">
            SSC CGL
          </span>
        </div>
      </header>

      <main
        data-testid="app-main"
        className="max-w-[720px] mx-auto px-5 sm:px-8 pt-5 sm:pt-8 pb-28 md:pb-16"
      >
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-surface border-t border-line flex safe-bottom">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            data-testid={`mobile-${t.testid}`}
            className={mobileLinkClass}
          >
            <t.icon className="h-5 w-5" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              {t.label}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
