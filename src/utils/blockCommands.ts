
import { Heading1, Heading2, Heading3, ListTodo, Quote, Code, Image, Table, FileText, Type } from 'lucide-react';
import { BlockCommand } from '@/types/commands';

export const blockCommands: BlockCommand[] = [
  {
    id: 'text',
    title: 'Text',
    description: 'Just start writing with plain text',
    icon: Type,
    keywords: ['text', 'plain', 'paragraph'],
    type: 'text'
  },
  {
    id: 'todo',
    title: 'To-do List',
    description: 'Track tasks with a to-do list',
    icon: ListTodo,
    keywords: ['todo', 'task', 'checkbox', 'check'],
    type: 'todo'
  },
  {
    id: 'heading1',
    title: 'Heading 1',
    description: 'Big section heading',
    icon: Heading1,
    keywords: ['h1', 'header', 'title'],
    type: 'heading1'
  },
  {
    id: 'heading2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    keywords: ['h2', 'header', 'subtitle'],
    type: 'heading2'
  },
  {
    id: 'heading3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    keywords: ['h3', 'header', 'subtitle'],
    type: 'heading3'
  },
  {
    id: 'quote',
    title: 'Quote',
    description: 'Capture a quote',
    icon: Quote,
    keywords: ['quote', 'blockquote', 'cite'],
    type: 'quote'
  },
  {
    id: 'code',
    title: 'Code',
    description: 'Add code snippets',
    icon: Code,
    keywords: ['code', 'snippet', 'pre'],
    type: 'code'
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Upload or embed an image',
    icon: Image,
    keywords: ['image', 'picture', 'photo'],
    type: 'image'
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Add a table',
    icon: Table,
    keywords: ['table', 'grid', 'spreadsheet'],
    type: 'table'
  },
  {
    id: 'file',
    title: 'File',
    description: 'Upload a file',
    icon: FileText,
    keywords: ['file', 'upload', 'document', 'attachment'],
    type: 'file'
  }
];
