
declare module 'uuid';

export interface MindBlock {
  id: string;
  page_id: string;
  content_type: 'text' | 'todo' | 'image' | 'file' | 'heading1' | 'heading2' | 'heading3' | 'quote' | 'code' | 'bullet' | 'numbered' | 'toggle' | 'callout' | 'divider';
  content: {
    text?: string;
    checked?: boolean;
    url?: string;
    caption?: string;
    name?: string;
    number?: number;
    expanded?: boolean;
    indent?: number;
  };
  position: number;
  created_at: string;
  updated_at: string;
}
