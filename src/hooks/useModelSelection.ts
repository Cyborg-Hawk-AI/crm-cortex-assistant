
import { useState } from 'react';

export type ModelType = 'openai' | 'deepseek';

export interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
}

export const MODEL_OPTIONS: Record<ModelType, ModelOption> = {
  openai: {
    id: 'openai',
    name: 'ActionAlpha',
    description: 'ActionBot Core'
  },
  deepseek: {
    id: 'deepseek',
    name: 'ActionOmega',
    description: 'DeepCognition Protocol'
  }
};

export const useModelSelection = () => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('openai');

  const toggleModel = () => {
    setSelectedModel(prev => prev === 'openai' ? 'deepseek' : 'openai');
  };

  return {
    selectedModel,
    setSelectedModel,
    toggleModel,
    modelOption: MODEL_OPTIONS[selectedModel]
  };
};
