
import { Task, SubTask } from '@/utils/types';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Create a new task in Supabase
export const createTask = async (taskData: Partial<Omit<Task, 'id'>>): Promise<Task> => {
  // Get current user ID for ownership
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to create tasks');
  
  // Generate a task with default values
  const taskWithDefaults: Omit<Task, 'id'> = {
    title: taskData.title || '',
    description: taskData.description || null,
    status: taskData.status || 'open',
    priority: taskData.priority || 'medium',
    due_date: taskData.due_date || null,
    assignee_id: taskData.assignee_id || null,
    reporter_id: userId, // Always use current user as reporter
    user_id: userId, // Always use current user as owner
    parent_task_id: taskData.parent_task_id || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tags: taskData.tags || [],
  };
  
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...taskWithDefaults, id: uuidv4() })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    throw new Error(error.message);
  }
  
  console.log('Created task:', data);
  return data as Task;
};

// Get all tasks for the current user
export const getTasks = async (): Promise<Task[]> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to fetch tasks');
  
  // RLS will automatically filter to only show user's own tasks
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .is('parent_task_id', null)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.message);
  }
  
  return data as Task[];
};

// Update an existing task
export const updateTask = async (task: Task): Promise<Task> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to update tasks');
  
  // RLS will ensure user can only update their own tasks
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...task,
      updated_at: new Date().toISOString()
    })
    .eq('id', task.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating task:', error);
    throw new Error(error.message);
  }
  
  return data as Task;
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  console.log(`API: Attempting to delete task with ID: ${taskId}`);
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to delete tasks');
  
  // First try to delete from subtasks table
  try {
    const { error: subtaskError } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', taskId);
    
    if (!subtaskError) {
      console.log(`Successfully deleted subtask: ${taskId}`);
      return;
    } else {
      console.log(`No subtask found with ID ${taskId} or error occurred: ${subtaskError.message}. Trying tasks table.`);
    }
  } catch (err) {
    console.log(`Error checking subtasks table: ${err}. Proceeding to check tasks table.`);
  }
  
  // RLS will ensure user can only delete their own tasks
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.message);
  }
  
  console.log(`Successfully deleted task: ${taskId}`);
};

// Create subtask
export const createSubtask = async (subtask: Omit<SubTask, 'id'>): Promise<SubTask> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to create subtasks');
  
  const subtaskWithDefaults = {
    ...subtask,
    id: uuidv4(),
    user_id: userId, // Set current user as owner
    created_by: userId, // Set current user as creator
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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

// Get subtasks for a task
export const getSubtasks = async (taskId: string): Promise<SubTask[]> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to fetch subtasks');
  
  // RLS will automatically filter to only show user's own subtasks
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

// Update subtask
export const updateSubtask = async (subtask: SubTask): Promise<SubTask> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to update subtasks');
  
  // RLS will ensure user can only update their own subtasks
  const { data, error } = await supabase
    .from('subtasks')
    .update({
      ...subtask,
      updated_at: new Date().toISOString()
    })
    .eq('id', subtask.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating subtask:', error);
    throw new Error(error.message);
  }
  
  return data as SubTask;
};

// Delete subtask
export const deleteSubtask = async (subtaskId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to delete subtasks');
  
  // RLS will ensure user can only delete their own subtasks
  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', subtaskId);
  
  if (error) {
    console.error('Error deleting subtask:', error);
    throw new Error(error.message);
  }
};
