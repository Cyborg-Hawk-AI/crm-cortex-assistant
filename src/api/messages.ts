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
  
  return data;
};

// Create a new conversation
export const createConversation = async (title?: string) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`Creating new conversation with title: ${title || 'New conversation'}`);

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      id: uuidv4(),
      user_id: userId,
      title: title || 'New conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // project_id is null by default, placing it in "Open Chats" group
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

  // Delete all messages in the conversation
  const { error: messagesError } = await supabase
    .from('chat_messages')
    .delete()
    .eq('conversation_id', conversationId);

  if (messagesError) {
    console.error('Error deleting messages:', messagesError);
    return false;
  }

  // Delete the conversation
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
  timeWindow: number = 5000 // 5 seconds window
): Promise<boolean> => {
  try {
    // Get the current time and the time 5 seconds ago
    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - timeWindow);
    
    // Format for Supabase timestamp comparison
    const nowIso = now.toISOString();
    const fiveSecondsAgoIso = fiveSecondsAgo.toISOString();
    
    // Check for similar messages in the last 5 seconds
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
  // First check if the message exists
  const exists = await checkMessageExists(id);
  if (!exists) {
    console.error(`Message with ID ${id} does not exist, cannot update`);
    return null;
  }
  
  // Update the message
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
  
  console.log(`Retrieved ${data.length} messages from database`);
  
  return data.map(msg => ({
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
  messageId?: string // Optional message ID for deduplication
): Promise<Message> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  console.log(`Saving ${sender} message to conversation ${conversationId}`);

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

  // Generate or use provided message ID
  const id = messageId || uuidv4();
  
  // Check for duplicate by ID or similarity
  if (messageId) {
    const exists = await checkMessageExists(messageId);
    if (exists) {
      console.log(`Message ${messageId} already exists, updating content instead`);
      const updatedMessage = await updateMessageContent(messageId, content);
      if (updatedMessage) {
        // Only update conversation timestamp on content updates
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
          
        return updatedMessage;
      }
    }
  } else {
    // If we don't have a specific ID, check for similar messages to prevent duplicates
    const similarExists = await checkSimilarMessageExists(conversationId, sender, content);
    if (similarExists) {
      console.log(`Similar message already exists in conversation, skipping save`);
      // Return a dummy message to avoid disrupting the flow, but don't save it
      return {
        id: uuidv4(), // Generate a temporary ID for the UI
        content,
        sender,
        timestamp: new Date(),
        isSystem: sender === 'system'
      } as Message;
    }
  }

  // Create the message
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
  
  // Update the conversation's last_updated timestamp
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

  // Delete all messages from this conversation
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

  // If projectId is empty string, treat as moving to "Open Chats"
  const finalProjectId = projectId === '' ? null : projectId;

  // Verify the user has access to this project if it's not null
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

  // Update the conversation
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

  // Update the conversation title
  const { error } = await supabase
    .from('conversations')
    .update({ 
      title,
      updated_at: new Date().toISOString() 
    })
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating conversation title:', error);
    return false;
  }

  console.log(`Successfully updated conversation ${conversationId} title to "${title}"`);
  return true;
};
