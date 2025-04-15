
import React, { useState, useEffect, useCallback } from 'react';
import { MindBlock } from '@/utils/types';
import BlockRenderer from './BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [newBlockType, setNewBlockType] = useState<string>('text');
  // Add a state to track blocks by id for consistent ordering
  const [orderedBlocks, setOrderedBlocks] = useState<MindBlock[]>([]);

  // Use a stable block ordering based on position and id
  useEffect(() => {
    if (blocks && blocks.length > 0) {
      // Sort blocks by position first, then by id for stability
      const sorted = [...blocks].sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }
        // If positions are equal, use id for stable ordering
        return a.id.localeCompare(b.id);
      });
      
      console.log('BlockEditor - Blocks sorted by position and id:', sorted.map(b => ({
        id: b.id.substring(0, 8),
        position: b.position,
        updated_at: b.updated_at
      })));
      
      setOrderedBlocks(sorted);
    } else {
      setOrderedBlocks([]);
    }
  }, [blocks]);

  // Memoized update handler to prevent unnecessary re-renders
  const handleUpdateBlock = useCallback(async (block: MindBlock, content: any) => {
    console.log('BlockEditor - Before update:', {
      blockId: block.id.substring(0, 8),
      position: block.position,
      updated_at: block.updated_at
    });
    
    try {
      // Explicitly preserve position to prevent reordering
      const updatedBlock = await onUpdateBlock(block.id, content, { position: block.position });
      console.log('BlockEditor - After update:', {
        blockId: updatedBlock.id.substring(0, 8),
        position: updatedBlock.position,
        updated_at: updatedBlock.updated_at
      });
    } catch (error) {
      console.error('BlockEditor - Update error:', error);
    }
  }, [onUpdateBlock]);

  const handleAddBlock = async () => {
    console.log('Creating new block of type:', newBlockType);
    const content = newBlockType === 'text' ? { text: '' } : {};
    await onCreateBlock(newBlockType, content);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-1">
        {orderedBlocks.map((block) => (
          <div 
            key={block.id}
            className={cn(
              "transition-all duration-200",
              "hover:bg-background/5 rounded-lg",
              "focus-within:ring-1 focus-within:ring-neon-purple/30"
            )}
          >
            <BlockRenderer
              block={block}
              onUpdate={(content) => {
                console.log(`BlockEditor - Updating block ${block.id.substring(0, 8)} at position ${block.position}`);
                handleUpdateBlock(block, content);
              }}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          onClick={() => {
            setNewBlockType('text');
            handleAddBlock();
          }}
          className="flex items-center gap-1 text-sm hover:bg-background/10"
        >
          <Type className="h-4 w-4" />
          <span>Add Text</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => {
            setNewBlockType('todo');
            handleAddBlock();
          }}
          className="flex items-center gap-1 text-sm hover:bg-background/10"
        >
          <span>Add Todo</span>
        </Button>
      </div>
    </div>
  );
}
