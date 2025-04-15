
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MindBlock } from '@/utils/types';
import BlockRenderer from './BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import debounce from 'lodash.debounce';

interface BlockEditorProps {
  pageId: string;
  blocks: MindBlock[];
  onCreateBlock: (type: string, content: any, position?: number, parentId?: string) => Promise<MindBlock>;
  onUpdateBlock: (id: string, content: any, properties?: Record<string, any>) => Promise<MindBlock>;
  onDeleteBlock: (id: string) => Promise<void>;
}

export function BlockEditor({ 
  pageId, 
  blocks, 
  onCreateBlock, 
  onUpdateBlock, 
  onDeleteBlock 
}: BlockEditorProps) {
  const [orderedBlocks, setOrderedBlocks] = useState<MindBlock[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (blocks && blocks.length > 0) {
      const sorted = [...blocks].sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        return a.id.localeCompare(b.id);
      });
      
      setOrderedBlocks(sorted);
    } else {
      setOrderedBlocks([]);
      handleAddTextBlock();
    }
  }, [blocks, pageId]);

  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce(async (blockId: string, content: any) => {
      try {
        const block = orderedBlocks.find(b => b.id === blockId);
        if (block) {
          await onUpdateBlock(blockId, content, { position: block.position });
        }
      } catch (error) {
        console.error('BlockEditor - Debounced save error:', error);
      }
    }, 1500),
    [orderedBlocks, onUpdateBlock]
  );

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const handleUpdateBlock = useCallback(async (block: MindBlock, content: any, shouldSaveImmediately = false) => {
    setPendingUpdates(prev => ({
      ...prev,
      [block.id]: content
    }));

    if (shouldSaveImmediately) {
      try {
        await onUpdateBlock(block.id, content, { position: block.position });
      } catch (error) {
        console.error('BlockEditor - Immediate save error:', error);
      }
    } else {
      debouncedSave(block.id, content);
    }
  }, [onUpdateBlock, debouncedSave]);

  const handleAddTextBlock = async (position?: number) => {
    console.log('Creating new text block at position:', position);
    const newBlockPosition = position ?? (orderedBlocks.length > 0 
      ? Math.max(...orderedBlocks.map(b => b.position || 0)) + 1 
      : 0);
    
    await onCreateBlock('text', { text: '' }, newBlockPosition);
  };

  const handleEditorClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorRef.current || e.defaultPrevented) return;

    // Get click coordinates relative to the editor
    const editorRect = editorRef.current.getBoundingClientRect();
    const clickY = e.clientY - editorRect.top;

    // Find the closest block to the click
    let insertPosition = 0;
    let clickedInBlock = false;

    const blockElements = editorRef.current.querySelectorAll('[data-block-id]');
    blockElements.forEach((blockEl) => {
      const rect = blockEl.getBoundingClientRect();
      const blockTop = rect.top - editorRect.top;
      const blockBottom = blockTop + rect.height;

      if (clickY >= blockTop && clickY <= blockBottom) {
        clickedInBlock = true;
      } else if (clickY > blockBottom) {
        const block = orderedBlocks.find(b => b.id === blockEl.getAttribute('data-block-id'));
        if (block) {
          insertPosition = (block.position || 0) + 1;
        }
      }
    });

    // Only create a new block if we clicked in empty space
    if (!clickedInBlock) {
      await handleAddTextBlock(insertPosition);
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto px-4 py-6 overflow-y-auto">
      <div 
        ref={editorRef}
        className="space-y-1 min-h-full"
        onClick={handleEditorClick}
      >
        {orderedBlocks.map((block) => (
          <div 
            key={block.id}
            data-block-id={block.id}
            className={cn(
              "transition-all duration-200",
              "hover:bg-background/5 rounded-lg",
              "focus-within:ring-1 focus-within:ring-neon-purple/30"
            )}
          >
            <BlockRenderer
              block={{
                ...block,
                content: pendingUpdates[block.id] || block.content
              }}
              onUpdate={(content) => handleUpdateBlock(block, content)}
              onTypeChange={(newType: string, content: any) => {
                onUpdateBlock(block.id, content, { 
                  content_type: newType,
                  position: block.position 
                });
              }}
              onDelete={() => onDeleteBlock(block.id)}
              onEnterPress={(content) => handleUpdateBlock(block, content, true)}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          onClick={() => handleAddTextBlock()}
          className="flex items-center gap-1 text-sm hover:bg-background/10"
        >
          <Type className="h-4 w-4" />
          <span>Add Text</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => onCreateBlock('todo', { checked: false })}
          className="flex items-center gap-1 text-sm hover:bg-background/10"
        >
          <span>Add Todo</span>
        </Button>
      </div>
    </div>
  );
}
