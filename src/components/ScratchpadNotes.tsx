
import React, { useState } from 'react';
import { useNotes } from '@/hooks/useNotes';
import { Plus, Book, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScratchpadSection } from './ScratchpadSection';
import { NotebookCreateModal } from './modals/NotebookCreateModal';

export function ScratchpadNotes() {
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    notebooks, 
    notes, 
    activeNotebookId, 
    setActiveNotebookId, 
    addNote, 
    createNotebook,
    isLoading,
    isCreatingNotebook
  } = useNotes();

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNoteContent.trim() && activeNotebookId) {
      addNote(newNoteContent);
      setNewNoteContent('');
    }
  };

  const handleCreateNotebook = (title: string) => {
    createNotebook(title);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="border-b border-border/30 p-4 flex items-center justify-between bg-primary/10">
        <h2 className="text-lg font-semibold text-foreground">Scratchpad</h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setIsModalOpen(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> New Notebook
        </Button>
      </header>

      <div className="flex-1 overflow-auto">
        {notebooks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Book className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No notebooks found.</p>
            <p className="text-sm">Create a notebook to start taking notes.</p>
            <Button 
              className="mt-4" 
              onClick={() => setIsModalOpen(true)}
              variant="default"
            >
              Create Notebook
            </Button>
          </div>
        ) : (
          <Tabs 
            defaultValue={notebooks[0]?.id} 
            className="w-full" 
            value={activeNotebookId || undefined}
            onValueChange={(value) => setActiveNotebookId(value)}
          >
            <div className="border-b px-4 overflow-x-auto bg-card">
              <TabsList className="mb-0">
                {notebooks.map(notebook => (
                  <TabsTrigger key={notebook.id} value={notebook.id} className="py-2">
                    {notebook.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            {notebooks.map(notebook => (
              <TabsContent key={notebook.id} value={notebook.id} className="p-0 mt-0">
                <ScratchpadSection 
                  notes={notes}
                  notebook={notebook}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {activeNotebookId && (
        <div className="p-4 border-t border-border/30 bg-card">
          <form onSubmit={handleAddNote} className="flex gap-2">
            <Input
              placeholder="Type a note and press Enter..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!newNoteContent.trim()}>
              Add Note
            </Button>
          </form>
        </div>
      )}

      <NotebookCreateModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        onSubmit={handleCreateNotebook}
      />
    </div>
  );
}
