import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Sparkles, Trash2, X } from "lucide-react";
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
  id: string;
  title: string;
  body: string;
  icon: NotificationIcon;
  link: string | null;
  time: string;
  is_read?: boolean;
}

const INITIAL_DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "demo-1",
    title: "Notes uploaded successfully",
    body: "JavaScript Notes.pdf has been processed and is ready.",
    icon: "Upload" as NotificationIcon,
    link: "/demo/workspace",
    time: "2m ago",
    is_read: false,
  },
  {
    id: "demo-2",
    title: "Quiz completed",
    body: "You scored 80% on the JavaScript quiz!",
    icon: "Brain" as NotificationIcon,
    link: "/demo/quiz",
    time: "1h ago",
    is_read: false,
  },
  {
    id: "demo-3",
    title: "Daily mission completed",
    body: "All tasks completed. +50 XP earned!",
    icon: "Target" as NotificationIcon,
    link: "/demo/missions",
    time: "2h ago",
    is_read: false,
  },
  {
    id: "demo-4",
    title: "Profile updated",
    body: "Your profile information has been saved.",
    icon: "User" as NotificationIcon,
    link: "/demo/profile",
    time: "1d ago",
    is_read: true,
  },
  {
    id: "demo-5",
    title: "Flashcards reviewed",
    body: "You reviewed 6 flashcards. Keep it up!",
    icon: "BookOpen" as NotificationIcon,
    link: "/demo/flashcards",
    time: "2d ago",
    is_read: true,
  },
  {
    id: "demo-6",
    title: "Study streak milestone",
    body: "7-day study streak achieved! 🔥",
    icon: "Zap" as NotificationIcon,
    link: "/demo/analytics",
    time: "3d ago",
    is_read: true,
  },
  {
    id: "demo-7",
    title: "Welcome to Synapse AI",
    body: "Start your learning journey by uploading your first note.",
    icon: "Sparkles" as NotificationIcon,
    link: "/demo/upload",
    time: "1w ago",
    is_read: true,
  },
];

/* ─────────────── Sub-components ─────────────── */

function NotificationItem({
  notification,
  onClick,
  onDismiss,
  isDemo,
}: {
  notification: AppNotification | DemoNotification;
  onClick?: () => void;
  onDismiss?: (e: React.MouseEvent) => void;
  isDemo?: boolean;
}) {
  const Icon = getNotificationIcon(
    "icon" in notification ? (notification.icon as NotificationIcon) : "Bell"
  );
  const isRead = "is_read" in notification ? notification.is_read : false;
  const time =
    "time" in notification
      ? notification.time
      : formatNotificationTime((notification as AppNotification).created_at);
  const body = notification.body;

  return (
    <div
      className={`group relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 ${
        isRead
          ? "hover:bg-muted/50"
          : "bg-primary/[0.02] hover:bg-primary/[0.04]"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-start gap-3 text-left cursor-pointer"
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isRead
              ? "bg-muted text-foreground/40"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon size={16} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1 pr-6">
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

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          title="Dismiss notification"
          aria-label="Dismiss notification"
          className="absolute right-3 top-3 rounded-md p-1 text-foreground/30 opacity-0 transition-opacity hover:bg-muted hover:text-red-500 group-hover:opacity-100 cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
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
    clearAllNotifications,
    deleteNotification,
  } = useNotifications(isDemo ? null : user);

  const [demoList, setDemoList] = useState<DemoNotification[]>(
    INITIAL_DEMO_NOTIFICATIONS
  );
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
    if (isDemo) {
      setDemoList((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } else {
      markAllAsRead();
    }
  }, [isDemo, markAllAsRead]);

  const handleClearAll = useCallback(() => {
    if (isDemo) {
      // Clear demo list immediately
      setDemoList([]);

      // Restore demo list after 2.5 seconds
      setTimeout(() => {
        setDemoList(INITIAL_DEMO_NOTIFICATIONS);
      }, 2500);
    } else {
      // Clear real notifications from Supabase
      clearAllNotifications();
    }
  }, [isDemo, clearAllNotifications]);

  const handleDismissSingle = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (isDemo) {
        setDemoList((prev) => prev.filter((item) => item.id !== id));
      } else {
        deleteNotification(id);
      }
    },
    [isDemo, deleteNotification]
  );

  const handleNotificationClick = useCallback(
    (notification: AppNotification | DemoNotification) => {
      if (isDemo) {
        setDemoList((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      } else {
        markAsRead((notification as AppNotification).id);
      }

      if ("link" in notification && notification.link) {
        navigate(notification.link);
      }
      setIsOpen(false);
    },
    [isDemo, markAsRead, navigate]
  );

  const displayNotifications: (AppNotification | DemoNotification)[] = isDemo
    ? demoList
    : notifications;

  const displayCount = isDemo
    ? demoList.filter((n) => !n.is_read).length
    : unreadCount;

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

      {isOpen && (
        <>
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
              <div className="flex items-center gap-1">
                {displayNotifications.length > 0 && (
                  <>
                    {displayCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 cursor-pointer"
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} aria-hidden="true" />
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-foreground/50 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                      title="Clear all notifications"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      Clear all
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* List / Empty state */}
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
                  {displayNotifications.map((notification, i) => {
                    const id =
                      "id" in notification
                        ? (notification.id as string)
                        : `demo-${i}`;
                    return (
                      <NotificationItem
                        key={id}
                        notification={notification}
                        onClick={() => handleNotificationClick(notification)}
                        onDismiss={(e) => handleDismissSingle(e, id)}
                        isDemo={isDemo}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Demo Footer */}
            {isDemo && (
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                <p className="flex items-center gap-1.5 text-[11px] text-foreground/40">
                  <Sparkles size={12} aria-hidden="true" />
                  Sample notifications mode
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}