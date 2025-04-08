
import { Task, SubTask } from '@/utils/types';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Create a new task in Supabase
export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  // Get current user ID for ownership
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to create tasks');
  
  // Generate a task with default values
  const taskWithDefaults = {
    ...task,
    id: uuidv4(),
    reporter_id: task.reporter_id || userId,
    user_id: task.user_id || userId, // Use provided user_id or default to current user
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

// Get all tasks for the current user
export const getTasks = async (): Promise<Task[]> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to fetch tasks');
  
  // Filter by user_id and only get top-level tasks (where parent_task_id is null)
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId) // Use user_id for filtering
    .is('parent_task_id', null)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.message);
  }
  
  return data as Task[];
};

// Update an existing task - verify ownership via user_id
export const updateTask = async (task: Task): Promise<Task> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to update tasks');
  
  // Verify task belongs to current user
  const { data: existingTask, error: checkError } = await supabase
    .from('tasks')
    .select('user_id')
    .eq('id', task.id)
    .single();
  
  if (checkError || !existingTask) {
    throw new Error('Task not found or access denied');
  }
  
  if (existingTask.user_id !== userId) {
    throw new Error('You do not have permission to update this task');
  }
  
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

// Delete a task - verify ownership via user_id
export const deleteTask = async (taskId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to delete tasks');
  
  // Verify task belongs to current user
  const { data: existingTask, error: checkError } = await supabase
    .from('tasks')
    .select('user_id')
    .eq('id', taskId)
    .single();
  
  if (checkError || !existingTask) {
    throw new Error('Task not found or access denied');
  }
  
  if (existingTask.user_id !== userId) {
    throw new Error('You do not have permission to delete this task');
  }
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  if (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.message);
  }
};

// Create subtask with parent_task_id and user_id
export const createSubtask = async (subtask: Omit<SubTask, 'id'>): Promise<SubTask> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to create subtasks');
  
  const subtaskWithDefaults = {
    ...subtask,
    id: uuidv4(),
    user_id: subtask.user_id || userId, // Use provided user_id or default to current user
    created_by: subtask.created_by || userId,
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

// Get subtasks for a task - filter by parent_task_id and user_id
export const getSubtasks = async (taskId: string): Promise<SubTask[]> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to fetch subtasks');
  
  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('parent_task_id', taskId)
    .eq('user_id', userId) // Filter by user_id as well
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching subtasks:', error);
    throw new Error(error.message);
  }
  
  return data as SubTask[];
};

// Update subtask - verify user_id ownership
export const updateSubtask = async (subtask: SubTask): Promise<SubTask> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to update subtasks');
  
  // Verify subtask belongs to current user
  const { data: existingSubtask, error: checkError } = await supabase
    .from('subtasks')
    .select('user_id')
    .eq('id', subtask.id)
    .single();
  
  if (checkError || !existingSubtask) {
    throw new Error('Subtask not found');
  }
  
  if (existingSubtask.user_id !== userId) {
    throw new Error('You do not have permission to update this subtask');
  }
  
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

// Delete subtask - verify user_id ownership
export const deleteSubtask = async (subtaskId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User must be authenticated to delete subtasks');
  
  // Verify subtask belongs to current user
  const { data: subtask, error: getSubtaskError } = await supabase
    .from('subtasks')
    .select('user_id')
    .eq('id', subtaskId)
    .single();
  
  if (getSubtaskError || !subtask) {
    throw new Error('Subtask not found');
  }
  
  if (subtask.user_id !== userId) {
    throw new Error('You do not have permission to delete this subtask');
  }
  
  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', subtaskId);
  
  if (error) {
    console.error('Error deleting subtask:', error);
    throw new Error(error.message);
  }
};
