import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Message, Task, Assistant } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import * as assistantService from '@/services/assistantService';
import { v4 as uuidv4 } from 'uuid';
import * as messagesApi from '@/api/messages';
import { createOpenAIStream } from '@/utils/openAIStream';
import { MessageStatus } from '@/utils/streamTypes';

export function useChatMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [openAiThreadId, setOpenAiThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isInitialLoadDone = useRef(false);
  
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  
  const pendingMessages = useRef<Set<string>>(new Set());
  const currentStreamingMessageId = useRef<string | null>(null);
  const processingMessageQueue = useRef<Set<string>>(new Set());
  const messageRetryTimeouts = useRef<Record<string, number>>({});

  const { 
    data: conversations = [], 
    isLoading: isLoadingConversations
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations(),
  });

  const {
    data: dbMessages = [],
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId 
      ? messagesApi.getMessages(activeConversationId) 
      : Promise.resolve([]),
    enabled: !!activeConversationId,
  });

  useEffect(() => {
    if (activeConversationId) {
      console.log(`Loading messages for conversation: ${activeConversationId}`);
      refetchMessages();
      
      setOptimisticMessages([]);
      
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
        
        console.log(`Switched to conversation: ${activeConversationId} with thread: ${activeConversation.open_ai_thread_id || 'none'}`);
      }
    }
  }, [activeConversationId, conversations, refetchMessages]);

  useEffect(() => {
    return () => {
      Object.values(messageRetryTimeouts.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  const mergeMessages = useCallback(() => {
    const messagesMap = new Map<string, Message>();
    
    dbMessages.forEach(msg => {
      messagesMap.set(msg.id, msg);
    });
    
    optimisticMessages.forEach(optMsg => {
      if (!messagesMap.has(optMsg.id) || optMsg.status === 'error' || optMsg.status === 'sending') {
        messagesMap.set(optMsg.id, optMsg);
      }
    });
    
    return Array.from(messagesMap.values())
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [dbMessages, optimisticMessages]);

  const startConversation = async (title?: string): Promise<string> => {
    try {
      const conversationTitle = title?.trim() || 'New conversation';
      const conversation = await messagesApi.createConversation(conversationTitle);
      
      console.log(`Auto-activating new conversation: ${conversation.id}`);
      setActiveConversationId(conversation.id);
      setOptimisticMessages([]);
      
      console.log(`Created conversation ${conversation.id} with title "${conversationTitle}" in Open Chats group`);
      
      return conversation.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
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
      console.log(`Generating title for conversation ${conversationId}`);
      
      const prompt = `Generate a short, 3-5 word title summarizing the following conversation: 
      User: ${userMessage.substring(0, 200)}
      Assistant: ${assistantResponse.substring(0, 200)}`;
      
      console.log("Sending title generation prompt:", prompt.substring(0, 100) + "...");
      
      const titleStream = await createOpenAIStream(
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
                  updateSuccess = await messagesApi.updateConversationTitle(conversationId, cleanTitle);
                  
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

  const addOptimisticMessage = useCallback((message: Message) => {
    console.log(`Adding optimistic message to UI: ${message.id} (${message.sender})`);
    
    setOptimisticMessages(prev => [
      ...prev.filter(m => m.id !== message.id),
      message
    ]);
    
    return message;
  }, []);

  const updateOptimisticMessage = useCallback((
    messageId: string, 
    updates: Partial<Message>
  ) => {
    setOptimisticMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, ...updates } 
          : msg
      )
    );
  }, []);

  const removeOptimisticMessage = useCallback((messageId: string) => {
    setOptimisticMessages(prev => 
      prev.filter(msg => msg.id !== messageId)
    );
  }, []);

  const clearMessages = useCallback(async (conversationId?: string) => {
    const targetConversationId = conversationId || activeConversationId;
    if (!targetConversationId) return;
    
    try {
      console.log(`Clearing messages for conversation ${targetConversationId}`);
      
      await messagesApi.deleteConversationMessages(targetConversationId);
      
      setOptimisticMessages([]);
      currentStreamingMessageId.current = null;
      pendingMessages.current.clear();
      processingMessageQueue.current.clear();
      
      Object.values(messageRetryTimeouts.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      messageRetryTimeouts.current = {};
      
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
        await assistantService.switchAssistant(activeConversationId, assistant);
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
        await assistantService.linkTaskToConversation(activeConversationId, task);
      } catch (error) {
        console.error('Error linking task:', error);
      }
    }
    
    return task;
  }, [activeConversationId]);

  const retryMessage = useCallback((message: Message, retryDelay: number = 2000) => {
    updateOptimisticMessage(message.id, { 
      status: 'sending',
      retryCount: (message.retryCount || 0) + 1
    });
    
    if (messageRetryTimeouts.current[message.id]) {
      clearTimeout(messageRetryTimeouts.current[message.id]);
    }
    
    messageRetryTimeouts.current[message.id] = window.setTimeout(() => {
      saveMessage(
        message.content, 
        message.sender as 'user' | 'assistant' | 'system', 
        message.id, 
        message.conversation_id || activeConversationId
      );
    }, retryDelay);
  }, [updateOptimisticMessage, activeConversationId]);

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
        const savedMessage = await messagesApi.sendMessage(
          conversationId,
          content,
          sender,
          messageId
        );
        
        if (messageId) {
          pendingMessages.current.delete(messageId);
          processingMessageQueue.current.delete(messageId);
          
          updateOptimisticMessage(messageId, { 
            status: 'sent',
            isOptimistic: false
          });
          
          if (messageRetryTimeouts.current[messageId]) {
            clearTimeout(messageRetryTimeouts.current[messageId]);
            delete messageRetryTimeouts.current[messageId];
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        
        return savedMessage;
      } catch (error) {
        console.error('Error saving message:', error);
        
        if (messageId) {
          pendingMessages.current.delete(messageId);
          processingMessageQueue.current.delete(messageId);
          
          updateOptimisticMessage(messageId, { 
            status: 'error'
          });
          
          const message = optimisticMessages.find(m => m.id === messageId);
          if (message) {
            retryMessage(message);
          }
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
  }, [activeConversationId, queryClient, optimisticMessages, updateOptimisticMessage, retryMessage]);

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
        const userMessageId = uuidv4();
        
        const userMessage: Message = {
          id: userMessageId,
          content,
          sender: 'user',
          timestamp: new Date(),
          isSystem: false,
          status: 'sending',
          isOptimistic: true,
          conversation_id: specificConversationId || activeConversationId || '',
          user_id: 'current-user'
        };
        
        console.log('IMMEDIATELY adding user message to UI:', userMessageId);
        addOptimisticMessage(userMessage);
        
        setIsSending(true);
        
        let conversationId = specificConversationId || activeConversationId;
        console.log(`Preparing to send message to conversation: ${conversationId}`);
        
        if (!conversationId) {
          const newConversationId = await startConversation(
            activeAssistant?.name ? `Conversation with ${activeAssistant.name}` : 'New conversation'
          );
          conversationId = newConversationId;
          setActiveConversationId(newConversationId);
          console.log(`Created and activated new conversation: ${newConversationId}`);
          
          updateOptimisticMessage(userMessageId, { conversation_id: newConversationId });
        }
        
        const conversation = conversations.find(c => c.id === conversationId);
        const threadId = conversation?.open_ai_thread_id || null;
        
        saveMessage(content, 'user', userMessageId, conversationId).catch(error => {
          console.error('Error saving user message to database:', error);
        });
        
        const assistantMessageId = uuidv4();
        currentStreamingMessageId.current = assistantMessageId;
        
        const assistantMessage: Message = {
          id: assistantMessageId,
          content: '',
          sender: 'assistant',
          timestamp: new Date(),
          isSystem: false,
          isStreaming: true,
          status: 'streaming',
          conversation_id: conversationId || '',
          user_id: 'current-user'
        };
        
        addOptimisticMessage(assistantMessage);
        
        setIsStreaming(true);
        
        let fullResponse = '';
        
        try {
          const messagesForContext = await messagesApi.getMessages(conversationId);
          
          console.log(`Sending ${messagesForContext.length} messages for context to maintain conversation history`);
          
          const messageHistory = messagesForContext.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          
          if (activeAssistant) {
            messageHistory.unshift({
              role: 'system',
              content: `You are ${activeAssistant.name || 'an AI assistant'}. ${activeAssistant.description || ''}`
            });
          } else {
            messageHistory.unshift({
              role: 'system',
              content: 'You are ActionBot, an engineering assistant designed to help with coding tasks and technical problems.'
            });
          }
          
          await createOpenAIStream(
            { messages: messageHistory },
            {
              onStart: () => {
                console.log('Starting to stream assistant response');
              },
              onChunk: (chunk: string) => {
                if (!chunk || typeof chunk !== 'string') return;
                
                fullResponse += chunk;
                
                updateOptimisticMessage(assistantMessageId, { content: fullResponse });
              },
              onComplete: async (finalResponse: string) => {
                console.log('Stream completed, saving final response');
                fullResponse = finalResponse;
                
                updateOptimisticMessage(assistantMessageId, { 
                  content: fullResponse, 
                  isStreaming: false,
                  status: 'complete' 
                });
                
                setIsStreaming(false);
                currentStreamingMessageId.current = null;
                
                await saveMessage(fullResponse, 'assistant', assistantMessageId, conversationId);
                
                if (isNewConversation) {
                  console.log("This is a new conversation - generating title after first exchange");
                  await generateConversationTitle(conversationId, content, finalResponse);
                }
                
                queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                
                setIsSending(false);
              },
              onError: (error) => {
                console.error('Error in assistant response:', error);
                const errorMessage = `Error: ${error.message}`;
                
                updateOptimisticMessage(assistantMessageId, { 
                  content: errorMessage, 
                  isStreaming: false,
                  status: 'error' 
                });
                
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
          
          updateOptimisticMessage(assistantMessageId, { 
            content: `Error: ${error.message}`, 
            isStreaming: false,
            status: 'error'
          });
          
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
        }
        
        const messageId = uuidv4();
        const message: Message = {
          id: messageId,
          content,
          sender,
          timestamp: new Date(),
          isSystem: sender === 'system',
          status: 'sending',
          conversation_id: conversationId || '',
          user_id: 'current-user'
        };
        
        addOptimisticMessage(message);
        
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
    addOptimisticMessage,
    startConversation,
    toast,
    updateOptimisticMessage
  ]);

  return {
    messages: mergeMessages(),
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
        status: sender === 'user' ? 'sending' : undefined,
        isOptimistic: sender === 'user',
        conversation_id: activeConversationId || 'temp-conversation',
        user_id: 'current-user'
      };
      return addOptimisticMessage(message);
    },
    activeAssistant,
    setActiveAssistant: handleSetActiveAssistant,
    clearMessages,
    isLoading: isLoadingMessages || isLoadingConversations,
    isSending,
    isStreaming,
    linkedTask,
    linkTaskToConversation: handleLinkTaskToConversation,
    activeConversationId,
    startConversation,
    setActiveConversationId,
    refetchMessages,
    saveMessage,
    generateConversationTitle
  };
}
