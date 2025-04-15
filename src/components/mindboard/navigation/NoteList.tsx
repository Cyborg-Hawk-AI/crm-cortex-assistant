
import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MindPage } from '@/utils/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NoteListProps {
  notes: MindPage[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote?: (title: string) => void;
  onDeleteNote?: (id: string) => void;
  onRenameNote?: (id: string, newTitle: string) => void;
  isNarrow?: boolean; // Add the isNarrow prop
}

export function NoteList({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  isNarrow = false // Set a default value
}: NoteListProps) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");

  useEffect(() => {
    // Log whenever notes are updated
    console.log("[NoteList] Notes received:", notes.map(n => ({ id: n.id.substring(0, 8), title: n.title })));
  }, [notes]);

  // Update the editing state when activeNoteId changes
  useEffect(() => {
    // If we have an active note, make sure we're not in editing mode for a different note
    if (activeNoteId && editingNoteId && activeNoteId !== editingNoteId) {
      setEditingNoteId(null);
      setEditingTitle("");
    }
    
    // If we're creating a note and a new active note is set, exit creation mode
    if (activeNoteId && isCreatingNote) {
      setIsCreatingNote(false);
      setNewNoteTitle("");
    }
  }, [activeNoteId]);

  const handleRenameStart = (note: MindPage) => {
    setEditingNoteId(note.id);
    setEditingTitle(note.title);
  };

  const handleRenameConfirm = () => {
    if (editingNoteId && editingTitle.trim() && onRenameNote) {
      console.log("[NoteList] Renaming note:", editingNoteId, "to:", editingTitle.trim());
      onRenameNote(editingNoteId, editingTitle.trim());
      setEditingNoteId(null);
      setEditingTitle("");
    }
  };

  const handleRenameCancel = () => {
    setEditingNoteId(null);
    setEditingTitle("");
  };

  const handleCreateNoteStart = () => {
    setIsCreatingNote(true);
    setNewNoteTitle("");
  };

  const handleCreateNoteConfirm = () => {
    if (newNoteTitle.trim() && onCreateNote) {
      console.log("[NoteList] Creating note with title:", newNoteTitle.trim());
      onCreateNote(newNoteTitle.trim());
      setIsCreatingNote(false);
      setNewNoteTitle("");
    }
  };

  const handleCreateNoteCancel = () => {
    setIsCreatingNote(false);
    setNewNoteTitle("");
  };

  return (
    <div className="h-full flex flex-col p-2">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className={cn(
          "font-semibold",
          isNarrow ? "text-base" : "text-lg" // Adjust text size based on isNarrow
        )}>Notes</h3>
        {onCreateNote && (
          <Button variant="ghost" size="icon" onClick={handleCreateNoteStart}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isCreatingNote && (
        <div className="flex items-center gap-1 p-1 bg-background/80 border rounded-md mb-3">
          <Input
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateNoteConfirm();
              } else if (e.key === 'Escape') {
                handleCreateNoteCancel();
              }
            }}
            placeholder="New note title..."
            autoFocus
            className="h-7 min-w-[100px] bg-transparent"
          />
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCreateNoteConfirm}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCreateNoteCancel}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {notes.map((note) => (
            <div key={note.id} className="group">
              {editingNoteId === note.id ? (
                <div className="flex items-center gap-1 p-1 bg-background/80 border rounded-md m-1">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameConfirm();
                      } else if (e.key === 'Escape') {
                        handleRenameCancel();
                      }
                    }}
                    autoFocus
                    className="h-7 min-w-[100px] bg-transparent"
                  />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRenameConfirm}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRenameCancel}>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log("[NoteList] Selected note:", note.id, note.title);
                      onSelectNote(note.id);
                    }}
                    className={cn(
                      "flex-1 justify-start h-9",
                      isNarrow && "text-sm py-1", // Apply smaller text and padding when narrow
                      note.id === activeNoteId && "bg-accent text-accent-foreground font-medium shadow-[0_0_8px_rgba(0,247,239,0.2)]"
                    )}
                  >
                    {note.title}
                  </Button>
                  
                  {(onRenameNote || onDeleteNote) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "opacity-0 group-hover:opacity-100 transition-opacity",
                            isNarrow ? "h-7 w-7" : "h-8 w-8" // Make buttons smaller when narrow
                          )}
                        >
                          <MoreVertical className={cn(
                            "text-muted-foreground",
                            isNarrow ? "h-3.5 w-3.5" : "h-4 w-4" // Make icons smaller when narrow
                          )} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onRenameNote && (
                          <DropdownMenuItem onClick={() => handleRenameStart(note)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                        )}
                        
                        {onDeleteNote && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-neon-red focus:text-neon-red"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className={isNarrow ? "max-w-[90vw] w-[270px]" : ""}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{note.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDeleteNote(note.id)}
                                  className="bg-neon-red hover:bg-neon-red/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
