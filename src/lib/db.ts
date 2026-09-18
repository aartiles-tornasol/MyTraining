import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import type { QueryResultRow } from 'pg';

/**
 * A single pool for the whole process. The app is deliberately usable without a
 * database — the programme itself is static — so every caller has to cope with
 * `null` and the UI says plainly that nothing is being saved.
 */
let pool: Pool | null = null;
let migrated: Promise<void> | null = null;

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

function getPool(): Pool | null {
  if (!hasDatabase()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    pool.on('error', (err) => {
      console.error('[db] idle client error', err.message);
    });
  }
  return pool;
}

async function runMigrations(p: Pool) {
  await p.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  const dir = path.join(process.cwd(), 'db', 'migrations');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const { rowCount } = await p.query('SELECT 1 FROM _migrations WHERE name = $1', [file]);
    if (rowCount) continue;
    const sql = await readFile(path.join(dir, file), 'utf8');
    const client = await p.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[db] applied migration ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export async function ready(): Promise<Pool | null> {
  const p = getPool();
  if (!p) return null;
  if (!migrated) {
    migrated = runMigrations(p).catch((err) => {
      // Reset so the next request retries rather than wedging the app forever.
      migrated = null;
      throw err;
    });
  }
  await migrated;
  return p;
}

/** Query that returns [] instead of throwing when there is no database. */
export async function q<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const p = await ready();
  if (!p) return [];
  const res = await p.query<T>(text, params);
  return res.rows;
}

export async function q1<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await q<T>(text, params);
  return rows[0] ?? null;
}

export async function exec(text: string, params: unknown[] = []): Promise<boolean> {
  const p = await ready();
  if (!p) return false;
  await p.query(text, params);
  return true;
}

/** True when the database is reachable right now, not merely configured. */
export async function dbHealthy(): Promise<boolean> {
  try {
    const p = await ready();
    if (!p) return false;
    await p.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
