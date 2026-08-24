// Local-first storage using expo-sqlite (async API).
// Everything works offline; a cloud sync layer can be added later without
// changing the repository call sites.

import * as SQLite from 'expo-sqlite';

const DB_NAME = 'deen.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Open (once) and run migrations. All repositories await this. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await migrate(db);
      return db;
    });
  }
  return dbPromise;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // We store nested structures (ingredients, steps, tags, nutrition) as JSON
  // text and keep flat columns only for the fields we query/sort by.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      heroPhotoUri TEXT,
      servings INTEGER NOT NULL DEFAULT 1,
      prepMinutes INTEGER NOT NULL DEFAULT 0,
      cookMinutes INTEGER NOT NULL DEFAULT 0,
      difficulty TEXT NOT NULL DEFAULT 'easy',
      tags TEXT NOT NULL DEFAULT '[]',
      notes TEXT,
      favorite INTEGER NOT NULL DEFAULT 0,
      ingredients TEXT NOT NULL DEFAULT '[]',
      steps TEXT NOT NULL DEFAULT '[]',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY NOT NULL,
      fdcId INTEGER,
      name TEXT NOT NULL,
      brand TEXT,
      calories REAL NOT NULL DEFAULT 0,
      protein REAL NOT NULL DEFAULT 0,
      carbs REAL NOT NULL DEFAULT 0,
      fat REAL NOT NULL DEFAULT 0,
      source TEXT NOT NULL DEFAULT 'usda',
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS log_entries (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      meal TEXT NOT NULL,
      source TEXT NOT NULL,
      recipeId TEXT,
      foodId TEXT,
      name TEXT NOT NULL,
      servings REAL NOT NULL DEFAULT 1,
      calories REAL NOT NULL DEFAULT 0,
      protein REAL NOT NULL DEFAULT 0,
      carbs REAL NOT NULL DEFAULT 0,
      fat REAL NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_log_date ON log_entries(date);

    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS water_log (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      amountMl REAL NOT NULL,
      createdAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_water_date ON water_log(date);
  `);
}

/** Small id helper (no external uuid dependency needed). */
export function makeId(prefix = ''): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}${Date.now().toString(36)}${rand}`;
}
