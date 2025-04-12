import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messagesApi from '@/api/messages';
import * as chatHistoryService from '@/services/chatHistoryService';
import { useToast } from '@/hooks/use-toast';
import { useAssistantConfig } from '@/hooks/useAssistantConfig';
import { useProjects } from '@/hooks/useProjects';
import { Message, Assistant, Task } from '@/utils/types';
import { createOpenAIStream } from '@/utils/openAIStream';
import { createDeepSeekStream } from '@/utils/deepSeekStream';
import { ModelType } from '@/hooks/useModelSelection';

export function useChatMessages() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [linkedTask, setLinkedTask] = useState<Task | null>(null);
  const [activeAssistant, setActiveAssistantState] = useState<Assistant | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeProjectId } = useProjects();
  
  const { getAssistantConfig } = useAssistantConfig();
  
  const { 
    data: messages = [],
    isLoading,
    error,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => activeConversationId ? messagesApi.getMessages(activeConversationId) : [],
    enabled: !!activeConversationId
  });

  const startConversation = useCallback(async (title?: string) => {
    try {
      console.log(`Starting new conversation with title: ${title || 'New conversation'}`);
      const newConversation = await messagesApi.createConversation(title);
      console.log('Created conversation:', newConversation);
      
      if (activeProjectId) {
        try {
          await chatHistoryService.updateConversation(newConversation.id, { 
            project_id: activeProjectId 
          });
          console.log(`Associated conversation ${newConversation.id} with project ${activeProjectId}`);
        } catch (error) {
          console.error('Failed to associate conversation with project:', error);
        }
      } else {
        console.log(`Conversation ${newConversation.id} assigned to Open Chats group`);
      }
      
      return newConversation.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start a new conversation. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast, activeProjectId]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, sender, conversationId }: { content: string; sender: 'user' | 'assistant' | 'system'; conversationId: string }) => {
      return messagesApi.sendMessage(conversationId, content, sender);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const clearMessagesMutation = useMutation({
    mutationFn: async (conversationId: string | null) => {
      if (!conversationId) return false;
      return messagesApi.deleteConversationMessages(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
    },
    onError: (error) => {
      console.error('Error clearing messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear messages. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const addMessage = useCallback((content: string, sender: 'user' | 'assistant' | 'system') => {
    if (!activeConversationId) return null;
    return sendMessageMutation.mutateAsync({ 
      content, 
      sender, 
      conversationId: activeConversationId 
    });
  }, [activeConversationId, sendMessageMutation]);

  const setActiveAssistant = useCallback(async (assistant: Assistant) => {
    setActiveAssistantState(assistant);
    return assistant;
  }, []);

  const linkTaskToConversation = useCallback(async (task: Task | null) => {
    setLinkedTask(task);
    return task;
  }, []);

  const sendMessage = useCallback(async (
    content: string, 
    sender: 'user' | 'assistant' | 'system' = 'user', 
    conversationId?: string | null,
    modelType: ModelType = 'openai'
  ) => {
    const convId = conversationId || activeConversationId;
    if (!content.trim() || !convId) return;

    try {
      console.log(`Sending ${sender} message to conversation ${convId} using model: ${modelType}`);
      
      await sendMessageMutation.mutateAsync({ content, sender, conversationId: convId });
      
      if (sender === 'user') {
        setIsStreaming(true);
        
        const { assistantId, onStartStreaming, onToken, onComplete, onError } = getAssistantConfig();
        
        try {
          const tempMessageId = crypto.randomUUID();
          
          if (onStartStreaming) {
            onStartStreaming(tempMessageId);
          }
          
          let streamedContent = '';
          
          const messagesForContext = await messagesApi.getMessages(convId);
          
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
              content: modelType === 'openai' 
                ? 'You are ActionAlpha, an engineering assistant designed to help with coding tasks and technical problems powered by OpenAI.'
                : 'You are ActionOmega, an engineering assistant designed to help with coding tasks and technical problems powered by DeepSeek.'
            });
          }
          
          if (modelType === 'openai') {
            await createOpenAIStream(
              { messages: messageHistory },
              {
                onStart: () => {
                  console.log('Starting to stream OpenAI response');
                },
                onChunk: (chunk: string) => {
                  if (!chunk || typeof chunk !== 'string') return;
                  
                  streamedContent += chunk;
                  
                  if (onToken) {
                    onToken(tempMessageId, chunk, streamedContent);
                  }
                },
                onComplete: async (finalResponse: string) => {
                  streamedContent = finalResponse;
                  
                  if (onComplete) {
                    onComplete(tempMessageId, streamedContent);
                  }
                  
                  await sendMessageMutation.mutateAsync({ 
                    content: streamedContent, 
                    sender: 'assistant', 
                    conversationId: convId 
                  });
                  
                  setIsStreaming(false);
                  queryClient.invalidateQueries({ queryKey: ['messages', convId] });
                  queryClient.invalidateQueries({ queryKey: ['conversations'] });
                },
                onError
              }
            );
          } else {
            try {
              await createDeepSeekStream(
                { 
                  messages: messageHistory,
                  model: 'deepseek-chat'  // Specify the model explicitly
                },
                {
                  onStart: () => {
                    console.log('Starting to stream DeepSeek response');
                  },
                  onChunk: (chunk: string) => {
                    if (!chunk || typeof chunk !== 'string') return;
                    
                    streamedContent += chunk;
                    
                    if (onToken) {
                      onToken(tempMessageId, chunk, streamedContent);
                    }
                  },
                  onComplete: async (finalResponse: string) => {
                    streamedContent = finalResponse;
                    
                    if (onComplete) {
                      onComplete(tempMessageId, streamedContent);
                    }
                    
                    await sendMessageMutation.mutateAsync({ 
                      content: streamedContent, 
                      sender: 'assistant', 
                      conversationId: convId 
                    });
                    
                    setIsStreaming(false);
                    queryClient.invalidateQueries({ queryKey: ['messages', convId] });
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                  },
                  onError: (error) => {
                    console.error('DeepSeek API error:', error);
                    
                    if (error.message.includes('API key') || error.message.includes('401')) {
                      toast({
                        title: 'DeepSeek API Key Error',
                        description: 'The DeepSeek API key is invalid or missing. Please add a valid API key in the settings.',
                        variant: 'destructive'
                      });
                      
                      setIsStreaming(false);
                    } else if (onError) {
                      onError(error);
                    }
                  }
                }
              );
            } catch (deepseekError) {
              console.error('Failed to use DeepSeek:', deepseekError);
              
              toast({
                title: 'DeepSeek Error',
                description: 'Failed to use DeepSeek API. Please check your configuration or try again later.',
                variant: 'destructive'
              });
              
              setIsStreaming(false);
            }
          }
        } catch (error) {
          console.error('Error in stream processing:', error);
          
          if (onError) {
            onError(error as Error);
          } else {
            toast({
              title: 'Error',
              description: 'An error occurred while processing your request.',
              variant: 'destructive'
            });
          }
        } finally {
          setIsStreaming(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsStreaming(false);
      toast({
        title: 'Error',
        description: 'Failed to process message. Please try again.',
        variant: 'destructive'
      });
    }
  }, [activeConversationId, sendMessageMutation, queryClient, toast, getAssistantConfig, activeAssistant]);

  const clearMessages = useCallback(async (conversationId: string | null = activeConversationId) => {
    if (!conversationId) return;
    await clearMessagesMutation.mutateAsync(conversationId);
  }, [activeConversationId, clearMessagesMutation]);

  return {
    messages,
    isLoading,
    error,
    refetchMessages,
    activeConversationId,
    setActiveConversationId,
    inputValue,
    setInputValue,
    sendMessage,
    clearMessages,
    isSending: sendMessageMutation.isPending,
    isStreaming,
    startConversation,
    addMessage,
    activeAssistant,
    setActiveAssistant,
    linkedTask,
    linkTaskToConversation
  };
}
