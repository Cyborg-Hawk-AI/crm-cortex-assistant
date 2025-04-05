import React, { useState, useRef, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, Copy, MoreVertical, ChevronDown, GripVertical, 
  ChevronRight, Calendar, User, Flag, Hash, FileText, Image,
  Code, Table, Columns, Quote, List, ListOrdered, Minus, Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { MindBlock } from '@/utils/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BlockEditorProps {
  pageId: string;
  blocks: MindBlock[];
  onCreateBlock: (type: MindBlock['content_type'], content: any, position?: number, parentId?: string) => Promise<void>;
  onUpdateBlock: (id: string, content: any, properties?: Record<string, any>) => Promise<void>;
  onDeleteBlock: (id: string) => Promise<void>;
  onMoveBlock?: (id: string, newPosition: number, newParentId?: string) => Promise<void>;
  onDuplicateBlock?: (id: string) => Promise<void>;
}

const BLOCK_TYPES = [
  { type: 'text', label: 'Text', icon: <FileText className="h-4 w-4" />, shortcut: 'just start typing' },
  { type: 'heading1', label: 'Heading 1', icon: '#', shortcut: '# ' },
  { type: 'heading2', label: 'Heading 2', icon: '##', shortcut: '## ' },
  { type: 'heading3', label: 'Heading 3', icon: '###', shortcut: '### ' },
  { type: 'todo', label: 'To-do', icon: '☐', shortcut: '[] ' },
  { type: 'bullet', label: 'Bullet List', icon: <List className="h-4 w-4" />, shortcut: '- ' },
  { type: 'numbered', label: 'Numbered List', icon: <ListOrdered className="h-4 w-4" />, shortcut: '1. ' },
  { type: 'toggle', label: 'Toggle', icon: <ChevronRight className="h-4 w-4" />, shortcut: '> ' },
  { type: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" />, shortcut: '> ' },
  { type: 'callout', label: 'Callout', icon: '💡', shortcut: '!!! ' },
  { type: 'divider', label: 'Divider', icon: <Minus className="h-4 w-4" />, shortcut: '---' },
  { type: 'code', label: 'Code', icon: <Code className="h-4 w-4" />, shortcut: '```' },
  { type: 'image', label: 'Image', icon: <Image className="h-4 w-4" />, shortcut: null },
  { type: 'file', label: 'File', icon: '📎', shortcut: null },
  { type: 'table', label: 'Table', icon: <Table className="h-4 w-4" />, shortcut: null },
  { type: 'columns', label: 'Columns', icon: <Columns className="h-4 w-4" />, shortcut: null },
] as const;

export function BlockEditor({ pageId, blocks, onCreateBlock, onUpdateBlock, onDeleteBlock, onMoveBlock, onDuplicateBlock }: BlockEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleBlockClick = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setSelectedBlock(blockId);
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    if (e.target === editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position = Math.floor(y / 40);
      handleCreateBlock('text', { text: '' }, position);
    }
  };

  const handleCreateBlock = async (
    type: MindBlock['content_type'], 
    content: any = {}, 
    position?: number,
    parentId?: string
  ) => {
    await onCreateBlock(type, content, position, parentId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: MindBlock) => {
    // Handle markdown shortcuts
    if (e.key === ' ' && !e.shiftKey) {
      const text = (e.target as HTMLDivElement).textContent || '';
      
      // Check for markdown shortcuts
      switch (text.trim()) {
        case '#':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'heading1');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '##':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'heading2');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '###':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'heading3');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '-':
        case '*':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'bullet');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '1.':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'numbered');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '[]':
        case '[ ]':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'todo');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '>':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'toggle');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '```':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'code');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '---':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'divider');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '!!!':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'callout');
          (e.target as HTMLDivElement).textContent = '';
          return;
        case '>quote':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'quote');
          (e.target as HTMLDivElement).textContent = '';
          return;
      }
    }

    // Handle Enter for new blocks
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const position = blocks.findIndex(b => b.id === block.id) + 1;
      
      // Continue the same block type for lists and todos
      const continueTypes: MindBlock['content_type'][] = ['bullet', 'numbered', 'todo'];
      const newType = continueTypes.includes(block.content_type) ? block.content_type : 'text';
      
      // If the current block is empty and is a continuing type, convert it to text
      if (continueTypes.includes(block.content_type) && !block.content.text?.trim()) {
        handleBlockTypeChange(block.id, 'text');
        return;
      }
      
      handleCreateBlock(newType, {
        text: '',
        checked: newType === 'todo' ? false : undefined
      }, position, block.parent_block_id);
    }

    // Handle Tab for nesting
    if (e.key === 'Tab') {
      e.preventDefault();
      const parentBlock = blocks.find(b => 
        b.position === (block.position || 0) - 1 && 
        (!b.parent_block_id || b.parent_block_id === block.parent_block_id)
      );
      if (parentBlock) {
        onMoveBlock?.(block.id, block.position || 0, parentBlock.id);
      }
    }
  };

  const handleBlockTypeChange = async (blockId: string, newType: MindBlock['content_type']) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Preserve the text content when converting between text-based blocks
    const textContent = block.content.text || '';
    
    // Initialize new content based on the target block type
    const newContent: MindBlock['content'] = {
      text: textContent,
    };

    // Add type-specific properties
    switch (newType) {
      case 'todo':
        newContent.checked = false;
        break;
      case 'heading1':
        newContent.level = 1;
        break;
      case 'heading2':
        newContent.level = 2;
        break;
      case 'heading3':
        newContent.level = 3;
        break;
      case 'toggle':
        newContent.expanded = true;
        break;
      case 'columns':
        newContent.columns = 2;
        break;
      // Add other type-specific initializations as needed
    }

    await onUpdateBlock(blockId, {
      content_type: newType,
      ...newContent
    });
  };

  const renderBlockContent = (block: MindBlock) => {
    const commonProps = {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => 
        onUpdateBlock(block.id, { ...block.content, text: e.currentTarget.textContent }),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block),
    };

    switch (block.content_type) {
      case 'text':
        return (
          <div
            {...commonProps}
            className="min-h-[24px] focus:outline-none"
            dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
          />
        );

      case 'heading1':
      case 'heading2':
      case 'heading3':
        const headingSize = block.content_type === 'heading1' ? 'text-2xl' : 
                          block.content_type === 'heading2' ? 'text-xl' : 'text-lg';
        return (
          <div
            {...commonProps}
            className={cn("font-semibold min-h-[32px] focus:outline-none", headingSize)}
            dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
          />
        );

      case 'todo':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.content.checked}
              onChange={(e) => onUpdateBlock(block.id, { 
                ...block.content,
                checked: e.target.checked 
              })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <div
              {...commonProps}
              className="flex-1 min-h-[24px] focus:outline-none"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
            {block.content.assignee && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{block.content.assignee}</span>
              </div>
            )}
            {block.content.due_date && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(block.content.due_date), 'MMM d')}</span>
              </div>
            )}
          </label>
        );

      case 'bullet':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-2">•</span>
            <div
              {...commonProps}
              className="flex-1 min-h-[24px] focus:outline-none"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'numbered':
        const index = blocks
          .filter(b => b.content_type === 'numbered' && b.parent_block_id === block.parent_block_id)
          .findIndex(b => b.id === block.id) + 1;
        return (
          <div className="flex items-start gap-2">
            <span className="mt-2 min-w-[1.5em]">{index}.</span>
            <div
              {...commonProps}
              className="flex-1 min-h-[24px] focus:outline-none"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 mt-1"
              onClick={() => onUpdateBlock(block.id, {
                ...block.content,
                expanded: !block.content.expanded
              })}
            >
              <ChevronRight className={cn(
                "h-4 w-4 transition-transform",
                block.content.expanded && "rotate-90"
              )} />
            </Button>
            <div
              {...commonProps}
              className="flex-1 min-h-[24px] focus:outline-none"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-accent pl-4">
            <div
              {...commonProps}
              className="min-h-[24px] focus:outline-none italic"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'callout':
        return (
          <div className="bg-accent/10 p-4 rounded-lg">
            <div
              {...commonProps}
              className="min-h-[24px] focus:outline-none"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'divider':
        return <hr className="my-4 border-accent" />;

      case 'code':
        return (
          <div className="bg-accent/10 p-4 rounded-lg font-mono">
            <div
              {...commonProps}
              className="min-h-[24px] focus:outline-none"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'image':
      case 'video':
        return (
          <div className="relative group">
            {block.content.url ? (
              block.content_type === 'image' ? (
                <img 
                  src={block.content.url} 
                  alt={block.content.text || ''} 
                  className="max-w-full rounded-lg"
                />
              ) : (
                <video 
                  src={block.content.url}
                  controls
                  className="max-w-full rounded-lg"
                />
              )
            ) : (
              <div className="border-2 border-dashed border-accent p-8 rounded-lg text-center">
                <Button variant="ghost" size="sm">
                  Upload {block.content_type}
                </Button>
              </div>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center gap-2 p-2 bg-accent/5 rounded">
            <span className="text-lg">📎</span>
            <span>{block.content.filename || 'Untitled File'}</span>
            {!block.content.url && (
              <Button variant="ghost" size="sm">Upload file</Button>
            )}
          </div>
        );

      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Table implementation */}
            </table>
          </div>
        );

      case 'columns':
        return (
          <div className="grid gap-4" style={{ 
            gridTemplateColumns: `repeat(${block.content.columns || 2}, 1fr)` 
          }}>
            {/* Column content */}
          </div>
        );

      default:
        return null;
    }
  };

  const renderBlock = (block: MindBlock) => {
    const isSelected = selectedBlock === block.id;
    const hasChildren = blocks.some(b => b.parent_block_id === block.id);
    const isChild = !!block.parent_block_id;

    return (
      <Reorder.Item
        key={block.id}
        value={block}
        className={cn(
          "group relative flex items-start gap-2 p-2 rounded-lg hover:bg-accent/5",
          isSelected && "bg-accent/10",
          isChild && "ml-8"
        )}
        onClick={(e) => handleBlockClick(e, block.id)}
        dragListener={!block.content_type.startsWith('heading')}
      >
        <div className="opacity-0 group-hover:opacity-100 cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Block Content */}
        <div className="flex-1">
          {renderBlockContent(block)}
          
          {/* Nested Blocks */}
          {hasChildren && block.content.expanded !== false && (
            <div className="mt-2">
              {blocks
                .filter(b => b.parent_block_id === block.id)
                .map(renderBlock)}
            </div>
          )}
        </div>

        {/* Block Controls */}
        <div className={cn(
          "absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100",
          isSelected && "opacity-100"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDuplicateBlock?.(block.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteBlock(block.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {block.content_type === 'todo' && (
                <>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Calendar className="h-4 w-4 mr-2" />
                      Add due date
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {/* Date picker implementation */}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <User className="h-4 w-4 mr-2" />
                      Assign to
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {/* User picker implementation */}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Flag className="h-4 w-4 mr-2" />
                      Set priority
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => 
                        onUpdateBlock(block.id, { ...block.content, priority: 'high' })
                      }>
                        🔴 High
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => 
                        onUpdateBlock(block.id, { ...block.content, priority: 'medium' })
                      }>
                        🟡 Medium
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => 
                        onUpdateBlock(block.id, { ...block.content, priority: 'low' })
                      }>
                        🟢 Low
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </>
              )}

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Hash className="h-4 w-4 mr-2" />
                  Turn into
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {BLOCK_TYPES.map(({ type, label, icon }) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleBlockTypeChange(block.id, type)}
                    >
                      <span className="mr-2">{icon}</span>
                      {label}
                      {type === block.content_type && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Reorder.Item>
    );
  };

  return (
    <div 
      ref={editorRef}
      className="min-h-full p-8"
      onClick={handleEditorClick}
    >
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={(newOrder) => {
          newOrder.forEach((block, index) => {
            if (onMoveBlock) onMoveBlock(block.id, index);
          });
        }}
        className="space-y-1"
      >
        {blocks.map(renderBlock)}
      </Reorder.Group>

      {/* Add New Block Button */}
      <div className="mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add new block...
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {BLOCK_TYPES.map(({ type, label, icon, shortcut }) => (
              <DropdownMenuItem
                key={type}
                onClick={() => handleCreateBlock(type as MindBlock['content_type'], { text: '' })}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="mr-2">{icon}</span>
                  {label}
                </div>
                {shortcut && (
                  <span className="text-xs text-muted-foreground">{shortcut}</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
