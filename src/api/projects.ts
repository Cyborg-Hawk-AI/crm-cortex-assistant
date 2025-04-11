
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { ActionProject } from '@/utils/types';

// Get all projects for the current user
export const getProjects = async (): Promise<ActionProject[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('action_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Create a new project
export const createProject = async (name: string, description?: string): Promise<ActionProject> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('action_projects')
    .insert({
      user_id: userId,
      name,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Update a project
export const updateProject = async (id: string, updates: { name?: string; description?: string }): Promise<ActionProject> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('action_projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Delete a project
export const deleteProject = async (id: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Verify the user has access to this project
  const { data: project, error: projectError } = await supabase
    .from('action_projects')
    .select()
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (projectError) {
    console.error('Error fetching project:', projectError);
    return false;
  }

  // Update conversations to remove this project_id
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ project_id: null })
    .eq('project_id', id);

  if (updateError) {
    console.error('Error updating conversations:', updateError);
    return false;
  }

  // Delete the project
  const { error } = await supabase
    .from('action_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
};

// Get conversations for a specific project
export const getConversationsByProject = async (projectId: string): Promise<any[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // First verify the user has access to this project
  const { data: project, error: projectError } = await supabase
    .from('action_projects')
    .select()
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (projectError) {
    console.error('Error fetching project:', projectError);
    throw new Error(projectError.message);
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching conversations for project:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Assign a conversation to a project
export const assignConversationToProject = async (conversationId: string, projectId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Verify the user has access to this conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select()
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convError) {
    console.error('Error fetching conversation:', convError);
    return false;
  }

  // Verify the user has access to this project
  if (projectId !== null) {
    const { data: project, error: projectError } = await supabase
      .from('action_projects')
      .select()
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return false;
    }
  }

  // Update the conversation
  const { error } = await supabase
    .from('conversations')
    .update({ 
      project_id: projectId,
      updated_at: new Date().toISOString() 
    })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error assigning conversation to project:', error);
    return false;
  }

  return true;
};
