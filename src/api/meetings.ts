import { supabase, getCurrentUserId } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Meeting } from '@/utils/types';

// Get all meetings for the current user
export const getMeetings = async () => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      attendees:meeting_attendees(*)
    `)
    .eq('created_by', userId)
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching meetings:', error);
    throw new Error(error.message);
  }
  
  return data || [];
};

// Create a new meeting
export const createMeeting = async (meetingData: Partial<Meeting>) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const meeting = {
    id: uuidv4(),
    created_by: userId,
    ...meetingData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating meeting:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Update an existing meeting
export const updateMeeting = async ({ id, ...meetingData }: Partial<Meeting> & { id: string }) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('meetings')
    .update({
      ...meetingData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('created_by', userId) // Ensure user can only update their own meetings
    .select()
    .single();
  
  if (error) {
    console.error('Error updating meeting:', error);
    throw new Error(error.message);
  }
  
  return data;
};

// Delete a meeting
export const deleteMeeting = async (id: string) => {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
    .eq('created_by', userId); // Ensure user can only delete their own meetings
  
  if (error) {
    console.error('Error deleting meeting:', error);
    throw new Error(error.message);
  }
  
  return { success: true };
};
