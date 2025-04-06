import axios from 'axios';

const DIFY_API_MAIN_KEY = process.env.NEXT_PUBLIC_DIFY_MAIN_API_KEY;
const DIFY_API_SCENARIO_KEY = process.env.NEXT_PUBLIC_DIFY_SCENARIO_API_KEY;

const DIFY_API_URL = process.env.NODE_ENV === 'production' ? '/api' : process.env.NEXT_PUBLIC_DIFY_API_URL;
const DIFY_AUSERID = process.env.NEXT_PUBLIC_DIFY_USERID;

if (!DIFY_API_MAIN_KEY || !DIFY_API_URL || !DIFY_API_SCENARIO_KEY || !DIFY_AUSERID) {
  throw new Error('Dify API configuration is missing');
}

interface DifyResponse {
  answer: string;
  conversation_id: string;
  suggestions?: string[];
}

export async function getDifyResponse(
  message: string,
  apiKey: string,
  conversationId?: string,
  inputs?: Record<string, any>,
): Promise<DifyResponse> {
  try {
    const response = await axios.post(
      `${DIFY_API_URL}/chat-messages`,
      {
        inputs: {
          ...inputs,
        },
        query: message,
        conversation_id: conversationId,
        response_mode: 'blocking',
        user: DIFY_AUSERID,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      answer: response.data.answer,
      conversation_id: response.data.conversation_id,
      suggestions: response.data.suggestions || [],
    };
  } catch (error) {
    console.error('Dify API Error:', error);
    throw new Error('Failed to get response from Dify API');
  }
}
export async function getStarCatResponse(
  message: string,
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  return getDifyResponse(message, DIFY_API_MAIN_KEY ?? '', conversationId, inputs)
}

export async function getScenarioResponse(
  message: string,
  conversationId?: string,
  inputs?: Record<string, any>
): Promise<DifyResponse> {
  return getDifyResponse(message, DIFY_API_SCENARIO_KEY ?? '', conversationId, inputs)
}