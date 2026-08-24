// Export food-log history to CSV so users can share with a nutritionist/doctor.
// Native: write to a cache file and open the share sheet.
// Web: trigger a browser download.

import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { getLogBetween } from '../db/log';
import type { LogEntry } from '../types';

function toCsv(entries: LogEntry[]): string {
  const header = ['Date', 'Meal', 'Item', 'Servings', 'Calories', 'Protein(g)', 'Carbs(g)', 'Fat(g)', 'Source'];
  const rows = entries.map((e) => [
    e.date,
    e.meal,
    csvCell(e.name),
    String(e.servings),
    String(Math.round(e.nutrition.calories * e.servings)),
    String(round(e.nutrition.protein * e.servings)),
    String(round(e.nutrition.carbs * e.servings)),
    String(round(e.nutrition.fat * e.servings)),
    e.source,
  ]);
  return [header, ...rows].map((r) => r.join(',')).join('\n');
}

const round = (n: number) => Math.round(n * 10) / 10;
function csvCell(s: string): string {
  // Neutralize spreadsheet formula injection — a leading =/+/-/@ can be
  // interpreted as a formula by Excel/Sheets when the CSV is opened.
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Export the given date range (inclusive). Returns a short status message. */
export async function exportLogCsv(startDate: string, endDate: string): Promise<string> {
  const entries = await getLogBetween(startDate, endDate);
  if (entries.length === 0) return 'Nothing to export in this range.';
  const csv = toCsv(entries);
  const filename = `crumb-food-log-${startDate}_to_${endDate}.csv`;

  if (Platform.OS === 'web') {
    // Browser download.
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return 'Downloaded CSV.';
  }

  // Native: write to cache, then share.
  const FileSystem = await import('expo-file-system');
  const file = new FileSystem.File(FileSystem.Paths.cache, filename);
  try {
    file.create({ overwrite: true });
  } catch {
    // ignore if it already exists
  }
  file.write(csv);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export food log' });
    return 'Opened share sheet.';
  }
  return `Saved to ${file.uri}`;
}
