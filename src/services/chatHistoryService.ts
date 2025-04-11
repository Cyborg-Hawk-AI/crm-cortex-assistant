
import { supabase, getCurrentUserId } from '@/lib/supabase';

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
    project_id?: string; // Add project_id to the updates type
    model_provider?: string; // Add model_provider to store user model selection
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
  title?: string,
  openAiThreadId?: string | null,
  taskId?: string | null,
  assistantId?: string | null,
  projectId?: string | null,
  modelProvider: string = 'openai' // Default to OpenAI as the provider
) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // If we have a thread ID, try to find the conversation
  if (openAiThreadId) {
    const { data, error } = await supabase
      .from('conversations')
      .select()
      .eq('open_ai_thread_id', openAiThreadId)
      .eq('user_id', userId)
      .single();
      
    if (!error && data) {
      return data;
    }
  }
  
  // Create a new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      title: title || 'New conversation',
      user_id: userId,
      open_ai_thread_id: openAiThreadId || null,
      task_id: taskId || null,
      assistant_id: assistantId || null,
      project_id: projectId || null,
      model_provider: modelProvider
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Format conversation history for context
 */
export const formatHistoryForContext = (messages: any[]): string => {
  // Filter out system messages
  const userAssistantMessages = messages.filter(msg => msg.sender !== 'system');
  
  // Sort by timestamp
  userAssistantMessages.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return dateA - dateB;
  });
  
  // Format into a string
  return userAssistantMessages.map(msg => {
    const role = msg.sender === 'user' ? 'User' : 'Assistant';
    return `${role}: ${msg.content}`;
  }).join('\n\n');
};

/**
 * Add a message to a conversation
 */
export const addMessageToConversation = async (
  conversationId: string,
  content: string,
  sender: 'user' | 'assistant' | 'system',
  assistantId?: string | null
) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      content,
      sender,
      user_id: userId,
      assistant_id: assistantId || null,
      timestamp: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error adding message to conversation:', error);
    throw new Error(error.message);
  }
  
  return data;
};

/**
 * Get all conversations
 */
export const getConversations = async () => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('conversations')
    .select()
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching conversations:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

/**
 * Get messages for a conversation
 */
export const getConversationMessages = async (conversationId: string) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('messages')
    .select()
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .order('timestamp', { ascending: true });
    
  if (error) {
    console.error('Error fetching conversation messages:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

// Additional chatHistoryService methods can go here
