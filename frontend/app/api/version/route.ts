import { NextResponse } from 'next/server';

// Baked in ONCE at build time — changes on every Vercel/Next.js deploy
const BUILD_ID = Date.now().toString();

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(
    { version: BUILD_ID },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
