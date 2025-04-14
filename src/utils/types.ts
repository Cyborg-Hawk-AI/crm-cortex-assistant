
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
  status: 'open' | 'in-progress' | 'completed' | 'closed' | 'resolved';
  priority: 'high' | 'medium' | 'low' | 'urgent';
  due_date?: Date;
  assignee?: string;
  
  // Additional properties used in the codebase
  assignee_id?: string;
  reporter_id?: string;
  user_id?: string;
  parent_task_id?: string | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Assistant {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  capabilities: string[];
}

// Additional types needed across the codebase
export interface SubTask {
  id: string;
  title: string;
  parent_task_id: string;
  is_completed?: boolean;
  status?: string;
  user_id?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_id?: string;
  position?: string;
  notes?: string;
  tags?: string[];
  avatar?: string;
  last_contact?: Date;
  created_at?: string;
  updated_at?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: Date | string;
  duration: number;
  client_name: string;
  client_id?: string;
  notes?: string;
  agenda?: string;
  meeting_link?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface Mindboard {
  id: string;
  title: string;
  description?: string;
  position?: number;
  color?: string;
  icon?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MindSection {
  id: string;
  mindboard_id: string;
  title: string;
  description?: string;
  position?: number;
  color?: string;
  icon?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MindPage {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  position?: number;
  is_pinned?: boolean;
  parent_page_id?: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface MindBlock {
  id: string;
  page_id: string;
  content_type: 'text' | 'todo' | 'heading' | 'image' | 'file' | 'code' | 'quote' | 'callout';
  content: any;
  position?: number;
  properties?: Record<string, any>;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  content: string;
  notebookId?: string;
  sectionId?: string;
  pageId?: string;
  linkedTaskId?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notebook {
  id: string;
  title: string;
  sections?: any[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface NoteSection {
  id: string;
  title: string;
  notebook_id: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotePage {
  id: string;
  title: string;
  section_id: string;
  parent_page_id?: string | null;
  is_subpage?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ActionProject {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  date?: string;
  user_id?: string;
}

export interface Activity {
  id: string;
  type: string;
  content: string;
  userId: string;
  timestamp: Date;
  entityId?: string;
  relatedItem?: string;
  additionalInfo?: any;
}

export interface MeetingAction {
  id: string;
  label: string;
  meeting_id?: string;
  icon: string;
  action: string;
  color: string;
}

export interface TicketAction {
  id: string;
  label: string;
  ticket_id?: string;
  icon: string;
  action: string;
  color: string;
}

export interface TaskView {
  id: string;
  name: string;
  project_id: string;
  filter_criteria?: any;
  sort_criteria?: any;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

// Type enums
export type TaskStatus = 'open' | 'in-progress' | 'completed' | 'closed' | 'resolved';
export type TaskPriority = 'high' | 'medium' | 'low' | 'urgent';
