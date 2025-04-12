
import { StreamingCallbacks } from './streamTypes';
import { flushSync } from 'react-dom';

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
    console.log(`[${new Date().toISOString()}] Stream started`);
    
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
    let chunkCount = 0;
    
    // Process the stream immediately without waiting for the entire response
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log(`[${new Date().toISOString()}] Stream complete - Received ${chunkCount} chunks total`);
            isComplete = true;
            callbacks.onComplete(fullText);
            break;
          }
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          console.log(`[${new Date().toISOString()}] Received chunk of size: ${chunk.length}`);
          
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
                chunkCount++;
                fullText += content;
                console.log(`[${new Date().toISOString()}] Processing chunk #${chunkCount}: "${content}" (${content.length} chars)`);
                
                // Immediately call onChunk to ensure real-time streaming
                callbacks.onChunk(content);
                console.log(`[${new Date().toISOString()}] onChunk callback completed for chunk #${chunkCount}`);
              }
            } catch (e) {
              console.error(`[${new Date().toISOString()}] Error parsing SSE line:`, line, e);
            }
          }
        }
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in stream processing:`, error);
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
        isComplete = true;
      }
    })();
    
    // Return function to check if streaming is complete
    return () => isComplete;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to create stream:`, error);
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    return () => true; // Return a function that indicates streaming is complete due to error
  }
}
