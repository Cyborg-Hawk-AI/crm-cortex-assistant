
import { Task, TaskStatus, TaskPriority } from '@/utils/types';
import { updateTask } from '@/api/tasks';

export interface TaskUpdateOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const updateTaskField = async (
  task: Task, 
  field: string, 
  value: any, 
  options?: TaskUpdateOptions
): Promise<Task> => {
  try {
    console.log(`[DEBUG-updateTaskField] Starting update for task ${task.id}, field: ${field}, value:`, value);
    
    // Create a copy of the task with the updated field
    const updatedTask = {
      ...task,
      [field]: value,
      updated_at: new Date().toISOString()
    };
    
    console.log(`[DEBUG-updateTaskField] Prepared updated task:`, updatedTask);
    
    // For date fields, ensure proper formatting
    if (field === 'due_date' && value instanceof Date) {
      updatedTask.due_date = value.toISOString();
      console.log(`[DEBUG-updateTaskField] Formatted date to ISO string:`, updatedTask.due_date);
    }
    
    // Send update to backend
    console.log(`[DEBUG-updateTaskField] Sending update to backend...`);
    const result = await updateTask(updatedTask);
    console.log(`[DEBUG-updateTaskField] Backend update successful, result:`, result);
    
    if (options?.onSuccess) {
      console.log(`[DEBUG-updateTaskField] Calling onSuccess callback`);
      options.onSuccess();
    }
    
    return result;
  } catch (error) {
    console.error(`[DEBUG-updateTaskField] Error updating ${field}:`, error);
    
    if (options?.onError) {
      console.log(`[DEBUG-updateTaskField] Calling onError callback`);
      options.onError(error);
    }
    
    throw error;
  }
};

export const getStatusDisplayInfo = (status: TaskStatus) => {
  console.log(`[DEBUG-getStatusDisplayInfo] Getting display info for status: ${status}`);
  
  switch (status) {
    case 'open':
      return { 
        label: 'Open', 
        color: 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50',
        dotColor: 'bg-[#64748B]'
      };
    case 'in-progress':
      return { 
        label: 'In Progress', 
        color: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
        dotColor: 'bg-neon-blue'
      };
    case 'resolved':
      return { 
        label: 'Resolved', 
        color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        dotColor: 'bg-amber-500'
      };
    case 'completed':
      return { 
        label: 'Completed', 
        color: 'bg-neon-green/20 text-neon-green border-neon-green/30',
        dotColor: 'bg-neon-green'
      };
    case 'closed':
      return { 
        label: 'Closed', 
        color: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
        dotColor: 'bg-neon-purple'
      };
    default:
      console.log(`[DEBUG-getStatusDisplayInfo] Unknown status: ${status}, using default`);
      return { 
        label: 'Open', 
        color: 'bg-[#3A4D62] text-[#F1F5F9] border-[#3A4D62]/50',
        dotColor: 'bg-[#64748B]'
      };
  }
};

export const getPriorityDisplayInfo = (priority: TaskPriority) => {
  console.log(`[DEBUG-getPriorityDisplayInfo] Getting display info for priority: ${priority}`);
  
  switch (priority) {
    case 'low':
      return {
        label: 'Low',
        color: 'bg-neon-aqua/20 text-neon-aqua border-neon-aqua/30',
        iconColor: 'text-neon-blue'
      };
    case 'medium':
      return {
        label: 'Medium',
        color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        iconColor: 'text-amber-500'
      };
    case 'high':
      return {
        label: 'High',
        color: 'bg-neon-red/20 text-neon-red border-neon-red/30',
        iconColor: 'text-neon-red'
      };
    case 'urgent':
      return {
        label: 'Urgent',
        color: 'bg-neon-red/40 text-neon-red border-neon-red/50',
        iconColor: 'text-neon-red'
      };
    default:
      console.log(`[DEBUG-getPriorityDisplayInfo] Unknown priority: ${priority}, using default`);
      return {
        label: 'Medium',
        color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
        iconColor: 'text-amber-500'
      };
  }
};
