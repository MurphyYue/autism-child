import axios from 'axios';

// Server-side only environment variables (no NEXT_PUBLIC_ prefix)
const DIFY_API_MAIN_KEY = process.env.DIFY_MAIN_API_KEY;
const DIFY_API_SCENARIO_KEY = process.env.DIFY_SCENARIO_API_KEY;
const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_USER_ID = process.env.DIFY_USER_ID;

if (!DIFY_API_MAIN_KEY || !DIFY_API_URL || !DIFY_API_SCENARIO_KEY || !DIFY_USER_ID) {
  throw new Error('Dify API configuration is missing');
}

interface DifyResponse {
  answer: string;
  conversation_id: string;
  suggestions?: string[];
}

async function getDifyResponse(
  message: string,
  apiKey: string,
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  try {
    const url = `${DIFY_API_URL}/chat-messages`;

    // Process inputs - convert child_introduction object to string if present
    const processedInputs: Record<string, any> = {};
    if (inputs) {
      for (const [key, value] of Object.entries(inputs)) {
        if (key === 'child_introduction' && typeof value === 'object') {
          // Convert child_introduction object to JSON string for Dify
          processedInputs[key] = JSON.stringify(value);
        } else {
          processedInputs[key] = value;
        }
      }
    }

    const requestBody = {
      inputs: processedInputs,
      query: message,
      conversation_id: conversationId || undefined,
      response_mode: 'blocking',
      user: DIFY_USER_ID,
    };

    const response = await axios.post(
      url,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 1 minutes for AI response
      }
    );

    return {
      answer: response.data.answer,
      conversation_id: response.data.conversation_id,
      suggestions: response.data.suggestions || [],
    };
  } catch (error: any) {
    console.error('Dify API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw new Error(error.response?.data?.message || 'Failed to get response from Dify API');
  }
}

export async function getStarCatResponse(
  message: string,
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  return getDifyResponse(message, DIFY_API_MAIN_KEY!, conversationId, inputs);
}

export async function getScenarioResponse(
  message: string,
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  return getDifyResponse(message, DIFY_API_SCENARIO_KEY!, conversationId, inputs);
}
