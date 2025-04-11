import { StreamingCallbacks } from './streamTypes';

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
// Updated API key as provided by the user
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
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    // Get response body as ReadableStream
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let isComplete = false;
    let buffer = '';
    
    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Process any remaining data in the buffer
            if (buffer.trim()) {
              try {
                const lines = buffer.trim().split('\n');
                for (const line of lines) {
                  const trimmedLine = line.replace(/^data: /, '').trim();
                  if (trimmedLine === '[DONE]') continue;
                  if (!trimmedLine) continue;
                  
                  try {
                    const json = JSON.parse(trimmedLine);
                    const content = json.choices[0]?.delta?.content || '';
                    if (content) {
                      fullText += content;
                      callbacks.onChunk(content);
                    }
                  } catch (e) {
                    console.error('Error parsing last buffer line:', trimmedLine, e);
                  }
                }
              } catch (e) {
                console.error('Error processing final buffer:', e);
              }
            }
            
            console.log('Stream complete');
            isComplete = true;
            callbacks.onComplete(fullText);
            break;
          }
          
          // Decode the chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Process complete lines
          const lines = buffer.split('\n');
          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmedLine = line.replace(/^data: /, '').trim();
            if (!trimmedLine) continue;
            if (trimmedLine === '[DONE]') {
              isComplete = true;
              continue;
            }
            
            try {
              const json = JSON.parse(trimmedLine);
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
