
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Update a conversation with new properties
 */
export const updateConversation = async (
  conversationId: string, 
  updates: { 
    assistant_id?: string;
    task_id?: string;
    title?: string;
    open_ai_thread_id?: string;
    project_id?: string;
  }
) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`Updating conversation ${conversationId} with:`, updates);
  
  // Verify user has access to this conversation
  const { data: conversation, error: fetchError } = await supabase
    .from('conversations')
    .select()
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();
    
  if (fetchError) {
    console.error('Error fetching conversation:', fetchError);
    throw new Error(fetchError.message);
  }

  // Update the conversation
  const { data, error } = await supabase
    .from('conversations')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating conversation:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Get or create a conversation thread
 */
export const getOrCreateConversationThread = async (
  title: string,
  openAiThreadId?: string | null,
  taskId?: string | null,
  assistantId?: string | null,
  projectId?: string | null
) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // If we have a thread ID, try to find the associated conversation
  if (openAiThreadId) {
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select()
      .eq('open_ai_thread_id', openAiThreadId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (!fetchError && existingConversation) {
      console.log(`Found existing conversation for thread ${openAiThreadId}:`, existingConversation.id);
      return existingConversation;
    }
  }

  // Create a new conversation
  const conversationId = uuidv4();
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      id: conversationId,
      user_id: userId,
      title,
      task_id: taskId || null,
      assistant_id: assistantId || null,
      open_ai_thread_id: openAiThreadId || null,
      project_id: projectId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error(error.message);
  }
  
  console.log(`Created new conversation:`, data.id);
  return data;
};

/**
 * Format chat history for context
 */
export const formatHistoryForContext = (messages: any[]) => {
  if (!messages || messages.length === 0) {
    return "No previous conversation.";
  }
  
  return messages
    .filter(msg => !msg.isSystem) // Filter out system messages
    .map(msg => {
      const role = msg.sender === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');
};

/**
 * Get all conversations for the user
 */
export const getConversations = async () => {
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
  
  return data || [];
};

/**
 * Add a message to a conversation
 */
export const addMessageToConversation = async (
  conversationId: string, 
  content: string, 
  sender: 'user' | 'assistant' | 'system' = 'user',
  assistantId?: string | null
) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Verify the user has access to this conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select()
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();
    
    if (convError) {
      console.error('Error fetching conversation:', convError);
      throw new Error(convError.message);
    }

    // Create the message
    const messageData = {
      id: uuidv4(),
      conversation_id: conversationId,
      assistant_id: assistantId || conversation.assistant_id || null,
      user_id: userId,
      content,
      sender,
      timestamp: new Date().toISOString(),
      is_system: sender === 'system'
    };
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding message to conversation:', error);
      throw new Error(error.message);
    }
    
    // Update the conversation's last_updated timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    return {
      id: data.id,
      content: data.content,
      sender: data.sender,
      timestamp: new Date(data.timestamp),
      isSystem: data.is_system || false,
      conversation_id: data.conversation_id,
      user_id: data.user_id
    };
  } catch (err) {
    console.error('Error in addMessageToConversation:', err);
    throw err;
  }
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (conversationId: string) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // First verify the user has access to this conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select()
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();
  
  if (convError) {
    console.error('Error fetching conversation:', convError);
    throw new Error(convError.message);
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    throw new Error(error.message);
  }
  
  return data.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender,
    timestamp: new Date(msg.timestamp),
    isSystem: msg.is_system || false,
    conversation_id: msg.conversation_id,
    user_id: msg.user_id
  }));
};
