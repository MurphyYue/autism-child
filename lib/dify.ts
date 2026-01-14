// Client-side Dify API calls now go through our API route to protect keys

interface DifyResponse {
  answer: string;
  conversation_id: string;
  suggestions?: string[];
}

// Cache CSRF token to avoid fetching it every time
let csrfTokenCache: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

// Fetch CSRF token from server
async function getCSRFToken(): Promise<string> {
  // Return cached token if available
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  // If a fetch is already in progress, wait for it
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // Fetch new token
  csrfTokenPromise = fetch('/api/csrf')
    .then(res => res.json())
    .then(data => {
      csrfTokenCache = data.token;
      csrfTokenPromise = null;
      return data.token;
    })
    .catch(error => {
      csrfTokenPromise = null;
      throw error;
    });

  return csrfTokenPromise;
}

async function callDifyAPI(
  message: string,
  type: 'main' | 'scenario',
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  try {
    // Get CSRF token
    const csrfToken = await getCSRFToken();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({
        message,
        type,
        conversationId,
        inputs,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      if (response.status === 403) {
        // CSRF token might be stale, clear cache and retry once
        csrfTokenCache = null;
        const newCsrfToken = await getCSRFToken();

        const retryResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': newCsrfToken,
          },
          body: JSON.stringify({
            message,
            type,
            conversationId,
            inputs,
          }),
        });

        if (!retryResponse.ok) {
          throw new Error('Failed to get response from chat API');
        }

        return await retryResponse.json();
      }
      throw new Error('Failed to get response from chat API');
    }

    return await response.json();
  } catch (error) {
    console.error('Dify API Error:', error);
    throw error;
  }
}

export async function getStarCatResponse(
  message: string,
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  return callDifyAPI(message, 'main', conversationId, inputs);
}

export async function getScenarioResponse(
  message: string,
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  return callDifyAPI(message, 'scenario', conversationId, inputs);
}
