
import React, { useState, useEffect } from 'react';
import { MindBlock } from '@/utils/types';
import BlockRenderer from './BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Type, Image, FileText, Code } from 'lucide-react';
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

  // Diagnostic logging: Log blocks whenever they change
  useEffect(() => {
    console.log('BlockEditor - Blocks updated:', blocks.map(b => ({
      id: b.id.substring(0, 8),
      type: b.content_type,
      position: b.position,
      updated_at: b.updated_at,
      text: b.content_type === 'text' ? b.content.text?.substring(0, 20) : '[non-text]'
    })));
  }, [blocks]);

  const handleAddBlock = async () => {
    console.log('Creating new block of type:', newBlockType);
    const content = newBlockType === 'text' ? { text: '' } : {};
    await onCreateBlock(newBlockType, content);
  };

  const handleUpdateBlock = async (block: MindBlock, content: any) => {
    console.log('BlockEditor - Before update:', {
      blockId: block.id.substring(0, 8),
      position: block.position,
      updated_at: block.updated_at,
      content: JSON.stringify(content).substring(0, 50)
    });
    
    try {
      const updatedBlock = await onUpdateBlock(block.id, content);
      console.log('BlockEditor - After update:', {
        blockId: updatedBlock.id.substring(0, 8),
        position: updatedBlock.position,
        updated_at: updatedBlock.updated_at,
        content: JSON.stringify(updatedBlock.content).substring(0, 50)
      });
    } catch (error) {
      console.error('BlockEditor - Update error:', error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-1">
        {blocks.map((block, index) => (
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
                console.log(`BlockEditor - Updating block ${block.id.substring(0, 8)} at index ${index}, position ${block.position}`);
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
