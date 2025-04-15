
import React, { useState, useEffect } from 'react';
import { MindBlock } from '@/utils/types';
import BlockRenderer from './BlockRenderer';
import { Button } from '@/components/ui/button';
import { Plus, Type, Image, FileText, Code } from 'lucide-react';

interface BlockEditorProps {
  pageId: string;
  blocks: MindBlock[];
  onCreateBlock: (type: string, content: any, position?: number, parentId?: string) => Promise<MindBlock>;
  onUpdateBlock: (id: string, content: any, properties?: Record<string, any>) => Promise<MindBlock>;
  onDeleteBlock: (id: string) => Promise<void>;
}

// This is a simplified BlockEditor component. Actual implementation will vary.
export function BlockEditor({ 
  pageId, 
  blocks, 
  onCreateBlock, 
  onUpdateBlock, 
  onDeleteBlock 
}: BlockEditorProps) {
  const [newBlockType, setNewBlockType] = useState<string>('text');

  const handleAddBlock = async () => {
    const content = newBlockType === 'text' ? { text: '' } : {};
    await onCreateBlock(newBlockType, content);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="space-y-4 mb-8">
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            onUpdate={(content) => onUpdateBlock(block.id, content)}
          />
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => {
            setNewBlockType('text');
            handleAddBlock();
          }}
          className="flex items-center gap-1"
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
          className="flex items-center gap-1"
        >
          <span>Add Todo</span>
        </Button>
      </div>
    </div>
  );
}
