"use client";

import { useState } from "react";

import { markAllRead } from "@/app/notifications/actions";
import type { Notification } from "@/lib/types/database";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationBell({
  notifications,
  unreadCount,
  overlay = false,
}: {
  notifications: Notification[];
  unreadCount: number;
  overlay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const color = overlay
    ? "text-ink-foreground/80 hover:text-white"
    : "text-muted-foreground hover:text-accent-strong";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex items-center transition ${color}`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.55rem] font-semibold text-accent-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-sm border border-border bg-card text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-foreground">
                Notifications
              </p>
              {unreadCount > 0 && (
                <form action={markAllRead}>
                  <button className="text-[0.65rem] uppercase tracking-[0.12em] text-accent-strong transition hover:underline">
                    Mark all read
                  </button>
                </form>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-3 ${n.read ? "" : "bg-accent/5"}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        )}
                        <div className={n.read ? "pl-3.5" : ""}>
                          <p className="text-sm font-medium text-foreground">
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                              {n.body}
                            </p>
                          )}
                          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-muted-foreground/70">
                            {timeAgo(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
