
import { useState, useEffect } from 'react';

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

// Local storage key for persisting model selection
const MODEL_SELECTION_KEY = 'actionit-model-selection';

export const useModelSelection = () => {
  // Get the stored model or use default
  const getSavedModel = (): ModelType => {
    try {
      const saved = localStorage.getItem(MODEL_SELECTION_KEY);
      console.log(`Retrieved model selection from storage: ${saved}`);
      if (saved && (saved === 'openai' || saved === 'deepseek')) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not access localStorage for model selection');
    }
    return 'openai';
  };

  // Initialize with saved or default model
  const [selectedModel, setSelectedModel] = useState<ModelType>(getSavedModel());

  // Save model selection to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(MODEL_SELECTION_KEY, selectedModel);
      console.log(`Model selection saved to localStorage: ${selectedModel}`);
    } catch (e) {
      console.warn('Could not save model selection to localStorage');
    }
  }, [selectedModel]);

  const toggleModel = () => {
    const newModel = selectedModel === 'openai' ? 'deepseek' : 'openai';
    console.log(`Model toggled from ${selectedModel} to ${newModel}`);
    setSelectedModel(newModel);
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
