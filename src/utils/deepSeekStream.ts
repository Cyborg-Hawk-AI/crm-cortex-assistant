
import { StreamingCallbacks } from './streamTypes';

// DeepSeek API configuration
const DEEPSEEK_API_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat'; // Using deepseek-chat model
// API key should be retrieved from environment variables in a secure way
// For frontend-only apps, we'll need to have the user provide their API key
const DEEPSEEK_API_KEY = 'sk-18518fb88a40422e9f61b5769a1feeca';

export interface StreamOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  messages: Array<{ role: string; content: string }>;
}

/**
 * Creates a streaming request to the DeepSeek API
 */
export async function createDeepSeekStream(
  options: StreamOptions,
  callbacks: StreamingCallbacks
): Promise<() => boolean> {
  try {
    callbacks.onStart();
    
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured. Please set the DEEPSEEK_API_KEY in your environment variables.');
    }
    
    // Prepare messages as per DeepSeek docs - each message needs role and content
    const cleanMessages = options.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    console.log(`Sending ${cleanMessages.length} messages to DeepSeek API using model: ${options.model || DEFAULT_MODEL}`);
    
    const response = await fetch(`${DEEPSEEK_API_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages: cleanMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
        stream: true,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error (${response.status}): ${errorText}`);
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }
    
    // Streaming setup
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get reader from response');
    }
    
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let isComplete = false;
    
    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('DeepSeek stream complete');
            isComplete = true;
            callbacks.onComplete(fullText);
            break;
          }
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          
          // Process the SSE format
          const lines = chunk
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.replace(/^data: /, '').trim());
          
          for (const line of lines) {
            if (line === '[DONE]') {
              isComplete = true;
              continue;
            }
            
            try {
              const json = JSON.parse(line);
              const content = json.choices[0]?.delta?.content || '';
              
              if (content) {
                fullText += content;
                callbacks.onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing DeepSeek SSE line:', line, e);
            }
          }
        }
      } catch (error) {
        console.error('Error in DeepSeek stream processing:', error);
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
        isComplete = true;
      }
    };
    
    // Start processing the stream
    processStream();
    
    // Return function to check if streaming is complete
    return () => isComplete;
  } catch (error) {
    console.error('Failed to create DeepSeek stream:', error);
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    return () => true; // Return a function that indicates streaming is complete due to error
  }
}

// Export the deepSeekChat function
export const deepSeekChat = createDeepSeekStream;
