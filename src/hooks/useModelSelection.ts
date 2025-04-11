
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as chatHistoryService from '@/services/chatHistoryService';

export type ModelProvider = 'openai' | 'deepseek';

export interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'action-alpha',
    name: 'ActionAlpha',
    provider: 'openai',
    description: 'Powered by OpenAI'
  },
  {
    id: 'action-omega',
    name: 'ActionOmega',
    provider: 'deepseek',
    description: 'Powered by DeepSeek-Reasoner'
  }
];

export function useModelSelection() {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(MODEL_OPTIONS[0]);
  const [modelApiKey, setModelApiKey] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Update conversation with selected model when changed
  const changeModel = useCallback(async (
    modelId: string, 
    conversationId?: string | null
  ) => {
    try {
      const model = MODEL_OPTIONS.find(m => m.id === modelId);
      
      if (!model) {
        throw new Error('Invalid model selected');
      }
      
      setSelectedModel(model);
      
      // If we have an active conversation, update its model provider
      if (conversationId) {
        await chatHistoryService.updateConversation(conversationId, {
          model_provider: model.provider
        });
        
        // Invalidate the conversation query to reflect the change
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        
        toast({
          title: `Switched to ${model.name}`,
          description: model.description
        });
      }
      
      return model;
    } catch (error) {
      console.error('Error changing model:', error);
      toast({
        title: 'Error',
        description: 'Failed to change model. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  }, [queryClient, toast]);
  
  // Get model API key (for DeepSeek)
  const getModelApiKey = useCallback(async (): Promise<string | null> => {
    // In a real application, you would fetch this from a secure location
    // or prompt the user to enter it
    if (selectedModel.provider === 'deepseek') {
      return modelApiKey || 'PLACEHOLDER_DEEPSEEK_API_KEY';
    }
    
    return null;
  }, [selectedModel.provider, modelApiKey]);
  
  // Set model API key
  const setApiKey = useCallback((apiKey: string) => {
    setModelApiKey(apiKey);
  }, []);
  
  return {
    selectedModel,
    changeModel,
    getModelApiKey,
    setApiKey,
    models: MODEL_OPTIONS
  };
}
