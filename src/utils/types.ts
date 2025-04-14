export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isSystem?: boolean;
  isStreaming?: boolean;
  conversation_id?: string;
  user_id?: string;
  assistant_id?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: Date;
  assignee?: string;
}

export interface Assistant {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  capabilities: string[];
}
