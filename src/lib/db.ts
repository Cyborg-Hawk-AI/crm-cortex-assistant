
// Database utility functions for working with Supabase or localStorage

// In a real implementation, we would import and configure Supabase
// import { createClient } from '@supabase/supabase-js';

// Determine if we should use Supabase or localStorage
const useSupabase = (): boolean => {
  // Check for Supabase configuration or connection
  // For development purposes, just return false
  return false;
};

// Generic get function for retrieving data
export async function getItems<T>(
  collection: string, 
  options?: { filters?: Record<string, any>, limit?: number }
): Promise<T[]> {
  if (useSupabase()) {
    // Example Supabase implementation
    // const { data, error } = await supabase
    //   .from(collection)
    //   .select('*')
    //   .limit(options?.limit || 50);
    
    // if (error) throw new Error(error.message);
    // return data as T[];
    
    // Mock Supabase result
    return [] as T[];
  } else {
    // Use localStorage
    try {
      const items = localStorage.getItem(collection);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error(`Error fetching ${collection} from localStorage:`, error);
      return [];
    }
  }
}

// Generic create function for adding data
export async function createItem<T>(
  collection: string,
  item: T
): Promise<T> {
  if (useSupabase()) {
    // Example Supabase implementation
    // const { data, error } = await supabase
    //   .from(collection)
    //   .insert(item)
    //   .select()
    //   .single();
    
    // if (error) throw new Error(error.message);
    // return data as T;
    
    // Mock Supabase result
    return item;
  } else {
    // Use localStorage
    try {
      const items = localStorage.getItem(collection);
      const existingItems = items ? JSON.parse(items) : [];
      const newItems = [...existingItems, item];
      localStorage.setItem(collection, JSON.stringify(newItems));
      return item;
    } catch (error) {
      console.error(`Error creating ${collection} in localStorage:`, error);
      throw new Error(`Failed to create ${collection}`);
    }
  }
}

// Generic update function for modifying data
export async function updateItem<T extends { id: string }>(
  collection: string,
  id: string,
  updates: Partial<T>
): Promise<T> {
  if (useSupabase()) {
    // Example Supabase implementation
    // const { data, error } = await supabase
    //   .from(collection)
    //   .update(updates)
    //   .eq('id', id)
    //   .select()
    //   .single();
    
    // if (error) throw new Error(error.message);
    // return data as T;
    
    // Mock Supabase result
    return { id, ...updates } as T;
  } else {
    // Use localStorage
    try {
      const items = localStorage.getItem(collection);
      if (!items) throw new Error(`Collection ${collection} not found`);
      
      const existingItems = JSON.parse(items);
      const updatedItems = existingItems.map((item: T) => 
        item.id === id ? { ...item, ...updates } : item
      );
      
      localStorage.setItem(collection, JSON.stringify(updatedItems));
      const updatedItem = updatedItems.find((item: T) => item.id === id);
      
      if (!updatedItem) throw new Error(`Item with id ${id} not found`);
      return updatedItem;
    } catch (error) {
      console.error(`Error updating ${collection} in localStorage:`, error);
      throw new Error(`Failed to update ${collection}`);
    }
  }
}

// Generic delete function for removing data
export async function deleteItem(
  collection: string,
  id: string
): Promise<void> {
  if (useSupabase()) {
    // Example Supabase implementation
    // const { error } = await supabase
    //   .from(collection)
    //   .delete()
    //   .eq('id', id);
    
    // if (error) throw new Error(error.message);
  } else {
    // Use localStorage
    try {
      const items = localStorage.getItem(collection);
      if (!items) return;
      
      const existingItems = JSON.parse(items);
      const filteredItems = existingItems.filter((item: any) => item.id !== id);
      
      localStorage.setItem(collection, JSON.stringify(filteredItems));
    } catch (error) {
      console.error(`Error deleting from ${collection} in localStorage:`, error);
      throw new Error(`Failed to delete from ${collection}`);
    }
  }
}
