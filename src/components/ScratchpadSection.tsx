import React from 'react';
import { Trash2, PlusCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/hooks/useNotes';
import { Note, Notebook, NoteSection, NotePage } from '@/utils/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScratchpadSectionProps {
  notes?: Note[];
  onDeleteNote?: (id: string) => void;
  notebook?: Notebook;
  sections?: NoteSection[];
  pages?: NotePage[];
  activeNotebookId?: string;
  activeSectionId?: string;
  activePageId?: string;
  onSelectNotebook?: (id: string) => void;
  onSelectSection?: (id: string) => void;
  onSelectPage?: (id: string) => void;
  onAddSection?: () => void;
  onAddPage?: () => void;
}

export const ScratchpadSection: React.FC<ScratchpadSectionProps> = ({ 
  notes, 
  onDeleteNote,
  notebook,
  sections,
  pages,
  activeNotebookId,
  activeSectionId,
  activePageId,
  onSelectNotebook,
  onSelectSection,
  onSelectPage,
  onAddSection,
  onAddPage
}) => {
  const { deleteNote } = useNotes();
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});

  const handleClearNotes = () => {
    if (window.confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
      // We'll handle clearing notes differently since clearAll is not available
      if (notes && notes.length > 0) {
        notes.forEach(note => {
          if (deleteNote) deleteNote(note.id);
        });
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (notebook) {
    const isActive = notebook.id === activeNotebookId;
    
    return (
      <div className="mb-2 h-full flex flex-col">
        <div 
          className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer text-sm ${
            isActive ? 'bg-teal-green/10 text-black' : 'hover:bg-teal-green/5 text-black'
          }`}
          onClick={() => onSelectNotebook && onSelectNotebook(notebook.id)}
        >
          <span className="font-medium truncate">{notebook.title}</span>
        </div>
        
        {isActive && sections && sections.length > 0 && (
          <ScrollArea className="ml-2 mt-1 flex-1" orientation="vertical">
            <div className="space-y-0.5 min-h-[100px]">
              {sections.map(section => {
                const isSectionActive = section.id === activeSectionId;
                const isExpanded = expandedSections[section.id] || isSectionActive;
                
                return (
                  <div key={section.id} className="mb-0.5">
                    <div className="flex items-center justify-between p-0.5 rounded">
                      <div 
                        className={`flex items-center cursor-pointer flex-1 ${
                          isSectionActive ? 'text-black' : 'text-black'
                        }`}
                        onClick={() => {
                          toggleSection(section.id);
                          onSelectSection && onSelectSection(section.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 mr-1" />
                        ) : (
                          <ChevronRight className="h-3 w-3 mr-1" />
                        )}
                        <div 
                          className="h-2 w-2 rounded-full mr-1"
                          style={{ backgroundColor: section.color || '#4f46e5' }}  
                        />
                        <span className="text-xs truncate">{section.title}</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddPage && onAddPage();
                              }}
                            >
                              <PlusCircle className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Add new page</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {isExpanded && pages && (
                      <div className="ml-5 mt-0.5 space-y-0.5">
                        {pages
                          .filter(page => page.sectionId === section.id && !page.isSubpage)
                          .map(page => (
                            <div 
                              key={page.id}
                              className={`text-xs p-0.5 rounded cursor-pointer flex items-center ${
                                page.id === activePageId 
                                  ? 'bg-teal-green/10 text-black' 
                                  : 'hover:bg-teal-green/5 text-black'
                              }`}
                              onClick={() => onSelectPage && onSelectPage(page.id)}
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-teal-green mr-1.5" />
                              <span className="truncate">{page.title}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    );
  }

  if (notes) {
    return (
      <div className="flex flex-col h-full p-3 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-black">Notes</h2>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive"
              onClick={handleClearNotes}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Clear All
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1" orientation="vertical">
          <div className="space-y-2 min-h-[200px]">
            {notes.length === 0 ? (
              <div className="text-center p-4 text-black">
                <p>No notes yet. Start taking notes!</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-2 bg-white rounded-md border border-slate-200 shadow-sm"
                >
                  <div className="flex justify-between">
                    <p className="whitespace-pre-wrap break-words text-black text-sm">{note.content}</p>
                    {onDeleteNote && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3 text-black" />
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-black mt-1">
                    {note.timestamp ? note.timestamp.toLocaleString() : note.created_at.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full text-black">
      <p>Select a notebook to view notes</p>
    </div>
  );
};
