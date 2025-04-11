
import { useState, useEffect } from 'react';

export type ModelProvider = 'openai' | 'deepseek';
export type ModelBranding = 'ActionAlpha' | 'ActionOmega';

export interface ModelOption {
  id: ModelProvider;
  name: ModelBranding;
  description: string;
}

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'openai',
    name: 'ActionAlpha',
    description: 'OpenAI-powered assistant with advanced capabilities'
  },
  {
    id: 'deepseek',
    name: 'ActionOmega',
    description: 'DeepSeek-powered reasoning assistant'
  }
];

export function useModelSelection() {
  // Default to OpenAI (ActionAlpha)
  const [selectedModel, setSelectedModel] = useState<ModelProvider>('openai');
  
  // Load from localStorage if available
  useEffect(() => {
    const storedModel = localStorage.getItem('actionit-model-provider');
    if (storedModel && (storedModel === 'openai' || storedModel === 'deepseek')) {
      setSelectedModel(storedModel);
    }
  }, []);
  
  // Save selection to localStorage
  const selectModel = (modelId: ModelProvider) => {
    setSelectedModel(modelId);
    localStorage.setItem('actionit-model-provider', modelId);
  };
  
  // Get the branded name based on the provider ID
  const getBrandedName = (): ModelBranding => {
    return selectedModel === 'openai' ? 'ActionAlpha' : 'ActionOmega';
  };
  
  // Check if using OpenAI
  const isOpenAI = selectedModel === 'openai';
  
  // Check if using DeepSeek
  const isDeepSeek = selectedModel === 'deepseek';
  
  return {
    selectedModel,
    selectModel,
    getBrandedName,
    isOpenAI,
    isDeepSeek,
    modelOptions: MODEL_OPTIONS
  };
}
