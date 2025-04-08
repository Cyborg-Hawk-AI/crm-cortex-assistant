
import React from 'react';
import { MindBlock } from '@/utils/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FileIcon } from 'lucide-react';

interface BlockRendererProps {
  block: MindBlock;
  onUpdate?: (blockId: string, content: any) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, onUpdate }) => {
  const handleTodoToggle = (checked: boolean) => {
    if (onUpdate && block.content_type === 'todo') {
      onUpdate(block.id, {
        ...block.content,
        completed: checked
      });
    }
  };

  const renderContent = () => {
    switch (block.content_type) {
      case 'text':
        return (
          <div className="p-4">
            <p>{block.content.text}</p>
          </div>
        );
      
      case 'todo':
        return (
          <div className="p-4 flex items-center gap-2">
            <Checkbox
              checked={block.content.completed}
              onCheckedChange={handleTodoToggle}
            />
            <span className={block.content.completed ? 'line-through text-muted-foreground' : ''}>
              {block.content.text}
            </span>
          </div>
        );
      
      case 'image':
        return (
          <div className="relative w-full aspect-video">
            <img
              src={block.content.url}
              alt={block.content.caption || 'Image'}
              className="w-full h-full object-contain"
            />
            {block.content.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {block.content.caption}
              </p>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="p-4 flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            <a
              href={block.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {block.content.name}
            </a>
          </div>
        );
      
      case 'code':
        return (
          <div className="p-4">
            <pre className="bg-muted p-2 rounded-md overflow-x-auto">
              <code>{block.content.code}</code>
            </pre>
          </div>
        );
      
      case 'audio':
        return (
          <div className="p-4">
            <audio controls className="w-full">
              <source src={block.content.url} type={block.content.mimeType || 'audio/mpeg'} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      
      case 'video':
        return (
          <div className="p-4">
            <video controls className="w-full">
              <source src={block.content.url} type={block.content.mimeType || 'video/mp4'} />
              Your browser does not support the video element.
            </video>
          </div>
        );
      
      case 'embed':
        return (
          <div className="p-4">
            <iframe
              src={block.content.url}
              title={block.content.title || 'Embedded content'}
              className="w-full aspect-video border-0"
              allowFullScreen
            />
          </div>
        );
      
      default:
        return (
          <div className="p-4">
            <p className="text-muted-foreground">Unsupported block type</p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full mb-4 overflow-hidden">
      {renderContent()}
    </Card>
  );
};

export default BlockRenderer; 
