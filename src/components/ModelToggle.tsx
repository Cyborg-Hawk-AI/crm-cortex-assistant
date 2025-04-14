
import React from 'react';
import { ModelType } from '@/hooks/useModelSelection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MODEL_OPTIONS } from '@/hooks/useModelSelection';

interface ModelToggleProps {
  currentModel: ModelType;
  onToggle: () => void;
}

export const ModelToggle = ({ currentModel, onToggle }: ModelToggleProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center">
        <ToggleGroup type="single" value={currentModel} className="flex items-center gap-1">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="openai" 
                className={`model-toggle-button ${currentModel === 'openai' ? 'selected bg-cyan-950/60 text-neon-aqua shadow-[0_0_10px_rgba(20,184,166,0.3)]' : ''}`}
                aria-label="Select action.it Core (OpenAI)"
                onClick={() => {
                  if (currentModel !== 'openai') onToggle();
                }}
              >
                <span className="text-xs font-medium">Core</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{MODEL_OPTIONS.openai.name}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="deepseek" 
                className={`model-toggle-button ${currentModel === 'deepseek' ? 'selected bg-purple-950/60 text-neon-purple shadow-[0_0_10px_rgba(168,85,247,0.3)]' : ''}`}
                aria-label="Select Jaxira MYK (DeepSeek)"
                onClick={() => {
                  if (currentModel !== 'deepseek') onToggle();
                }}
              >
                <span className="text-xs font-medium">MYK</span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{MODEL_OPTIONS.deepseek.name}</p>
            </TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </div>
    </TooltipProvider>
  );
};
