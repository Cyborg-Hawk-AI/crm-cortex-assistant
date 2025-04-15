
import { useState } from 'react';

export type ModelType = 'openai' | 'deepseek';

export interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
  apiModel: string;
}

export const MODEL_OPTIONS: Record<ModelType, ModelOption> = {
  openai: {
    id: 'openai',
    name: 'action.it Core',
    description: 'ActionBot Core',
    apiModel: 'gpt-4o-mini'
  },
  deepseek: {
    id: 'deepseek',
    name: 'Jaxira MetaYield Kernel',
    description: 'Advanced AI Cognition Protocol',
    apiModel: 'deepseek-chat'
  }
};

export const useModelSelection = () => {
  // Always initialize with a valid default model
  const [selectedModel, setSelectedModel] = useState<ModelType>('openai');

  const toggleModel = () => {
    setSelectedModel(prev => prev === 'openai' ? 'deepseek' : 'openai');
  };

  // Ensure we always return a valid model option
  const getModelOption = (): ModelOption => {
    // Return default if selected model is invalid or undefined
    if (!selectedModel || !MODEL_OPTIONS[selectedModel]) {
      console.warn("Invalid model selection, defaulting to openai");
      return MODEL_OPTIONS['openai'];
    }
    return MODEL_OPTIONS[selectedModel];
  };

  const modelOption = getModelOption();
  const modelSelection = {
    id: selectedModel,
    ...MODEL_OPTIONS[selectedModel]
  };

  return {
    selectedModel,
    setSelectedModel,
    toggleModel,
    modelOption,
    modelSelection
  };
};
