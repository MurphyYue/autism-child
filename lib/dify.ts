// Client-side Dify API calls now go through our API route to protect keys

interface DifyResponse {
  answer: string;
  conversation_id: string;
  suggestions?: string[];
}

async function callDifyAPI(
  message: string,
  type: 'main' | 'scenario',
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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