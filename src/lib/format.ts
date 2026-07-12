// src/lib/format.ts
import { Timestamp } from "firebase/firestore";

export function formatDate(ts?: Timestamp | null, withTime = false): string {
  if (!ts) return "—";
  try {
    const date = ts.toDate();
    const dateStr = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    if (!withTime) return dateStr;
    const timeStr = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr}, ${timeStr}`;
  } catch {
    return "—";
  }
}

export function timeAgo(ts?: Timestamp | null): string {
  if (!ts) return "—";
  const seconds = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(ts);
}

export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function percentChange(current: number, previous: number): string {
  if (previous === 0) return "0%";
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? "↑" : "↓"} ${Math.abs(change).toFixed(1)}%`;
}
