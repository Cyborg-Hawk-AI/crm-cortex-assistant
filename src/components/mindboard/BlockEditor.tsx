
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

  const handleAddBlock = async () => {
    console.log('Creating new block of type:', newBlockType);
    const content = newBlockType === 'text' ? { text: '' } : {};
    await onCreateBlock(newBlockType, content);
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
                console.log('Updating block:', block.id, content);
                onUpdateBlock(block.id, content);
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
