import { NextResponse } from 'next/server';
import { dbHealthy, hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = hasDatabase() ? await dbHealthy() : null;
  // The app is useful without a database, so a missing one is not unhealthy.
  const ok = db !== false;
  return NextResponse.json(
    { ok, database: db === null ? 'not-configured' : db ? 'up' : 'down' },
    { status: ok ? 200 : 503 },
  );
}
