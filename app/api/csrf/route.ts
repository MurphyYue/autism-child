import { NextResponse } from 'next/server';
import { getOrCreateCSRFToken } from '@/lib/csrf';

export async function GET() {
  const token = await getOrCreateCSRFToken();

  return NextResponse.json({ token });
}
