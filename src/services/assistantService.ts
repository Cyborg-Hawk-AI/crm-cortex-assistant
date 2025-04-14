import { v4 as uuidv4 } from 'uuid';
import * as openaiClient from './openaiClient';
import * as chatHistoryService from './chatHistoryService';
import { Assistant, Task, Message } from '@/utils/types';
import { supabase } from '@/lib/supabase';
import { getAssistantConfigById, ASSISTANTS } from '@/utils/assistantConfig';
import { StreamingCallbacks, StreamingResponse } from '@/utils/streamTypes';

// Get the OpenAI API key from openaiClient
const getOpenAIApiKey = async (): Promise<string> => {
  return openaiClient.getOpenAIApiKey();
};

// Helper function to convert Message[] to the format expected by chatHistoryService
const convertMessagesToChatMessages = (messages: Message[], conversationId: string): any[] => {
  return messages.map(msg => ({
    id: msg.id,
    conversation_id: conversationId,
    content: msg.content,
    sender: msg.sender,
    timestamp: msg.timestamp,
    assistant_id: null,
    metadata: null,
    isSystem: msg.isSystem || false
  }));
};

// Send a message to an assistant and get a response with streaming support
export const sendMessage = async (
  content: string, 
  assistant: Assistant | null, 
  openAiThreadId?: string | null,
  task?: Task | null,
  existingMessages: Message[] = [],
  callbacks?: StreamingCallbacks,
  tempMessageId?: string
): Promise<StreamingResponse> => {
  try {
    // Get OpenAI API key
    const apiKey = await getOpenAIApiKey();
    
    // Get default assistant ID if one isn't provided
    const assistantId = assistant?.id || await openaiClient.ensureDefaultAssistantExists();
    
    if (!assistantId) {
      throw new Error('Failed to get a valid assistant ID');
    }
    
    // Get the assistant configuration based on the assistant ID
    const assistantConfig = getAssistantConfigById(assistantId);
    
    console.log(`assistantService: Using assistant ID ${assistantId} (${assistantConfig.name})`);
    
    // Step 1: Get or create a conversation in our database
    const conversation = await chatHistoryService.getOrCreateConversationThread(
      assistant?.name ? `Conversation with ${assistant.name}` : 'New conversation',
      openAiThreadId,
      task?.id,
      assistantId
    );

    console.log(`assistantService: Using conversation ${conversation.id}`);

    // Step 2: Add user message to the thread only, database save handled separately
    console.log(`Processing user message for conversation ${conversation.id}`);

    // Step 3: Get or create an OpenAI thread
    let threadId = conversation.open_ai_thread_id;
    if (!threadId) {
      // No thread ID exists, create a new one
      threadId = await openaiClient.createThread(apiKey);
      if (!threadId) {
        throw new Error('Failed to create OpenAI thread');
      }
      
      // Update our conversation with the new thread ID
      await chatHistoryService.updateConversation(conversation.id, {
        open_ai_thread_id: threadId
      });
      
      console.log(`Created new thread ${threadId} for conversation ${conversation.id}`);
    } else {
      console.log(`Using existing thread ${threadId} for conversation ${conversation.id}`);
    }

    // Step 4: Process the conversation history for context
    console.log(`Using ${existingMessages.length} messages for context`);
    
    // Convert the existing messages to the format expected by chatHistoryService
    const messagesForContext = convertMessagesToChatMessages(existingMessages, conversation.id);
    
    // Format the history for context
    const historyForContext = chatHistoryService.formatHistoryForContext(messagesForContext);
    
    // Create a properly formatted prompt with the assistant's prompt and context
    const formattedPrompt = `
${assistantConfig.prompt}

${assistantConfig.contextPrompt}

Conversation History:
${historyForContext}

Current Query: ${content}
`;

    console.log(`Using assistant ${assistantId} (${assistantConfig.name}) with customized prompt`);
    
    // Step 5: Format the conversation history for OpenAI
    const messagesForOpenAI = existingMessages
      .filter(msg => msg.sender !== 'system') // Filter out system messages
      .map(msg => {
        return {
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        };
      });
    
    console.log(`Using ${messagesForOpenAI.length} formatted messages for OpenAI with assistant ${assistantId}`);
    
    // Step 6: Check if we need to clear the thread first (for threads with too much history)
    // This is important for handling long conversations that might exceed token limits
    const threadMessages = await openaiClient.getThreadMessages(threadId, apiKey);
    console.log(`Thread ${threadId} has ${threadMessages.length} messages`);
    
    // Before adding new messages, ensure the thread is properly synced with our conversation history
    if (threadMessages.length === 0) {
      // If thread is empty (new thread), add all conversation history
      console.log("New thread detected, adding full conversation history");
      if (messagesForOpenAI.length > 0) {
        await openaiClient.addMessagesToThread(threadId, messagesForOpenAI, apiKey);
      }
    } else if (threadMessages.length > 50) {
      // Thread has too many messages, clear it and re-add recent history
      console.log("Thread has many messages, clearing and re-adding recent history");
      await openaiClient.clearThreadMessages(threadId, apiKey);
      
      // Re-add only the most recent 30 messages to keep context but stay within limits
      const recentMessages = messagesForOpenAI.slice(-30);
      if (recentMessages.length > 0) {
        await openaiClient.addMessagesToThread(threadId, recentMessages, apiKey);
      }
    } else if (messagesForOpenAI.length > threadMessages.length) {
      // If our history has more messages than the thread, we might need to add missing ones
      console.log("Checking for missing messages in thread history");
      
      // Get the messages in the thread
      const threadMsgContents = threadMessages.map(msg => msg.content).join("");
      
      // Find messages that might not be in the thread
      const messagesToAdd = messagesForOpenAI.filter(msg => {
        // Simple heuristic: if the thread doesn't contain this content, it's probably missing
        return !threadMsgContents.includes(msg.content);
      });
      
      // Add any missing messages
      if (messagesToAdd.length > 0) {
        console.log(`Adding ${messagesToAdd.length} missing messages to thread`);
        await openaiClient.addMessagesToThread(threadId, messagesToAdd, apiKey);
      }
    }
    
    // Now add the current user message
    await openaiClient.addMessageToThread(threadId, content, apiKey, 'user');

    // Step 7: Prepare instructions for the assistant run
    let instructions = assistantConfig.contextPrompt;
    if (task) {
      instructions += `\n\nThis conversation is about the following task: ${task.title}. Priority: ${task.priority}. Status: ${task.status}.`;
      if (task.description) {
        instructions += ` Description: ${task.description}`;
      }
    }

    // Add additional context instructions
    if (assistant && assistant.name === 'Technical Summarizer') {
      instructions += " Please provide a technical summary of the entire conversation history, focusing on key technical details, decisions, and conclusions.";
      console.log("Using Technical Summarizer assistant with special instructions");
    } else {
      instructions += " Please review the full conversation history to maintain context. The most recent user query is: " + content;
    }

    // Step 8: Run the assistant on the thread
    console.log(`Running assistant ${assistantId} on thread ${threadId}`);
    const runId = await openaiClient.runAssistant(threadId, assistantId, apiKey, instructions);
    if (!runId) {
      throw new Error('Failed to run assistant');
    }

    // We'll only create ONE message in the database that will be updated with streaming content
    let messageId = tempMessageId || uuidv4(); // Use the provided temp ID or generate a new one
    let dbMessageCreated = false;

    // If we have callbacks for streaming, start streaming
    if (callbacks) {
      let finalResponse = "";
      
      // Set up callbacks for streaming
      const streamingCallbacks: StreamingCallbacks = {
        onStart: () => {
          console.log("Streaming started");
          callbacks.onStart();
        },
        
        onChunk: async (chunk: string) => {
          // Make sure we're receiving valid content
          if (!chunk || typeof chunk !== 'string') {
            console.warn("Received empty chunk, ignoring");
            return;
          }
          
          finalResponse = chunk; // Overwrite with latest chunk (entire response so far)
          console.log(`Received chunk of length: ${chunk.length}`);
          
          // Send chunk to UI immediately
          callbacks.onChunk(chunk);
          
          // Only save to database on completion to avoid duplicates
        },
        
        onComplete: async (fullResponse: string) => {
          // Ensure we have valid content
          if (!fullResponse || fullResponse.trim() === '') {
            console.warn("Received empty final response, using fallback");
            fullResponse = "I processed your request but couldn't generate a complete response.";
          }
          
          finalResponse = fullResponse;
          console.log(`Stream complete. Final response length: ${finalResponse.length}`);
          
          // Send final content to UI
          callbacks.onComplete(finalResponse);
          
          // We deliberately don't save to the database here - that's handled separately
          // to avoid duplicate messages
        },
        
        onError: (error) => {
          console.error("Streaming error:", error);
          callbacks.onError(error);
        }
      };
      
      // Start the streaming process
      openaiClient.streamRunResponse(
        threadId,
        runId,
        streamingCallbacks,
        apiKey
      );
      
      // Return immediately with the conversation details
      return {
        success: true,
        conversationId: conversation.id,
        threadId,
        isComplete: false
      };
    } else {
      // Non-streaming fallback (legacy method)
      return new Promise((resolve, reject) => {
        let assistantResponse = '';

        openaiClient.streamRunResponse(
          threadId!,
          runId,
          {
            onStart: () => {
              console.log("Response generation started");
            },
            onChunk: async (content: string) => {
              assistantResponse = content; // Overwrite with latest
            },
            onComplete: async (fullResponse: string) => {
              if (!fullResponse || fullResponse.trim() === '') {
                console.warn("Received empty final response, using fallback");
                fullResponse = "I processed your request but couldn't generate a complete response.";
              }
              
              assistantResponse = fullResponse;
              console.log(`Response complete. Length: ${assistantResponse.length}`);

              resolve({
                success: true,
                content: assistantResponse,
                conversationId: conversation.id,
                threadId,
                isComplete: true
              });
            },
            onError: (error) => {
              console.error('Error in assistant response:', error);
              
              reject({
                success: false,
                error: error.message || 'Failed to get assistant response',
                conversationId: conversation.id,
                threadId,
                isComplete: true
              });
            }
          },
          apiKey
        );
      });
    }
  } catch (error: any) {
    console.error('Error in sendMessage:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      conversationId: '',
      isComplete: true
    };
  }
};

// Get existing conversation thread if available for this task/assistant combination
export const getExistingThread = async (
  taskId?: string | null,
  assistantId?: string | null
): Promise<{ conversationId: string; threadId: string | null } | null> => {
  try {
    const conversations = await chatHistoryService.getConversations();
    
    // Filter for conversations matching the criteria
    let filteredConversations = conversations;
    
    if (taskId) {
      filteredConversations = filteredConversations.filter(c => c.task_id === taskId);
    }
    
    // Filter by assistant ID if provided, otherwise any conversation is fine
    if (assistantId) {
      filteredConversations = filteredConversations.filter(c => 
        c.assistant_id === assistantId
      );
    }
    
    // Sort by most recently updated
    filteredConversations.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    // Return the most recently updated conversation if any
    if (filteredConversations.length > 0) {
      return {
        conversationId: filteredConversations[0].id,
        threadId: filteredConversations[0].open_ai_thread_id
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting existing thread:', error);
    return null;
  }
};

// Switch assistant for an existing conversation
export const switchAssistant = async (
  conversationId: string,
  newAssistant: Assistant
): Promise<boolean> => {
  try {
    if (!newAssistant.id) {
      throw new Error('Assistant ID is required');
    }
    
    const updated = await chatHistoryService.updateConversation(conversationId, {
      assistant_id: newAssistant.id,
      title: `Conversation with ${newAssistant.name}`
    });
    
    return !!updated;
  } catch (error) {
    console.error('Error switching assistant:', error);
    return false;
  }
};

// Link a task to an existing conversation
export const linkTaskToConversation = async (
  conversationId: string,
  task: Task
): Promise<boolean> => {
  try {
    const updated = await chatHistoryService.updateConversation(conversationId, {
      task_id: task.id
    });
    
    if (updated) {
      // Get the assistant ID from the conversation
      const assistantId = updated.assistant_id || await openaiClient.ensureDefaultAssistantExists();
      
      // Add a system message about the task being linked
      await chatHistoryService.addMessageToConversation(
        conversationId,
        `Task linked: ${task.title} (${task.status}, ${task.priority})`,
        'system',
        assistantId // Use the assistant ID from the conversation
      );
    }
    
    return !!updated;
  } catch (error) {
    console.error('Error linking task to conversation:', error);
    return false;
  }
};

// Get conversation history for UI display
export const getConversationHistory = async (conversationId: string) => {
  return chatHistoryService.getConversationMessages(conversationId);
};
