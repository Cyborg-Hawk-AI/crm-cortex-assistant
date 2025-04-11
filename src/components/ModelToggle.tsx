
import React from 'react';
import { ModelType } from '@/hooks/useModelSelection';
import { Toggle } from '@/components/ui/toggle';
import { useTooltip, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface ModelToggleProps {
  currentModel: ModelType;
  onToggle: () => void;
}

export const ModelToggle = ({ currentModel, onToggle }: ModelToggleProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Toggle 
            pressed={currentModel === 'deepseek'} 
            onPressedChange={() => onToggle()}
            className="h-8 w-8 p-0 data-[state=on]:bg-teal-900 data-[state=on]:text-white hover:bg-teal-800"
            aria-label="Toggle AI model"
          >
            {currentModel === 'openai' ? (
              <ToggleLeft className="h-4 w-4" />
            ) : (
              <ToggleRight className="h-4 w-4" />
            )}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{currentModel === 'openai' ? 'ActionAlpha (OpenAI)' : 'ActionOmega (DeepSeek)'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
