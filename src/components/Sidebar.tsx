import { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  Brain,
  FileText,
  Sparkles,
  GraduationCap,
  User,
  Target,
  BarChart3,
  Settings,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDemoMode } from "../context/DemoMode";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  linkPrefix?: string;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Upload Notes", icon: Upload },
  { label: "Workspace", icon: Brain },
  { label: "Smart Summary", icon: FileText },
  { label: "Quiz", icon: Sparkles },
  { label: "Flashcards", icon: GraduationCap },
  { label: "Profile", icon: User },
  { label: "Missions", icon: Target },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const navPathMap: Record<string, string> = {
  Dashboard: "/dashboard",
  "Upload Notes": "/upload",
  Workspace: "/workspace",
  "Smart Summary": "/summary",
  Quiz: "/quiz",
  Flashcards: "/flashcards",
  Profile: "/profile",
  Missions: "/missions",
  Analytics: "/analytics",
  Settings: "/settings",
};

export default function Sidebar({
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapsed,
  linkPrefix = "",
}: SidebarProps) {
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);
  const { isDemo, showRestricted } = useDemoMode();

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>, label: string) => {
    if (!collapsed) {
      setTooltip(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, top: rect.top + rect.height / 2 });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Sidebar"
        className={`
          fixed top-0 left-0 z-30 h-full w-64
          bg-card border-r border-border
          transform transition-all duration-300 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${collapsed ? "lg:w-[76px]" : "lg:w-64"}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          flex flex-col
        `.trim()}
      >
        {/* Logo / brand + collapse toggle */}
        <div
          className={`
            flex h-16 shrink-0 items-center border-b border-border
            ${collapsed ? "lg:justify-between lg:px-2" : "justify-between px-4"}
          `.trim()}
        >
          {/* Full logo images wrapper — hidden when collapsed on desktop (avoids
              dark:block overriding lg:hidden due to CSS specificity) */}
          <div className={`flex items-center gap-2 overflow-hidden ${collapsed ? "lg:hidden" : ""}`}>
            <img
              src="/lightmodelogo.png"
              alt="Synapse AI"
              className="h-[38px] w-auto block dark:hidden"
            />
            <img
              src="/darkmodelogo.png"
              alt="Synapse AI"
              className="hidden h-[38px] w-auto dark:block"
            />
          </div>
          {collapsed && (
            <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary lg:flex">
              <Brain size={18} aria-hidden="true" />
            </span>
          )}
          <button
            onClick={onToggleCollapsed}
            className="hidden items-center justify-center rounded-lg p-2 text-foreground/60 transition-colors duration-200 hover:bg-muted hover:text-foreground cursor-pointer lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1" aria-label="Main navigation">
          {/* Back to Landing — mobile sidebar only, demo mode */}
          {isDemo && (
            <a
              href="/"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer text-foreground/60 hover:bg-muted hover:text-foreground lg:hidden"
            >
              <ArrowLeft size={18} className="shrink-0" aria-hidden="true" />
              <span className="truncate">Back to Landing</span>
            </a>
          )}

          {navItems.map((item) => {
            const href = `${linkPrefix}${navPathMap[item.label]}`;

            // In demo mode, "Upload Notes" triggers the restricted modal instead of navigating
            if (isDemo && item.label === "Upload Notes") {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onClose();
                    showRestricted(item.label);
                  }}
                  onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                  onMouseLeave={handleMouseLeave}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
                    collapsed ? "lg:justify-center lg:px-2" : ""
                  } text-foreground/60 hover:bg-muted hover:text-foreground`}
                >
                  <item.icon size={18} className="shrink-0" aria-hidden="true" />
                  <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={href}
                onClick={onClose}
                onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                onMouseLeave={handleMouseLeave}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer relative ${
                    collapsed ? "lg:justify-center lg:px-2" : ""
                  } ${
                    isActive
                      ? "bg-primary/10 text-primary before:absolute before:left-0 before:top-1/4 before:h-1/2 before:w-0.5 before:rounded-full before:bg-primary"
                      : "text-foreground/60 hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" aria-hidden="true" />
                <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          {collapsed ? (
            <p className="hidden text-center text-xs text-foreground/40 lg:block">
              &copy;{new Date().getFullYear()}
            </p>
          ) : (
            <p className="text-xs text-foreground/40">
              &copy; {new Date().getFullYear()} Synapse AI
            </p>
          )}
        </div>
      </aside>

      {/* Tooltip for collapsed desktop sidebar (fixed so it escapes the scroll container) */}
      {collapsed && tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg lg:block"
          style={{ top: tooltip.top, left: 76 + 14 }}
        >
          {tooltip.label}
        </div>
      )}
    </>
  );
}