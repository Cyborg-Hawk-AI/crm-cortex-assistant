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
  due_date: string | null;  // Changed from Date to string | null
  assignee_id: string | null;
  reporter_id: string;
  user_id: string;
  parent_task_id: string | null;
  created_at: string;  // Changed from Date to string
  updated_at: string;  // Changed from Date to string
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
  created_at: string;  // Changed from Date to string
  updated_at: string;  // Changed from Date to string
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
  last_contact?: string;  // Changed from Date to string
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
  company?: string;  // Added to match usage in components
}

// Meeting interface
export interface Meeting {
  id: string;
  title: string;
  date: string;  // Changed from Date to string
  duration: number;
  client_id?: string;
  client_name: string;
  created_by: string;
  agenda?: string;
  notes?: string;
  meeting_link?: string;
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    status?: 'pending' | 'accepted' | 'declined';
    role?: string;
  }>;
}

// Project interface for the new Notion-like Project management
export interface Project {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  status: string;  // Added to match usage in components
  created_at: string;  // Changed from Date to string
  updated_at: string;  // Changed from Date to string
  tags: string[];
  cover_image?: string;
  icon?: string;  // Added to match usage in components
  task_count?: number;  // Added to match usage in components
  completed_count?: number;  // Added to match usage in components
  name?: string;  // Added to maintain backward compatibility
}

// Message interface - updated to match how it's used in the codebase
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  conversation_id: string;
  user_id: string;
  timestamp: string;  // Changed from Date to string
  isSystem?: boolean;
  isStreaming?: boolean;
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
  notebookId?: string;
  pageId?: string;
  sectionId?: string;
  linkedTaskId?: string;
}

export interface Notebook {
  id: string;
  title: string;
  user_id: string;
  sections?: string | any[];
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
  sectionId?: string;
  isSubpage?: boolean;
  content?: string;
  notebook_id?: string;
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
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
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
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
}

export interface MindPage {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  section_id: string;
  parent_page_id?: string;
  parent_id?: string;  // Added to match usage in components
  is_pinned?: boolean;
  position?: number;
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
}

export interface MindBlock {
  id: string;
  page_id: string;
  user_id: string;
  content_type: string;
  content: any;
  properties?: any;
  position?: number;
  parent_block_id?: string;
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
}

// Activity interface
export interface Activity {
  id: string;
  userId?: string;  // Changed from user_id to userId to match usage in components
  user_id?: string;  // Keep backward compatibility
  type: string;
  entityType?: string;  // Changed from entity_type to entityType to match usage
  entity_type?: string;  // Keep backward compatibility
  entityId?: string;  // Changed from entity_id to entityId to match usage
  entity_id?: string;  // Keep backward compatibility
  content: string;
  description?: string;
  timestamp?: string;  // Changed from Date to string
  additionalInfo?: any;  // Changed from additional_info to additionalInfo
  additional_info?: any;  // Keep backward compatibility
  created_at?: string;  // Changed from Date to string
  relatedItem?: string;
}

// Ticket interface - expanded to match how it's used in the codebase
export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  created_by: string;
  assignee?: string;
  assigned_to?: string;
  reporter?: string;
  due_date?: string;  // Changed from Date to string
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
  created?: string;  // Changed from Date to string
  updated?: string;  // Changed from Date to string
  tags?: string[];
  related?: string[];
  comments?: any[];
  user_id?: string;
  parent_task_id?: string;
  summary?: string;
  actionItems?: string[];
  meetingDate?: string;  // Changed from Date to string
  meetingAttendees?: string[];
  communications?: any[];
  updatedAt?: string;  // Changed from Date to string
  lastStatusUpdate?: string;
  customer?: {
    name: string;
    company?: string;
    email?: string;  // Added to match usage in components
  };
}

// Integration interface
export interface Integration {
  id: string;
  name: string;
  type: string;
  user_id: string;
  config: any;
  status?: string;
  last_sync?: string;  // Changed from Date to string
  lastSync?: string;  // Changed from Date to string
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
  description?: string;
  setupInstructions?: string;
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
  icon?: string;
}

// MeetingAction interface for MeetingQuickActions
export interface MeetingAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  bgColor?: string;  // Keep bgColor for backward compatibility
  color?: string;    // Add color for new components
}

// TicketAction interface for TicketQuickActions
export interface TicketAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  bgColor?: string;  // Keep bgColor for backward compatibility
  color?: string;    // Required property as referenced in errors
}

// Communication interface
export interface Communication {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'chat';
  title: string;
  content: string;
  contact_id: string;
  contact_name: string;
  date: string;  // Changed from Date to string
  created_by: string;
  created_at?: string;  // Changed from Date to string
  updated_at?: string;  // Changed from Date to string
  from?: string;
  message?: string;
  sender?: string;
}

// Comment interface for tasks and projects
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  entity_id: string;
  entity_type: 'task' | 'project';
  created_at: string | Date;
  updated_at: string | Date;
  author_name?: string;
  author_avatar?: string;
}

// ActionProject interface for organizing conversations
export interface ActionProject {
  id: string;
  name: string;
  description?: string | null;
  user_id: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  conversations?: Message[][];
}

// TaskView type for different views
export type TaskView = 'table' | 'board' | 'timeline';
