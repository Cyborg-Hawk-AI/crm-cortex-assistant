import React from 'react';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { BlockNoteViewRaw, useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/core/style.css';
import '@blocknote/react/style.css';
import { MindBlock } from '@/utils/types';

// Map our block types to BlockNote types
const blockTypeMap: Record<MindBlock['content_type'], string> = {
  'text': 'paragraph',
  'heading1': 'heading',
  'heading2': 'heading',
  'heading3': 'heading',
  'todo': 'checkListItem',
  'bullet': 'bulletListItem',
  'numbered': 'numberedListItem',
  'toggle': 'paragraph',
  'quote': 'quote',
  'callout': 'paragraph',
  'divider': 'paragraph',
  'code': 'codeBlock',
  'image': 'paragraph',
  'video': 'paragraph',
  'file': 'paragraph',
  'embed': 'paragraph',
  'table': 'paragraph',
  'database': 'paragraph',
  'columns': 'paragraph',
  'ai': 'paragraph'
};

// Convert MindBlock to BlockNote format
const mindBlockToBlockNote = (block: MindBlock): PartialBlock => {
  const baseBlock = {
    id: block.id,
    type: blockTypeMap[block.content_type],
    props: {
      textAlignment: block.content.textAlignment || 'left',
      backgroundColor: block.content.backgroundColor,
      textColor: block.content.textColor,
    },
    content: block.content.text ? [
      {
        type: 'text',
        text: block.content.text,
        styles: {
          bold: block.content.bold,
          italic: block.content.italic,
          underline: block.content.underline,
          strike: block.content.strike,
          textColor: block.content.textColor,
          backgroundColor: block.content.backgroundColor,
        },
      },
    ] : [],
  } as PartialBlock;

  // Add type-specific properties
  switch (block.content_type) {
    case 'heading1':
    case 'heading2':
    case 'heading3':
      (baseBlock.props as any).level = parseInt(block.content_type.replace('heading', ''));
      break;
    case 'todo':
      (baseBlock.props as any).checked = block.content.checked;
      break;
    case 'image':
      (baseBlock.props as any).url = block.content.url;
      (baseBlock.props as any).caption = block.content.text;
      break;
    case 'video':
      (baseBlock.props as any).url = block.content.url;
      (baseBlock.props as any).caption = block.content.text;
      break;
    case 'file':
      (baseBlock.props as any).url = block.content.url;
      (baseBlock.props as any).name = block.content.filename;
      break;
    case 'code':
      (baseBlock.props as any).language = block.content.language;
      break;
    case 'columns':
      (baseBlock.props as any).columns = block.content.columns;
      break;
  }

  return baseBlock;
};

// Convert BlockNote format to MindBlock
const blockNoteToMindBlock = (block: PartialBlock, pageId: string): Partial<MindBlock> => {
  const content: any = {
    text: typeof block.content?.[0] === 'object' && block.content[0]?.type === 'text' ? block.content[0].text : '',
    textAlignment: (block.props as any).textAlignment,
    backgroundColor: (block.props as any).backgroundColor,
    textColor: (block.props as any).textColor,
  };

  // Add type-specific properties
  switch (block.type) {
    case 'heading':
      content.level = (block.props as any).level;
      break;
    case 'checkListItem':
      content.checked = (block.props as any).checked;
      break;
    case 'image':
      content.url = (block.props as any).url;
      content.text = (block.props as any).caption;
      break;
    case 'video':
      content.url = (block.props as any).url;
      content.text = (block.props as any).caption;
      break;
    case 'file':
      content.url = (block.props as any).url;
      content.filename = (block.props as any).name;
      break;
    case 'codeBlock':
      content.language = (block.props as any).language;
      break;
  }

  return {
    id: block.id,
    page_id: pageId,
    content_type: Object.entries(blockTypeMap).find(([_, value]) => value === block.type)?.[0] as MindBlock['content_type'] || 'text',
    content,
    position: (block.props as any).position,
    parent_block_id: (block.props as any).parentId,
  };
};

interface BlockEditorProps {
  blocks: MindBlock[];
  pageId: string;
  onBlockCreate: (block: MindBlock) => void;
  onBlockUpdate: (block: MindBlock) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockMove: (blockId: string, newPosition: number, newParentId?: string) => void;
}

export function BlockEditor({ blocks, pageId, onBlockCreate, onBlockUpdate, onBlockDelete, onBlockMove }: BlockEditorProps) {
  // Convert blocks to BlockNote format
  const initialBlocks = blocks.length > 0 
    ? blocks.map(block => {
        const converted = mindBlockToBlockNote(block);
        console.log('Converted block:', converted);
        return converted;
      })
    : [{
        type: "paragraph" as const,
        content: [{
          type: "text" as const,
          text: "Start typing here...",
          styles: {}
        }],
        props: {
          textAlignment: "left" as const,
          backgroundColor: "default" as const,
          textColor: "default" as const
        }
      }];

  // Create the editor instance using the hook
  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
  });

  if (!editor) {
    console.log('Editor not ready, showing loading state');
    return <div>Loading editor...</div>;
  }

  console.log('Rendering editor with current state');
  return (
    <div className="block-editor" style={{ minHeight: '500px' }}>
      <BlockNoteViewRaw 
        editor={editor}
        onChange={() => {
          console.log('Editor content changed');
          const blocks = editor.topLevelBlocks;
          blocks.forEach((block) => {
            const mindBlock = blockNoteToMindBlock(block, pageId);
            if (mindBlock.id) {
              onBlockUpdate(mindBlock as MindBlock);
            } else {
              onBlockCreate(mindBlock as MindBlock);
            }
          });
        }}
        sideMenu={false}
        formattingToolbar={false}
        linkToolbar={false}
        slashMenu={false}
        emojiPicker={false}
        filePanel={false}
        tableHandles={false}
      />
    </div>
  );
}
