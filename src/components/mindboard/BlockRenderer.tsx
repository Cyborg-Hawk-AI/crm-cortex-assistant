
import React, { useState, useRef, useEffect } from 'react';
import { MindBlock } from '@/utils/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FileIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommandMenu } from './CommandMenu';
import { BlockCommand } from '@/types/commands';

interface BlockRendererProps {
  block: MindBlock;
  onUpdate?: (content: any) => void;
  onTypeChange?: (blockId: string, newType: string, content: any) => void;
  onDelete?: () => void; // Add this new prop to fix the error
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  block, 
  onUpdate,
  onTypeChange,
  onDelete // Add this to the destructuring
}) => {
  const [localContent, setLocalContent] = useState<any>(block.content);
  const [showCommands, setShowCommands] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    console.log('BlockRenderer - Block updated from props:', {
      blockId: block.id.substring(0, 8),
      position: block.position,
      updated_at: block.updated_at,
    });
    setLocalContent(block.content);
  }, [block]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [localContent.text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/' && !showCommands) {
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY
      });
      setShowCommands(true);
      setCommandQuery('/');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (showCommands) {
      setCommandQuery(value);
    }
    handleContentChange(value);
  };

  const handleContentChange = (value: string) => {
    const newContent = { ...localContent, text: value };
    console.log('BlockRenderer - Content changed:', {
      blockId: block.id.substring(0, 8),
      oldText: localContent.text?.substring(0, 20),
      newText: value.substring(0, 20),
      position: block.position
    });
    setLocalContent(newContent);
    if (onUpdate) {
      console.log('BlockRenderer - Triggering onUpdate');
      onUpdate(newContent);
    }
  };

  const handleTodoToggle = (checked: boolean) => {
    if (onUpdate && block.content_type === 'todo') {
      console.log('BlockRenderer - Todo toggled:', {
        blockId: block.id.substring(0, 8),
        oldState: localContent.checked,
        newState: checked,
        position: block.position
      });
      const newContent = { 
        ...localContent, 
        checked: checked 
      };
      setLocalContent(newContent);
      onUpdate(newContent);
    }
  };

  const handleCommandSelect = (command: BlockCommand) => {
    setShowCommands(false);
    setCommandQuery('');
    if (onTypeChange) {
      let newContent: any = { text: '' };
      if (command.type === 'todo') {
        newContent.checked = false;
      }
      onTypeChange(block.id, command.type, newContent);
    }
  };

  const indentLevel = block.content?.indent || 0;
  const indentPadding = indentLevel * 24; // 24px per indent level

  const renderContent = () => {
    switch (block.content_type) {
      case 'text':
        return (
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
            <textarea
              ref={textareaRef}
              value={localContent.text || ''}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent resize-none outline-none min-h-[24px] text-foreground placeholder-muted-foreground"
              rows={1}
              style={{
                overflow: 'hidden',
              }}
            />
          </div>
        );
      
      case 'todo':
        return (
          <div className="p-2 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <Checkbox
              checked={localContent.checked || false}
              onCheckedChange={handleTodoToggle}
              className="mt-1"
            />
            <textarea
              ref={textareaRef}
              value={localContent.text || ''}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex-1 bg-transparent resize-none outline-none min-h-[24px]",
                localContent.checked && "line-through text-muted-foreground"
              )}
              rows={1}
              style={{
                overflow: 'hidden',
              }}
            />
          </div>
        );
      
      case 'bullet':
        return (
          <div className="p-2 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <span className="mt-0.5">•</span>
            <span className="whitespace-pre-wrap flex-1">{block.content.text}</span>
          </div>
        );

      case 'numbered':
        return (
          <div className="p-2 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <span className="min-w-[1.5em] text-right">{block.content.number || '1'}.</span>
            <span className="whitespace-pre-wrap flex-1">{block.content.text}</span>
          </div>
        );
      
      case 'heading1':
        return (
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
            <h1 className="text-2xl font-bold whitespace-pre-wrap">{block.content.text}</h1>
          </div>
        );
      
      case 'heading2':
        return (
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
            <h2 className="text-xl font-semibold whitespace-pre-wrap">{block.content.text}</h2>
          </div>
        );
      
      case 'heading3':
        return (
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
            <h3 className="text-lg font-medium whitespace-pre-wrap">{block.content.text}</h3>
          </div>
        );

      case 'toggle':
        return (
          <div className="p-2 flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <ChevronRight className={cn(
              "h-4 w-4 mt-1 transition-transform",
              block.content.expanded && "rotate-90"
            )} />
            <span className="whitespace-pre-wrap flex-1">{block.content.text}</span>
          </div>
        );
      
      case 'quote':
        return (
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
            <blockquote className="border-l-4 border-muted pl-4 italic whitespace-pre-wrap">
              {block.content.text}
            </blockquote>
          </div>
        );
      
      case 'callout':
        return (
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
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
          <div className="p-2 flex items-center gap-2" style={{ marginLeft: `${indentPadding}px` }}>
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
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto font-mono text-sm whitespace-pre-wrap">
              <code>{block.content.text}</code>
            </pre>
          </div>
        );
      
      case 'divider':
        return (
          <div className="px-2" style={{ marginLeft: `${indentPadding}px` }}>
            <hr className="my-4 border-muted-foreground/30" />
          </div>
        );
      
      default:
        return (
          <div className="p-2" style={{ marginLeft: `${indentPadding}px` }}>
            <p className="text-muted-foreground">Unsupported block type</p>
          </div>
        );
    }
  };

  const renderedContent = renderContent();
  const isEditable = block.content_type === 'text' || block.content_type === 'todo';

  return (
    <div className="w-full overflow-hidden transition-all duration-200 hover:bg-muted/5 rounded-lg">
      {renderedContent}
      {showCommands && (
        <CommandMenu
          isOpen={showCommands}
          searchQuery={commandQuery}
          onSelect={handleCommandSelect}
          onClose={() => setShowCommands(false)}
          anchorPosition={menuPosition}
        />
      )}
    </div>
  );
};

export default BlockRenderer;
