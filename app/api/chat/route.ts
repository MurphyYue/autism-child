import { NextRequest, NextResponse } from 'next/server';
import { getStarCatResponse, getScenarioResponse } from '@/lib/dify-server';

export async function POST(req: NextRequest) {
  try {
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
    const rateLimitData = global.rateLimitData as Map<string, number[]>;
    if (!rateLimitData) {
      (global.rateLimitData as Map<string, number[]>) = new Map();
    }
    const timestamps = (global.rateLimitData as Map<string, number[]>).get(rateLimitKey) || [];
    const recentTimestamps = timestamps.filter(t => now - t < 60000); // 1 minute window

    if (recentTimestamps.length >= 10) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    recentTimestamps.push(now);
    (global.rateLimitData as Map<string, number[]>).set(rateLimitKey, recentTimestamps);

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
