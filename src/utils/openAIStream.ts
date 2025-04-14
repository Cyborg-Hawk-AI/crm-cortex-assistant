
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

// Log with timestamps for debugging stream performance
const logWithTime = (message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
  console.log(`[${timestamp}] ${message}`, data ? data : '');
};

/**
 * Creates a streaming request to the OpenAI API using the latest streaming responses API
 * @param options - The configuration options for the stream
 * @param callbacks - Callback functions for stream events
 */
export async function createOpenAIStream(
  options: StreamOptions,
  callbacks: StreamingCallbacks
): Promise<() => boolean> {
  try {
    // Start streaming process
    callbacks.onStart();
    logWithTime('Starting OpenAI stream with model:', options.model || DEFAULT_MODEL);

    // Create AbortController for request cancellation
    const controller = new AbortController();
    const { signal } = controller;
    
    // Format messages for the request
    const messages = options.messages.map(message => ({
      role: message.role,
      content: message.content
    }));
    
    // FIXED: Corrected the endpoint URL
    const response = await fetch(`${OPENAI_API_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        input: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
        stream: true,
      }),
      signal,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logWithTime(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }
    
    if (!response.body) {
      logWithTime('Response body is null');
      throw new Error('Response body is null');
    }
    
    // Stream processing variables
    let fullText = '';
    let isComplete = false;
    
    // Handle the stream processing
    const processStream = async () => {
      try {
        logWithTime('Starting stream processing');
        const reader = response.body!.getReader();
        const decoder = new TextDecoder('utf-8');
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            logWithTime('Stream reading complete');
            isComplete = true;
            
            // Ensure we call onComplete if it hasn't been called by an event
            if (fullText) {
              callbacks.onComplete(fullText);
            }
            break;
          }
          
          // Decode the chunk and parse the events
          const chunk = decoder.decode(value, { stream: true });
          logWithTime('Received raw chunk:', chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
          
          // Process the SSE format - each line starts with "data: "
          const lines = chunk
            .split('\n')
            .filter(line => line.trim().startsWith('data:'))
            .map(line => line.replace(/^data: /, '').trim());
          
          for (const line of lines) {
            if (line === '[DONE]') {
              logWithTime('Received [DONE] signal');
              isComplete = true;
              continue;
            }
            
            try {
              // Parse the event data
              const event = JSON.parse(line);
              logWithTime('Parsed event:', { type: event.type });
              
              // Handle different event types from the streaming responses API
              switch (event.type) {
                case 'response.created':
                  logWithTime('Response created event received');
                  break;
                  
                case 'response.output_text.delta':
                  // Process text delta event (incremental token)
                  const delta = event.delta?.value || '';
                  if (delta) {
                    logWithTime('Text delta received:', delta);
                    fullText += delta;
                    callbacks.onChunk(delta);
                  }
                  break;
                  
                case 'response.completed':
                  logWithTime('Response completed event received');
                  isComplete = true;
                  callbacks.onComplete(fullText);
                  break;
                  
                case 'error':
                  logWithTime('Error event received:', event.error);
                  callbacks.onError(new Error(event.error?.message || 'Unknown streaming error'));
                  isComplete = true;
                  break;
                  
                default:
                  // Handle other event types if needed
                  logWithTime(`Unhandled event type: ${event.type}`);
                  break;
              }
            } catch (e) {
              logWithTime('Error parsing SSE line:', line);
              console.error('Parse error:', e);
            }
          }
        }
      } catch (error) {
        logWithTime('Error in stream processing:', error);
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
        isComplete = true;
      }
    };
    
    // Start processing the stream
    processStream();
    
    // Return a function to check if streaming is complete and allow cancellation
    return () => {
      if (!isComplete) {
        controller.abort();
      }
      return isComplete;
    };
  } catch (error) {
    logWithTime('Failed to create stream:', error);
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
    return () => true; // Return a function that indicates streaming is complete due to error
  }
}
