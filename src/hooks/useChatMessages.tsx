
import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Message, Task, Assistant } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';
import * as assistantService from '@/services/assistantService';
import { v4 as uuidv4 } from 'uuid';
import * as messagesApi from '@/api/messages';
import { createOpenAIStream } from '@/utils/openAIStream';

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
  
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  
  const pendingMessages = useRef<Set<string>>(new Set());
  const currentStreamingMessageId = useRef<string | null>(null);
  const processingMessageQueue = useRef<Set<string>>(new Set());

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
        
        console.log(`Switched to conversation: ${activeConversationId} with thread: ${activeConversation.open_ai_thread_id || 'none'}`);
      }
    }
  }, [activeConversationId, conversations, refetchMessages]);

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

  const startConversation = async (title?: string): Promise<string> => {
    try {
      const conversation = await messagesApi.createConversation(title);
      setActiveConversationId(conversation.id);
      setLocalMessages([]);
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

  const addLocalMessage = useCallback((message: Message) => {
    setLocalMessages(prev => [...prev, message]);
    return message;
  }, []);

  const clearMessages = useCallback(async (conversationId?: string) => {
    const targetConversationId = conversationId || activeConversationId;
    if (!targetConversationId) return;
    
    try {
      console.log(`Clearing messages for conversation ${targetConversationId}`);
      
      await messagesApi.deleteConversationMessages(targetConversationId);
      
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
        
        if (!conversationId) {
          const newConversationId = await startConversation(
            activeAssistant?.name ? `Conversation with ${activeAssistant.name}` : 'New conversation'
          );
          conversationId = newConversationId;
          setActiveConversationId(newConversationId);
        }
        
        const conversation = conversations.find(c => c.id === conversationId);
        const threadId = conversation?.open_ai_thread_id || null;
        
        const userMessageId = uuidv4();
        const userMessage: Message = {
          id: userMessageId,
          content,
          sender: 'user',
          timestamp: new Date(),
          isSystem: false,
          conversation_id: conversationId || '',
          user_id: 'current-user' // Use a default value or get from auth context
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
          conversation_id: conversationId || '',
          user_id: 'current-user' // Use a default value or get from auth context
        };
        
        addLocalMessage(assistantMessage);
        
        setIsStreaming(true);
        
        let fullResponse = '';
        
        try {
          const messagesForContext = await messagesApi.getMessages(conversationId);
          
          console.log(`Sending ${messagesForContext.length} messages for context to maintain conversation history`);
          
          // Format messages for OpenAI API
          const messageHistory = messagesForContext.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          
          // Add system message if we have an active assistant
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
          
          // Create the stream directly from the frontend
          await createOpenAIStream(
            { messages: messageHistory },
            {
              onStart: () => {
                console.log('Starting to stream assistant response');
              },
              onChunk: (chunk: string) => {
                if (!chunk || typeof chunk !== 'string') return;
                
                fullResponse = chunk;
                
                setLocalMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullResponse } 
                      : msg
                  )
                );
              },
              onComplete: async (finalResponse: string) => {
                console.log('Stream completed, saving final response');
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
                
                // Save the complete response to the database
                await saveMessage(fullResponse, 'assistant', assistantMessageId, conversationId);
                
                queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                
                setIsSending(false);
              },
              onError: (error) => {
                console.error('Error in assistant response:', error);
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
        }
        
        const messageId = uuidv4();
        const message: Message = {
          id: messageId,
          content,
          sender,
          timestamp: new Date(),
          isSystem: sender === 'system',
          conversation_id: conversationId || '',
          user_id: 'current-user' // Use a default value or get from auth context
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
    toast
  ]);

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
    activeConversationId,
    startConversation,
    setActiveConversationId,
    refetchMessages,
    saveMessage
  };
}
