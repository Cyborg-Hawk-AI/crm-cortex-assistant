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

export function BlockEditor({ pageId, blocks: unsortedBlocks, onCreateBlock, onUpdateBlock, onDeleteBlock, onMoveBlock, onDuplicateBlock }: BlockEditorProps) {
  // Sort blocks by position at the component level
  const blocks = [...unsortedBlocks].sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 BlockEditor State Update:', {
      selectedBlock,
      draggedBlock,
      hoveredBlock,
      editingContent,
      blocksCount: blocks.length,
      blocks: blocks.map(b => ({ id: b.id, type: b.content_type, position: b.position }))
    });
  }, [selectedBlock, draggedBlock, hoveredBlock, editingContent, blocks]);

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

  // Function to set cursor at the end of a contentEditable div
  const setCursorToEnd = (element: HTMLDivElement) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    if (e.target === editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position = Math.floor(y / 40);
      handleCreateBlock('text', { text: '' }, position);
    }
  };

  const handleBlockClick = (e: React.MouseEvent, blockId: string) => {
    console.log('🖱️ Block clicked:', {
      blockId,
      currentPosition: blocks.findIndex(b => b.id === blockId),
      previousSelected: selectedBlock
    });
    e.stopPropagation();
    setSelectedBlock(blockId);
  };

  const handleCreateBlock = async (
    type: MindBlock['content_type'],
    content: any,
    position: number,
    parentId?: string
  ) => {
    console.log('➕ Creating new block:', {
      type,
      position,
      parentId,
      content,
      currentBlocks: blocks.map(b => ({ id: b.id, position: b.position }))
    });

    try {
      // Calculate the new position by finding the maximum position and adding 1
      const maxPosition = Math.max(...blocks.map(b => b.position || 0), 0);
      const newPosition = position > maxPosition ? position : maxPosition + 1;

      // Create the new block first
      const newBlockId = await onCreateBlock(type, content, newPosition, parentId);
      
      // Then update positions of existing blocks
      const blocksToUpdate = blocks
        .filter(b => b.position >= position && b.id !== newBlockId)
        .map(b => ({
          id: b.id,
          newPosition: (b.position || 0) + 1
        }));

      // Update positions in sequence
      for (const block of blocksToUpdate) {
        await onUpdateBlock(block.id, { 
          ...blocks.find(b => b.id === block.id)?.content,
          position: block.newPosition 
        });
      }

      console.log('✅ Block created successfully:', {
        newBlockId,
        newPosition,
        updatedBlocks: blocksToUpdate
      });

      if (newBlockId) {
        setSelectedBlock(newBlockId);
        // Focus the new block after a short delay to ensure it's rendered
        setTimeout(() => {
          const newBlockRef = blockRefs.current.get(newBlockId);
          if (newBlockRef) {
            newBlockRef.focus();
            setCursorToEnd(newBlockRef);
            console.log('🎯 Focused new block:', newBlockId);
          }
        }, 50); // Increased delay to ensure rendering
      }
    } catch (error) {
      console.error('❌ Error creating block:', error);
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

    // Handle Shift+Enter for todo blocks
    if (e.key === 'Enter' && e.shiftKey && block.content_type === 'todo') {
      e.preventDefault();
      const position = blocks.findIndex(b => b.id === block.id) + 1;
      
      // Create a new todo block below the current one
      handleCreateBlock('todo', {
        text: '',
        checked: false,
        // Inherit properties from the current block
        assignee: block.content.assignee,
        due_date: block.content.due_date,
        priority: block.content.priority,
        status: block.content.status
      }, position, block.parent_block_id);
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

  const handleContentUpdate = (blockId: string, content: string) => {
    console.log('📝 Content update triggered:', {
      blockId,
      content,
      currentContent: blocks.find(b => b.id === blockId)?.content.text
    });

    // Clear any existing timeout for this block
    if (updateTimeoutRef.current[blockId]) {
      console.log('⏱️ Clearing existing timeout for block:', blockId);
      clearTimeout(updateTimeoutRef.current[blockId]);
    }

    // Only store the content in local state, don't update the server yet
    setEditingContent(prev => ({ ...prev, [blockId]: content }));
  };

  const handleContentSave = async (blockId: string, content: string) => {
    console.log('💾 Saving content update for block:', {
      blockId,
      content,
      currentPosition: blocks.findIndex(b => b.id === blockId)
    });

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    try {
      // Preserve the block's position and other properties when updating content
      await onUpdateBlock(blockId, { 
        ...block.content, 
        text: content,
        position: block.position // Explicitly preserve position
      });

      // Clear the editing state after successful save
      setEditingContent(prev => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
    } catch (error) {
      console.error('❌ Error saving block content:', error);
    }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      console.log('⏎ Enter key pressed in block:', {
        blockId,
        currentContent: (e.target as HTMLDivElement).textContent
      });
      e.preventDefault();
      const content = (e.target as HTMLDivElement).textContent || '';
      handleContentSave(blockId, content);
    }
  };

  // Filter block types based on search query
  const filteredBlockTypes = BLOCK_TYPES.filter(type => 
    type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (type.shortcut && type.shortcut.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderBlockContent = (block: MindBlock) => {
    console.log('🎨 Rendering block:', {
      id: block.id,
      type: block.content_type,
      position: block.position,
      content: block.content
    });

    const commonProps = {
      contentEditable: true,
      suppressContentEditableWarning: true,
      dir: "ltr",
      onInput: (e: React.FormEvent<HTMLDivElement>) => {
        const content = e.currentTarget.textContent || '';
        handleContentUpdate(block.id, content);
        // Ensure cursor stays at the right position after input
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        if (range) {
          const offset = range.endOffset;
          setTimeout(() => {
            try {
              range.setStart(range.endContainer, offset);
              range.setEnd(range.endContainer, offset);
              selection?.removeAllRanges();
              selection?.addRange(range);
            } catch (e) {
              console.error('Error restoring cursor position:', e);
            }
          }, 0);
        }
      },
      onKeyDown: (e: React.KeyboardEvent) => {
        handleKeyDown(e, block);
        handleContentKeyDown(e, block.id);
      },
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
        const content = e.currentTarget.textContent || '';
        console.log('👋 Block blur:', {
          blockId: block.id,
          content,
          currentPosition: blocks.findIndex(b => b.id === block.id)
        });
        handleContentSave(block.id, content);
      },
      onFocus: (e: React.FocusEvent<HTMLDivElement>) => {
        // Set cursor to end when focusing empty block
        if (!e.currentTarget.textContent) {
          setCursorToEnd(e.currentTarget);
        }
      },
      dangerouslySetInnerHTML: { 
        __html: editingContent[block.id] || block.content.text || '' 
      }
    };

    switch (block.content_type) {
      case 'text':
        return (
          <div
            {...commonProps}
            className="min-h-[24px] focus:outline-none text-left"
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
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
            style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
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
              className="flex-1 min-h-[24px] focus:outline-none text-left"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
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
              className="flex-1 min-h-[24px] focus:outline-none text-left"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
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
              className="flex-1 min-h-[24px] focus:outline-none text-left"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
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
              className="flex-1 min-h-[24px] focus:outline-none text-left"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            />
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-accent pl-4">
            <div
              {...commonProps}
              className="min-h-[24px] focus:outline-none italic text-left"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
            />
          </div>
        );

      case 'callout':
        return (
          <div className="bg-accent/10 p-4 rounded-lg">
            <div
              {...commonProps}
              className="min-h-[24px] focus:outline-none text-left"
              style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
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
          {blocks.map((block, index) => {
            console.log('📦 Rendering block in list:', {
              id: block.id,
              index,
              position: block.position,
              type: block.content_type
            });
            return (
              <div
                key={block.id}
                className={cn(
                  "group relative flex items-start gap-2 p-2 rounded-lg hover:bg-accent/5",
                  selectedBlock === block.id && "bg-accent/10",
                  draggedBlock === block.id && "opacity-50"
                )}
                onClick={(e) => handleBlockClick(e, block.id)}
                onMouseEnter={() => {
                  console.log('🐭 Mouse entered block:', block.id);
                  setHoveredBlock(block.id);
                }}
                onMouseLeave={() => {
                  console.log('🐭 Mouse left block:', block.id);
                  setHoveredBlock(null);
                }}
                style={{
                  position: 'relative',
                  zIndex: selectedBlock === block.id ? 1 : 0
                }}
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
              </div>
            );
          })}

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
