
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messageApi from '@/api/messages';
import * as assistantService from '@/services/assistantService';
import { Message, Task, Assistant } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';
import { useAssistantConfig } from './useAssistantConfig';
import { openAIChat } from '@/utils/openAIStream';
import { deepSeekChat } from '@/utils/deepSeekStream';
import { useModelSelection } from './useModelSelection';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatTaskContext, TaskContextDetailLevel, shouldRefreshTaskContext, logTaskContext } from '@/utils/taskContextFormatter';

export const useChatMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { assistantConfig } = useAssistantConfig();
  const { modelOption, modelSelection } = useModelSelection();
  const { user } = useAuth();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [openAiThreadId, setOpenAiThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isInitialLoadDone = useRef(false);

  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const pendingMessages = useRef<Set<string>>(new Set());
  const currentStreamingMessageId = useRef<string | null>(null);
  const processingMessageQueue = useRef<Set<string>>(new Set());

  const { 
    data: conversations = [], 
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageApi.getConversations(),
  });

  const {
    data: dbMessages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId 
      ? messageApi.getMessages(activeConversationId) 
      : Promise.resolve([]),
    enabled: !!activeConversationId,
  });

  const [linkedProject, setLinkedProject] = useState<any | null>(null);

  const saveMessage = useCallback(async (
    content: string, 
    sender: 'user' | 'assistant' | 'system',
    messageId?: string,
    specificConversationId?: string
  ): Promise<Message | null> => {
    const conversationId = specificConversationId || activeConversationId;
    
    if (!conversationId) return null;
    
    try {
      if (messageId && processingMessageQueue.current.has(messageId)) {
        console.log(`Message ${messageId} is already being processed, skipping duplicate save`);
        return null;
      }
      
      if (messageId && pendingMessages.current.has(messageId)) {
        console.log(`Message ${messageId} is already pending, skipping duplicate save`);
        return null;
      }
      
      if (messageId) {
        processingMessageQueue.current.add(messageId);
        pendingMessages.current.add(messageId);
      }
      
      console.log(`Saving ${sender} message to conversation ${conversationId}`);
      
      try {
        const savedMessage = await messageApi.sendMessage(
          conversationId,
          content,
          sender,
          messageId
        );
        
        if (messageId) {
          pendingMessages.current.delete(messageId);
          processingMessageQueue.current.delete(messageId);
        }
        
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        
        return savedMessage;
      } catch (error) {
        console.error('Error saving message:', error);
        
        if (messageId) {
          pendingMessages.current.delete(messageId);
          processingMessageQueue.current.delete(messageId);
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error in saveMessage:', error);
      
      if (messageId) {
        pendingMessages.current.delete(messageId);
        processingMessageQueue.current.delete(messageId);
      }
      
      return null;
    }
  }, [activeConversationId, queryClient]);

  useEffect(() => {
    if (activeConversationId) {
      console.log(`Loading messages for conversation: ${activeConversationId}`);
      refetchMessages();
      
      setLocalMessages([]);
      
      const activeConversation = conversations.find(c => c.id === activeConversationId);
      if (activeConversation) {
        setOpenAiThreadId(activeConversation.open_ai_thread_id || null);
        
        if (activeConversation.assistant_id) {
          const assistantConfig = { 
            id: activeConversation.assistant_id, 
            name: "AI Assistant",
            description: "Default AI Assistant",
            capabilities: []
          };
          setActiveAssistant(assistantConfig);
        }
        
        if (activeConversation.task_id) {
          const fetchTask = async () => {
            try {
              const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', activeConversation.task_id)
                .single();
                
              if (!error && data) {
                const fullTask: Task = {
                  id: data.id,
                  title: data.title,
                  description: data.description || '',
                  status: data.status || 'open',
                  priority: data.priority || 'medium',
                  due_date: data.due_date,
                  assignee_id: data.assignee_id,
                  reporter_id: data.reporter_id || user?.id || '',
                  created_at: new Date(data.created_at),
                  updated_at: new Date(data.updated_at),
                  tags: data.tags || [],
                  parent_task_id: data.parent_task_id,
                  user_id: data.user_id || user?.id
                };
                
                setLinkedTask(fullTask);
                
                const taskMessage = `Task linked: ${data.title} (Status: ${data.status}, Priority: ${data.priority})
Description: ${data.description || 'No description provided'}
Due date: ${data.due_date ? new Date(data.due_date).toLocaleDateString() : 'No due date'}
Last updated: ${new Date(data.updated_at).toLocaleString()}`;
                
                const systemMessageExists = dbMessages.some(msg => 
                  msg.isSystem && msg.content.includes(`Task linked: ${data.title}`)
                );
                
                if (!systemMessageExists) {
                  await saveMessage(
                    taskMessage,
                    'system',
                    uuidv4(),
                    activeConversationId
                  );
                  
                  refetchMessages();
                }
              }
            } catch (error) {
              console.error('Error fetching linked task:', error);
            }
          };
          
          fetchTask();
        } else {
          setLinkedTask(null);
        }
        
        console.log(`Switched to conversation: ${activeConversationId} with thread: ${activeConversation.open_ai_thread_id || 'none'}`);
      }
    }
  }, [activeConversationId, conversations, refetchMessages, dbMessages, saveMessage, user]);

  const messages = useCallback(() => {
    const result = [...dbMessages];
    
    const dbMessageIds = new Set(dbMessages.map(msg => msg.id));
    
    for (const localMsg of localMessages) {
      if (!dbMessageIds.has(localMsg.id)) {
        result.push(localMsg);
      }
    }
    
    return result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [dbMessages, localMessages]);

  const startConversation = async (title?: string, projectId: string = ''): Promise<string> => {
    try {
      console.log("Starting new conversation creation process...");
      const conversationTitle = title?.trim() || 'New conversation';
      
      console.log(`Creating conversation with title "${conversationTitle}" in ${projectId ? `project ${projectId}` : 'Open Chats'}`);
      const conversation = await messageApi.createConversation(conversationTitle, projectId || undefined);
      
      console.log(`Successfully created new conversation with ID: ${conversation.id}`);
      setActiveConversationId(conversation.id);
      setLocalMessages([]);
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      refetchConversations();
      
      return conversation.id;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start a new conversation',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const generateConversationTitle = async (
    conversationId: string, 
    userMessage: string, 
    assistantResponse: string
  ) => {
    try {
      console.log(`Generating title for conversation ${conversationId} based on content`);
      
      const prompt = `Generate a short, 3-5 word title summarizing the following conversation: 
      User: ${userMessage.substring(0, 200)}
      Assistant: ${assistantResponse.substring(0, 200)}`;
      
      console.log("Sending title generation prompt:", prompt.substring(0, 100) + "...");
      
      const titleStream = await openAIChat(
        { 
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates short, concise titles.' },
            { role: 'user', content: prompt }
          ] 
        },
        {
          onStart: () => {
            console.log('Starting title generation');
          },
          onChunk: () => {},
          onComplete: async (titleResponse) => {
            const cleanTitle = titleResponse
              .replace(/^["']|["']$/g, '') // Remove quotes at start/end
              .trim()
              .replace(/^Title:?\s*/i, ''); // Remove "Title:" prefix if present
            
            console.log(`Generated title: "${cleanTitle}"`);
            
            try {
              console.log(`Updating conversation ${conversationId} with new title: "${cleanTitle}"`);
              
              let updateSuccess = false;
              let attempts = 0;
              const maxAttempts = 3;
              
              while (!updateSuccess && attempts < maxAttempts) {
                attempts++;
                console.log(`Attempting to update title (attempt ${attempts}/${maxAttempts})...`);
                
                try {
                  updateSuccess = await messageApi.updateConversationTitle(conversationId, cleanTitle);
                  
                  if (updateSuccess) {
                    console.log(`Successfully updated conversation ${conversationId} title to "${cleanTitle}"`);
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                  } else {
                    console.warn(`Failed to update title on attempt ${attempts}`);
                    await new Promise(resolve => setTimeout(resolve, 500));
                  }
                } catch (updateError) {
                  console.error(`Error updating title (attempt ${attempts}):`, updateError);
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              }
              
              if (!updateSuccess) {
                console.error(`Failed to update conversation title after ${maxAttempts} attempts`);
              }
            } catch (err) {
              console.error('Error in title update process:', err);
            }
          },
          onError: (error) => {
            console.error('Error generating title:', error);
          }
        }
      );
      
      return titleStream;
      
    } catch (error) {
      console.error('Error in generateConversationTitle:', error);
      return null;
    }
  };

  const addLocalMessage = useCallback((message: Message) => {
    setLocalMessages(prev => [...prev, message]);
    return message;
  }, []);

  const clearMessages = useCallback(async (conversationId?: string) => {
    const targetConversationId = conversationId || activeConversationId;
    if (!targetConversationId) return;
    
    try {
      console.log(`Clearing messages for conversation ${targetConversationId}`);
      
      await messageApi.deleteConversationMessages(targetConversationId);
      
      setLocalMessages([]);
      currentStreamingMessageId.current = null;
      pendingMessages.current.clear();
      processingMessageQueue.current.clear();
      
      queryClient.invalidateQueries({ queryKey: ['messages', targetConversationId] });
      
      toast({
        title: 'Chat cleared',
        description: 'All messages have been cleared from this conversation'
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear messages',
        variant: 'destructive'
      });
    }
  }, [activeConversationId, queryClient, toast]);

  const handleSetActiveAssistant = useCallback(async (assistant: Assistant) => {
    setActiveAssistant(assistant);
    
    if (activeConversationId) {
      try {
        await messageApi.switchAssistant(activeConversationId, assistant);
      } catch (error) {
        console.error('Error setting assistant:', error);
      }
    }
    
    return assistant;
  }, [activeConversationId]);

  const handleLinkTaskToConversation = useCallback(async (task: Task | null) => {
    setLinkedTask(task);
    
    if (activeConversationId && task) {
      try {
        await messageApi.linkTaskToConversation(activeConversationId, task);
      } catch (error) {
        console.error('Error linking task:', error);
      }
    }
    
    return task;
  }, [activeConversationId]);

  const linkMissionToConversation = useCallback(async (mission: Task | null) => {
    if (mission) {
      setLinkedTask(mission);
    } else {
      setLinkedTask(null);
    }
    
    if (activeConversationId && mission) {
      try {
        const { error } = await supabase
          .from('conversations')
          .update({ task_id: mission.id })
          .eq('id', activeConversationId);
          
        if (error) {
          throw error;
        }
        
        const taskMessage = `Task linked: ${mission.title} (Status: ${mission.status}, Priority: ${mission.priority})
Description: ${mission.description || 'No description provided'}
Due date: ${mission.due_date ? new Date(mission.due_date).toLocaleDateString() : 'No due date'}
Last updated: ${new Date(mission.updated_at).toLocaleString()}`;
        
        await saveMessage(
          taskMessage,
          'system',
          uuidv4(),
          activeConversationId
        );
        
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        refetchMessages();
      } catch (error) {
        console.error('Error linking mission:', error);
        throw error;
      }
    }
    
    return mission;
  }, [activeConversationId, queryClient, refetchMessages, saveMessage]);

  const sendMessage = useCallback(async (
    content: string,
    sender: 'user' | 'assistant' | 'system' = 'user',
    specificConversationId?: string | null
  ) => {
    if (!content.trim()) return null;
    
    if (isStreaming) {
      toast({
        title: "Please wait",
        description: "Please wait for the current response to finish"
      });
      return null;
    }
    
    try {
      if (sender === 'user') {
        setIsSending(true);
        
        let conversationId = specificConversationId || activeConversationId;
        console.log(`Preparing to send message to conversation: ${conversationId}`);
        
        const isNewConversation = !conversationId;
        
        if (!conversationId) {
          console.log("No active conversation, creating a new one...");
          const newConversationId = await startConversation(
            activeAssistant?.name ? `Conversation with ${activeAssistant.name}` : 'New conversation'
          );
          conversationId = newConversationId;
          setActiveConversationId(newConversationId);
        }
        
        const messagesForContext = await messageApi.getMessages(conversationId);
        
        if (linkedTask && shouldRefreshTaskContext(messagesForContext, linkedTask.id)) {
          console.log('Refreshing task context due to message threshold');
          const taskContext = formatTaskContext(linkedTask, TaskContextDetailLevel.COMPREHENSIVE);
          await saveMessage(taskContext, 'system', uuidv4(), conversationId);
          logTaskContext('system-message', conversationId, linkedTask.id, true, taskContext.length);
        }
        
        const userMessageId = uuidv4();
        const userMessage: Message = {
          id: userMessageId,
          content,
          sender: 'user',
          timestamp: new Date(),
          isSystem: false,
          conversation_id: conversationId,
          user_id: 'current-user'
        };
        
        addLocalMessage(userMessage);
        await saveMessage(content, 'user', userMessageId, conversationId);
        
        const assistantMessageId = uuidv4();
        currentStreamingMessageId.current = assistantMessageId;
        
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: '',
          sender: 'assistant',
          timestamp: new Date(),
          isSystem: false,
          isStreaming: true,
          conversation_id: conversationId,
          user_id: 'current-user'
        };
        
        addLocalMessage(assistantMessage);
        setIsStreaming(true);
        
        let fullResponse = '';
        
        try {
          let systemPrompt = activeAssistant?.name 
            ? `You are ${activeAssistant.name}. ${activeAssistant.description || ''}`
            : 'You are ActionBot, an engineering assistant designed to help with coding tasks and technical problems.';
          
          if (linkedTask) {
            const taskContext = formatTaskContext(linkedTask, TaskContextDetailLevel.COMPREHENSIVE);
            systemPrompt += `\n\n${taskContext}`;
            logTaskContext('prompt-inclusion', conversationId, linkedTask.id, true, taskContext.length);
          }

          const messagesForContext = await messageApi.getMessages(conversationId);
          
          console.log(`Sending ${messagesForContext.length} messages for context to maintain conversation history`);
          
          const messageHistory = messagesForContext.map(msg => ({
            role: msg.sender === 'user' ? 'user' : msg.sender === 'system' ? 'system' : 'assistant',
            content: msg.content
          }));
          
          messageHistory.unshift({
            role: 'system',
            content: systemPrompt
          });
          
          // Choose stream function based on selected model
          const chatFunction = modelSelection.id === 'deepseek' ? deepSeekChat : openAIChat;
          console.log(`Using ${modelSelection.id} model (${modelSelection.name}) for chat`);
          
          await chatFunction(
            { messages: messageHistory },
            {
              onStart: () => {
                console.log(`Starting to stream ${modelSelection.id} response`);
              },
              onChunk: (chunk: string) => {
                if (!chunk || typeof chunk !== 'string') return;
                
                fullResponse += chunk;
                
                setLocalMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullResponse } 
                      : msg
                  )
                );
              },
              onComplete: async (finalResponse: string) => {
                console.log(`${modelSelection.id} stream completed, saving final response`);
                fullResponse = finalResponse;
                
                setLocalMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullResponse, isStreaming: false } 
                      : msg
                  )
                );
                
                setIsStreaming(false);
                currentStreamingMessageId.current = null;
                
                await saveMessage(fullResponse, 'assistant', assistantMessageId, conversationId);
                
                if (isNewConversation || messagesForContext.length <= 1) {
                  console.log("First exchange in conversation - generating title");
                  await generateConversationTitle(conversationId, content, finalResponse);
                }
                
                queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                
                setIsSending(false);
              },
              onError: (error) => {
                console.error(`Error in ${modelSelection.id} response:`, error);
                const errorMessage = `Error: ${error.message}`;
                
                setLocalMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: errorMessage, isStreaming: false } 
                      : msg
                  )
                );
                
                setIsStreaming(false);
                currentStreamingMessageId.current = null;
                
                saveMessage(errorMessage, 'assistant', assistantMessageId, conversationId);
                
                setIsSending(false);
                
                toast({
                  title: 'Error',
                  description: `Failed to get response: ${error.message}`,
                  variant: 'destructive'
                });
              }
            }
          );
        } catch (error: any) {
          console.error('Error in sendMessage:', error);
          
          setLocalMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: `Error: ${error.message}`, isStreaming: false } 
                : msg
            )
          );
          
          setIsStreaming(false);
          currentStreamingMessageId.current = null;
          setIsSending(false);
          
          toast({
            title: 'Error',
            description: 'Failed to get assistant response',
            variant: 'destructive'
          });
        }
        
        return userMessage;
      } else {
        let conversationId = specificConversationId || activeConversationId;
        
        if (!conversationId) {
          const newConversationId = await startConversation();
          conversationId = newConversationId;
          setActiveConversationId(newConversationId);
          
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          refetchConversations();
        }
        
        const messageId = uuidv4();
        const message: Message = {
          id: messageId,
          content,
          sender: sender,
          timestamp: new Date(),
          isSystem: sender === 'system',
          conversation_id: conversationId || '',
          user_id: 'current-user'
        };
        
        addLocalMessage(message);
        
        await saveMessage(content, sender, messageId, conversationId);
        
        return message;
      }
    } catch (error: any) {
      console.error('Error in sendMessage:', error);
      setIsSending(false);
      setIsStreaming(false);
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
      
      return null;
    }
  }, [
    activeConversationId,
    activeAssistant,
    isStreaming,
    linkedTask,
    conversations,
    openAiThreadId,
    queryClient,
    saveMessage,
    addLocalMessage,
    startConversation,
    toast,
    refetchConversations,
    generateConversationTitle,
    modelSelection // Added modelSelection dependency
  ]);

  useEffect(() => {
    if (activeConversationId) {
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (conversation?.project_id) {
        const project = conversations?.find(p => p.id === conversation.project_id);
        setLinkedProject(project || null);
      } else {
        setLinkedProject(null);
      }
    }
  }, [activeConversationId, conversations]);

  return {
    messages: messages(),
    inputValue,
    setInputValue,
    sendMessage,
    addMessage: (content: string, sender: 'user' | 'assistant' | 'system') => {
      const message: Message = {
        id: uuidv4(),
        content,
        sender,
        timestamp: new Date(),
        isSystem: sender === 'system',
        conversation_id: activeConversationId || 'temp-conversation',
        user_id: 'current-user'
      };
      return addLocalMessage(message);
    },
    activeAssistant,
    setActiveAssistant: handleSetActiveAssistant,
    clearMessages,
    isLoading: isLoadingMessages || isLoadingConversations,
    isSending,
    isStreaming,
    linkedTask,
    linkTaskToConversation: handleLinkTaskToConversation,
    linkMissionToConversation,
    activeConversationId,
    startConversation,
    setActiveConversationId,
    refetchMessages,
    saveMessage,
    generateConversationTitle,
    refetchConversations,
    linkedProject,
  };
};

export type { ChatMessagesHook } from './useChatMessages';
