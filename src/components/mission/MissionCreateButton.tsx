
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export function MissionCreateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMission = useMutation({
    mutationFn: async () => {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User must be authenticated to create missions');
      
      const missionId = uuidv4();
      const missionTag = `mission:${missionId}`;
      
      // Create a new task as the mission - removing user_id field which doesn't exist in schema
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          id: missionId,
          title: title,
          description: description || null,
          status: 'open',
          priority: 'medium',
          reporter_id: userId,
          parent_task_id: null,
          assignee_id: null,
          tags: [missionTag], // Tag with self-reference for easy querying
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentTickets'] });
      toast({
        title: 'Mission created',
        description: 'Your new mission has been created successfully'
      });
      setIsOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create mission: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
  };

  const handleCreateMission = () => {
    if (!title.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide a title for your mission',
        variant: 'destructive'
      });
      return;
    }
    
    createMission.mutate();
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-neon-aqua/20 hover:bg-neon-aqua/30 text-neon-aqua hover:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
      >
        <Plus className="mr-1 h-4 w-4" />
        Create Mission
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Mission</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Mission Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter mission title"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <RichTextEditor 
                content={description} 
                onSave={setDescription} 
                placeholder="Add mission details..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMission}
              disabled={createMission.isPending || !title.trim()}
            >
              {createMission.isPending ? 'Creating...' : 'Create Mission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
