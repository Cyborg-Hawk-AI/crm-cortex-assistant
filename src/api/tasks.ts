import { Task, SubTask } from '@/utils/types';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Create a new task in Supabase
export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  // For development, we'll get the current user ID but not enforce it
  const userId = await getCurrentUserId();
  
  // Generate a task with default values if needed
  const taskWithDefaults = {
    ...task,
    id: uuidv4(), // Generate a valid UUID
    reporter_id: task.reporter_id || userId || 'unknown', // Allow any value for now
    // Allow any value for assignee_id, no validation
  };
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskWithDefaults)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message);
  }
  
  console.log('Created task:', data);
  return data as Task;
};

// Get all tasks for the current user - but in development, get all tasks
export const getTasks = async (): Promise<Task[]> => {
  // For development, we'll try to get the current user ID but not enforce it
  const userId = await getCurrentUserId();
  
  // During development, get all tasks without filtering by user
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.message);
  }
  
  return data as Task[];
};

// Update an existing task - relaxed validation for development
export const updateTask = async (task: Task): Promise<Task> => {
  // For development, don't check permissions
  
  const { data, error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', task.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    throw new Error(error.message);
  }
  
  return data as Task;
};

// Delete a task - relaxed validation for development
export const deleteTask = async (taskId: string): Promise<void> => {
  // For development, don't check permissions
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.message);
  }
};

// Create subtask - relaxed validation for development
export const createSubtask = async (subtask: Omit<SubTask, 'id'>): Promise<SubTask> => {
  // For development, we'll try to get the current user ID but not enforce it
  const userId = await getCurrentUserId();
  
  const subtaskWithDefaults = {
    ...subtask,
    id: uuidv4(), // Generate a valid UUID for subtask
    created_by: subtask.created_by || userId || 'unknown' // Allow any value for now
  };
  
  const { data, error } = await supabase
    .from('subtasks')
    .insert(subtaskWithDefaults)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating subtask:', error);
    throw new Error(error.message);
  }
  
  return data as SubTask;
};

// Get subtasks for a task - relaxed validation for development
export const getSubtasks = async (taskId: string): Promise<SubTask[]> => {
  // For development, don't check permissions
  
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('parent_task_id', taskId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching subtasks:', error);
    throw new Error(error.message);
  }
  
  return data as SubTask[];
};

// Update subtask - relaxed validation for development
export const updateSubtask = async (subtask: SubTask): Promise<SubTask> => {
  // For development, don't check permissions
  
  const { data, error } = await supabase
    .from('subtasks')
    .update(subtask)
    .eq('id', subtask.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subtask:', error);
    throw new Error(error.message);
  }
  
  return data as SubTask;
};

// Delete subtask - relaxed validation for development
export const deleteSubtask = async (subtaskId: string): Promise<void> => {
  // For development, don't check permissions
  
  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', subtaskId);
  
  if (error) {
    console.error('Error deleting subtask:', error);
    throw new Error(error.message);
  }
};
