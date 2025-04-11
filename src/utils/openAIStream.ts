
import { createParser } from 'eventsource-parser';
import { ModelProvider } from '@/hooks/useModelSelection';

export type ChatCompletionRequestMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type OpenAIStreamPayload = {
  model?: string;
  messages: ChatCompletionRequestMessage[];
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  stream?: boolean;
  n?: number;
};

export async function createOpenAIStream(
  payload: OpenAIStreamPayload,
  callbacks: {
    onStart: () => void;
    onChunk: (chunk: string) => void;
    onComplete: (fullResponse: string) => void;
    onError: (error: Error) => void;
  },
  provider: ModelProvider = 'openai'
) {
  try {
    callbacks.onStart();
    
    // Different API URLs based on provider
    const apiUrl = provider === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : 'https://api.deepseek.com/v1/chat/completions';
    
    // Different model based on provider
    const model = provider === 'openai'
      ? 'gpt-4-turbo'  // Using a placeholder - replace with your actual OpenAI model
      : 'deepseek-reasoner';
    
    // Get API key (would need to be fetched from secure storage)
    const apiKey = provider === 'openai'
      ? process.env.OPENAI_API_KEY || 'PLACEHOLDER_OPENAI_API_KEY'
      : process.env.DEEPSEEK_API_KEY || 'PLACEHOLDER_DEEPSEEK_API_KEY';
      
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Create the request payload
    const requestPayload = {
      ...payload,
      model,
      stream: true
    };
    
    const res = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      method: 'POST',
      body: JSON.stringify(requestPayload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error: ${res.status} - ${errorText}`);
    }
    
    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        // Create parser with the correct interface
        const parser = createParser(event => {
          if (event.type === 'event') {
            const data = event.data;
            
            // Handle event completion
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            
            try {
              const json = JSON.parse(data);
              
              // Extract content based on provider
              let content = '';
              if (provider === 'openai') {
                content = json.choices[0]?.delta?.content || '';
              } else { // deepseek
                content = json.choices[0]?.delta?.content || '';
              }
              
              if (content) {
                callbacks.onChunk(content);
                const queue = encoder.encode(content);
                controller.enqueue(queue);
              }
            } catch (e) {
              console.error('Error parsing stream:', e);
              controller.error(e);
            }
          }
        });
        
        // Process the stream
        if (res.body) {
          const reader = res.body.getReader();
          let done = false;
          let fullContent = '';
          
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            
            if (done) {
              callbacks.onComplete(fullContent);
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            parser.feed(chunk);
            fullContent += chunk;
          }
        }
      },
    });
    
    return stream;
  } catch (error) {
    console.error('Error in createOpenAIStream:', error);
    callbacks.onError(error as Error);
    return null;
  }
}
