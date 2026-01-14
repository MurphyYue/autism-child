import { cookies } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Generate a new CSRF token
export function generateCSRFToken(): string {
  return createId();
}

// Set CSRF token in cookie
export async function setCSRFCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

// Get CSRF token from cookie
export async function getCSRFCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

// Validate CSRF token from request
export async function validateCSRFToken(request: Request): Promise<boolean> {
  const cookieToken = await getCSRFCookie();

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  for (let i = 0; i < cookieToken.length; i++) {
    if (cookieToken[i] !== headerToken[i]) {
      return false;
    }
  }

  return true;
}

// Get or create CSRF token (for client-side access)
export async function getOrCreateCSRFToken(): Promise<string> {
  const existingToken = await getCSRFCookie();

  if (existingToken) {
    return existingToken;
  }

  const newToken = generateCSRFToken();
  await setCSRFCookie(newToken);
  return newToken;
}

export { CSRF_HEADER_NAME };
