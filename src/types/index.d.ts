declare module 'uuid';

export interface MindBlock {
  id: string;
  page_id: string;
  content_type: 'text' | 'todo' | 'image' | 'file';
  content: {
    text?: string;
    completed?: boolean;
    url?: string;
    caption?: string;
    name?: string;
  };
  position: number;
  created_at: string;
  updated_at: string;
}
