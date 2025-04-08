
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

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

// Increase the debounce time to reduce update frequency
const CONTENT_UPDATE_DEBOUNCE = 800;

export function BlockEditor({ pageId, blocks: unsortedBlocks, onCreateBlock, onUpdateBlock, onDeleteBlock, onMoveBlock, onDuplicateBlock }: BlockEditorProps) {
  // Sort blocks to maintain stable ordering
  const blocks = [...unsortedBlocks].sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [slashCommandOpen, setSlashCommandOpen] = useState(false);
  const [slashCommandPosition, setSlashCommandPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  
  // New state to track if an update is in progress to prevent multiple updates
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const contentChangeRef = useRef<Map<string, boolean>>(new Map());
  const nestedLevels = useRef<Map<string, number>>(new Map());
  const cursorPosition = useRef<Map<string, {node: Node | null, offset: number}>>(new Map());

  console.log('[DEBUG] Initial blocks:', blocks);
  console.log('[DEBUG] Cursor tracking enabled with enhanced position management');

  useEffect(() => {
    if (blocks.length === 0) {
      handleCreateBlock('text', { text: '' }, 0);
    }
  }, [blocks.length]);

  useEffect(() => {
    if (selectedBlock && blockRefs.current.get(selectedBlock)) {
      const blockEl = blockRefs.current.get(selectedBlock);
      if (blockEl && scrollAreaRef.current) {
        const scrollArea = scrollAreaRef.current;
        const blockRect = blockEl.getBoundingClientRect();
        const scrollRect = scrollArea.getBoundingClientRect();
        
        if (blockRect.top < scrollRect.top || blockRect.bottom > scrollRect.bottom) {
          blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [selectedBlock, blocks.length]);

  // Enhanced cursor position saving
  const saveCursorPosition = (blockId: string) => {
    console.log('[DEBUG] Saving cursor position for block:', blockId);
    const selection = window.getSelection();
    
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const blockEl = blockRefs.current.get(blockId);
      
      if (blockEl && blockEl.contains(range.startContainer)) {
        cursorPosition.current.set(blockId, {
          node: range.startContainer,
          offset: range.startOffset
        });
        
        console.log('[DEBUG] Cursor position saved:', {
          blockId,
          node: range.startContainer.nodeName,
          nodeType: range.startContainer.nodeType,
          text: range.startContainer.textContent?.substring(0, 20) + '...',
          offset: range.startOffset
        });
      }
    }
  };

  // Enhanced cursor position restoration
  const restoreCursorPosition = (blockId: string) => {
    console.log('[DEBUG] Restoring cursor position for block:', blockId);
    const savedPosition = cursorPosition.current.get(blockId);
    const blockElement = blockRefs.current.get(blockId);
    
    if (!savedPosition || !blockElement) {
      console.log('[DEBUG] No saved position or block element found');
      return;
    }
    
    try {
      const selection = window.getSelection();
      if (!selection) return;
      
      // If the node is no longer in the DOM, find the best approximation
      let targetNode = savedPosition.node;
      let targetOffset = savedPosition.offset;
      
      if (!blockElement.contains(savedPosition.node)) {
        console.log('[DEBUG] Saved node not found in DOM, finding alternative');
        // Default to the first text node or the element itself
        if (blockElement.firstChild) {
          if (blockElement.firstChild.nodeType === Node.TEXT_NODE) {
            targetNode = blockElement.firstChild;
          } else if (blockElement.firstChild.firstChild) {
            targetNode = blockElement.firstChild.firstChild;
          } else {
            targetNode = blockElement.firstChild;
          }
          targetOffset = Math.min(targetOffset, targetNode.textContent?.length || 0);
        } else {
          targetNode = blockElement;
          targetOffset = 0;
        }
      }
      
      const range = document.createRange();
      range.setStart(targetNode || blockElement, targetOffset);
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
      
      console.log('[DEBUG] Cursor position restored:', {
        blockId,
        node: targetNode?.nodeName,
        offset: targetOffset
      });
    } catch (err) {
      console.error('[DEBUG] Error restoring cursor:', err);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Key navigation handlers
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsNavigationMode(prevMode => !prevMode);
        if (!isNavigationMode) {
          setSelectedBlocks([]);
          if (selectedBlock) {
            setSelectedBlocks([selectedBlock]);
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isNavigationMode, selectedBlock]);

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
    
    if (isNavigationMode) {
      if (e.shiftKey) {
        setSelectedBlocks(prev => {
          if (prev.includes(blockId)) {
            return prev.filter(id => id !== blockId);
          } else {
            return [...prev, blockId];
          }
        });
      } else {
        setSelectedBlocks([blockId]);
      }
    } else {
      setSelectedBlock(blockId);
      setSelectedBlocks([blockId]);
    }
  };

  const handleCreateBlock = async (
    type: MindBlock['content_type'],
    content: any,
    position: number,
    parentId?: string,
    indent?: number
  ) => {
    try {
      const maxPosition = blocks.length > 0 ? Math.max(...blocks.map(b => b.position || 0)) : -1;
      const newPosition = position !== undefined ? position : maxPosition + 1;

      const finalContent = { ...content };
      if (type === 'todo' && finalContent.checked === undefined) {
        finalContent.checked = false;
      }

      const newBlockId = await onCreateBlock(type, finalContent, newPosition, parentId);
      
      if (indent !== undefined && indent > 0) {
        nestedLevels.current.set(newBlockId, indent);
      }
      
      setSelectedBlock(newBlockId);
      
      setTimeout(() => {
        const newBlockRef = blockRefs.current.get(newBlockId);
        if (newBlockRef) {
          newBlockRef.focus();
          
          const range = document.createRange();
          const selection = window.getSelection();
          if (selection && newBlockRef.firstChild) {
            range.setStart(newBlockRef.firstChild, newBlockRef.textContent?.length || 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 100);
      
      return newBlockId;
    } catch (error) {
      console.error('Error creating block:', error);
      return '';
    }
  };

  const handleOpenSlashCommand = (blockId: string) => {
    const blockRef = blockRefs.current.get(blockId);
    if (blockRef) {
      const rect = blockRef.getBoundingClientRect();
      const scrollContainer = scrollAreaRef.current;
      const scrollOffset = scrollContainer ? scrollContainer.scrollTop : 0;
      
      setSlashCommandPosition({ 
        x: rect.left, 
        y: rect.top + rect.height - scrollOffset 
      });
      setSlashCommandOpen(true);
      setSearchQuery('');
    }
  };

  const handleBlockTypeChange = async (blockId: string, newType: MindBlock['content_type']) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    saveCursorPosition(blockId);
    
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
      ...newContent
    });

    const blockElement = blockRefs.current.get(blockId);
    if (blockElement) {
      setTimeout(() => {
        blockElement.focus();
        restoreCursorPosition(blockId);
      }, 10);
    }
  };

  const handleContentChange = (
    blockId: string, 
    event: React.FormEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    const content = event.currentTarget.textContent || '';
    const htmlContent = event.currentTarget.innerHTML;
    
    console.log('[DEBUG] Content change:', { 
      blockId, 
      textContent: content, 
      htmlContent,
      eventType: event.type
    });
    
    // Save cursor position BEFORE any updates
    saveCursorPosition(blockId);
    
    if (content === '/') {
      handleOpenSlashCommand(blockId);
    }
    
    // Cancel existing update timeout if there is one
    if (updateTimeoutRef.current[blockId]) {
      clearTimeout(updateTimeoutRef.current[blockId]);
    }
    
    // Mark content as changed
    contentChangeRef.current.set(blockId, true);
    
    // Only schedule an update if one isn't already in progress
    if (!isUpdating[blockId]) {
      updateTimeoutRef.current[blockId] = setTimeout(() => {
        if (contentChangeRef.current.get(blockId)) {
          const block = blocks.find(b => b.id === blockId);
          if (block) {
            console.log('[DEBUG] Updating block content after timeout:', {
              blockId,
              htmlContent: htmlContent
            });
            
            setIsUpdating(prev => ({ ...prev, [blockId]: true }));
            
            onUpdateBlock(blockId, { 
              ...block.content, 
              text: htmlContent 
            }).then(() => {
              contentChangeRef.current.set(blockId, false);
              setIsUpdating(prev => ({ ...prev, [blockId]: false }));
              
              // Restore cursor position AFTER the update completes
              setTimeout(() => {
                if (blockRefs.current.get(blockId)) {
                  restoreCursorPosition(blockId);
                }
              }, 10);
            });
          }
        }
      }, CONTENT_UPDATE_DEBOUNCE);
    }
  };

  const handleContentBlur = (blockId: string, event: React.FocusEvent<HTMLDivElement>) => {
    const htmlContent = event.currentTarget.innerHTML;
    
    console.log('[DEBUG] Content blur:', { 
      blockId, 
      htmlContent
    });
    
    if (updateTimeoutRef.current[blockId]) {
      clearTimeout(updateTimeoutRef.current[blockId]);
    }
    
    if (contentChangeRef.current.get(blockId)) {
      const block = blocks.find(b => b.id === blockId);
      if (block) {
        setIsUpdating(prev => ({ ...prev, [blockId]: true }));
        
        onUpdateBlock(blockId, { 
          ...block.content, 
          text: htmlContent 
        }).then(() => {
          contentChangeRef.current.set(blockId, false);
          setIsUpdating(prev => ({ ...prev, [blockId]: false }));
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, block: MindBlock) => {
    console.log('[DEBUG] KeyDown event:', {
      key: e.key, 
      keyCode: e.keyCode, 
      shiftKey: e.shiftKey, 
      ctrlKey: e.ctrlKey,
      blockId: block.id,
      blockType: block.content_type
    });
    
    const selection = window.getSelection();
    const textContent = e.currentTarget.textContent || '';
    const cursorAtStart = selection?.anchorOffset === 0;
    const cursorAtEnd = selection?.anchorOffset === textContent.length;
    const isEmpty = !textContent.trim();
    
    console.log('[DEBUG] Text state:', { 
      textContent, 
      cursorAtStart, 
      cursorAtEnd, 
      isEmpty,
      selection: selection ? {
        anchorOffset: selection.anchorOffset,
        focusOffset: selection.focusOffset,
        type: selection.type,
        isCollapsed: selection.isCollapsed
      } : 'No selection'
    });
    
    handleContentChange(block.id, e);
    
    if (cursorAtStart && isEmpty) {
      switch (e.key) {
        case '#':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'heading1');
          return;
          
        case '-':
          e.preventDefault();
          handleBlockTypeChange(block.id, 'bullet');
          return;
          
        case '[':
          e.preventDefault();
          if (e.currentTarget.textContent === '[') {
            e.currentTarget.textContent = ''; // Clear the [ character
            handleBlockTypeChange(block.id, 'todo');
          }
          return;
      }
    }
    
    if (e.key === '/' && !e.shiftKey && isEmpty) {
      e.preventDefault();
      handleOpenSlashCommand(block.id);
      return;
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      console.log('[DEBUG] Shift+Enter detected - inserting line break');
      
      // Save cursor position before the change
      saveCursorPosition(block.id);
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        console.log('[DEBUG] Selection exists, creating line break');
        const range = selection.getRangeAt(0);
        const br = document.createElement('br');
        range.deleteContents();
        range.insertNode(br);
        
        // Add a zero-width space after the <br> to ensure cursor placement works correctly
        const textNode = document.createTextNode('\u200B');
        range.setStartAfter(br);
        range.insertNode(textNode);
        
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('[DEBUG] Line break inserted, updating content');
        
        // Force an update of the content
        const updatedContent = e.currentTarget.innerHTML;
        console.log('[DEBUG] Updated HTML content:', updatedContent);
        
        // Explicitly update the block content with HTML
        if (block) {
          setIsUpdating(prev => ({ ...prev, [block.id]: true }));
          
          onUpdateBlock(block.id, { 
            ...block.content, 
            text: updatedContent 
          }).then(() => {
            console.log('[DEBUG] Block updated after Shift+Enter, cursor should be after break');
            contentChangeRef.current.set(block.id, false);
            setIsUpdating(prev => ({ ...prev, [block.id]: false }));
            
            // Make sure the cursor stays after the <br>
            setTimeout(() => {
              const blockEl = blockRefs.current.get(block.id);
              if (blockEl) {
                blockEl.focus();
                
                // Find the last <br> element
                const allBrs = blockEl.querySelectorAll('br');
                if (allBrs.length > 0) {
                  const lastBr = allBrs[allBrs.length - 1];
                  const range = document.createRange();
                  const selection = window.getSelection();
                  
                  if (selection) {
                    range.setStartAfter(lastBr);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                  }
                }
              }
            }, 10);
          });
        }
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const blockIndex = blocks.findIndex(b => b.id === block.id);
      const position = blockIndex + 1;
      
      const indentLevel = nestedLevels.current.get(block.id) || 0;
      
      const continueTypes: MindBlock['content_type'][] = ['bullet', 'numbered', 'todo'];
      const newType = continueTypes.includes(block.content_type) ? block.content_type : 'text';
      
      if (continueTypes.includes(block.content_type) && !block.content.text?.trim()) {
        handleBlockTypeChange(block.id, 'text');
        return;
      }
      
      handleCreateBlock(newType, {
        text: '',
        checked: newType === 'todo' ? false : undefined
      }, position, block.parent_block_id, indentLevel);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      
      if (e.shiftKey) {
        const currentLevel = nestedLevels.current.get(block.id) || 0;
        if (currentLevel > 0) {
          nestedLevels.current.set(block.id, currentLevel - 1);
          onUpdateBlock(block.id, {
            ...block.content,
            indent: Math.max(0, currentLevel - 1)
          });
        }
      } else {
        const currentLevel = nestedLevels.current.get(block.id) || 0;
        nestedLevels.current.set(block.id, currentLevel + 1);
        onUpdateBlock(block.id, {
          ...block.content,
          indent: currentLevel + 1
        });
      }
      return;
    }

    if (e.key === 'Backspace' && !e.shiftKey) {
      const text = (e.target as HTMLDivElement).textContent || '';
      if (!text.trim() && blocks.length > 1) {
        e.preventDefault();
        onDeleteBlock(block.id);
        const prevBlock = blocks[blocks.findIndex(b => b.id === block.id) - 1];
        if (prevBlock) {
          setSelectedBlock(prevBlock.id);
          
          setTimeout(() => {
            const prevBlockEl = blockRefs.current.get(prevBlock.id);
            if (prevBlockEl) {
              prevBlockEl.focus();
              const selection = window.getSelection();
              const range = document.createRange();
              
              if (selection && prevBlockEl.firstChild) {
                range.setStart(prevBlockEl.firstChild, prevBlockEl.textContent?.length || 0);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            }
          }, 10);
        }
      }
      return;
    }

    // Arrow key navigation
    handleArrowNavigation(e, block);

    if (e.key === ' ' && !e.shiftKey && cursorAtStart) {
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

  const handleArrowNavigation = (e: React.KeyboardEvent<HTMLDivElement>, block: MindBlock) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const textContent = e.currentTarget.textContent || '';
    const cursorAtStart = selection.anchorOffset === 0;
    const cursorAtEnd = selection.anchorOffset === textContent.length;
    
    if (e.key === 'ArrowUp' && !e.shiftKey && cursorAtStart) {
      const currentIndex = blocks.findIndex(b => b.id === block.id);
      if (currentIndex > 0) {
        e.preventDefault();
        const prevBlockId = blocks[currentIndex - 1].id;
        setSelectedBlock(prevBlockId);
        
        setTimeout(() => {
          const prevBlockEl = blockRefs.current.get(prevBlockId);
          if (prevBlockEl) {
            prevBlockEl.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            
            if (selection && prevBlockEl.firstChild) {
              range.setStart(prevBlockEl.firstChild, prevBlockEl.textContent?.length || 0);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }, 10);
      }
      return;
    }
    
    if (e.key === 'ArrowDown' && !e.shiftKey && cursorAtEnd) {
      const currentIndex = blocks.findIndex(b => b.id === block.id);
      if (currentIndex < blocks.length - 1) {
        e.preventDefault();
        const nextBlockId = blocks[currentIndex + 1].id;
        setSelectedBlock(nextBlockId);
        
        setTimeout(() => {
          const nextBlockEl = blockRefs.current.get(nextBlockId);
          if (nextBlockEl) {
            nextBlockEl.focus();
            const selection = window.getSelection();
            const range = document.createRange();
            
            if (selection && nextBlockEl.firstChild) {
              range.setStart(nextBlockEl.firstChild, 0);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }, 10);
      }
      return;
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;
    
    if (source.index === destination.index) {
      return;
    }

    const blockId = blocks[source.index].id;
    const newPosition = calculatePosition(destination.index);
    
    if (onMoveBlock) {
      await onMoveBlock(blockId, newPosition);
    }
  };

  const calculatePosition = (newIndex: number): number => {
    if (newIndex === 0) {
      return blocks.length > 0 ? (blocks[0].position || 0) - 1 : 0;
    }
    
    if (newIndex >= blocks.length) {
      return blocks.length > 0 ? (blocks[blocks.length - 1].position || 0) + 1 : 0;
    }
    
    const prevPos = blocks[newIndex - 1].position || 0;
    const nextPos = blocks[newIndex].position || 0;
    return prevPos + (nextPos - prevPos) / 2;
  };

  const handleInsertBlockFromSlash = async (type: MindBlock['content_type']) => {
    if (!selectedBlock) return;
    
    const currentBlock = blocks.find(b => b.id === selectedBlock);
    if (!currentBlock) return;

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

    await handleBlockTypeChange(currentBlock.id, type);
    setSlashCommandOpen(false);
  };

  const filteredBlockTypes = BLOCK_TYPES.filter(type => 
    type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (type.shortcut && type.shortcut.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderBlockContent = (block: MindBlock) => {
    const indentLevel = nestedLevels.current.get(block.id) || 0;
    const indentPadding = indentLevel * 24;

    const commonProps = {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLDivElement>) => handleContentChange(block.id, e),
      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(e, block),
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => handleContentBlur(block.id, e),
      className: "min-h-[24px] focus:outline-none text-left whitespace-pre-wrap break-words",
      style: { marginLeft: `${indentPadding}px` },
    };

    switch (block.content_type) {
      case 'text':
        return (
          <div
            {...commonProps}
            dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            className="min-h-[24px] focus:outline-none text-left whitespace-pre-wrap break-words"
            style={{ 
              marginLeft: `${indentPadding}px`, 
              minHeight: '200px' 
            }}
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
            className={cn("font-semibold min-h-[32px] focus:outline-none text-left whitespace-pre-wrap break-words", headingSize)}
            dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
          />
        );

      case 'todo':
        return (
          <label className="flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
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
              className="h-4 w-4 mt-1.5 rounded border-gray-300"
              onClick={(e) => e.stopPropagation()}
            />
            <div
              {...commonProps}
              style={{ marginLeft: 0 }}
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
              className={cn(
                "min-h-[24px] focus:outline-none text-left flex-1 whitespace-pre-wrap break-words",
                block.content.checked && "text-muted-foreground line-through"
              )}
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
          <div className="flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <span className="mt-1.5 text-lg">•</span>
            <div
              {...commonProps}
              style={{ marginLeft: 0 }}
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
              className="min-h-[24px] focus:outline-none text-left flex-1 whitespace-pre-wrap break-words"
            />
          </div>
        );

      case 'numbered':
        const index = blocks
          .filter(b => b.content_type === 'numbered' && b.parent_block_id === block.parent_block_id)
          .findIndex(b => b.id === block.id) + 1;
        return (
          <div className="flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <span className="mt-1.5 min-w-[1.5em] text-right">{index}.</span>
            <div
              {...commonProps}
              style={{ marginLeft: 0 }}
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
              className="min-h-[24px] focus:outline-none text-left flex-1 whitespace-pre-wrap break-words"
            />
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-start gap-2" style={{ marginLeft: `${indentPadding}px` }}>
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-6 w-6 mt-1 hover:bg-transparent"
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
              style={{ marginLeft: 0 }}
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
              className="min-h-[24px] focus:outline-none text-left flex-1 whitespace-pre-wrap break-words"
            />
          </div>
        );

      case 'quote':
        return (
          <div className="border-l-4 border-accent pl-4" style={{ marginLeft: `${indentPadding}px` }}>
            <div
              {...commonProps}
              style={{ marginLeft: 0 }}
              className="min-h-[24px] focus:outline-none italic text-left whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'callout':
        return (
          <div className="bg-accent/10 p-4 rounded-lg" style={{ marginLeft: `${indentPadding}px` }}>
            <div
              {...commonProps}
              style={{ marginLeft: 0 }}
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'divider':
        return <hr className="my-4 border-accent" style={{ marginLeft: `${indentPadding}px` }} />;

      case 'code':
        return (
          <div className="bg-accent/10 p-4 rounded-lg font-mono" style={{ marginLeft: `${indentPadding}px` }}>
            <div
              {...commonProps}
              style={{ marginLeft: 0 }}
              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
            />
          </div>
        );

      case 'image':
      case 'video':
        return (
          <div className="relative group" style={{ marginLeft: `${indentPadding}px` }}>
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
          <div className="flex items-center gap-2 p-2 bg-accent/5 rounded" style={{ marginLeft: `${indentPadding}px` }}>
            <span className="text-lg">📎</span>
            <span>{block.content.filename || 'Untitled File'}</span>
            {!block.content.url && (
              <Button variant="ghost" size="sm">Upload file</Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const navigationModeClass = isNavigationMode ? "cursor-pointer !bg-transparent" : "";

  useEffect(() => {
    toast.info("Block editor loaded with enhanced cursor management", {
      description: "Shift+Enter creates a line break within blocks and cursor position is maintained during edits",
      duration: 5000
    });
  }, []);

  return (
    <div 
      ref={editorRef}
      className={cn("flex flex-col h-full", isNavigationMode && "navigation-mode")}
      onClick={handleEditorClick}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          {isNavigationMode ? (
            <Badge variant="outline">Navigation Mode</Badge>
          ) : "Blocks (Enhanced Cursor Management)"}
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              console.log('[DEBUG] Current blocks:', blocks);
              console.log('[DEBUG] Cursor positions:', Array.from(cursorPosition.current.entries()));
              toast.info("Block state logged to console", { duration: 2000 });
            }}
          >
            Log State
          </Button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks-droppable">
          {(provided) => (
            <ScrollArea 
              ref={scrollAreaRef} 
              className="flex-1 p-4"
            >
              <div
                className="space-y-1 min-h-full"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {blocks.length === 0 ? (
                  <div className="text-center p-10 text-muted-foreground">
                    <p>No blocks yet. Click anywhere to create one.</p>
                  </div>
                ) : (
                  blocks.map((block, index) => (
                    <Draggable 
                      key={block.id} 
                      draggableId={block.id} 
                      index={index}
                      isDragDisabled={isNavigationMode || isUpdating[block.id]}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "group relative flex items-start gap-2 p-2 rounded-lg transition-all",
                            "hover:bg-accent/5",
                            selectedBlock === block.id && !isNavigationMode && "bg-accent/10",
                            selectedBlocks.includes(block.id) && isNavigationMode && "bg-primary/10 ring-1 ring-primary/20",
                            snapshot.isDragging && "bg-accent/20 shadow-lg",
                            navigationModeClass,
                            isUpdating[block.id] && "border-l-2 border-amber-400" // Visual indicator for updating
                          )}
                          onClick={(e) => handleBlockClick(e, block.id)}
                          onMouseEnter={() => setHoveredBlock(block.id)}
                          onMouseLeave={() => setHoveredBlock(null)}
                          style={{...provided.draggableProps.style}}
                        >
                          <div 
                            className={cn(
                              "opacity-0 group-hover:opacity-70 flex items-center gap-1 cursor-grab mt-1 self-start",
                              isNavigationMode && "hidden"
                            )}
                            {...provided.dragHandleProps}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
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

                          <div 
                            className={cn(
                              "opacity-0 group-hover:opacity-100 flex items-center gap-1 self-start",
                              isNavigationMode && "hidden"
                            )}
                          >
                            <Button 
                              variant="ghost"
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-accent/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('[DEBUG] Delete button clicked for block:', block.id);
                                onDeleteBlock(block.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-accent/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('[DEBUG] Duplicate button clicked for block:', block.id);
                                onDuplicateBlock?.(block.id);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Visual indicator for updating status */}
                          {isUpdating[block.id] && (
                            <div className="absolute right-2 top-2">
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">Updating</Badge>
                            </div>
                          )}

                          {(hoveredBlock === block.id || index === blocks.length - 1) && !isNavigationMode && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 z-10">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 rounded-full bg-background border shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('[DEBUG] Add block button clicked after block:', block.id);
                                  handleCreateBlock('text', { text: '' }, index + 1);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}

                <div
                  className="h-8 opacity-0 hover:opacity-100 transition-opacity cursor-text"
                  onClick={() => handleCreateBlock('text', { text: '' }, blocks.length)}
                  onFocus={() => handleCreateBlock('text', { text: '' }, blocks.length)}
                  tabIndex={0}
                />
              </div>
            </ScrollArea>
          )}
        </Droppable>
      </DragDropContext>

      <Popover open={slashCommandOpen} onOpenChange={setSlashCommandOpen}>
        <PopoverContent
          className="w-72 p-0"
          align="start"
          side="bottom"
          style={{
            position: 'absolute',
            left: slashCommandPosition.x,
            top: slashCommandPosition.y + 20,
          }}
        >
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Type a command or search..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              autoFocus
            />
            <CommandList>
              <CommandGroup heading="Block types">
                {filteredBlockTypes.map(({ type, label, icon }) => (
                  <CommandItem
                    key={type}
                    onSelect={() => handleInsertBlockFromSlash(type)}
                    className="flex items-center gap-2 py-2"
                  >
                    {icon}
                    <span>{label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
