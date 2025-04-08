export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isSystem?: boolean;
  isStreaming?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  prompt?: string;
  model?: string;
  icon?: string | React.ReactNode; // Updated to allow ReactNode for icons
  capabilities?: string[]; // Added capabilities property
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string | null;
  reporter_id: string;
  parent_task_id: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface SubTask {
  id: string;
  title: string;
  parent_task_id: string;
  is_completed: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  // For the notebook feature
  notebookId?: string;
  sectionId?: string;
  pageId?: string;
  linkedTaskId?: string;
  // For backwards compatibility
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string | Date;
  start_time: string;
  end_time: string;
  attendees: string[] | { name: string; email: string; }[];
  location?: string;
  meeting_link?: string;
  meetingLink?: string; // Added for compatibility
  created_by: string;
  created_at: Date;
  updated_at: Date;
  clientName?: string; // Added for compatibility
  duration?: number; // Added for compatibility
  agenda?: string; // Added for compatibility
  clientId?: string; // Added for compatibility
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  title?: string;
  tags?: string[];
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'meeting_scheduled' | 'note_created' | 'message_received' | 'note_updated' | 'comment_added';
  description: string;
  timestamp: Date;
  user_id?: string;
  related_id?: string;
  related_type?: 'task' | 'meeting' | 'note' | 'message';
  // For backwards compatibility
  userId?: string;
  content?: string;
  relatedItem?: string;
  entityId?: string;
  entityType?: string;
  additionalInfo?: any;
}

// Additional types needed by various components
export interface Notebook {
  id: string;
  title: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  sections?: NoteSection[];
}

export interface NoteSection {
  id: string;
  title: string;
  notebook_id: string;
  color?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NotePage {
  id: string;
  title: string;
  section_id: string;
  notebook_id: string;
  content?: string;
  order?: number;
  is_subpage?: boolean;
  parent_page_id?: string;
  created_at?: string;
  updated_at?: string;
  sectionId?: string;
  isSubpage?: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: string;
  reporter?: string; // Added for compatibility
  created?: Date; // Added for compatibility
  updated?: Date; // Added for compatibility
  created_at: Date;
  updated_at: Date;
  updatedAt?: Date; // Added for compatibility
  customer?: { // Added for compatibility
    name: string;
    company?: string;
    email?: string;
  };
  comments?: any[];
  tags?: string[];
  related?: string[];
  lastStatusUpdate?: string; // Added for compatibility
  summary?: string; // Added for compatibility
  actionItems?: string[]; // Added for compatibility
  meetingDate?: Date; // Added for compatibility
  meetingAttendees?: string[]; // Added for compatibility
  communications?: Communication[]; // Added for compatibility
}

export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  lastSync?: Date;
}

export interface MeetingAction {
  id: string;
  name?: string;
  type?: string;
  label?: string;
  description?: string;
  action?: () => void;
  icon?: React.ReactNode;
  variant?: string;
  bgColor?: string;
}

export interface TicketAction {
  id: string;
  name?: string;
  type?: string;
  label?: string;
  description?: string;
  action?: () => void;
  icon?: React.ReactNode;
}

// Added for compatibility with mockData
export interface Communication {
  id?: string;
  from?: string;
  message?: string;
  date: Date;
  content?: string;
  sender?: string;
}

// For the streaming functionality
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

// New interfaces for the Mindboard feature
export interface Mindboard {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  position?: number;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  sections?: MindSection[];
}

// Alias for compatibility with component name
export type MindboardType = Mindboard;

export interface MindSection {
  id: string;
  mindboard_id: string;
  user_id: string;
  title: string;
  description?: string;
  position?: number;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  pages?: MindPage[];
}

export interface MindPage {
  id: string;
  title: string;
  description?: string;
  section_id: string;
  user_id?: string;  // Added for API compatibility
  parent_page_id?: string;
  parent_id?: string;
  is_pinned?: boolean;
  position?: number;
  created_at: string;
  updated_at: string;
}

export interface MindBlock {
  id: string;
  page_id: string;
  user_id: string;
  content_type: 'text' | 'heading1' | 'heading2' | 'heading3' | 'todo' | 'bullet' | 'numbered' | 
    'toggle' | 'quote' | 'callout' | 'divider' | 'code' | 'image' | 'video' | 'file' | 'embed' | 
    'table' | 'database' | 'columns' | 'ai' | 'audio';  // Added 'audio' to the accepted types
  content: {
    text?: string;
    checked?: boolean;
    completed?: boolean;  // Added for todo items
    level?: 1 | 2 | 3; // For headings
    language?: string; // For code blocks
    url?: string; // For images, videos, embeds
    name?: string; // For file name display
    filename?: string; // For files
    code?: string; // For code blocks
    caption?: string; // For image/media captions
    mimeType?: string; // For audio/video media types
    title?: string; // For embed titles
    columns?: number; // For column layouts
    expanded?: boolean; // For toggles
    style?: string; // For callouts
    data?: any; // For tables/databases
    assignee?: string;
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
    status?: string;
    indent?: number; // Added for indentation
    number?: number; // Added for numbered lists
  };
  position?: number;
  parent_block_id?: string; // For nesting blocks
  properties?: Record<string, any>;
  created_at: string;
  updated_at: string;
  tags?: string[];
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  comments?: Array<{
    id: string;
    user_id: string;
    content: string;
    created_at: string;
  }>;
}
