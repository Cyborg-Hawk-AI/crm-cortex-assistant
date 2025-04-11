
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as messagesApi from '@/api/messages';
import * as chatHistoryService from '@/services/chatHistoryService';
import { useToast } from '@/hooks/use-toast';
import { useAssistantConfig } from '@/hooks/useAssistantConfig';
import { useProjects } from '@/hooks/useProjects';

export function useChatMessages() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { activeProjectId } = useProjects();
  
  const { getAssistantConfig } = useAssistantConfig();
  
  // Fetch messages for active conversation
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

  // Create a new conversation
  const startConversation = useCallback(async (title?: string) => {
    try {
      console.log(`Starting new conversation with title: ${title || 'New conversation'}`);
      const newConversation = await messagesApi.createConversation(title);
      console.log('Created conversation:', newConversation);
      
      // If there's an active project, associate this conversation with it
      if (activeProjectId) {
        try {
          await chatHistoryService.updateConversation(newConversation.id, { 
            project_id: activeProjectId 
          });
          console.log(`Associated conversation ${newConversation.id} with project ${activeProjectId}`);
        } catch (error) {
          console.error('Failed to associate conversation with project:', error);
        }
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

  // Send a message mutation with streaming support
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

  // Clear messages mutation
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

  // Send a message with streaming response
  const sendMessage = useCallback(async (content: string, sender: 'user' | 'assistant' | 'system' = 'user', conversationId?: string | null) => {
    const convId = conversationId || activeConversationId;
    if (!content.trim() || !convId) return;

    try {
      console.log(`Sending ${sender} message to conversation ${convId}`);
      
      // Send the user's message
      await sendMessageMutation.mutateAsync({ content, sender, conversationId: convId });
      
      // Only stream a response if this is a user message
      if (sender === 'user') {
        setIsStreaming(true);
        
        // Get the assistant configuration to use
        const { assistantId, onStartStreaming, onToken, onComplete, onError } = getAssistantConfig();
        
        try {
          // Create a message ID for the streaming message
          const tempMessageId = crypto.randomUUID();
          
          // Notify that streaming is starting
          if (onStartStreaming) {
            onStartStreaming(tempMessageId);
          }
          
          let streamedContent = '';
          
          // Start streaming from the assistant
          const streamResponse = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: convId,
              assistantId: assistantId
            })
          });
          
          if (!streamResponse.ok || !streamResponse.body) {
            throw new Error(`Stream response error: ${streamResponse.statusText}`);
          }
          
          // Create a reader for the stream
          const reader = streamResponse.body.getReader();
          const decoder = new TextDecoder();
          
          let isDone = false;
          while (!isDone) {
            const { value, done } = await reader.read();
            isDone = done;
            
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            streamedContent += chunk;
            
            // Notify about new content
            if (onToken) {
              onToken(tempMessageId, chunk, streamedContent);
            }
          }
          
          // Save the complete message
          if (streamedContent) {
            await messagesApi.sendMessage(convId, streamedContent, 'assistant');
          }
          
          // Notify that streaming is complete
          if (onComplete) {
            onComplete(tempMessageId, streamedContent);
          }
          
          // Refresh the messages
          queryClient.invalidateQueries({ queryKey: ['messages', convId] });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        } catch (error) {
          console.error('Error in stream processing:', error);
          
          // Notify about error
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
  }, [activeConversationId, sendMessageMutation, queryClient, toast, getAssistantConfig]);

  // Clear all messages in a conversation
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
    startConversation
  };
}
