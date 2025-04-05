import { v4 as uuidv4 } from 'uuid';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { Assistant } from '@/utils/types';
import * as openaiClient from './openaiClient';

// Types for chat history data
interface ChatMessage {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: Date;
  assistant_id?: string | null;
  metadata?: any;
}

interface Conversation {
  id: string;
  title: string;
  user_id: string;
  task_id?: string | null;
  assistant_id?: string | null;
  open_ai_thread_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Get conversation by OpenAI thread ID
export const getConversationByThreadId = async (threadId: string): Promise<Conversation | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('open_ai_thread_id', threadId)
      .single();

    if (error) {
      console.error('Error fetching conversation by thread ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getConversationByThreadId:', error);
    return null;
  }
};

// Get or create a conversation thread for the current user
export const getOrCreateConversationThread = async (
  title?: string,
  openAiThreadId?: string | null,
  taskId?: string | null,
  assistantId?: string | null
): Promise<Conversation> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Ensure we have a valid assistant_id (use default if not provided)
  const finalAssistantId = assistantId || await openaiClient.ensureDefaultAssistantExists();
  
  if (!finalAssistantId) {
    throw new Error('Failed to get a valid assistant ID');
  }

  // Check if the conversation table has the necessary columns
  try {
    // First check if user already has an active conversation
    let conversation: Conversation | null = null;
    
    // Try to get the most recent active conversation
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      conversation = data[0];
      
      // Update the existing conversation if needed
      let updates: any = {
        updated_at: new Date().toISOString()
      };
      
      if (openAiThreadId && !conversation.open_ai_thread_id) {
        try {
          updates.open_ai_thread_id = openAiThreadId;
        } catch (err) {
          console.warn('Could not update open_ai_thread_id, it might not exist in the schema');
        }
      }
      
      if (!conversation.assistant_id && finalAssistantId) {
        try {
          updates.assistant_id = finalAssistantId;
        } catch (err) {
          console.warn('Could not update assistant_id, it might not exist in the schema');
        }
      }
      
      // Only update if we have changes
      if (Object.keys(updates).length > 1) {
        try {
          const { data: updatedData } = await supabase
            .from('conversations')
            .update(updates)
            .eq('id', conversation.id)
            .select()
            .single();
            
          if (updatedData) {
            conversation = updatedData;
          }
        } catch (updateError) {
          console.warn('Error updating conversation:', updateError);
        }
      }
    } else {
      // Create a new conversation
      const newConversation: any = {
        id: uuidv4(),
        user_id: userId,
        title: title || 'New conversation',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Conditionally add fields that might not exist in the schema
      try {
        newConversation.task_id = taskId || null;
      } catch (err) {
        console.warn('Could not set task_id, it might not exist in the schema');
      }
      
      try {
        newConversation.assistant_id = finalAssistantId;
      } catch (err) {
        console.warn('Could not set assistant_id, it might not exist in the schema');
      }
      
      try {
        newConversation.open_ai_thread_id = openAiThreadId || null;
      } catch (err) {
        console.warn('Could not set open_ai_thread_id, it might not exist in the schema');
      }

      const { data: newData, error: newError } = await supabase
        .from('conversations')
        .insert(newConversation)
        .select()
        .single();

      if (newError) {
        console.error('Error creating conversation:', newError);
        throw new Error(`Failed to create conversation: ${newError.message}`);
      }

      conversation = newData;
    }

    return conversation;
  } catch (error) {
    console.error('Error in getOrCreateConversationThread:', error);
    // Create a minimal conversation object if all else fails
    return {
      id: uuidv4(),
      user_id: userId,
      title: title || 'New conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assistant_id: finalAssistantId,
      task_id: taskId || null,
      open_ai_thread_id: openAiThreadId || null
    };
  }
};

// Update conversation with assistant ID and/or task ID
export const updateConversation = async (
  conversationId: string,
  updates: {
    assistant_id?: string | null;
    task_id?: string | null;
    title?: string;
    open_ai_thread_id?: string | null;
  }
): Promise<Conversation | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // If assistant_id is explicitly set to null, use the default assistant ID
  if (updates.assistant_id === null) {
    updates.assistant_id = await openaiClient.ensureDefaultAssistantExists();
  }

  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateConversation:', error);
    return null;
  }
};

// Get conversation messages
export const getConversationMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
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
      conversation_id: msg.conversation_id,
      content: msg.content,
      sender: msg.sender,
      timestamp: new Date(msg.timestamp),
      assistant_id: msg.assistant_id,
      metadata: msg.metadata
    }));
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return [];
  }
};

// Add a message to the conversation
export const addMessageToConversation = async (
  conversationId: string,
  content: string,
  sender: 'user' | 'assistant' | 'system' = 'user',
  assistantId?: string | null,
  metadata?: any
): Promise<ChatMessage> => {
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

    // Ensure we have a valid assistant_id
    let finalAssistantId = assistantId;
    if (!finalAssistantId) {
      // If not provided, use the one from the conversation
      finalAssistantId = conversation.assistant_id;
      
      // If conversation doesn't have one, use the default
      if (!finalAssistantId) {
        finalAssistantId = await openaiClient.ensureDefaultAssistantExists();
      }
    }

    // Create the message
    const messageData: any = {
      id: uuidv4(),
      conversation_id: conversationId,
      content,
      sender,
      user_id: userId,
      timestamp: new Date().toISOString(),
      is_system: sender === 'system'
    };
    
    // Add optional fields
    if (finalAssistantId) {
      try {
        messageData.assistant_id = finalAssistantId;
      } catch (err) {
        console.warn('Could not set assistant_id, it might not exist in the schema');
      }
    }
    
    if (metadata) {
      try {
        messageData.metadata = metadata;
      } catch (err) {
        console.warn('Could not set metadata, it might not exist in the schema');
      }
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error adding message:', error);
      throw new Error(error.message);
    }

    // Update the conversation's last_updated timestamp
    try {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    } catch (updateError) {
      console.warn('Error updating conversation timestamp:', updateError);
    }

    return {
      id: data.id,
      conversation_id: data.conversation_id,
      content: data.content,
      sender: data.sender,
      timestamp: new Date(data.timestamp),
      assistant_id: data.assistant_id,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Error in addMessageToConversation:', error);
    
    // Return a minimal message object if all else fails - we'll try to save it later
    return {
      id: uuidv4(),
      conversation_id: conversationId,
      content,
      sender,
      timestamp: new Date(),
      assistant_id: assistantId
    };
  }
};

// Update a message's content (used for streaming updates)
export const updateMessageContent = async (
  messageId: string,
  content: string
): Promise<ChatMessage | null> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // First get the message to make sure it exists
    const { data: existingMessage, error: getError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('id', messageId)
      .single();
      
    if (getError) {
      console.error('Message not found:', getError);
      throw new Error('Message not found: ' + getError.message);
    }
    
    // Update just the content field
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ content })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message content:', error);
      throw new Error('Error updating message: ' + error.message);
    }

    return {
      id: data.id,
      conversation_id: data.conversation_id,
      content: data.content,
      sender: data.sender,
      timestamp: new Date(data.timestamp),
      assistant_id: data.assistant_id,
      metadata: data.metadata
    };
  } catch (error) {
    console.error('Error in updateMessageContent:', error);
    throw error;
  }
};

// Format conversation history for context
export const formatHistoryForContext = (messages: ChatMessage[], limit: number = 20): string => {
  // Get the most recent messages up to the limit
  const recentMessages = [...messages].slice(-limit);
  
  // Format them into a context string
  return recentMessages.map(msg => {
    const role = msg.sender === 'assistant' ? 'Assistant' : msg.sender === 'user' ? 'User' : 'System';
    return `${role}: ${msg.content}`;
  }).join('\n\n');
};

// Format conversation history for OpenAI API
export const formatHistoryForOpenAI = (messages: ChatMessage[], limit: number = 20): { role: string, content: string }[] => {
  // Make sure we have messages
  if (!messages || messages.length === 0) {
    console.warn('No messages to format for OpenAI');
    return [];
  }
  
  // Filter out system messages and get the most recent messages up to the limit
  const recentMessages = messages
    .filter(msg => msg.sender !== 'system') // OpenAI only accepts 'user' and 'assistant' roles
    .slice(-limit);
  
  console.log(`Formatting ${recentMessages.length} messages for OpenAI out of ${messages.length} total`);
  
  // Format them into OpenAI message format
  return recentMessages.map(msg => {
    // Map our sender types to OpenAI roles (system messages have been filtered out)
    const role = msg.sender === 'assistant' ? 'assistant' : 'user';
    
    return {
      role,
      content: msg.content
    };
  });
};

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
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

// Delete all conversations and messages for the current user
export const deleteAllConversations = async (): Promise<boolean> => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // First get all user's conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    if (convError) {
      console.error('Error fetching conversations:', convError);
      return false;
    }

    const conversationIds = conversations.map(conv => conv.id);
    
    // If there are no conversations, we're done
    if (conversationIds.length === 0) {
      return true;
    }

    // Delete all messages from these conversations
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .in('conversation_id', conversationIds);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return false;
    }

    // Delete all the conversations
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .in('id', conversationIds);

    if (deleteError) {
      console.error('Error deleting conversations:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAllConversations:', error);
    return false;
  }
};
