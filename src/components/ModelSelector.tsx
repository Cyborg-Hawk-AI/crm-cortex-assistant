
import React from 'react';
import { useModelSelection, ModelProvider } from '@/hooks/useModelSelection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Zap, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ModelSelector: React.FC = () => {
  const { selectedModel, selectModel, modelOptions } = useModelSelection();
  const { toast } = useToast();
  
  const handleModelChange = (value: string) => {
    const modelId = value as ModelProvider;
    selectModel(modelId);
    
    toast({
      title: `Switched to ${modelId === 'openai' ? 'ActionAlpha' : 'ActionOmega'}`,
      description: `Now using ${modelId === 'openai' ? 'OpenAI' : 'DeepSeek'} for responses`,
    });
  };
  
  return (
    <div className="mb-4">
      <ToggleGroup 
        type="single" 
        value={selectedModel} 
        onValueChange={(value) => {
          if (value) handleModelChange(value);
        }}
        className="justify-center bg-[#25384D]/30 rounded-md p-1 border border-[#3A4D62]/50 w-full"
      >
        <ToggleGroupItem 
          value="openai" 
          aria-label="Switch to ActionAlpha"
          className="flex items-center gap-1.5 flex-1 data-[state=on]:bg-[#3A4D62] data-[state=on]:text-white rounded-sm"
        >
          <Zap className="h-4 w-4" />
          <span>ActionAlpha</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="deepseek" 
          aria-label="Switch to ActionOmega"
          className="flex items-center gap-1.5 flex-1 data-[state=on]:bg-[#3A4D62] data-[state=on]:text-white rounded-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>ActionOmega</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
