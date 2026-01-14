import { NextRequest, NextResponse } from 'next/server';
import { getStarCatResponse, getScenarioResponse } from '@/lib/dify-server';
import { validateCSRFToken } from '@/lib/csrf';

// Simple in-memory rate limiting store
const rateLimitStore = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(req);
    if (!isValidCSRF) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const { message, conversationId, inputs, type = 'main' } = await req.json();

    // Validate request
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Rate limiting: 10 requests per minute per IP
    const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
    const rateLimitKey = `ratelimit:${ip}`;

    // Simple in-memory rate limiting (for production, use Redis)
    const now = Date.now();
    const timestamps = rateLimitStore.get(rateLimitKey) || [];
    const recentTimestamps = timestamps.filter(t => now - t < 60000); // 1 minute window

    if (recentTimestamps.length >= 10) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    recentTimestamps.push(now);
    rateLimitStore.set(rateLimitKey, recentTimestamps);

    // Call appropriate Dify API based on type
    const response = type === 'scenario'
      ? await getScenarioResponse(message, conversationId, inputs)
      : await getStarCatResponse(message, conversationId, inputs);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
