
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
  
  // Debug tracking
  const debugState = useRef({
    lastConversationCreated: null as string | null,
    conversationActivateTime: null as number | null,
    redirectAttempted: false
  });

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
      console.log(`[CHAT HOOK] Loading messages for conversation: ${activeConversationId}`);
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
        
        console.log(`[CHAT HOOK] Switched to conversation: ${activeConversationId} with thread: ${activeConversation.open_ai_thread_id || 'none'}`);
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
      console.log(`[CHAT CREATION] Starting new conversation with title: ${title || 'New conversation'}`);
      const conversationTitle = title?.trim() || 'New conversation';
      const conversation = await messagesApi.createConversation(conversationTitle);
      
      // Automatically set the new conversation as active
      console.log(`[CHAT REDIRECT] Auto-activating new conversation: ${conversation.id}`);
      setActiveConversationId(conversation.id);
      
      // Store debug info
      debugState.current.lastConversationCreated = conversation.id;
      debugState.current.conversationActivateTime = Date.now();
      
      setLocalMessages([]);
      
      console.log(`[CHAT CREATION] Created conversation ${conversation.id} with title "${conversationTitle}" in Open Chats group`);
      
      // Immediately invalidate conversations to refresh sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      return conversation.id;
    } catch (error) {
      console.error('[CHAT CREATION] Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start a new conversation',
        variant: 'destructive'
      });
      throw error;
    }
  };

  // Function to generate a title for a new conversation
  const generateConversationTitle = async (
    conversationId: string, 
    userMessage: string, 
    assistantResponse: string
  ) => {
    try {
      console.log(`[TITLE GENERATION] Generating title for conversation ${conversationId}`);
      
      // Create prompt for generating a title
      const prompt = `Generate a short, 3-5 word title summarizing the following conversation: 
      User: ${userMessage.substring(0, 200)}
      Assistant: ${assistantResponse.substring(0, 200)}`;
      
      // Log the title generation attempt
      console.log("[TITLE GENERATION] Sending title generation prompt:", prompt.substring(0, 100) + "...");
      
      // Create a temporary message stream for the title generation
      const titleStream = await createOpenAIStream(
        { 
          messages: [
            { role: 'system', content: 'You are a helpful assistant that generates short, concise titles.' },
            { role: 'user', content: prompt }
          ] 
        },
        {
          onStart: () => {
            console.log('[TITLE GENERATION] Starting title generation');
          },
          onChunk: () => {},
          onComplete: async (titleResponse) => {
            // Clean up the title (remove quotes, trim, etc.)
            const cleanTitle = titleResponse
              .replace(/^["']|["']$/g, '') // Remove quotes at start/end
              .trim()
              .replace(/^Title:?\s*/i, ''); // Remove "Title:" prefix if present
            
            console.log(`[TITLE GENERATION] Generated title: "${cleanTitle}"`);
            
            // Update the conversation title in Supabase
            try {
              console.log(`[TITLE UPDATE] Updating conversation ${conversationId} with new title: "${cleanTitle}"`);
              
              // Add retries for title updates
              let updateSuccess = false;
              let attempts = 0;
              const maxAttempts = 3;
              
              while (!updateSuccess && attempts < maxAttempts) {
                attempts++;
                console.log(`[TITLE UPDATE] Attempting to update title (attempt ${attempts}/${maxAttempts})...`);
                
                try {
                  updateSuccess = await messagesApi.updateConversationTitle(conversationId, cleanTitle);
                  
                  if (updateSuccess) {
                    console.log(`[TITLE UPDATE] Successfully updated conversation ${conversationId} title to "${cleanTitle}"`);
                    // Invalidate the conversations query to refresh the sidebar
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                  } else {
                    console.warn(`[TITLE UPDATE] Failed to update title on attempt ${attempts}`);
                    // Wait briefly before retrying
                    await new Promise(resolve => setTimeout(resolve, 500));
                  }
                } catch (updateError) {
                  console.error(`[TITLE UPDATE] Error updating title (attempt ${attempts}):`, updateError);
                  // Wait briefly before retrying
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              }
              
              if (!updateSuccess) {
                console.error(`[TITLE UPDATE] Failed to update conversation title after ${maxAttempts} attempts`);
              }
            } catch (err) {
              console.error('[TITLE UPDATE] Error in title update process:', err);
            }
          },
          onError: (error) => {
            console.error('[TITLE GENERATION] Error generating title:', error);
          }
        }
      );
      
      // We don't need to do anything with the returned stream since processing happens in onComplete callback
      return titleStream;
      
    } catch (error) {
      console.error('[TITLE GENERATION] Error in generateConversationTitle:', error);
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
        console.log(`[MESSAGE SAVE] Message ${messageId} is already being processed, skipping duplicate save`);
        return null;
      }
      
      if (messageId && pendingMessages.current.has(messageId)) {
        console.log(`[MESSAGE SAVE] Message ${messageId} is already pending, skipping duplicate save`);
        return null;
      }
      
      if (messageId) {
        processingMessageQueue.current.add(messageId);
        pendingMessages.current.add(messageId);
      }
      
      console.log(`[MESSAGE SAVE] Saving ${sender} message to conversation ${conversationId}`);
      
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
        console.error('[MESSAGE SAVE] Error saving message:', error);
        
        if (messageId) {
          pendingMessages.current.delete(messageId);
          processingMessageQueue.current.delete(messageId);
        }
        
        return null;
      }
    } catch (error) {
      console.error('[MESSAGE SAVE] Error in saveMessage:', error);
      
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
        console.log(`[SEND MESSAGE] Preparing to send message to conversation: ${conversationId || 'new'}`);
        
        // Track if this is a new conversation
        const isNewConversation = !conversationId;
        
        if (!conversationId) {
          console.log('[SEND MESSAGE] No active conversation, creating new one');
          const newConversationId = await startConversation(
            activeAssistant?.name ? `Conversation with ${activeAssistant.name}` : 'New conversation'
          );
          conversationId = newConversationId;
          
          console.log(`[CHAT REDIRECT] Created and activated new conversation: ${newConversationId}`);
          debugState.current.redirectAttempted = true;
          
          // We need to wait a small moment to ensure state updates propagate
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Double-check that the active conversation has been properly set
          if (activeConversationId !== newConversationId) {
            console.log(`[CHAT REDIRECT] Active conversation not updated yet, forcing to: ${newConversationId}`);
            setActiveConversationId(newConversationId);
          }
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
          
          console.log(`[SEND MESSAGE] Sending ${messagesForContext.length} messages for context to maintain conversation history`);
          
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
                console.log('[STREAMING] Starting to stream assistant response');
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
                console.log('[STREAMING] Stream completed, saving final response');
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
                
                // If this is a new conversation's first message exchange, generate a title
                if (isNewConversation) {
                  console.log("[TITLE GENERATION] This is a new conversation - generating title after first exchange");
                  await generateConversationTitle(conversationId, content, finalResponse);
                }
                
                queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
                
                setIsSending(false);
              },
              onError: (error) => {
                console.error('[STREAMING] Error in assistant response:', error);
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
          console.error('[STREAMING] Error in sendMessage:', error);
          
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
      console.error('[SEND MESSAGE] Error in sendMessage:', error);
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
    saveMessage,
    generateConversationTitle
  };
}
