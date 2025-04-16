
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/utils/types';
import * as messageApi from '@/api/messages';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export const useMessageOperations = (activeConversationId: string | null) => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addLocalMessage = useCallback((message: Message) => {
    setLocalMessages(prev => [...prev, message]);
    return message;
  }, []);

  const saveMessage = useCallback(async (
    content: string, 
    sender: 'user' | 'assistant' | 'system',
    messageId?: string,
    specificConversationId?: string
  ): Promise<Message | null> => {
    const conversationId = specificConversationId || activeConversationId;
    
    if (!conversationId) return null;
    
    try {
      console.log(`Saving ${sender} message to conversation ${conversationId}`);
      
      const savedMessage = await messageApi.sendMessage(
        conversationId,
        content,
        sender,
        messageId
      );
      
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      
      return savedMessage;
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: 'Error',
        description: 'Failed to save message',
        variant: 'destructive'
      });
      return null;
    }
  }, [activeConversationId, queryClient, toast]);

  const clearMessages = useCallback(async (conversationId?: string) => {
    const targetConversationId = conversationId || activeConversationId;
    if (!targetConversationId) return;
    
    try {
      await messageApi.deleteConversationMessages(targetConversationId);
      setLocalMessages([]);
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

  return {
    localMessages,
    setLocalMessages,
    addLocalMessage,
    saveMessage,
    clearMessages
  };
};
