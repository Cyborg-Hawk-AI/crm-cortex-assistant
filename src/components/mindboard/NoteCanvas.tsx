import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Save, Link, Image, List, ListOrdered, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible';
import { NotePage, Note } from '@/utils/types';
import { useToast } from '@/hooks/use-toast';

const getPage = async (id: string | null): Promise<NotePage | null> => {
  if (!id) return null;
  return {
    id,
    title: 'Sample Page',
    section_id: '1',
    notebook_id: '1',
    content: '# Sample Content\n\nThis is a sample page content. Edit me!',
    is_subpage: false
  };
};

const getPageNotes = async (pageId: string | null): Promise<Note[]> => {
  if (!pageId) return [];
  
  return [
    {
      id: '1',
      content: 'This is a sample note on this page.',
      created_at: new Date(),
      updated_at: new Date(),
      user_id: 'user1',
      pageId
    }
  ];
};

interface NoteCanvasProps {
  notebookId: string | null;
  sectionId: string | null;
  pageId: string | null;
}

export function NoteCanvas({ notebookId, sectionId, pageId }: NoteCanvasProps) {
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const { data: page } = useQuery({
    queryKey: ['page', pageId],
    queryFn: () => getPage(pageId),
    enabled: !!pageId
  });
  
  const { data: notes = [] } = useQuery({
    queryKey: ['notes', pageId],
    queryFn: () => getPageNotes(pageId),
    enabled: !!pageId
  });
  
  useEffect(() => {
    if (page?.content) {
      setContent(page.content);
    } else {
      setContent('');
    }
  }, [page]);
  
  const handleStartEditing = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    setIsEditing(false);
    
    toast({
      title: "Page content saved",
      description: "Your changes have been saved"
    });
  };
  
  const insertFormatting = (format: string) => {
    toast({
      title: `Format: ${format}`,
      description: `Applied ${format} formatting`
    });
  };
  
  if (!pageId) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <div>
          <h3 className="text-lg font-medium text-neon-blue mb-2">Welcome to Mindboard</h3>
          <p className="text-sm text-[#CBD5E1] mb-6 max-w-md">
            Select a notebook, section, and page to start editing your notes or create new ones to get started.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            {['Notebooks', 'Sections', 'Pages'].map((item, i) => (
              <div key={i} className="bg-[#25384D]/50 border border-[#3A4D62] rounded-lg p-3 text-center">
                <p className="text-xs text-neon-aqua mb-1">{i + 1}</p>
                <h4 className="text-sm font-medium text-[#F1F5F9]">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-[#3A4D62] bg-[#1C2A3A]/50">
        <h3 className="text-base font-medium text-[#F1F5F9]">
          {page?.title || 'Untitled'}
        </h3>
        
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <Button
              onClick={handleSave}
              variant="outline"
              size="sm"
              className="h-7 text-xs bg-[#25384D] hover:bg-[#3A4D62] border-neon-aqua/30 hover:border-neon-aqua"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          ) : (
            <Button
              onClick={handleStartEditing}
              variant="outline"
              size="sm"
              className="h-7 text-xs bg-[#25384D] hover:bg-[#3A4D62] border-neon-aqua/30 hover:border-neon-aqua"
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {isEditing && (
        <div className="flex items-center p-2 border-b border-[#3A4D62] bg-[#25384D]/30">
          <div className="flex flex-wrap gap-1">
            {[
              { icon: <ListOrdered className="h-3 w-3" />, label: 'Heading', format: 'heading' },
              { icon: <List className="h-3 w-3" />, label: 'List', format: 'list' },
              { icon: <ListOrdered className="h-3 w-3" />, label: 'Numbered List', format: 'numbered-list' },
              { icon: <CircleDot className="h-3 w-3" />, label: 'Bullet', format: 'bullet' },
              { icon: <Image className="h-3 w-3" />, label: 'Image', format: 'image' },
              { icon: <Link className="h-3 w-3" />, label: 'Link', format: 'link' },
            ].map((item, i) => (
              <Button
                key={i}
                onClick={() => insertFormatting(item.format)}
                variant="ghost"
                size="sm"
                className="h-7 text-xs hover:bg-[#3A4D62]/50"
              >
                {item.icon}
                <span className="ml-1">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1" orientation="vertical" hideScrollbar={true}>
        <div className="p-6 min-h-[800px]">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] p-3 rounded-md bg-[#25384D]/30 border border-[#3A4D62] text-[#F1F5F9] focus:outline-none focus:border-neon-aqua/50 resize-vertical"
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              {content ? (
                <div className="p-3 bg-[#25384D]/10 rounded-md border border-[#3A4D62]/50 min-h-[200px]">
                  <pre className="whitespace-pre-wrap text-[#CBD5E1]">{content}</pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-center">
                  <p className="text-sm text-[#64748B]">This page is empty. Click Edit to add content.</p>
                </div>
              )}
            </div>
          )}
          
          {notes.length > 0 && !isEditing && (
            <Collapsible className="mt-8 border-t border-[#3A4D62]/50 pt-4">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <h4 className="text-sm font-medium text-[#CBD5E1]">Attached Notes ({notes.length})</h4>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-180"
                    >
                      <path d="M1 1L5 5L9 1" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-[#25384D]/20 border border-[#3A4D62]/50 rounded-md p-3 text-sm text-[#CBD5E1]">
                      {note.content}
                      <div className="mt-1 text-xs text-[#64748B]">
                        {new Date(note.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
