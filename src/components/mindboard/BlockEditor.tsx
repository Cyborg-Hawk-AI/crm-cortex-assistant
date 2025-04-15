
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MindBlock } from '@/utils/types';
import BlockRenderer from './BlockRenderer';
import { cn } from '@/lib/utils';
import debounce from 'lodash.debounce';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // If there are no blocks, create an initial one
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
    const newBlockPosition = position ?? (orderedBlocks.length > 0 
      ? Math.max(...orderedBlocks.map(b => b.position || 0)) + 1 
      : 0);
    
    await onCreateBlock('text', { text: '' }, newBlockPosition);
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto px-4 py-6 overflow-y-auto">
      <div 
        ref={editorRef}
        className="space-y-1 min-h-[calc(100vh-8rem)]"
      >
        {orderedBlocks.map((block, index) => (
          <div 
            key={block.id}
            className="relative group"
          >
            <div 
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
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full bg-background border border-border hover:bg-muted"
                onClick={() => handleAddTextBlock(block.position + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {(!orderedBlocks || orderedBlocks.length === 0) && (
          <div className="h-full flex items-center justify-center">
            <BlockRenderer
              block={{
                id: 'new',
                content: { text: '' },
                content_type: 'text',
                position: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                page_id: pageId,
                user_id: 'current-user'
              }}
              onUpdate={(content) => handleAddTextBlock()}
              onTypeChange={(newType: string, content: any) => handleAddTextBlock()}
              onDelete={() => {}}
              onEnterPress={(content) => handleAddTextBlock()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
