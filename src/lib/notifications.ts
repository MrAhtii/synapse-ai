import { supabase } from "./supabase";
import { Bell, Upload, Brain, BookOpen, Target, User, Sparkles, Award, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─────────────── Types ─────────────── */

export type NotificationIcon = keyof typeof ICON_MAP;

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  icon: NotificationIcon;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

/* ─────────────── Icon map ─────────────── */

export const ICON_MAP: Record<string, LucideIcon> = {
  Bell,
  Upload,
  Brain,
  BookOpen,
  Target,
  User,
  Sparkles,
  Award,
  Zap,
} as const;

export function getNotificationIcon(icon: NotificationIcon): LucideIcon {
  return ICON_MAP[icon] ?? Bell;
}

/* ─────────────── Create notification ─────────────── */

export async function createNotification(
  userId: string,
  title: string,
  options?: {
    body?: string;
    icon?: NotificationIcon;
    link?: string;
  },
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    body: options?.body ?? null,
    icon: options?.icon ?? "Bell",
    link: options?.link ?? null,
    is_read: false,
  });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}

/* ─────────────── Helpers ─────────────── */

export function formatNotificationTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}