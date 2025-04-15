
import React, { useEffect } from 'react';
import { ModelType } from '@/hooks/useModelSelection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { MODEL_OPTIONS } from '@/hooks/useModelSelection';

interface ModelToggleProps {
  currentModel: ModelType;
  onToggle: () => void;
  disabled?: boolean;
}

export const ModelToggle = ({ currentModel, onToggle, disabled = false }: ModelToggleProps) => {
  // Log the current model on mount and when it changes
  useEffect(() => {
    console.log(`ModelToggle component rendered with currentModel: ${currentModel}`);
  }, [currentModel]);

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <ToggleGroup 
          type="single" 
          value={currentModel} 
          className="flex items-center gap-1"
          onValueChange={(value) => {
            if (value && value !== currentModel) {
              console.log(`ModelToggle direct value change: ${value}`);
              // This should not happen normally as we're using onClick handlers
            }
          }}
        >
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <ToggleGroupItem 
                value="openai" 
                className={`model-toggle-button ${currentModel === 'openai' ? 'selected bg-cyan-950/60 text-neon-aqua shadow-[0_0_10px_rgba(20,184,166,0.3)]' : ''}`}
                aria-label="Select action.it Core (OpenAI)"
                onClick={() => {
                  if (currentModel !== 'openai') {
                    console.log('Toggling to OpenAI model via Core button click');
                    onToggle();
                  }
                }}
                disabled={disabled}
                data-active={currentModel === 'openai'}
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
                aria-label="Select Jaxira MetaYield Kernel (DeepSeek)"
                onClick={() => {
                  if (currentModel !== 'deepseek') {
                    console.log('Toggling to DeepSeek model via MYK button click');
                    onToggle();
                  }
                }}
                disabled={disabled}
                data-active={currentModel === 'deepseek'}
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
