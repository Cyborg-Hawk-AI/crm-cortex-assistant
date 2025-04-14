
export interface StreamingResponse {
  success: boolean;
  content?: string;
  error?: string;
  conversationId: string;
  threadId?: string;
  isComplete: boolean;
}

export interface StreamingCallbacks {
  onStart: () => void;
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

export interface MessageStreamCallbacks {
  onMessageStart?: (messageId: string) => void;
  onTokenReceived?: (messageId: string, token: string, fullContent: string) => void;
  onMessageComplete?: (messageId: string, fullContent: string) => void;
  onMessageError?: (error: Error, messageId?: string) => void;
}
