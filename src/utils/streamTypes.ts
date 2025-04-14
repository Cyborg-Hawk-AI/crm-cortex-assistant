
export interface StreamOptions {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;  // Make sure this is added
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
