
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as messageApi from '@/api/messages';
import { useToast } from './use-toast';
import { openAIChat } from '@/utils/openAIStream';

export const useConversationManagement = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startConversation = async (title?: string, projectId: string = ''): Promise<string> => {
    try {
      console.log("Starting new conversation creation process...");
      const conversationTitle = title?.trim() || 'New conversation';
      
      const conversation = await messageApi.createConversation(conversationTitle, projectId || undefined);
      
      setActiveConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
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
      const prompt = `Generate a short, 3-5 word title summarizing the following conversation: 
      User: ${userMessage.substring(0, 200)}
      Assistant: ${assistantResponse.substring(0, 200)}`;
      
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
              .replace(/^["']|["']$/g, '')
              .trim()
              .replace(/^Title:?\s*/i, '');
            
            try {
              const updateSuccess = await messageApi.updateConversationTitle(conversationId, cleanTitle);
              if (updateSuccess) {
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
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

  return {
    activeConversationId,
    setActiveConversationId,
    startConversation,
    generateConversationTitle
  };
};
