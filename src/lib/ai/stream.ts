
import { StreamingCallbacks } from '@/utils/streamTypes';
import { createOpenAIStream } from '@/utils/openAIStream';

/**
 * Utility to create a streaming response from an AI model
 * @param modelProvider - The provider of the model (openai or deepseek) 
 * @param options - Configuration options for the stream
 * @param callbacks - Event callbacks for streaming
 * @returns A function to check if the stream is complete and to cancel the stream
 */
export async function createAIStream(
  modelProvider: 'openai' | 'deepseek',
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    messages: Array<{ role: string; content: string }>;
  },
  callbacks: StreamingCallbacks
): Promise<() => boolean> {
  console.log(`Creating AI stream with provider: ${modelProvider}`);
  
  // Currently only OpenAI stream is implemented
  // This architecture allows easy addition of other providers
  if (modelProvider === 'openai') {
    return createOpenAIStream(options, callbacks);
  } else {
    // Placeholder for future DeepSeek or other model integrations
    console.warn(`Stream for provider ${modelProvider} not implemented, falling back to OpenAI`);
    return createOpenAIStream(options, callbacks);
  }
}

/**
 * Parse and handle streaming events from OpenAI's streaming responses API
 * @param event - The event object from the stream
 * @returns Parsed event data and type
 */
export function parseStreamEvent(event: any): {
  type: string;
  content?: string;
  error?: Error;
  completed?: boolean;
} {
  try {
    // Handle different event types from the streaming responses API
    switch (event.type) {
      case 'response.created':
        return { type: 'started' };
        
      case 'response.output_text.delta':
        return {
          type: 'chunk',
          content: event.delta?.value || ''
        };
        
      case 'response.completed':
        return {
          type: 'completed',
          completed: true
        };
        
      case 'error':
        return {
          type: 'error',
          error: new Error(event.error?.message || 'Unknown streaming error')
        };
        
      default:
        // Unknown or unhandled event type
        return { type: 'unknown' };
    }
  } catch (error) {
    console.error('Error parsing stream event:', error);
    return {
      type: 'error',
      error: error instanceof Error ? error : new Error('Error parsing stream event')
    };
  }
}

/**
 * Creates a cancellable stream controller
 * @returns An object with cancel method and signal for controlling the stream
 */
export function createStreamController() {
  const controller = new AbortController();
  const { signal } = controller;
  
  return {
    cancel: () => controller.abort('User cancelled the stream'),
    signal
  };
}
