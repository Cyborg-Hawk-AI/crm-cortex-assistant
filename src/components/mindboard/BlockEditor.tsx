
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
  const [orderedBlocks, setOrderedBlocks] = useState<MindBlock[]>([]);

  useEffect(() => {
    if (blocks && blocks.length > 0) {
      const sorted = [...blocks].sort((a, b) => {
        if (a.position !== b.position) {
          return a.position - b.position;
        }
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
      // Automatically create a text block for new pages
      handleAddTextBlock();
    }
  }, [blocks, pageId]);

  const handleUpdateBlock = useCallback(async (block: MindBlock, content: any) => {
    console.log('BlockEditor - Before update:', {
      blockId: block.id.substring(0, 8),
      position: block.position,
      updated_at: block.updated_at
    });
    
    try {
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

  const handleAddTextBlock = async () => {
    if (blocks.length === 0) {
      console.log('Creating initial text block');
      await onCreateBlock('text', { text: '' });
    }
  };

  const handleAddBlock = async (type: string) => {
    console.log('Creating new block of type:', type);
    const content = type === 'text' ? { text: '' } : {};
    await onCreateBlock(type, content);
  };

  const handleTypeChange = async (blockId: string, newType: string, content: any) => {
    const block = orderedBlocks.find(b => b.id === blockId);
    if (!block) return;

    try {
      await onUpdateBlock(blockId, content, {
        content_type: newType,
        position: block.position
      });
    } catch (error) {
      console.error('Error changing block type:', error);
    }
  };

  return (
    <div className="w-full h-full max-w-4xl mx-auto px-4 py-6 overflow-y-auto">
      <div className="space-y-1 min-h-full">
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
              onUpdate={(content) => handleUpdateBlock(block, content)}
              onTypeChange={handleTypeChange}
              onDelete={() => onDeleteBlock(block.id)}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <Button 
          variant="outline" 
          onClick={() => handleAddBlock('text')}
          className="flex items-center gap-1 text-sm hover:bg-background/10"
        >
          <Type className="h-4 w-4" />
          <span>Add Text</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => handleAddBlock('todo')}
          className="flex items-center gap-1 text-sm hover:bg-background/10"
        >
          <span>Add Todo</span>
        </Button>
      </div>
    </div>
  );
}
