import { v4 as uuidv4 } from 'uuid';
import * as openaiClient from './openaiClient';
import * as chatHistoryService from './chatHistoryService';
import { Assistant, Task, Message } from '@/utils/types';
import { supabase } from '@/lib/supabase';
import { getAssistantConfigById, ASSISTANTS } from '@/utils/assistantConfig';
import { StreamingCallbacks, StreamingResponse } from '@/utils/streamTypes';
import { formatTaskContext, TaskContextDetailLevel, logTaskContext } from '@/utils/taskContextFormatter';

const getOpenAIApiKey = async (): Promise<string> => {
  return openaiClient.getOpenAIApiKey();
};

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

const formatTaskDetails = (task: Task | null): string => {
  if (!task) return '';
  
  let taskDetails = `
TASK DETAILS:
- Title: ${task.title}
- Status: ${task.status}
- Priority: ${task.priority}
`;

  if (task.description && task.description.trim()) {
    taskDetails += `- Description: ${task.description}\n`;
  }
  
  if (task.due_date) {
    taskDetails += `- Due Date: ${new Date(task.due_date).toLocaleDateString()}\n`;
  }
  
  if (task.assignee_id) {
    taskDetails += `- Assigned To: ${task.assignee_id}\n`;
  }
  
  if (task.parent_task_id) {
    taskDetails += `- Part of Mission: ${task.parent_task_id}\n`;
  }

  taskDetails += `- Last Updated: ${new Date(task.updated_at).toLocaleString()}\n`;
  
  return taskDetails;
};

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
    const apiKey = await getOpenAIApiKey();
    
    const assistantId = assistant?.id || await openaiClient.ensureDefaultAssistantExists();
    
    if (!assistantId) {
      throw new Error('Failed to get a valid assistant ID');
    }
    
    const assistantConfig = getAssistantConfigById(assistantId);
    
    const conversation = await chatHistoryService.getOrCreateConversationThread(
      assistant?.name ? `Conversation with ${assistant.name}` : 'New conversation',
      openAiThreadId,
      task?.id,
      assistantId
    );

    console.log(`Processing user message for conversation ${conversation.id}`);

    let threadId = conversation.open_ai_thread_id;
    if (!threadId) {
      threadId = await openaiClient.createThread(apiKey);
      if (!threadId) {
        throw new Error('Failed to create OpenAI thread');
      }
      
      await chatHistoryService.updateConversation(conversation.id, {
        open_ai_thread_id: threadId
      });
      
      console.log(`Created new thread ${threadId} for conversation ${conversation.id}`);
    } else {
      console.log(`Using existing thread ${threadId} for conversation ${conversation.id}`);
    }

    console.log(`Using ${existingMessages.length} messages for context`);
    
    const messagesForContext = convertMessagesToChatMessages(existingMessages, conversation.id);
    
    const historyForContext = chatHistoryService.formatHistoryForContext(messagesForContext);
    
    // Prepare message history array for OpenAI
    const openAIMessageHistory = [];
    
    // Add task context if available
    let formattedTaskContext = '';
    if (task) {
      formattedTaskContext = formatTaskContext(task, TaskContextDetailLevel.COMPREHENSIVE);
      
      const hasTaskContext = existingMessages.some(msg => 
        msg.isSystem && msg.content.includes(`Task #${task.id.substring(0,8)}`)
      );
      
      if (!hasTaskContext) {
        openAIMessageHistory.unshift({
          role: 'system',
          content: formattedTaskContext
        });
        
        logTaskContext('api-call', conversation.id, task.id, true, formattedTaskContext.length);
      }
      
      const taskReminder = formatTaskContext(task, TaskContextDetailLevel.MINIMAL);
      openAIMessageHistory.push({
        role: 'system',
        content: `Remember: This conversation is about ${taskReminder}`
      });
    }
    
    const formattedPrompt = `
${assistantConfig.prompt}

${assistantConfig.contextPrompt}

${formattedTaskContext ? 'ASSOCIATED TASK INFORMATION:\n' + formattedTaskContext + '\n' : ''}

Conversation History:
${historyForContext}

Current Query: ${content}
`;

    console.log(`Using assistant ${assistantId} (${assistantConfig.name}) with customized prompt`);
    console.log(`Task information included in prompt: ${!!formattedTaskContext}`);
    
    const messagesForOpenAI = [...existingMessages];
    
    if (task && !messagesForOpenAI.some(msg => 
      msg.isSystem && msg.content.includes(`Task linked: ${task.title}`)
    )) {
      messagesForOpenAI.unshift({
        id: uuidv4(),
        content: `This conversation is about the following task:\n${formatTaskDetails(task)}`,
        sender: 'system',
        timestamp: new Date(),
        isSystem: true,
        conversation_id: conversation.id,
        user_id: 'system'
      });
    }
    
    const processedMessagesForOpenAI = messagesForOpenAI
      .filter(msg => msg.sender !== 'system' || (msg.isSystem && task))
      .map(msg => {
        return {
          role: msg.sender === 'user' ? 'user' : 
                msg.sender === 'system' ? 'system' : 'assistant',
          content: msg.content
        };
      });
    
    console.log(`Using ${processedMessagesForOpenAI.length} formatted messages for OpenAI with assistant ${assistantId}`);
    
    const threadMessages = await openaiClient.getThreadMessages(threadId, apiKey);
    console.log(`Thread ${threadId} has ${threadMessages.length}`);
    
    if (threadMessages.length === 0) {
      if (processedMessagesForOpenAI.length > 0) {
        await openaiClient.addMessagesToThread(threadId, processedMessagesForOpenAI, apiKey);
      }
    } else if (threadMessages.length > 50) {
      await openaiClient.clearThreadMessages(threadId, apiKey);
      
      const recentMessages = processedMessagesForOpenAI.slice(-30);
      if (recentMessages.length > 0) {
        await openaiClient.addMessagesToThread(threadId, recentMessages, apiKey);
      }
    } else if (processedMessagesForOpenAI.length > threadMessages.length) {
      const threadMsgContents = threadMessages.map(msg => msg.content).join("");
      
      const messagesToAdd = processedMessagesForOpenAI.filter(msg => {
        return !threadMsgContents.includes(msg.content);
      });
      
      if (messagesToAdd.length > 0) {
        console.log(`Adding ${messagesToAdd.length} missing messages to thread`);
        await openaiClient.addMessagesToThread(threadId, messagesToAdd, apiKey);
      }
    }
    
    await openaiClient.addMessageToThread(threadId, content, apiKey, 'user');

    let instructions = assistantConfig.contextPrompt;
    if (task) {
      instructions += `\n\nThis conversation is about the following task: ${task.title}. Priority: ${task.priority}. Status: ${task.status}.`;
      if (task.description) {
        instructions += ` Description: ${task.description}`;
      }
      instructions += ` Last updated: ${new Date(task.updated_at).toLocaleString()}`;
    }

    if (assistant && assistant.name === 'Technical Summarizer') {
      instructions += " Please provide a technical summary of the entire conversation history, focusing on key technical details, decisions, and conclusions.";
      console.log("Using Technical Summarizer assistant with special instructions");
    } else {
      instructions += " Please review the full conversation history to maintain context. The most recent user query is: " + content;
    }

    console.log(`Running assistant ${assistantId} on thread ${threadId}`);
    const runId = await openaiClient.runAssistant(threadId, assistantId, apiKey, instructions);
    if (!runId) {
      throw new Error('Failed to run assistant');
    }

    let messageId = tempMessageId || uuidv4();
    let dbMessageCreated = false;

    if (callbacks) {
      let finalResponse = "";
      
      const streamingCallbacks: StreamingCallbacks = {
        onStart: () => {
          console.log("Streaming started");
          callbacks.onStart();
        },
        
        onChunk: async (chunk: string) => {
          if (!chunk || typeof chunk !== 'string') {
            console.warn("Received empty chunk, ignoring");
            return;
          }
          
          finalResponse = chunk;
          console.log(`Received chunk of length: ${chunk.length}`);
          
          callbacks.onChunk(chunk);
        },
        
        onComplete: async (fullResponse: string) => {
          if (!fullResponse || fullResponse.trim() === '') {
            console.warn("Received empty final response, using fallback");
            fullResponse = "I processed your request but couldn't generate a complete response.";
          }
          
          finalResponse = fullResponse;
          console.log(`Stream complete. Final response length: ${finalResponse.length}`);
          
          callbacks.onComplete(finalResponse);
        },
        
        onError: (error) => {
          console.error("Streaming error:", error);
          callbacks.onError(error);
        }
      };
      
      openaiClient.streamRunResponse(
        threadId,
        runId,
        streamingCallbacks,
        apiKey
      );
      
      return {
        success: true,
        conversationId: conversation.id,
        threadId,
        isComplete: false
      };
    } else {
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
              assistantResponse = content;
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

export const getExistingThread = async (
  taskId?: string | null,
  assistantId?: string | null
): Promise<{ conversationId: string; threadId: string | null } | null> => {
  try {
    const conversations = await chatHistoryService.getConversations();
    
    let filteredConversations = conversations;
    
    if (taskId) {
      filteredConversations = filteredConversations.filter(c => c.task_id === taskId);
    }
    
    if (assistantId) {
      filteredConversations = filteredConversations.filter(c => 
        c.assistant_id === assistantId
      );
    }
    
    filteredConversations.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
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

export const linkTaskToConversation = async (
  conversationId: string,
  task: Task
): Promise<boolean> => {
  try {
    const updated = await chatHistoryService.updateConversation(conversationId, {
      task_id: task.id
    });
    
    if (updated) {
      const assistantId = updated.assistant_id || await openaiClient.ensureDefaultAssistantExists();
      
      const taskMessage = `Task linked: ${task.title} (Status: ${task.status}, Priority: ${task.priority})
Description: ${task.description || 'No description provided'}
Due date: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
Last updated: ${new Date(task.updated_at).toLocaleString()}`;

      await chatHistoryService.addMessageToConversation(
        conversationId,
        taskMessage,
        'system',
        assistantId
      );
    }
    
    return !!updated;
  } catch (error) {
    console.error('Error linking task to conversation:', error);
    return false;
  }
};

export const getConversationHistory = async (conversationId: string) => {
  return chatHistoryService.getConversationMessages(conversationId);
};
