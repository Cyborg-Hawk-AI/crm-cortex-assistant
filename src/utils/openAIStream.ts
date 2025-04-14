
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
    // Signal the start of streaming immediately to update UI
    callbacks.onStart();
    console.log("OpenAI Stream: Starting connection to OpenAI API");
    
    // Ensure we're starting with the correct API URL
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
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    console.log("OpenAI Stream: Connection established, starting to read stream");
    
    // Streaming setup
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get reader from response');
    }
    
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let isComplete = false;
    
    // Process the stream asynchronously without awaiting
    const processStream = async () => {
      try {
        console.log("OpenAI Stream: Processing stream started");
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('OpenAI Stream: Complete - sending final text');
            isComplete = true;
            // Ensure we call onComplete with the final text
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
                // Send each chunk for immediate UI update
                console.log(`OpenAI Stream: Received chunk "${content.substring(0, 20)}${content.length > 20 ? '...' : ''}"`);
                callbacks.onChunk(content);
              }
            } catch (e) {
              console.error('OpenAI Stream: Error parsing SSE line:', line, e);
            }
          }
        }
      } catch (error) {
        console.error('OpenAI Stream: Error in stream processing:', error);
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
        isComplete = true;
      }
    };
    
    // Start processing the stream without waiting
    processStream();
    
    // Return function to check if streaming is complete
    return () => isComplete;
  } catch (error) {
    console.error('OpenAI Stream: Failed to create stream:', error);
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    return () => true; // Return a function that indicates streaming is complete due to error
  }
}
