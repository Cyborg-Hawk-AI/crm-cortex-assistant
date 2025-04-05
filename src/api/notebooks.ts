import { supabase, getCurrentUserId, getCurrentUserEmail, ensureProfileExists } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Note, Notebook, NoteSection, NotePage } from '@/utils/types';

// Fetch all notebooks for the current user
export const getNotebooks = async (): Promise<Notebook[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Get notebooks directly without requiring the user_id to exist in profiles
  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching notebooks:', error);
    throw new Error(error.message);
  }
  
  return data as Notebook[];
};

// Create a new notebook
export const createNotebook = async (title: string): Promise<Notebook> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Simplified profile check that won't block notebook creation
  const profileCheck = await ensureProfileExists();
  console.log("Profile check result:", profileCheck);
  
  // Create notebook even if profile check has issues
  const newNotebook: Notebook = {
    id: uuidv4(),
    title,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sections: []
  };
  
  try {
    const { data, error } = await supabase
      .from('notebooks')
      .insert(newNotebook)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notebook:', error);
      
      // Check if the error is related to RLS policies
      if (error.code === '42501') {
        throw new Error('Permission denied. Please check your Supabase RLS policies.');
      }
      
      throw new Error(error.message);
    }
    
    return data as Notebook;
  } catch (error: any) {
    console.error('Error in createNotebook:', error);
    throw error;
  }
};

// Update a notebook
export const updateNotebook = async (notebook: Partial<Notebook> & { id: string }): Promise<Notebook> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // First check if user owns this notebook
  const { data: existingNotebook, error: fetchError } = await supabase
    .from('notebooks')
    .select()
    .eq('id', notebook.id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching notebook:', fetchError);
    throw new Error(fetchError.message);
  }
  
  // Update with new values
  const updates = {
    ...notebook,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('notebooks')
    .update(updates)
    .eq('id', notebook.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating notebook:', error);
    throw new Error(error.message);
  }
  
  return data as Notebook;
};

// Delete a notebook
export const deleteNotebook = async (notebookId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check if user owns this notebook
  const { data: existingNotebook, error: fetchError } = await supabase
    .from('notebooks')
    .select()
    .eq('id', notebookId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching notebook:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const { error } = await supabase
    .from('notebooks')
    .delete()
    .eq('id', notebookId);
  
  if (error) {
    console.error('Error deleting notebook:', error);
    throw new Error(error.message);
  }
};

// Create a new note
export const createNote = async (note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const newNote = {
    id: uuidv4(),
    content: note.content,
    user_id: userId,
    notebook_id: (note as any).notebookId,
    section_id: (note as any).sectionId,
    page_id: (note as any).pageId,
    linked_task_id: (note as any).linkedTaskId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('notes')
    .insert(newNote)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating note:', error);
    throw new Error(error.message);
  }
  
  // Transform the data to match our Note interface
  const result = {
    id: data.id,
    content: data.content,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    user_id: data.user_id,
    notebookId: data.notebook_id,
    sectionId: data.section_id,
    pageId: data.page_id,
    linkedTaskId: data.linked_task_id
  } as Note;
  
  return result;
};

// Get notes for a notebook, section, or page
export const getNotes = async (options: { 
  notebookId?: string, 
  sectionId?: string, 
  pageId?: string 
}): Promise<Note[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId);
  
  if (options.notebookId) {
    query = query.eq('notebook_id', options.notebookId);
  }
  
  if (options.sectionId) {
    query = query.eq('section_id', options.sectionId);
  }
  
  if (options.pageId) {
    query = query.eq('page_id', options.pageId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching notes:', error);
    throw new Error(error.message);
  }
  
  // Transform data to match Note interface
  const notes = data.map(note => ({
    id: note.id,
    content: note.content,
    created_at: new Date(note.created_at),
    updated_at: new Date(note.updated_at),
    user_id: note.user_id,
    notebookId: note.notebook_id,
    sectionId: note.section_id,
    pageId: note.page_id,
    linkedTaskId: note.linked_task_id
  } as Note));
  
  return notes;
};

// Update a note
export const updateNote = async (note: Partial<Note> & { id: string }): Promise<Note> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // First check if user owns this note
  const { data: existingNote, error: fetchError } = await supabase
    .from('notes')
    .select()
    .eq('id', note.id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching note:', fetchError);
    throw new Error(fetchError.message);
  }
  
  // Prepare the update
  const updates: any = {
    content: note.content,
    updated_at: new Date().toISOString()
  };
  
  if ((note as any).notebookId) updates.notebook_id = (note as any).notebookId;
  if ((note as any).sectionId) updates.section_id = (note as any).sectionId;
  if ((note as any).pageId) updates.page_id = (note as any).pageId;
  if ((note as any).linkedTaskId !== undefined) updates.linked_task_id = (note as any).linkedTaskId;
  
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', note.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating note:', error);
    throw new Error(error.message);
  }
  
  // Transform data to match Note interface
  const result = {
    id: data.id,
    content: data.content,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    user_id: data.user_id,
    notebookId: data.notebook_id,
    sectionId: data.section_id,
    pageId: data.page_id,
    linkedTaskId: data.linked_task_id
  } as Note;
  
  return result;
};

// Delete a note
export const deleteNote = async (noteId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check if user owns this note
  const { data: existingNote, error: fetchError } = await supabase
    .from('notes')
    .select()
    .eq('id', noteId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching note:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  
  if (error) {
    console.error('Error deleting note:', error);
    throw new Error(error.message);
  }
};
