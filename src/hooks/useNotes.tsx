
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note, Notebook } from '@/utils/types';
import { notebookApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export function useNotes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  
  // Fetch all notebooks
  const { 
    data: notebooks = [], 
    isLoading: isLoadingNotebooks,
    error: notebooksError
  } = useQuery({
    queryKey: ['notebooks'],
    queryFn: () => notebookApi.getNotebooks(),
  });
  
  // Fetch notes for the active notebook
  const {
    data: notes = [],
    isLoading: isLoadingNotes,
    error: notesError
  } = useQuery({
    queryKey: ['notes', activeNotebookId],
    queryFn: () => activeNotebookId 
      ? notebookApi.getNotes({ notebookId: activeNotebookId }) 
      : Promise.resolve([]),
    enabled: !!activeNotebookId,
  });
  
  // Create notebook mutation
  const createNotebookMutation = useMutation({
    mutationFn: notebookApi.createNotebook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast({
        title: 'Notebook created',
        description: 'Notebook has been created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create notebook: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  // Update notebook mutation
  const updateNotebookMutation = useMutation({
    mutationFn: notebookApi.updateNotebook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast({
        title: 'Notebook updated',
        description: 'Notebook has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update notebook: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  // Delete notebook mutation
  const deleteNotebookMutation = useMutation({
    mutationFn: notebookApi.deleteNotebook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast({
        title: 'Notebook deleted',
        description: 'Notebook has been deleted successfully'
      });
      if (activeNotebookId) {
        setActiveNotebookId(null);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete notebook: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: notebookApi.createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', activeNotebookId] });
      toast({
        title: 'Note created',
        description: 'Note has been created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create note: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: notebookApi.updateNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', activeNotebookId] });
      toast({
        title: 'Note updated',
        description: 'Note has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update note: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: notebookApi.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', activeNotebookId] });
      toast({
        title: 'Note deleted',
        description: 'Note has been deleted successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete note: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  // Function to create a new notebook with a modal for name entry
  const createNotebook = async (title: string) => {
    return createNotebookMutation.mutate(title);
  };
  
  // Function to add a note to the active notebook
  const addNote = (content: string) => {
    if (!activeNotebookId) {
      toast({
        title: 'Error',
        description: 'Please select a notebook first',
        variant: 'destructive'
      });
      return;
    }
    
    createNoteMutation.mutate({
      content,
      notebookId: activeNotebookId
    } as any); // Using 'as any' to bypass TypeScript checking
  };
  
  // Function to update a note
  const updateNote = (note: Partial<Note> & { id: string }) => {
    updateNoteMutation.mutate(note);
  };
  
  // Function to delete a note
  const deleteNote = (noteId: string) => {
    deleteNoteMutation.mutate(noteId);
  };
  
  return {
    notebooks,
    notes,
    activeNotebookId,
    setActiveNotebookId,
    createNotebook,
    updateNotebook: updateNotebookMutation.mutate,
    deleteNotebook: deleteNotebookMutation.mutate,
    addNote,
    updateNote,
    deleteNote,
    isLoading: isLoadingNotebooks || isLoadingNotes,
    error: notebooksError || notesError,
    isCreatingNotebook: createNotebookMutation.isPending,
    isUpdatingNotebook: updateNotebookMutation.isPending,
    isDeletingNotebook: deleteNotebookMutation.isPending,
    isCreatingNote: createNoteMutation.isPending,
    isUpdatingNote: updateNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending
  };
}
