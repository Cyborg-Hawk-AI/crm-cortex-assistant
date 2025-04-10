
import { useState } from 'react';

export type ModelType = 'openai' | 'deepseek';

export interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
  apiModel: string; // Added this to track which actual API model to use
}

export const MODEL_OPTIONS: Record<ModelType, ModelOption> = {
  openai: {
    id: 'openai',
    name: 'ActionAlpha',
    description: 'ActionBot Core',
    apiModel: 'gpt-4o-mini'
  },
  deepseek: {
    id: 'deepseek',
    name: 'ActionOmega',
    description: 'DeepCognition Protocol',
    apiModel: 'deepseek-chat'
  }
};

export const useModelSelection = () => {
  // Explicitly set default to 'openai' (Alpha)
  const [selectedModel, setSelectedModel] = useState<ModelType>('openai');

  const toggleModel = () => {
    setSelectedModel(prev => prev === 'openai' ? 'deepseek' : 'openai');
  };

  // Ensure we always return a valid model option
  const getModelOption = (): ModelOption => {
    if (!selectedModel || !MODEL_OPTIONS[selectedModel]) {
      // If selectedModel is invalid, default to 'openai'
      return MODEL_OPTIONS['openai'];
    }
    return MODEL_OPTIONS[selectedModel];
  };

  return {
    selectedModel,
    setSelectedModel,
    toggleModel,
    modelOption: getModelOption()
  };
};
