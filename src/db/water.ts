// Water log repository. Crumb tracks water in "glasses" (~250 ml each).

import { getDb, makeId } from './database';

export const GLASS_ML = 250;

export async function addGlass(date: string, ml = GLASS_ML): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO water_log (id, date, amountMl, createdAt) VALUES (?, ?, ?, ?)', [
    makeId('w_'),
    date,
    ml,
    Date.now(),
  ]);
}

/** Remove the most recent glass for a day (the "undo" action). */
export async function removeLastGlass(date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM water_log WHERE id = (SELECT id FROM water_log WHERE date = ? ORDER BY createdAt DESC LIMIT 1)',
    [date]
  );
}

/** Number of glasses logged on a day. */
export async function glassesForDate(date: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ ml: number }>(
    'SELECT COALESCE(SUM(amountMl),0) as ml FROM water_log WHERE date = ?',
    [date]
  );
  return Math.round((row?.ml ?? 0) / GLASS_ML);
}
