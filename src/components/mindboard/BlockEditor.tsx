
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  onCreateBlock: (type: MindBlock['content_type'], content: any, position?: number, parentId?: string) => Promise<string>;
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

// Increased debounce time to reduce update frequency
const CONTENT_UPDATE_DEBOUNCE = 2000;

export function BlockEditor({ pageId, blocks: unsortedBlocks, onCreateBlock, onUpdateBlock, onDeleteBlock, onMoveBlock, onDuplicateBlock }: BlockEditorProps) {
  // Sort blocks by position to ensure consistent rendering
  const blocks = [...unsortedBlocks].sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const contentChangeRef = useRef<Map<string, boolean>>(new Map());

  // Create a default block if none exist
  useEffect(() => {
    if (blocks.length === 0) {
      handleCreateBlock('text', { text: '' }, 0);
    }
  }, [blocks.length]);

  // Scroll to bottom when blocks change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [blocks.length]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

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
    content: any,
    position: number,
    parentId?: string
  ) => {
    try {
      // Use the provided position or add at the end
      const maxPosition = Math.max(...blocks.map(b => b.position || 0), 0);
      const newPosition = position > maxPosition ? position : maxPosition + 1;

      const newBlockId = await onCreateBlock(type, content, newPosition, parentId);
      
      setSelectedBlock(newBlockId);
      
      // Focus the new block after a short delay to ensure the DOM has updated
      setTimeout(() => {
        const newBlockRef = blockRefs.current.get(newBlockId);
        if (newBlockRef) {
          newBlockRef.focus();
        }
      }, 100);
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

  const handleInsertBlock = async (type: MindBlock['content_type']) => {
    const currentBlock = blocks.find(b => b.id === selectedBlock);
    if (!currentBlock) return;

    const currentIndex = blocks.findIndex(b => b.id === currentBlock.id);
    const position = currentIndex + 1;

    const content: Record<string, any> = { text: '' };
    
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
    // Handle slash to show block selector
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

    // Handle Shift+Enter for todo items
    if (e.key === 'Enter' && e.shiftKey && block.content_type === 'todo') {
      e.preventDefault();
      const position = blocks.findIndex(b => b.id === block.id) + 1;
      
      handleCreateBlock('todo', {
        text: '',
        checked: false,
        assignee: block.content.assignee,
        due_date: block.content.due_date,
        priority: block.content.priority,
        status: block.content.status
      }, position, block.parent_block_id);
      return;
    }

    // Handle Enter to create a new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const position = blocks.findIndex(b => b.id === block.id) + 1;
      
      const continueTypes: MindBlock['content_type'][] = ['bullet', 'numbered', 'todo'];
      const newType = continueTypes.includes(block.content_type) ? block.content_type : 'text';
      
      if (continueTypes.includes(block.content_type) && !block.content.text?.trim()) {
        handleBlockTypeChange(block.id, 'text');
        return;
      }
      
      handleCreateBlock(newType, {
        text: '',
        checked: newType === 'todo' ? false : undefined
      }, position, block.parent_block_id);
    }

    // Handle Backspace to delete empty block
    if (e.key === 'Backspace' && !e.shiftKey) {
      const text = (e.target as HTMLDivElement).textContent || '';
      if (!text.trim() && blocks.length > 1) {
        e.preventDefault();
        onDeleteBlock(block.id);
        const prevBlock = blocks[blocks.findIndex(b => b.id === block.id) - 1];
        if (prevBlock) {
          setSelectedBlock(prevBlock.id);
        }
      }
    }

    // Handle up/down arrows for block navigation
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

    // Markdown-style shortcuts
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

    const textContent = block.content.text || '';
    
    const newContent: Record<string, any> = {
      text: textContent,
    };

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
    }

    await onUpdateBlock(blockId, {
      content_type: newType,
      ...newContent
    });
  };

  // Simplified content update function to prevent cursor movement issues
  const handleContentChange = (blockId: string, event: React.FormEvent<HTMLDivElement>) => {
    const content = event.currentTarget.textContent || '';
    
    // Update with debounce to prevent excessive saves
    if (updateTimeoutRef.current[blockId]) {
      clearTimeout(updateTimeoutRef.current[blockId]);
    }
    
    contentChangeRef.current.set(blockId, true);
    
    updateTimeoutRef.current[blockId] = setTimeout(() => {
      if (contentChangeRef.current.get(blockId)) {
        const block = blocks.find(b => b.id === blockId);
        if (block) {
          onUpdateBlock(blockId, { 
            ...block.content, 
            text: content 
          });
          contentChangeRef.current.set(blockId, false);
        }
      }
    }, CONTENT_UPDATE_DEBOUNCE);
  };

  // Handle block content blur for saving changes
  const handleContentBlur = (blockId: string, event: React.FocusEvent<HTMLDivElement>) => {
    const content = event.currentTarget.textContent || '';
    
    if (updateTimeoutRef.current[blockId]) {
      clearTimeout(updateTimeoutRef.current[blockId]);
    }
    
    if (contentChangeRef.current.get(blockId)) {
      const block = blocks.find(b => b.id === blockId);
      if (block) {
        onUpdateBlock(blockId, { 
          ...block.content, 
          text: content 
        });
        contentChangeRef.current.set(blockId, false);
      }
    }
  };

  const filteredBlockTypes = BLOCK_TYPES.filter(type => 
    type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (type.shortcut && type.shortcut.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderBlockContent = (block: MindBlock) => {
    const commonProps = {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLDivElement>) => handleContentChange(block.id, e),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, block),
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => handleContentBlur(block.id, e),
      className: "min-h-[24px] focus:outline-none text-left",
    };

    switch (block.content_type) {
      case 'text':
        return (
          <div
            {...commonProps}
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
            className={cn("font-semibold min-h-[32px] focus:outline-none text-left", headingSize)}
            dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
          />
        );

      case 'todo':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={block.content.checked || false}
              onChange={(e) => {
                e.stopPropagation();
                onUpdateBlock(block.id, { 
                  ...block.content,
                  checked: e.target.checked 
                });
              }}
              className="h-4 w-4 rounded border-gray-300"
              onClick={(e) => e.stopPropagation()}
            />
            <div
              {...commonProps}
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
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-accent pl-4">
            <div
              {...commonProps}
              className="min-h-[24px] focus:outline-none italic text-left"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'callout':
        return (
          <div className="bg-accent/10 p-4 rounded-lg">
            <div
              {...commonProps}
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
            <div
              key={block.id}
              className={cn(
                "group relative flex items-start gap-2 p-2 rounded-lg hover:bg-accent/5",
                selectedBlock === block.id && "bg-accent/10"
              )}
              onClick={(e) => handleBlockClick(e, block.id)}
              onMouseEnter={() => setHoveredBlock(block.id)}
              onMouseLeave={() => setHoveredBlock(null)}
            >
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <GripVertical className="h-4 w-4" />
                </Button>
              </div>

              <div 
                className="flex-1" 
                ref={(el) => {
                  if (el) blockRefs.current.set(block.id, el);
                  else blockRefs.current.delete(block.id);
                }}
              >
                {renderBlockContent(block)}
              </div>

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
            </div>
          ))}

          <div
            className="h-8 opacity-0 hover:opacity-100 transition-opacity cursor-text"
            onClick={() => handleCreateBlock('text', { text: '' }, blocks.length)}
            onFocus={() => handleCreateBlock('text', { text: '' }, blocks.length)}
            tabIndex={0}
          />
        </div>
      </ScrollArea>

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

