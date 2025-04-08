
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Code, Quote } from 'lucide-react';

interface RichTextEditorProps {
  content: string | null;
  onSave: (content: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function RichTextEditor({ 
  content, 
  onSave, 
  placeholder = 'Add description...', 
  autoFocus = false 
}: RichTextEditorProps) {
  const [editedContent, setEditedContent] = useState<string | null>(content);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      setEditedContent(editor.getHTML());
    },
    autofocus: autoFocus,
  });

  useEffect(() => {
    if (editor && content !== editedContent && !isEditing) {
      editor.commands.setContent(content || '');
      setEditedContent(content);
    }
  }, [content, editor, isEditing]);

  const handleSave = () => {
    if (editedContent !== content) {
      onSave(editedContent || '');
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (editor) {
      editor.commands.setContent(content || '');
      setEditedContent(content);
    }
    setIsEditing(false);
  };

  if (!isEditing && (!content || content.trim() === '' || content === '<p></p>')) {
    return (
      <div 
        className="text-sm text-muted-foreground italic cursor-pointer p-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50"
        onClick={() => setIsEditing(true)}
      >
        {placeholder}
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div 
        className="prose prose-sm max-w-none cursor-pointer p-2 border border-transparent rounded-md hover:border-gray-200 hover:bg-gray-50"
        dangerouslySetInnerHTML={{ __html: content || '' }}
        onClick={() => setIsEditing(true)}
      />
    );
  }

  return (
    <div className="border rounded-md bg-white">
      <div className="flex items-center p-1 border-b bg-gray-50">
        {editor && (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm" 
              className={`p-1 h-8 w-8 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              className={`p-1 h-8 w-8 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              className={`p-1 h-8 w-8 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              className={`p-1 h-8 w-8 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              className={`p-1 h-8 w-8 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm" 
              className={`p-1 h-8 w-8 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <EditorContent editor={editor} className="p-2 min-h-[100px] max-h-[300px] overflow-y-auto" />
      
      <div className="flex justify-end p-2 border-t bg-gray-50">
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
