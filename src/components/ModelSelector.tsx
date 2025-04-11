
import React from 'react';
import { Zap, Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useModelSelection, MODEL_OPTIONS } from '@/hooks/useModelSelection';
import { useChatMessages } from '@/hooks/useChatMessages';

export function ModelSelector() {
  const { selectedModel, changeModel, models } = useModelSelection();
  const { activeConversationId } = useChatMessages();
  
  const handleSelectModel = (modelId: string) => {
    changeModel(modelId, activeConversationId);
  };

  return (
    <div className="mb-2">
      <Select value={selectedModel.id} onValueChange={handleSelectModel}>
        <SelectTrigger className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700/80 transition-colors">
          <SelectValue placeholder="Select Model">
            <div className="flex items-center">
              {selectedModel.id === 'action-alpha' ? (
                <Zap className="mr-2 h-4 w-4 text-blue-400" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
              )}
              <span>{selectedModel.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id} className="cursor-pointer">
              <div className="flex items-center">
                {model.id === 'action-alpha' ? (
                  <Zap className="mr-2 h-4 w-4 text-blue-400" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                )}
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">{model.description}</div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
