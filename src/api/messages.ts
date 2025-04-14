import { supabase, getCurrentUserId } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/utils/types';

// Fetch conversations for the current user
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
  
  console.log(`Fetched ${data?.length || 0} conversations from the database`);
  return data || [];
};

// Create a new conversation
export const createConversation = async (title?: string, projectId?: string) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`Creating new conversation with title: ${title || 'New conversation'} and project: ${projectId || 'Open Chats'}`);

  const conversationId = uuidv4();
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      id: conversationId,
      user_id: userId,
      title: title || 'New conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: projectId || null
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error(error.message);
  }
  
  console.log('Conversation created:', data);
  return data;
};

// Delete a conversation and all its messages
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

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

  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('conversation_id', conversationId);

  if (messagesError) {
    console.error('Error deleting messages:', messagesError);
    return false;
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }

  return true;
};

// Check if a message already exists by exact ID
export const checkMessageExists = async (id: string): Promise<boolean> => {
  try {
    console.log(`Checking if message with ID ${id} exists`);
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error checking message existence:', error);
      return false;
    }
    
    const exists = count !== null && count > 0;
    console.log(`Message ${id} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('Error in checkMessageExists:', error);
    return false;
  }
};

// Check if a similar message exists (same conversation, sender and timestamp close)
export const checkSimilarMessageExists = async (
  conversationId: string,
  sender: string,
  content: string,
  timeWindow: number = 5000
): Promise<boolean> => {
  try {
    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - timeWindow);
    
    const nowIso = now.toISOString();
    const fiveSecondsAgoIso = fiveSecondsAgo.toISOString();
    
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('sender', sender)
      .eq('content', content)
      .gte('timestamp', fiveSecondsAgoIso)
      .lte('timestamp', nowIso);
    
    if (error) {
      console.error('Error checking similar message existence:', error);
      return false;
    }
    
    const exists = count !== null && count > 0;
    console.log(`Similar message in conversation ${conversationId} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('Error in checkSimilarMessageExists:', error);
    return false;
  }
};

// Update an existing message's content (for streaming)
export const updateMessageContent = async (id: string, content: string): Promise<Message | null> => {
  const exists = await checkMessageExists(id);
  if (!exists) {
    console.error(`Message with ID ${id} does not exist, cannot update`);
    return null;
  }
  
  console.log(`Updating message content for ID ${id}`);
  const { data, error } = await supabase
    .from('chat_messages')
    .update({ content })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating message content:', error);
    return null;
  }
  
  return {
    id: data.id,
    content: data.content,
    sender: data.sender,
    timestamp: new Date(data.timestamp),
    isSystem: data.is_system || false
  } as Message;
};

// Fetch messages for a conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`Fetching messages for conversation: ${conversationId}`);

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
  
  console.log(`Retrieved ${data?.length || 0} messages from database`);
  
  return (data || []).map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender,
    timestamp: new Date(msg.timestamp),
    isSystem: msg.is_system || false
  })) as Message[];
};

// Send a new message - with deduplication
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  sender: 'user' | 'assistant' | 'system' = 'user',
  messageId?: string
): Promise<Message> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`Saving ${sender} message to conversation ${conversationId}`);

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

  const id = messageId || uuidv4();
  
  if (messageId) {
    const exists = await checkMessageExists(messageId);
    if (exists) {
      console.log(`Message ${messageId} already exists, updating content instead`);
      const updatedMessage = await updateMessageContent(messageId, content);
      if (updatedMessage) {
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
          
        return updatedMessage;
      }
    }
  } else {
    const similarExists = await checkSimilarMessageExists(conversationId, sender, content);
    if (similarExists) {
      console.log(`Similar message already exists in conversation, skipping save`);
      return {
        id: uuidv4(),
        content,
        sender,
        timestamp: new Date(),
        isSystem: sender === 'system'
      } as Message;
    }
  }

  const messageData = {
    id,
    conversation_id: conversationId,
    assistant_id: conversation.assistant_id || 'default',
    user_id: userId,
    content,
    sender,
    timestamp: new Date().toISOString(),
    is_system: sender === 'system'
  };
  
  console.log('Saving message to database:', {
    id: messageData.id,
    sender: messageData.sender,
    contentPreview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
  });
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(messageData)
    .select()
    .single();
  
  if (error) {
    console.error('Error sending message:', error);
    throw new Error(error.message);
  }
  
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
  
  console.log('Message saved successfully to database:', data.id);
  
  return {
    id: data.id,
    content: data.content,
    sender: data.sender,
    timestamp: new Date(data.timestamp),
    isSystem: data.is_system || false
  } as Message;
};

// Delete all messages in a conversation
export const deleteConversationMessages = async (conversationId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

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

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('conversation_id', conversationId);

  if (error) {
    console.error('Error deleting messages:', error);
    return false;
  }

  console.log(`Successfully deleted all messages from conversation ${conversationId}`);
  return true;
};

// Update the assignConversationToProject function to handle "Open Chats" case (null project_id)
export const assignConversationToProject = async (conversationId: string, projectId: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

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

  const finalProjectId = projectId === '' ? null : projectId;

  if (finalProjectId !== null) {
    const { data: project, error: projectError } = await supabase
      .from('action_projects')
      .select()
      .eq('id', finalProjectId)
      .eq('user_id', userId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return false;
    }
  }

  const { error } = await supabase
    .from('conversations')
    .update({ 
      project_id: finalProjectId,
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

// Add this new function to update conversation titles
export const updateConversationTitle = async (conversationId: string, title: string): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    console.error('Cannot update title: User not authenticated');
    return false;
  }

  console.log(`API call: Updating conversation ${conversationId} title to "${title}"`);

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select()
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convError) {
    console.error('Error fetching conversation for title update:', convError);
    return false;
  }

  const { error, data } = await supabase
    .from('conversations')
    .update({ 
      title,
      updated_at: new Date().toISOString() 
    })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error updating conversation title in Supabase:', error);
    return false;
  }

  console.log(`Successfully updated conversation ${conversationId} title to "${title}"`, data);
  return true;
};

// Switch assistant for a conversation
export const switchAssistant = async (conversationId: string, assistant: any): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`API: Switching assistant for conversation ${conversationId} to ${assistant.id} (${assistant.name})`);

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convError) {
    console.error('Error fetching conversation:', convError);
    return false;
  }

  console.log(`Found conversation ${conversationId}, updating assistant_id to ${assistant.id}`);

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
    console.error('Error details:', error.details);
    console.error('Error message:', error.message);
    return false;
  }

  console.log(`Successfully updated conversation ${conversationId} with assistant ${assistant.id}`);
  return true;
};

// Link a task to a conversation
export const linkTaskToConversation = async (conversationId: string, task: any): Promise<boolean> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

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

  const { error } = await supabase
    .from('conversations')
    .update({ 
      task_id: task.id,
      updated_at: new Date().toISOString() 
    })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error linking task to conversation:', error);
    return false;
  }

  return true;
};
