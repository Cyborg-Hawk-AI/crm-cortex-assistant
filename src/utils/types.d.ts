
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

// Update Message interface to include optional status field
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isSystem?: boolean;
  isStreaming?: boolean;
  conversation_id?: string;
  user_id?: string;
  status?: 'sending' | 'sent' | 'error' | 'streaming' | 'complete';
  isOptimistic?: boolean;
  retryCount?: number;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'in progress' | 'done' | 'blocked';
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Assistant {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
}
