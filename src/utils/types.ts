
// Define task priority and status types based on what's in the database
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'completed';

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  assignee_id: string | null;
  reporter_id: string;
  user_id: string;
  parent_task_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  tags: string[];
}

// SubTask interface
export interface SubTask {
  id: string;
  title: string;
  parent_task_id: string;
  user_id: string;
  is_completed: boolean;
  created_by: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

// Contact interface
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  company_id?: string;
  notes?: string;
  tags?: string[];
  avatar?: string;
  last_contact?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Meeting interface
export interface Meeting {
  id: string;
  title: string;
  date: Date | string;
  duration: number;
  client_id?: string;
  client_name: string;
  created_by: string;
  agenda?: string;
  notes?: string;
  meeting_link?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    status?: 'pending' | 'accepted' | 'declined';
    role?: string;
  }>;
}

// Message interface
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  conversation_id: string;
  user_id: string;
  timestamp: Date | string;
  isSystem?: boolean;
  metadata?: Record<string, any>;
}

// Notebook related interfaces
export interface Note {
  id: string;
  content: string;
  user_id: string;
  notebook_id?: string;
  page_id?: string;
  linked_task_id?: string;
  timestamp?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Notebook {
  id: string;
  title: string;
  user_id: string;
  sections?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface NoteSection {
  id: string;
  title: string;
  notebook_id: string;
  color?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface NotePage {
  id: string;
  title: string;
  section_id: string;
  parent_page_id?: string;
  is_subpage?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Mindboard related interfaces
export interface Mindboard {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  icon?: string;
  color?: string;
  position?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface MindSection {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  mindboard_id: string;
  icon?: string;
  color?: string;
  position?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface MindPage {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  section_id: string;
  parent_page_id?: string;
  is_pinned?: boolean;
  position?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface MindBlock {
  id: string;
  page_id: string;
  user_id: string;
  content_type: string;
  content: any;
  properties?: any;
  position?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Activity interface
export interface Activity {
  id: string;
  user_id: string;
  type: string;
  entity_type: string;
  entity_id: string;
  content: string;
  timestamp?: Date | string;
  additional_info?: any;
  created_at?: Date | string;
}

// Ticket interface
export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  created_by: string;
  assigned_to?: string;
  due_date?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
  tags?: string[];
}

// Integration interface
export interface Integration {
  id: string;
  name: string;
  type: string;
  user_id: string;
  config: any;
  status?: string;
  last_sync?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// Assistant interface
export interface Assistant {
  id: string;
  name: string;
  description?: string;
  capabilities?: string[];
  openai_assistant_id?: string;
  is_active?: boolean;
  configuration?: any;
  created_at?: Date | string;
  updated_at?: Date | string;
}

// MeetingAction interface for MeetingQuickActions
export interface MeetingAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  bgColor?: string;
}

// TicketAction interface for TicketQuickActions
export interface TicketAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  bgColor?: string;
}

// Communication interface
export interface Communication {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'chat';
  title: string;
  content: string;
  contact_id: string;
  contact_name: string;
  date: Date | string;
  created_by: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}
