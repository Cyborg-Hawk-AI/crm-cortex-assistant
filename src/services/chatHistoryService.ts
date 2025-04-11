
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

// Additional chatHistoryService methods can go here

