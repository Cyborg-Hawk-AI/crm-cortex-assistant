
import { Message, Task, Assistant } from '@/utils/types';
import { RefetchOptions, QueryObserverResult } from '@tanstack/react-query';

export interface ChatMessagesHook {
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  sendMessage: (content: string, sender?: 'user' | 'assistant' | 'system', specificConversationId?: string | null) => Promise<Message | null>;
  addMessage: (content: string, sender: 'user' | 'assistant' | 'system') => Message;
  activeAssistant: Assistant | null;
  setActiveAssistant: (assistant: Assistant) => Promise<Assistant>;
  clearMessages: (conversationId?: string) => Promise<void>;
  isLoading: boolean;
  isSending: boolean;
  isStreaming: boolean;
  linkedTask: Task | null;
  linkTaskToConversation: (task: Task | null) => Promise<Task | null>;
  activeConversationId: string | null;
  startConversation: (title?: string) => Promise<string>;
  setActiveConversationId: (id: string | null) => void;
  refetchMessages: (options?: RefetchOptions) => Promise<QueryObserverResult<Message[], Error>>;
  saveMessage: (content: string, sender: 'user' | 'assistant' | 'system', messageId?: string, specificConversationId?: string) => Promise<Message | null>;
  generateConversationTitle: (conversationId: string, userMessage: string, assistantResponse: string) => Promise<any>;
  refetchConversations: (options?: RefetchOptions) => Promise<QueryObserverResult<any[], Error>>;
}

// This is just for type definition, the actual implementation is in useChatMessages.tsx
export function useChatMessages(): ChatMessagesHook;
