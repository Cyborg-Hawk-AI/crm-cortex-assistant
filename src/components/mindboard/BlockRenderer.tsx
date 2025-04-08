import React from 'react';
import { MindBlock } from '@/utils/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FileIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockRendererProps {
  block: MindBlock;
  onUpdate?: (blockId: string, content: any) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, onUpdate }) => {
  const handleTodoToggle = (checked: boolean) => {
    if (onUpdate && block.content_type === 'todo') {
      onUpdate(block.id, {
        ...block.content,
        checked
      });
    }
  };

  // Get indentation level from block properties
  const indentLevel = block.content?.indent || 0;
  const indentPadding = indentLevel * 24; // 24px per indent level

  const renderContent = () => {
    switch (block.content_type) {
      case 'text':
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <p className="whitespace-pre-wrap">{block.content.text}</p>
          </div>
        );
      
      case 'todo':
        return (
          <div className="p-4 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <Checkbox
              checked={block.content.checked}
              onCheckedChange={handleTodoToggle}
              className="mt-1"
            />
            <span className={cn(
              "whitespace-pre-wrap flex-1",
              block.content.checked && "line-through text-muted-foreground"
            )}>
              {block.content.text}
            </span>
          </div>
        );
      
      case 'bullet':
        return (
          <div className="p-4 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <span className="mt-0.5">•</span>
            <span className="whitespace-pre-wrap flex-1">{block.content.text}</span>
          </div>
        );

      case 'numbered':
        return (
          <div className="p-4 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <span className="min-w-[1.5em] text-right">{block.content.number || '1'}.</span>
            <span className="whitespace-pre-wrap flex-1">{block.content.text}</span>
          </div>
        );
      
      case 'heading1':
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <h1 className="text-2xl font-bold whitespace-pre-wrap">{block.content.text}</h1>
          </div>
        );
      
      case 'heading2':
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <h2 className="text-xl font-semibold whitespace-pre-wrap">{block.content.text}</h2>
          </div>
        );
      
      case 'heading3':
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <h3 className="text-lg font-medium whitespace-pre-wrap">{block.content.text}</h3>
          </div>
        );

      case 'toggle':
        return (
          <div className="p-4 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <ChevronRight className={cn(
              "h-4 w-4 mt-1 transition-transform",
              block.content.expanded && "rotate-90"
            )} />
            <span className="whitespace-pre-wrap flex-1">{block.content.text}</span>
          </div>
        );
      
      case 'quote':
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <blockquote className="border-l-4 border-muted pl-4 italic whitespace-pre-wrap">
              {block.content.text}
            </blockquote>
          </div>
        );
      
      case 'callout':
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <div className="bg-muted/30 p-4 rounded-md whitespace-pre-wrap">
              {block.content.text}
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="relative w-full" style={{ marginLeft: `${indentPadding}px` }}>
            <img
              src={block.content.url}
              alt={block.content.caption || 'Image'}
              className="w-full h-full object-contain"
            />
            {block.content.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {block.content.caption}
              </p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="p-4 flex items-center gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <FileIcon className="h-5 w-5" />
            <a
              href={block.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {block.content.name || 'Untitled File'}
            </a>
          </div>
        );
      
      case 'code':
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm whitespace-pre-wrap">
              <code>{block.content.text}</code>
            </pre>
          </div>
        );
      
      case 'divider':
        return (
          <div className="px-4" style={{ marginLeft: `${indentPadding}px` }}>
            <hr className="my-4 border-muted-foreground/30" />
          </div>
        );
      
      default:
        return (
          <div className="p-4" style={{ marginLeft: `${indentPadding}px` }}>
            <p className="text-muted-foreground">Unsupported block type</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full mb-4 overflow-hidden">
      {renderContent()}
    </Card>
  );
};

export default BlockRenderer;
