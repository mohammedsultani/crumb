// Local-day helpers. The food log keys on "YYYY-MM-DD" in the user's local time.

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(dateKey: string, delta: number): string {
  const d = new Date(dateKey + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return toDateKey(d);
}

export function isToday(dateKey: string): boolean {
  return dateKey === todayKey();
}

/** Friendly label: "Today", "Yesterday", or e.g. "Mon, Aug 17". */
export function friendlyDate(dateKey: string): string {
  const today = todayKey();
  if (dateKey === today) return 'Today';
  if (dateKey === addDays(today, -1)) return 'Yesterday';
  if (dateKey === addDays(today, 1)) return 'Tomorrow';
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
