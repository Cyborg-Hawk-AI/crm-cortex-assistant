
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

export const assignConversationToProject = async (conversationId: string, projectId: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('User not authenticated, cannot assign conversation to project');
      return false;
    }
    
    console.log(`API: Assigning conversation ${conversationId} to project ${projectId || 'Open Chats'}`);
    
    // Don't make an unnecessary update if the project is already set correctly
    const { data: conversation, error: checkError } = await supabase
      .from('conversations')
      .select('project_id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      console.error('Error checking conversation project:', checkError);
      return false;
    }
    
    if (conversation && conversation.project_id === projectId) {
      console.log(`Conversation ${conversationId} is already in project ${projectId}, skipping update`);
      return true;
    }
    
    // Update the conversation with the project ID
    const { error } = await supabase
      .from('conversations')
      .update({ 
        project_id: projectId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error assigning conversation to project:', error);
      return false;
    }
    
    console.log(`✅ Successfully assigned conversation ${conversationId} to project ${projectId || 'Open Chats'}`);
    return true;
  } catch (error) {
    console.error('Unexpected error in assignConversationToProject:', error);
    return false;
  }
};

export const createConversation = async (title: string, projectId?: string): Promise<{id: string}> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`API: Creating conversation titled "${title}" in project ${projectId || 'Open Chats'}`);
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title: title,
      project_id: projectId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }

  if (!data) {
    throw new Error('No data returned from conversation creation');
  }

  console.log(`API: Created conversation with ID ${data.id} in project ${projectId || 'Open Chats'}`);
  return data;
};

// Get all conversations for the current user
export const getConversations = async (): Promise<any[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching conversations:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Get a specific conversation by ID
export const getConversation = async (id: string): Promise<any> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching conversation:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Update a conversation
export const updateConversationTitle = async (id: string, title: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('conversations')
    .update({ 
      title: title,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating conversation:', error);
    return false;
  }
  
  return true;
};

// Delete a conversation
export const deleteConversation = async (id: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
  
  return true;
};

// Get all messages for a specific conversation
export const getMessages = async (conversationId: string): Promise<any[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Fix: Remove the non-existent user_id filter from the query
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Send a message to a conversation
export const sendMessage = async (conversationId: string, content: string, sender: 'user' | 'assistant' | 'system', messageId?: string): Promise<any> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Fix: Adjust the fields to match the actual database schema
  const { data, error } = await supabase
    .from('messages')
    .insert({
      id: messageId,
      conversation_id: conversationId,
      content: content,
      role: sender, // Use 'role' instead of 'sender'
      created_at: new Date().toISOString(),
      is_system: sender === 'system'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error sending message:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Delete all messages for a specific conversation
export const deleteConversationMessages = async (conversationId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Fix: Remove the non-existent user_id filter from the query
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);
  
  if (error) {
    console.error('Error deleting messages:', error);
    return false;
  }
  
  return true;
};

// Switch the assistant for a conversation
export const switchAssistant = async (conversationId: string, assistant: any): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('conversations')
    .update({ 
      assistant_id: assistant.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error switching assistant:', error);
    return false;
  }
  
  return true;
};

// Link a task to a conversation
export const linkTaskToConversation = async (conversationId: string, task: any): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('conversations')
    .update({ 
      task_id: task.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error linking task:', error);
    return false;
  }
  
  return true;
};
