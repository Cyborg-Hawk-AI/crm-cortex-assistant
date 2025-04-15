
import { Task } from '@/utils/types';

export enum TaskContextDetailLevel {
  MINIMAL = 'minimal',
  STANDARD = 'standard',
  COMPREHENSIVE = 'comprehensive'
}

export const formatTaskContext = (
  task: Task | null, 
  detailLevel: TaskContextDetailLevel = TaskContextDetailLevel.STANDARD
): string => {
  if (!task) return '';
  
  switch (detailLevel) {
    case TaskContextDetailLevel.MINIMAL:
      return `Task #${task.id.substring(0,8)}: ${task.title} (${task.status}, ${task.priority})`;
      
    case TaskContextDetailLevel.COMPREHENSIVE:
      return `
COMPREHENSIVE TASK CONTEXT:
• ID: ${task.id.substring(0,8)}
• Title: ${task.title}
• Status: ${task.status.toUpperCase()}
• Priority: ${task.priority.toUpperCase()}
• Description: ${task.description || 'No description provided'}
• Due Date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
• Assignee: ${task.assignee_id || 'Unassigned'}
• Reporter: ${task.reporter_id}
• Parent Task: ${task.parent_task_id || 'None'}
• Created: ${new Date(task.created_at).toLocaleString()}
• Last Updated: ${new Date(task.updated_at).toLocaleString()}
• Tags: ${task.tags?.join(', ') || 'None'}

Additional Instructions:
- When asked about this task, provide complete information based on the details above.
- Remember these details throughout our conversation.
- If the task details seem outdated, let the user know they may need to refresh.`;
      
    case TaskContextDetailLevel.STANDARD:
    default:
      return `
TASK CONTEXT:
• Title: ${task.title}
• Status: ${task.status.toUpperCase()}
• Priority: ${task.priority.toUpperCase()}
• Description: ${task.description ? (task.description.length > 150 ? task.description.substring(0, 150) + '...' : task.description) : 'No description'}
• Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
• Last Updated: ${new Date(task.updated_at).toLocaleString()}

Note: You can ask me for more details about this task at any time.`;
  }
};

// Utility to detect if context needs refresh
export const shouldRefreshTaskContext = (
  messages: any[], 
  taskId: string, 
  threshold: number = 10
): boolean => {
  // Find last system message with task context
  const lastTaskMessage = messages
    .reverse()
    .find(msg => msg.isSystem && msg.content.includes(`Task #${taskId.substring(0,8)}`));
    
  if (!lastTaskMessage) return true;
  
  // Get message count since last task context
  const messagesSinceContext = messages
    .reverse()
    .findIndex(msg => msg.id === lastTaskMessage.id);
    
  return messagesSinceContext >= threshold;
};

// Log task context integration points
export const logTaskContext = (
  stage: 'system-message' | 'prompt-inclusion' | 'api-call',
  conversationId: string,
  taskId: string | null,
  included: boolean,
  contextSize: number
) => {
  console.log(
    `[TaskContext:${stage}] Conv:${conversationId.substring(0,8)} ` +
    `Task:${taskId ? taskId.substring(0,8) : 'none'} ` +
    `Included:${included} Size:${contextSize}`
  );
};
