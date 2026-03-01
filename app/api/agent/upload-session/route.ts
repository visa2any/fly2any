import { NextRequest, NextResponse } from 'next/server';

// In-memory session store (TTL: 30 min)
// In production, replace with Redis
const sessions = new Map<string, {
  idDocumentUrl?: string; idDocumentName?: string;
  einLetterUrl?: string; einLetterName?: string;
  createdAt: number;
}>();

const TTL = 30 * 60 * 1000;

function prune() {
  const now = Date.now();
  sessions.forEach((v, k) => { if (now - v.createdAt > TTL) sessions.delete(k); });
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  prune();
  const session = sessions.get(id);
  if (!session) return NextResponse.json({ files: {} });
  return NextResponse.json({ files: {
    idDocumentUrl: session.idDocumentUrl,
    idDocumentName: session.idDocumentName,
    einLetterUrl: session.einLetterUrl,
    einLetterName: session.einLetterName,
  }});
}

export async function POST(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  prune();
  const body = await request.json();
  const existing = sessions.get(id) ?? { createdAt: Date.now() };
  sessions.set(id, { ...existing, ...body });
  return NextResponse.json({ ok: true });
}
