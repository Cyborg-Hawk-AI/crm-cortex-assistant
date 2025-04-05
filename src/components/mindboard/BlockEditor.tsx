import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, Copy, MoreVertical, ChevronDown, GripVertical, 
  ChevronRight, Calendar, User, Flag, Hash, FileText, Image,
  Code, Table, Columns, Quote, List, ListOrdered, Minus, Link, CheckSquare, Lightbulb
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
import { ScrollArea } from '@/components/ui/scroll-area';

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
  { type: 'text', label: 'Text', icon: <FileText className="h-4 w-4" />, shortcut: '/text' },
  { type: 'heading1', label: 'Heading 1', icon: <Hash className="h-4 w-4" />, shortcut: '/h1' },
  { type: 'heading2', label: 'Heading 2', icon: <Hash className="h-4 w-4" />, shortcut: '/h2' },
  { type: 'heading3', label: 'Heading 3', icon: <Hash className="h-4 w-4" />, shortcut: '/h3' },
  { type: 'todo', label: 'To-do', icon: <CheckSquare className="h-4 w-4" />, shortcut: '/todo' },
  { type: 'bullet', label: 'Bullet List', icon: <List className="h-4 w-4" />, shortcut: '/bullet' },
  { type: 'numbered', label: 'Numbered List', icon: <ListOrdered className="h-4 w-4" />, shortcut: '/numbered' },
  { type: 'toggle', label: 'Toggle', icon: <ChevronRight className="h-4 w-4" />, shortcut: '/toggle' },
  { type: 'quote', label: 'Quote', icon: <Quote className="h-4 w-4" />, shortcut: '/quote' },
  { type: 'callout', label: 'Callout', icon: <Lightbulb className="h-4 w-4" />, shortcut: '/callout' },
  { type: 'divider', label: 'Divider', icon: <Minus className="h-4 w-4" />, shortcut: '/divider' },
  { type: 'code', label: 'Code Block', icon: <Code className="h-4 w-4" />, shortcut: '/code' },
  { type: 'image', label: 'Image', icon: <Image className="h-4 w-4" />, shortcut: '/image' },
  { type: 'file', label: 'File', icon: <FileText className="h-4 w-4" />, shortcut: '/file' },
  { type: 'table', label: 'Table', icon: <Table className="h-4 w-4" />, shortcut: '/table' },
  { type: 'columns', label: 'Columns', icon: <Columns className="h-4 w-4" />, shortcut: '/columns' },
] as const;

export function BlockEditor({ pageId, blocks, onCreateBlock, onUpdateBlock, onDeleteBlock, onMoveBlock, onDuplicateBlock }: BlockEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Add placeholder block when editor is empty
  useEffect(() => {
    if (blocks.length === 0) {
      handleCreateBlock('text', { text: '' }, 0);
    }
  }, [blocks.length]);

  // Scroll to bottom when new blocks are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [blocks.length]);

  const handleEditorClick = (e: React.MouseEvent) => {
    if (e.target === editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position = Math.floor(y / 40);
      handleCreateBlock('text', { text: '' }, position);
    }
  };

  const handleBlockClick = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setSelectedBlock(blockId);
  };

  const handleCreateBlock = async (
    type: MindBlock['content_type'], 
    content: any = {}, 
    position?: number,
    parentId?: string
  ) => {
    const newBlockId = await onCreateBlock(type, content, position, parentId);
    if (newBlockId) {
      setSelectedBlock(newBlockId);
      // Focus the new block after a short delay to ensure it's rendered
      setTimeout(() => {
        const newBlockRef = blockRefs.current.get(newBlockId);
        if (newBlockRef) {
          newBlockRef.focus();
        }
      }, 0);
    }
  };

  const handleInsertBlock = async (type: MindBlock['content_type']) => {
    const currentBlock = blocks.find(b => b.id === selectedBlock);
    if (!currentBlock) return;

    const currentIndex = blocks.findIndex(b => b.id === currentBlock.id);
    const position = currentIndex + 1;

    // Initialize content based on block type
    const content: MindBlock['content'] = { text: '' };
    switch (type) {
      case 'todo':
        content.checked = false;
        break;
      case 'heading1':
        content.level = 1;
        break;
      case 'heading2':
        content.level = 2;
        break;
      case 'heading3':
        content.level = 3;
        break;
      case 'toggle':
        content.expanded = true;
        break;
      case 'columns':
        content.columns = 2;
        break;
    }

    await onCreateBlock(type, content, position);
    setShowBlockSelector(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: MindBlock) => {
    // Handle slash command for block selector
    if (e.key === '/' && !e.shiftKey) {
      e.preventDefault();
      const blockRef = blockRefs.current.get(block.id);
      if (blockRef) {
        const rect = blockRef.getBoundingClientRect();
        const scrollContainer = scrollAreaRef.current;
        const scrollOffset = scrollContainer ? scrollContainer.scrollTop : 0;
        
        setBlockSelectorPosition({ 
          x: rect.left, 
          y: rect.top + rect.height - scrollOffset 
        });
        setShowBlockSelector(true);
        setSearchQuery('');
      }
      return;
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

    // Handle Backspace to remove empty blocks
    if (e.key === 'Backspace' && !e.shiftKey) {
      const text = (e.target as HTMLDivElement).textContent || '';
      if (!text.trim() && blocks.length > 1) {
        e.preventDefault();
        onDeleteBlock(block.id);
        // Focus the previous block
        const prevBlock = blocks[blocks.findIndex(b => b.id === block.id) - 1];
        if (prevBlock) {
          setSelectedBlock(prevBlock.id);
        }
      }
    }

    // Handle arrow keys for navigation
    if (e.key === 'ArrowUp' && !e.shiftKey) {
      const currentIndex = blocks.findIndex(b => b.id === block.id);
      if (currentIndex > 0) {
        e.preventDefault();
        setSelectedBlock(blocks[currentIndex - 1].id);
      }
    }
    if (e.key === 'ArrowDown' && !e.shiftKey) {
      const currentIndex = blocks.findIndex(b => b.id === block.id);
      if (currentIndex < blocks.length - 1) {
        e.preventDefault();
        setSelectedBlock(blocks[currentIndex + 1].id);
      }
    }

    // Handle markdown shortcuts
    if (e.key === ' ' && !e.shiftKey) {
      const text = (e.target as HTMLDivElement).textContent || '';
      const trimmedText = text.trim();
      
      if (trimmedText === '#') {
        e.preventDefault();
        handleBlockTypeChange(block.id, 'heading1');
        (e.target as HTMLDivElement).textContent = '';
      } else if (trimmedText === '##') {
        e.preventDefault();
        handleBlockTypeChange(block.id, 'heading2');
        (e.target as HTMLDivElement).textContent = '';
      } else if (trimmedText === '###') {
        e.preventDefault();
        handleBlockTypeChange(block.id, 'heading3');
        (e.target as HTMLDivElement).textContent = '';
      } else if (trimmedText === '-') {
        e.preventDefault();
        handleBlockTypeChange(block.id, 'bullet');
        (e.target as HTMLDivElement).textContent = '';
      } else if (trimmedText === '1.') {
        e.preventDefault();
        handleBlockTypeChange(block.id, 'numbered');
        (e.target as HTMLDivElement).textContent = '';
      } else if (trimmedText === '[]') {
        e.preventDefault();
        handleBlockTypeChange(block.id, 'todo');
        (e.target as HTMLDivElement).textContent = '';
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

  // Filter block types based on search query
  const filteredBlockTypes = BLOCK_TYPES.filter(type => 
    type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (type.shortcut && type.shortcut.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
  
  return (
    <div 
      ref={editorRef}
      className="flex flex-col h-full"
      onClick={handleEditorClick}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Blocks</h2>
      </div>
      
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-2 min-h-full">
          {blocks.map((block, index) => (
            <motion.div
              key={block.id}
              className={cn(
                "group relative flex items-start gap-2 p-2 rounded-lg hover:bg-accent/5",
                selectedBlock === block.id && "bg-accent/10",
                draggedBlock === block.id && "opacity-50"
              )}
              onClick={(e) => handleBlockClick(e, block.id)}
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
              layout
            >
              {/* Block Controls - Only show on hover */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 cursor-grab"
                  onMouseDown={() => setDraggedBlock(block.id)}
                  onMouseUp={() => setDraggedBlock(null)}
                >
                  <GripVertical className="h-4 w-4" />
            </Button>
          </div>

              {/* Block Content */}
              <div 
                className="flex-1"
                ref={(el) => {
                  if (el) {
                    blockRefs.current.set(block.id, el);
                  } else {
                    blockRefs.current.delete(block.id);
                  }
                }}
              >
                {renderBlockContent(block)}
                  </div>
                    
              {/* Block Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      <Button 
                  variant="ghost"
                        size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBlock(block.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button 
                  variant="ghost"
                        size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateBlock?.(block.id);
                  }}
                >
                  <Copy className="h-4 w-4" />
                      </Button>
              </div>

              {/* Insert Block Button */}
              {hoveredBlock === block.id && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full bg-background border"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateBlock('text', { text: '' }, index + 1);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
          </div>
        )}
            </motion.div>
          ))}

          {/* Phantom Block */}
          <div
            className="h-8 opacity-0 hover:opacity-100 transition-opacity cursor-text"
            onClick={() => handleCreateBlock('text', { text: '' }, blocks.length)}
            onFocus={() => handleCreateBlock('text', { text: '' }, blocks.length)}
            tabIndex={0}
          />
        </div>
      </ScrollArea>

      {/* Block Selector Menu */}
      {showBlockSelector && (
        <DropdownMenu open={showBlockSelector} onOpenChange={setShowBlockSelector}>
          <DropdownMenuContent
            style={{
              position: 'fixed',
              left: blockSelectorPosition.x,
              top: blockSelectorPosition.y,
            }}
            className="w-56"
          >
            <div className="p-2">
              <Input
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredBlockTypes.map(({ type, label, icon, shortcut }) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => handleInsertBlock(type)}
                  className="flex items-center gap-2"
                >
                  {icon}
                  <span>{label}</span>
                  <span className="text-muted-foreground text-xs ml-auto">
                    {shortcut}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
