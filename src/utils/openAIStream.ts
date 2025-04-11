
import { StreamingCallbacks } from './streamTypes';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
// Using the provided OpenAI key 
const OPENAI_API_KEY = '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';

export interface StreamOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  messages: Array<{ role: string; content: string }>;
}

/**
 * Creates a streaming request to the OpenAI API
 */
export async function createOpenAIStream(
  options: StreamOptions,
  callbacks: StreamingCallbacks
): Promise<() => boolean> {
  try {
    callbacks.onStart();
    
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
        stream: true,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
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
            console.log('Stream complete');
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
              console.error('Error parsing SSE line:', line, e);
            }
          }
        }
      } catch (error) {
        console.error('Error in stream processing:', error);
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
        isComplete = true;
      }
    };
    
    // Start processing the stream
    processStream();
    
    // Return function to check if streaming is complete
    return () => isComplete;
  } catch (error) {
    console.error('Failed to create stream:', error);
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    return () => true; // Return a function that indicates streaming is complete due to error
  }
}
