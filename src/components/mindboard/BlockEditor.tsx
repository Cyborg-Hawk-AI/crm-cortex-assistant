
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

// Increase the debounce time even further to reduce update frequency
const CONTENT_UPDATE_DEBOUNCE = 5000; // 5 seconds

export function BlockEditor({ pageId, blocks: unsortedBlocks, onCreateBlock, onUpdateBlock, onDeleteBlock, onMoveBlock, onDuplicateBlock }: BlockEditorProps) {
  // Sort blocks by position to fix ordering issues
  const blocks = [...unsortedBlocks].sort((a, b) => {
    // Ensure we have valid numbers for comparison
    const posA = typeof a.position === 'number' ? a.position : 0;
    const posB = typeof b.position === 'number' ? b.position : 0;
    return posA - posB;
  });
  
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [slashCommandOpen, setSlashCommandOpen] = useState(false);
  const [slashCommandPosition, setSlashCommandPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [manualUpdateMode, setManualUpdateMode] = useState<Record<string, boolean>>({});
  
  const editorRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const updateTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const contentChangeRef = useRef<Map<string, boolean>>(new Map());
  const nestedLevels = useRef<Map<string, number>>(new Map());
  
  // Enhanced cursor position tracking
  const cursorPosition = useRef<Map<string, {
    node: Node | null, 
    offset: number,
    nodeHTML?: string,
    textContent?: string,
    startContainer?: Node | null,
    endContainer?: Node | null,
    startOffset?: number,
    endOffset?: number,
    range?: Range,
    rangeText?: string,
  }>>(new Map());
  
  console.log('[DEBUG] Initial blocks:', blocks);
  console.log('[DEBUG] Enhanced cursor tracking with improved position management');

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

  // Enhanced cursor position saving with selection range support
  const saveCursorPosition = (blockId: string) => {
    console.log('[DEBUG] Saving cursor position for block:', blockId);
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      console.log('[DEBUG] No valid selection found to save');
      return;
    }
    
    const range = selection.getRangeAt(0);
    const blockEl = blockRefs.current.get(blockId);
    
    if (!blockEl || !blockEl.contains(range.startContainer)) {
      console.log('[DEBUG] Block element not found or selection outside block');
      return;
    }
    
    // Store complete range information
    const node = range.startContainer;
    const nodeHTML = node.nodeType === Node.ELEMENT_NODE 
      ? (node as Element).innerHTML 
      : node.textContent || '';
    
    const clonedRange = range.cloneRange();
    const rangeText = clonedRange.toString();
    
    cursorPosition.current.set(blockId, {
      node: range.startContainer,
      offset: range.startOffset,
      nodeHTML: nodeHTML,
      textContent: node.textContent || '',
      startContainer: range.startContainer,
      endContainer: range.endContainer,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      range: clonedRange,
      rangeText: rangeText
    });
    
    console.log('[DEBUG] Cursor position saved:', {
      blockId,
      node: range.startContainer.nodeName,
      nodeType: range.startContainer.nodeType,
      text: range.startContainer.textContent?.substring(0, 20) + '...',
      offset: range.startOffset,
      nodeHTML: nodeHTML.substring(0, 20) + '...',
      isCollapsed: range.collapsed,
      rangeText: rangeText.substring(0, 20) + (rangeText.length > 20 ? '...' : ''),
    });
  };

  // Enhanced cursor restoration with multiple fallback strategies
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
      
      // Strategy 1: Try using the saved range directly if available
      if (savedPosition.range && blockElement.contains(savedPosition.startContainer)) {
        console.log('[DEBUG] Using saved range for restoration');
        selection.removeAllRanges();
        
        try {
          // Create a new range based on saved positions
          const newRange = document.createRange();
          newRange.setStart(savedPosition.startContainer!, savedPosition.startOffset!);
          
          if (savedPosition.endContainer && !savedPosition.range.collapsed) {
            newRange.setEnd(savedPosition.endContainer, savedPosition.endOffset!);
          } else {
            newRange.collapse(true);
          }
          
          selection.addRange(newRange);
          console.log('[DEBUG] Cursor restored using saved range');
          return;
        } catch (err) {
          console.log('[DEBUG] Error restoring from saved range:', err);
        }
      }
      
      // Strategy 2: Try to find the exact same node
      if (blockElement.contains(savedPosition.node)) {
        console.log('[DEBUG] Original node found, restoring directly');
        
        try {
          const range = document.createRange();
          range.setStart(savedPosition.node, savedPosition.offset);
          range.collapse(true);
          
          selection.removeAllRanges();
          selection.addRange(range);
          console.log('[DEBUG] Cursor restored using original node');
          return;
        } catch (err) {
          console.log('[DEBUG] Error restoring using original node:', err);
        }
      }
      
      // Strategy 3: Try to find node with specific text content
      if (savedPosition.textContent && savedPosition.textContent.trim() !== '') {
        console.log('[DEBUG] Searching for node with matching text:', 
          savedPosition.textContent.substring(0, 15));
        
        // Helper function to find a node with similar text content
        const findNodeWithText = (rootNode: Node, text: string): Node | null => {
          if (rootNode.nodeType === Node.TEXT_NODE && 
              rootNode.textContent && 
              rootNode.textContent.includes(text)) {
            return rootNode;
          }
          
          for (let i = 0; i < rootNode.childNodes.length; i++) {
            const child = rootNode.childNodes[i];
            const result = findNodeWithText(child, text);
            if (result) return result;
          }
          
          return null;
        };
        
        // Try to find a node with at least part of the text
        const searchText = savedPosition.textContent.substring(0, 
          Math.min(20, savedPosition.textContent.length));
          
        if (searchText && searchText.trim().length > 0) {
          const foundNode = findNodeWithText(blockElement, searchText);
          
          if (foundNode) {
            console.log('[DEBUG] Found node with matching text');
            
            try {
              const range = document.createRange();
              
              // Calculate appropriate offset
              let offsetInNode = 0;
              if (foundNode.textContent) {
                // Try to maintain same relative position in text
                const originalLength = savedPosition.textContent.length;
                const newLength = foundNode.textContent.length;
                
                if (originalLength > 0) {
                  const relativePosition = savedPosition.offset / originalLength;
                  offsetInNode = Math.min(Math.floor(relativePosition * newLength), newLength);
                } else {
                  offsetInNode = Math.min(savedPosition.offset, newLength);
                }
              }
              
              range.setStart(foundNode, offsetInNode);
              range.collapse(true);
              
              selection.removeAllRanges();
              selection.addRange(range);
              console.log('[DEBUG] Cursor restored using text-matching node');
              return;
            } catch (err) {
              console.log('[DEBUG] Error restoring using text-matching node:', err);
            }
          }
        }
      }
      
      // Strategy 4: Analyze all text nodes in the block and place cursor at a similar position
      console.log('[DEBUG] Using text node traversal strategy');
      
      const textNodes: Node[] = [];
      const traverseForText = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          textNodes.push(node);
        } else {
          for (let i = 0; i < node.childNodes.length; i++) {
            traverseForText(node.childNodes[i]);
          }
        }
      };
      
      traverseForText(blockElement);
      
      if (textNodes.length > 0) {
        // If we have saved rangeText, try to find it
        if (savedPosition.rangeText && savedPosition.rangeText.trim()) {
          let bestNode = textNodes[0];
          let bestPosition = 0;
          
          for (const node of textNodes) {
            if (!node.textContent) continue;
            
            const index = node.textContent.indexOf(savedPosition.rangeText);
            if (index >= 0) {
              bestNode = node;
              bestPosition = index;
              break;
            }
          }
          
          try {
            const range = document.createRange();
            range.setStart(bestNode, bestPosition);
            range.collapse(true);
            
            selection.removeAllRanges();
            selection.addRange(range);
            console.log('[DEBUG] Cursor restored using text content search');
            return;
          } catch (err) {
            console.log('[DEBUG] Error during text content search restoration:', err);
          }
        }
        
        // Fallback: Place at similar relative position
        try {
          const totalLength = textNodes.reduce((sum, node) => 
            sum + (node.textContent?.length || 0), 0);
          const targetOffset = Math.floor(savedPosition.offset / 100 * totalLength);
          
          let currentLength = 0;
          let targetNode = textNodes[0];
          let nodeOffset = 0;
          
          for (const node of textNodes) {
            const nodeLength = node.textContent?.length || 0;
            
            if (currentLength + nodeLength > targetOffset) {
              targetNode = node;
              nodeOffset = targetOffset - currentLength;
              break;
            }
            
            currentLength += nodeLength;
          }
          
          const range = document.createRange();
          range.setStart(targetNode, Math.min(nodeOffset, targetNode.textContent?.length || 0));
          range.collapse(true);
          
          selection.removeAllRanges();
          selection.addRange(range);
          console.log('[DEBUG] Cursor restored using positional estimation');
          return;
        } catch (err) {
          console.log('[DEBUG] Error in positional estimation:', err);
        }
      }
      
      // Final fallback: Position at the beginning of the first text node
      console.log('[DEBUG] Fallback to positioning at first text node');
      
      const findFirstTextNode = (node: Node): Node => {
        if (node.nodeType === Node.TEXT_NODE) return node;
        
        for (let i = 0; i < node.childNodes.length; i++) {
          const result = findFirstTextNode(node.childNodes[i]);
          if (result.nodeType === Node.TEXT_NODE) return result;
        }
        
        return node;
      };
      
      try {
        const targetNode = findFirstTextNode(blockElement);
        
        // Use the original offset if possible
        const offset = Math.min(savedPosition.offset, targetNode.textContent?.length || 0);
        
        const range = document.createRange();
        range.setStart(targetNode, offset);
        range.collapse(true);
        
        selection.removeAllRanges();
        selection.addRange(range);
        console.log('[DEBUG] Cursor positioned at first text node');
      } catch (err) {
        console.error('[DEBUG] Final fallback positioning failed:', err);
      }
      
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
      // Calculate position to ensure correct ordering
      let newPosition = position;
      
      if (position === undefined || position === null) {
        const maxPosition = blocks.length > 0 
          ? Math.max(...blocks.map(b => typeof b.position === 'number' ? b.position : 0)) 
          : -1;
        newPosition = maxPosition + 1;
      }
      
      // When creating a new block between existing blocks, calculate intermediate position
      if (blocks.length > 0 && position < blocks.length) {
        const prevBlock = blocks[Math.max(0, position - 1)];
        const nextBlock = blocks[Math.min(position, blocks.length - 1)];
        
        const prevPos = typeof prevBlock.position === 'number' ? prevBlock.position : 0;
        const nextPos = typeof nextBlock.position === 'number' ? nextBlock.position : prevPos + 1;
        
        // Create a position between the two blocks
        newPosition = prevPos + (nextPos - prevPos) / 2;
      }

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
    
    // Always save cursor position on content change
    saveCursorPosition(blockId);
    
    if (content === '/') {
      handleOpenSlashCommand(blockId);
    }
    
    // If manual update mode is on for this block, don't schedule automatic updates
    if (manualUpdateMode[blockId]) {
      console.log('[DEBUG] Manual update mode active, skipping auto update');
      contentChangeRef.current.set(blockId, true);
      return;
    }
    
    if (updateTimeoutRef.current[blockId]) {
      clearTimeout(updateTimeoutRef.current[blockId]);
    }
    
    contentChangeRef.current.set(blockId, true);
    
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

  // Improved manual update function that preserves cursor position
  const handleManualUpdate = (blockId: string, content: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    // Always save cursor position before update
    saveCursorPosition(blockId);
    
    setIsUpdating(prev => ({ ...prev, [blockId]: true }));
    
    onUpdateBlock(blockId, { 
      ...block.content, 
      text: content 
    }).then(() => {
      contentChangeRef.current.set(blockId, false);
      setIsUpdating(prev => ({ ...prev, [blockId]: false }));
      
      // Restore cursor position after update using enhanced restoration
      setTimeout(() => {
        if (blockRefs.current.get(blockId)) {
          restoreCursorPosition(blockId);
        }
      }, 10);
    }).catch(error => {
      console.error('[DEBUG] Error updating block:', error);
      setIsUpdating(prev => ({ ...prev, [blockId]: false }));
    });
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
    
    // Don't process content change for regular typing - only on Shift+Enter
    if (e.key !== 'Enter') {
      // Set manual update mode for this block
      setManualUpdateMode(prev => ({
        ...prev,
        [block.id]: true
      }));
    }
    
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

    // Shift+Enter triggers an update with the current content and inserts a line break
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      console.log('[DEBUG] Shift+Enter detected - inserting line break and triggering update');
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        console.log('[DEBUG] Selection exists, creating line break');
        
        // Save complete cursor position with enhanced data
        saveCursorPosition(block.id);
        
        const range = selection.getRangeAt(0);
        
        // Insert the line break
        const br = document.createElement('br');
        range.deleteContents();
        range.insertNode(br);
        
        // Add a zero-width space to ensure cursor can be positioned after the BR
        const textNode = document.createTextNode('\u200B');
        range.setStartAfter(br);
        range.insertNode(textNode);
        
        // Position cursor after the inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Save the current range again after modification
        const updatedRange = selection.getRangeAt(0);
        cursorPosition.current.set(block.id, {
          ...cursorPosition.current.get(block.id)!,
          range: updatedRange.cloneRange(),
          startContainer: updatedRange.startContainer,
          endContainer: updatedRange.endContainer,
          startOffset: updatedRange.startOffset,
          endOffset: updatedRange.endOffset
        });
        
        // Get the updated content
        const updatedContent = e.currentTarget.innerHTML;
        console.log('[DEBUG] Updated HTML content after insertion:', updatedContent);
        
        // Set flag to avoid auto-update
        setManualUpdateMode(prev => ({
          ...prev,
          [block.id]: false
        }));
        
        // Manually trigger an update with the updated cursor position
        handleManualUpdate(block.id, updatedContent);
      }
      return;
    }

    // Regular Enter now creates a new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Find the actual index of this block based on position order
      const blockIndex = blocks.findIndex(b => b.id === block.id);
      const position = blockIndex + 1;
      
      const indentLevel = nestedLevels.current.get(block.id) || 0;
      
      const continueTypes: MindBlock['content_type'][] = ['bullet', 'numbered', 'todo'];
      const newType = continueTypes.includes(block.content_type) ? block.content_type : 'text';
      
      if (continueTypes.includes(block.content_type) && !block.content.text?.trim()) {
        handleBlockTypeChange(block.id, 'text');
        return;
      }
      
      // Trigger update of the current block before creating a new one
      if (contentChangeRef.current.get(block.id)) {
        const currentContent = e.currentTarget.innerHTML;
        handleManualUpdate(block.id, currentContent);
      }
      
      // Then create the new block with proper position
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

    handleArrowNavigation(e, block);
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

  // Improved position calculation to prevent blocks with same position
  const calculatePosition = (newIndex: number): number => {
    // Ensure blocks are ordered by position value
    const sortedBlocks = [...blocks].sort((a, b) => {
      const posA = typeof a.position === 'number' ? a.position : 0;
      const posB = typeof b.position === 'number' ? b.position : 0;
      return posA - posB;
    });
    
    if (newIndex <= 0) {
      // Place at the beginning
      const firstPosition = sortedBlocks.length > 0 ? 
        (typeof sortedBlocks[0].position === 'number' ? sortedBlocks[0].position : 0) : 0;
      return firstPosition - 1;
    }
    
    if (newIndex >= sortedBlocks.length) {
      // Place at the end
      const lastPosition = sortedBlocks.length > 0 ? 
        (typeof sortedBlocks[sortedBlocks.length - 1].position === 'number' ? 
          sortedBlocks[sortedBlocks.length - 1].position : 0) : 0;
      return lastPosition + 1;
    }
    
    // Place between two blocks
    const beforeBlock = sortedBlocks[newIndex - 1];
    const afterBlock = sortedBlocks[newIndex];
    
    const beforePos = typeof beforeBlock.position === 'number' ? beforeBlock.position : 0;
    const afterPos = typeof afterBlock.position === 'number' ? afterBlock.position : beforePos + 1;
    
    // Make sure we don't create identical positions
    if (beforePos === afterPos) {
      // Reorder all block positions to create space
      return beforePos + 0.5;
    }
    
    return beforePos + (afterPos - beforePos) / 2;
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
              minHeight: '300px' 
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
    toast.info("Manual update mode enabled", {
      description: "Press Shift+Enter to update content, Enter to create a new block",
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
          ) : "Blocks (Manual Update Mode)"}
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
                            isUpdating[block.id] && "border-l-2 border-amber-400",
                            manualUpdateMode[block.id] && "border-l-2 border-blue-400"
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
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-accent/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('[DEBUG] Manual update button clicked for block:', block.id);
                                if (contentChangeRef.current.get(block.id)) {
                                  const blockEl = blockRefs.current.get(block.id);
                                  if (blockEl) {
                                    handleManualUpdate(block.id, blockEl.innerHTML);
                                  }
                                }
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                <polyline points="17 21 17 13 7 13 7 21"/>
                                <polyline points="7 3 7 8 15 8"/>
                              </svg>
                            </Button>
                          </div>

                          {isUpdating[block.id] && (
                            <div className="absolute right-2 top-2">
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">Updating</Badge>
                            </div>
                          )}
                          
                          {manualUpdateMode[block.id] && contentChangeRef.current.get(block.id) && (
                            <div className="absolute right-2 top-2">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">Unsaved</Badge>
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

