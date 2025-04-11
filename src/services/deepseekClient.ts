
import { StreamingCallbacks } from '@/utils/streamTypes';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat';
const DEEPSEEK_MODEL = 'deepseek-reasoner';

// Get the DeepSeek API key (this would typically come from the user or environment)
export const getDeepSeekApiKey = async (): Promise<string> => {
  // In a real app this would be fetched from a secure place
  // For now, we'll use a placeholder
  return 'PLACEHOLDER_DEEPSEEK_API_KEY';
};

// Format the messages for DeepSeek API
export const formatMessagesForDeepSeek = (messages: { role: string, content: string }[]): any[] => {
  return messages.map(msg => {
    // Map OpenAI roles to DeepSeek roles (they're the same, but this makes it explicit)
    const role = msg.role === 'user' ? 'user' : 
                 msg.role === 'assistant' ? 'assistant' : 
                 msg.role === 'system' ? 'system' : 'user';
    
    return {
      role,
      content: msg.content
    };
  });
};

// Stream messages from DeepSeek API
export const streamChatCompletion = async (
  messages: { role: string, content: string }[],
  callbacks: StreamingCallbacks,
  apiKeyOverride?: string
) => {
  try {
    callbacks.onStart();
    
    const apiKey = apiKeyOverride || await getDeepSeekApiKey();
    
    const response = await fetch(`${DEEPSEEK_API_URL}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: formatMessagesForDeepSeek(messages),
        stream: true,
        max_tokens: 4096
      })
    });
    
    if (!response.ok || !response.body) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      
      // Parse the chunk (format similar to OpenAI's streaming)
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.trim() || line.trim() === 'data: [DONE]') {
          continue;
        }
        
        if (line.startsWith('data:')) {
          try {
            const jsonStr = line.slice(5).trim();
            const json = JSON.parse(jsonStr);
            
            const content = json?.choices?.[0]?.delta?.content || '';
            
            if (content) {
              fullContent += content;
              callbacks.onChunk(content);
            }
          } catch (e) {
            console.error('Error parsing DeepSeek chunk:', e);
          }
        }
      }
    }
    
    callbacks.onComplete(fullContent);
  } catch (error: any) {
    console.error('DeepSeek streaming error:', error);
    callbacks.onError(error);
  }
};

// Non-streaming version for compatibility
export const getChatCompletion = async (
  messages: { role: string, content: string }[],
  apiKeyOverride?: string
): Promise<string> => {
  try {
    const apiKey = apiKeyOverride || await getDeepSeekApiKey();
    
    const response = await fetch(`${DEEPSEEK_API_URL}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: formatMessagesForDeepSeek(messages),
        max_tokens: 4096
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
};
