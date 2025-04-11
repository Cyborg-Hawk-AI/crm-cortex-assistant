
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
      <div className="flex items-center gap-1">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem 
                value="openai" 
                className={`model-toggle-button ${currentModel === 'openai' ? 'selected' : ''}`}
                aria-label="Select ActionAlpha (OpenAI)"
                onClick={() => {
                  if (currentModel !== 'openai') onToggle();
                }}
              >
                <span className="text-xs font-medium">Α</span>
                <span className="hidden sm:inline text-xs ml-1">Alpha</span>
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{MODEL_OPTIONS.openai.name} ({MODEL_OPTIONS.openai.description})</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div>
              <ToggleGroupItem 
                value="deepseek" 
                className={`model-toggle-button ${currentModel === 'deepseek' ? 'selected' : ''}`}
                aria-label="Select ActionOmega (DeepSeek)"
                onClick={() => {
                  if (currentModel !== 'deepseek') onToggle();
                }}
              >
                <span className="text-xs font-medium">Ω</span>
                <span className="hidden sm:inline text-xs ml-1">Omega</span>
              </ToggleGroupItem>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{MODEL_OPTIONS.deepseek.name} ({MODEL_OPTIONS.deepseek.description})</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
