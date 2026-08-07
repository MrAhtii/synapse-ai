import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Sparkles } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import {
  getNotificationIcon,
  formatNotificationTime,
  type AppNotification,
  type NotificationIcon,
} from "../lib/notifications";
import { useAuth } from "../context/AuthContext";

/* ─────────────── Demo sample notifications ─────────────── */

interface DemoNotification {
  title: string;
  body: string;
  icon: NotificationIcon;
  link: string | null;
  time: string;
}

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    title: "Notes uploaded successfully",
    body: "JavaScript Notes.pdf has been processed and is ready.",
    icon: "Upload" as NotificationIcon,
    link: "/demo/workspace",
    time: "2m ago",
  },
  {
    title: "Quiz completed",
    body: "You scored 80% on the JavaScript quiz!",
    icon: "Brain" as NotificationIcon,
    link: "/demo/quiz",
    time: "1h ago",
  },
  {
    title: "Daily mission completed",
    body: "All tasks completed. +50 XP earned!",
    icon: "Target" as NotificationIcon,
    link: "/demo/missions",
    time: "2h ago",
  },
  {
    title: "Profile updated",
    body: "Your profile information has been saved.",
    icon: "User" as NotificationIcon,
    link: "/demo/profile",
    time: "1d ago",
  },
  {
    title: "Flashcards reviewed",
    body: "You reviewed 6 flashcards. Keep it up!",
    icon: "BookOpen" as NotificationIcon,
    link: "/demo/flashcards",
    time: "2d ago",
  },
  {
    title: "Study streak milestone",
    body: "7-day study streak achieved! 🔥",
    icon: "Zap" as NotificationIcon,
    link: "/demo/analytics",
    time: "3d ago",
  },
  {
    title: "Welcome to Synapse AI",
    body: "Start your learning journey by uploading your first note.",
    icon: "Sparkles" as NotificationIcon,
    link: "/demo/upload",
    time: "1w ago",
  },
];

/* ─────────────── Sub-components ─────────────── */

function NotificationItem({
  notification,
  onClick,
  isDemo,
}: {
  notification: AppNotification | DemoNotification;
  onClick?: () => void;
  isDemo?: boolean;
}) {
  const Icon = getNotificationIcon(
    "icon" in notification ? (notification.icon as NotificationIcon) : "Bell",
  );
  const isRead = "is_read" in notification ? notification.is_read : false;
  const time = "time" in notification ? notification.time : formatNotificationTime(notification.created_at);
  const body = notification.body;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 cursor-pointer ${
        isRead
          ? "hover:bg-muted/50"
          : "bg-primary/[0.02] hover:bg-primary/[0.04]"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isRead
            ? "bg-muted text-foreground/40"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Icon size={16} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-tight ${
              isRead
                ? "text-foreground/60 font-normal"
                : "text-foreground font-semibold"
            }`}
          >
            {notification.title}
          </p>
          {!isRead && !isDemo && (
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
        </div>
        {body && (
          <p
            className={`mt-0.5 text-xs leading-relaxed ${
              isRead ? "text-foreground/40" : "text-foreground/60"
            }`}
          >
            {body.length > 100 ? body.slice(0, 100) + "…" : body}
          </p>
        )}
        <p className="mt-0.5 text-[11px] text-foreground/30">{time}</p>
      </div>
    </button>
  );
}

/* ─────────────── Main Component ─────────────── */

interface NotificationBellProps {
  isDemo?: boolean;
}

export default function NotificationBell({ isDemo }: NotificationBellProps) {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(isDemo ? null : user);

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    if (isDemo) return;
    markAllAsRead();
  }, [isDemo, markAllAsRead]);

  const handleNotificationClick = useCallback(
    (notification: AppNotification | DemoNotification) => {
      if (!isDemo) {
        markAsRead((notification as AppNotification).id);
      }
      if ("link" in notification && notification.link) {
        navigate(notification.link);
      }
      setIsOpen(false);
    },
    [isDemo, markAsRead, navigate],
  );

  // Determine what to display
  const displayCount = isDemo ? DEMO_NOTIFICATIONS.filter((_, i) => i < 3).length : unreadCount;
  const displayNotifications: (AppNotification | DemoNotification)[] = isDemo
    ? DEMO_NOTIFICATIONS
    : notifications;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative inline-flex items-center justify-center rounded-lg p-2 text-foreground/60 hover:bg-muted hover:text-foreground transition-colors duration-200 cursor-pointer"
        aria-label={
          isOpen
            ? "Close notifications"
            : `Notifications${displayCount > 0 ? ` (${displayCount} unread)` : ""}`
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell size={20} aria-hidden="true" />
        {displayCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-tight text-white">
            {displayCount > 99 ? "99+" : displayCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 sm:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 top-full mt-2 z-50 w-[min(calc(100vw-16px),400px)] origin-top-right animate-page-enter rounded-xl border border-border bg-card shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>
              {!isDemo && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 cursor-pointer"
                >
                  <CheckCheck size={14} aria-hidden="true" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div
              className="max-h-[420px] overflow-y-auto"
              role="list"
              aria-label="Notification list"
            >
              {isLoading && !isDemo ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Bell size={18} className="text-foreground/30" />
                  </div>
                  <p className="text-sm font-medium text-foreground/60">
                    No notifications yet
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/40">
                    We'll notify you about your learning progress
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50" role="list">
                  {displayNotifications.map((notification, i) => (
                    <NotificationItem
                      key={"id" in notification ? notification.id : `demo-${i}`}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      isDemo={isDemo}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer - for demo mode show educational message */}
            {isDemo && (
              <div className="border-t border-border px-4 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-foreground/40">
                  <Sparkles size={12} aria-hidden="true" />
                  These are sample notifications.{" "}
                  <a
                    href="/register"
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up
                  </a>{" "}
                  to get real notifications.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}