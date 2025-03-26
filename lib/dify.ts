import axios from 'axios';

const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY;
const DIFY_API_URL = process.env.NEXT_PUBLIC_DIFY_API_URL;

if (!DIFY_API_KEY || !DIFY_API_URL) {
  throw new Error('Dify API configuration is missing');
}

interface DifyResponse {
  answer: string;
  conversation_id: string;
  suggestions?: string[];
}

export async function getDifyResponse(
  message: string,
  conversationId?: string,
  inputs?: Record<string, any>
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
        user: "abc-123",
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
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