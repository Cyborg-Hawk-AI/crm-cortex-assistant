
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
