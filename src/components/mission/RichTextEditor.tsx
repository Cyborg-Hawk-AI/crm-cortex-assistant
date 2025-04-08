
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Code, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  content?: string | null;
  onSave: (content: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onSave, placeholder = 'Enter text here...' }: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState(content || '');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      if (content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  // Auto-save when clicking outside the editor
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isEditing && editor && !e.defaultPrevented) {
        const editorElement = document.querySelector('.ProseMirror');
        const toolbarElement = document.querySelector('.editor-toolbar');
        const buttonElement = document.querySelector('.editor-buttons');
        
        // Check if click is outside editor, toolbar, and buttons
        if (editorElement && 
            !editorElement.contains(e.target as Node) && 
            toolbarElement && 
            !toolbarElement.contains(e.target as Node) &&
            buttonElement &&
            !buttonElement.contains(e.target as Node)) {
          handleSave();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, editor, editorContent]);

  const handleSave = () => {
    if (editor) {
      const html = editor.getHTML();
      // Only save if there's actual content (not just empty paragraphs)
      const hasContent = html !== '<p></p>' && html.trim() !== '';
      onSave(html);
      console.log("Saving content:", html);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
    setIsEditing(false);
  };

  const toggleBold = () => {
    if (editor) {
      editor.chain().focus().toggleBold().run();
    }
  };

  const toggleItalic = () => {
    if (editor) {
      editor.chain().focus().toggleItalic().run();
    }
  };

  const toggleBulletList = () => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run();
    }
  };

  const toggleOrderedList = () => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run();
    }
  };

  const toggleCodeBlock = () => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock().run();
    }
  };

  const toggleBlockquote = () => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  // Determine whether to show content or editor
  // This now checks if content exists and isn't just an empty paragraph
  const isEmpty = !content || content === '<p></p>' || content.trim() === '';
  const showEditor = isEditing || isEmpty;
  
  return (
    <div className="border border-[#3A4D62] rounded-md bg-[#1C2A3A]">
      {showEditor ? (
        <>
          <div className="flex items-center p-1 border-b border-[#3A4D62] bg-[#25384D] editor-toolbar">
            <div className="flex space-x-1">
              <Button 
                variant="ghost"
                size="sm"
                onClick={toggleBold}
                className="p-1 h-8 w-8 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={toggleItalic}
                className="p-1 h-8 w-8 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={toggleBulletList}
                className="p-1 h-8 w-8 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={toggleOrderedList}
                className="p-1 h-8 w-8 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={toggleCodeBlock}
                className="p-1 h-8 w-8 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={toggleBlockquote}
                className="p-1 h-8 w-8 text-[#CBD5E1] hover:bg-[#3A4D62]/50"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <EditorContent 
            editor={editor} 
            className="p-2 min-h-[100px] max-h-[300px] overflow-y-auto text-[#F1F5F9]"
            onClick={() => setIsEditing(true)}
          />

          <div className="flex justify-end p-2 border-t border-[#3A4D62] bg-[#25384D] editor-buttons">
            <div className="space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="border-[#3A4D62] text-[#F1F5F9] hover:bg-[#3A4D62]/30"
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
              >
                Save
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div 
          className="p-4 prose prose-invert max-w-none"
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />
      )}
    </div>
  );
}
