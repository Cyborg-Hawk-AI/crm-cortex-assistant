
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Mindboard, MindSection, MindPage, MindBlock } from '@/utils/types';

// Fetch all mindboards for the current user
export const getMindboards = async (): Promise<Mindboard[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('mindboards')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true });
  
  if (error) {
    console.error('Error fetching mindboards:', error);
    throw new Error(error.message);
  }
  
  return data as Mindboard[];
};

// Create a new mindboard
export const createMindboard = async (title: string, options?: { 
  description?: string,
  color?: string,
  icon?: string
}): Promise<Mindboard> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Get highest position to place new mindboard at the end
  const { data: existing } = await supabase
    .from('mindboards')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1);
  
  const position = existing && existing.length > 0 ? (existing[0].position + 1) : 0;
  
  const newMindboard: Partial<Mindboard> = {
    id: uuidv4(),
    user_id: userId,
    title,
    description: options?.description,
    position,
    color: options?.color || '#3B82F6', // Default blue color
    icon: options?.icon,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mindboards')
    .insert(newMindboard)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mindboard:', error);
    throw new Error(error.message);
  }
  
  return data as Mindboard;
};

// Update a mindboard
export const updateMindboard = async (mindboard: Partial<Mindboard> & { id: string }): Promise<Mindboard> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mindboards')
    .select()
    .eq('id', mindboard.id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mindboard:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const updates = {
    ...mindboard,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mindboards')
    .update(updates)
    .eq('id', mindboard.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating mindboard:', error);
    throw new Error(error.message);
  }
  
  return data as Mindboard;
};

// Delete a mindboard
export const deleteMindboard = async (mindboardId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mindboards')
    .select()
    .eq('id', mindboardId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mindboard:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const { error } = await supabase
    .from('mindboards')
    .delete()
    .eq('id', mindboardId);
  
  if (error) {
    console.error('Error deleting mindboard:', error);
    throw new Error(error.message);
  }
};

// Sections API

// Fetch sections for a mindboard
export const getMindSections = async (mindboardId: string): Promise<MindSection[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('mind_sections')
    .select('*')
    .eq('mindboard_id', mindboardId)
    .eq('user_id', userId)
    .order('position', { ascending: true });
  
  if (error) {
    console.error('Error fetching mind sections:', error);
    throw new Error(error.message);
  }
  
  return data as MindSection[];
};

// Create a new section
export const createMindSection = async (
  mindboardId: string, 
  title: string, 
  options?: {
    description?: string,
    color?: string,
    icon?: string
  }
): Promise<MindSection> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Get highest position to place new section at the end
  const { data: existing } = await supabase
    .from('mind_sections')
    .select('position')
    .eq('mindboard_id', mindboardId)
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1);
  
  const position = existing && existing.length > 0 ? (existing[0].position + 1) : 0;
  
  const newSection: Partial<MindSection> = {
    id: uuidv4(),
    mindboard_id: mindboardId,
    user_id: userId,
    title,
    description: options?.description,
    position,
    color: options?.color || '#10B981', // Default green color
    icon: options?.icon,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mind_sections')
    .insert(newSection)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mind section:', error);
    throw new Error(error.message);
  }
  
  return data as MindSection;
};

// Update a section
export const updateMindSection = async (section: Partial<MindSection> & { id: string }): Promise<MindSection> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mind_sections')
    .select()
    .eq('id', section.id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mind section:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const updates = {
    ...section,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mind_sections')
    .update(updates)
    .eq('id', section.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating mind section:', error);
    throw new Error(error.message);
  }
  
  return data as MindSection;
};

// Delete a section
export const deleteMindSection = async (sectionId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mind_sections')
    .select()
    .eq('id', sectionId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mind section:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const { error } = await supabase
    .from('mind_sections')
    .delete()
    .eq('id', sectionId);
  
  if (error) {
    console.error('Error deleting mind section:', error);
    throw new Error(error.message);
  }
};

// Pages API

// Fetch pages for a section
export const getMindPages = async (sectionId: string): Promise<MindPage[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('mind_pages')
    .select('*')
    .eq('section_id', sectionId)
    .eq('user_id', userId)
    .is('parent_page_id', null) // Only top-level pages
    .order('position', { ascending: true });
  
  if (error) {
    console.error('Error fetching mind pages:', error);
    throw new Error(error.message);
  }
  
  return data as MindPage[];
};

// Create a new page
export const createMindPage = async (
  sectionId: string, 
  title: string, 
  options?: {
    description?: string,
    parentPageId?: string,
    isPinned?: boolean
  }
): Promise<MindPage> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Get highest position to place new page at the end
  const { data: existing } = await supabase
    .from('mind_pages')
    .select('position')
    .eq('section_id', sectionId)
    .eq('user_id', userId)
    .eq('parent_page_id', options?.parentPageId || null)
    .order('position', { ascending: false })
    .limit(1);
  
  const position = existing && existing.length > 0 ? (existing[0].position + 1) : 0;
  
  const newPage: Partial<MindPage> = {
    id: uuidv4(),
    section_id: sectionId,
    user_id: userId,
    title,
    description: options?.description,
    position,
    is_pinned: options?.isPinned || false,
    parent_page_id: options?.parentPageId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mind_pages')
    .insert(newPage)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mind page:', error);
    throw new Error(error.message);
  }
  
  return data as MindPage;
};

// Update a page
export const updateMindPage = async (page: Partial<MindPage> & { id: string }): Promise<MindPage> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mind_pages')
    .select()
    .eq('id', page.id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mind page:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const updates = {
    ...page,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mind_pages')
    .update(updates)
    .eq('id', page.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating mind page:', error);
    throw new Error(error.message);
  }
  
  return data as MindPage;
};

// Delete a page
export const deleteMindPage = async (pageId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mind_pages')
    .select()
    .eq('id', pageId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mind page:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const { error } = await supabase
    .from('mind_pages')
    .delete()
    .eq('id', pageId);
  
  if (error) {
    console.error('Error deleting mind page:', error);
    throw new Error(error.message);
  }
};

// Blocks API

// Fetch blocks for a page
export const getMindBlocks = async (pageId: string): Promise<MindBlock[]> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('mind_blocks')
    .select('*')
    .eq('page_id', pageId)
    .eq('user_id', userId)
    .order('position', { ascending: true });
  
  if (error) {
    console.error('Error fetching mind blocks:', error);
    throw new Error(error.message);
  }
  
  return data as MindBlock[];
};

// Create a new block
export const createMindBlock = async (
  pageId: string, 
  contentType: MindBlock['content_type'], 
  content: any,
  options?: {
    position?: number,
    properties?: Record<string, any>
  }
): Promise<MindBlock> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Get highest position to place new block at the end if not specified
  let position = options?.position;
  
  if (position === undefined) {
    const { data: existing } = await supabase
      .from('mind_blocks')
      .select('position')
      .eq('page_id', pageId)
      .eq('user_id', userId)
      .order('position', { ascending: false })
      .limit(1);
    
    position = existing && existing.length > 0 ? (existing[0].position + 1) : 0;
  }
  
  const newBlock: Partial<MindBlock> = {
    id: uuidv4(),
    page_id: pageId,
    user_id: userId,
    content_type: contentType,
    content,
    position,
    properties: options?.properties || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mind_blocks')
    .insert(newBlock)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mind block:', error);
    throw new Error(error.message);
  }
  
  return data as MindBlock;
};

// Update a block
export const updateMindBlock = async (block: Partial<MindBlock> & { id: string }): Promise<MindBlock> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mind_blocks')
    .select()
    .eq('id', block.id)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mind block:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const updates = {
    ...block,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('mind_blocks')
    .update(updates)
    .eq('id', block.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating mind block:', error);
    throw new Error(error.message);
  }
  
  return data as MindBlock;
};

// Delete a block
export const deleteMindBlock = async (blockId: string): Promise<void> => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('mind_blocks')
    .select()
    .eq('id', blockId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) {
    console.error('Error fetching mind block:', fetchError);
    throw new Error(fetchError.message);
  }
  
  const { error } = await supabase
    .from('mind_blocks')
    .delete()
    .eq('id', blockId);
  
  if (error) {
    console.error('Error deleting mind block:', error);
    throw new Error(error.message);
  }
};
