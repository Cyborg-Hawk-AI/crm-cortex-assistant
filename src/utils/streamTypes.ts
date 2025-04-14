
export interface StreamOptions {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  max_tokens?: number;
}

export interface StreamCallbacks {
  onStart: () => void;
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

// Add aliases for backward compatibility
export type StreamingCallbacks = StreamCallbacks;

// Add the missing StreamingResponse type
export interface StreamingResponse {
  success: boolean;
  content?: string;
  error?: string;
  conversationId?: string;
  threadId?: string | null;
  isComplete: boolean;
}
