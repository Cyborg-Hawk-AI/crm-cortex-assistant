
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUserId } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface ProjectCreateButtonProps {
  onProjectCreated?: (projectId: string) => void;
  navigateToProject?: boolean;
}

export function ProjectCreateButton({ 
  onProjectCreated, 
  navigateToProject = false 
}: ProjectCreateButtonProps) {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateProject = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to create a project",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Creating a project as a task with null parent_task_id
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          description,
          reporter_id: userId,
          user_id: userId,
          status: 'open',
          priority: 'medium',
          parent_task_id: null // This marks it as a top-level task (project)
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setIsDialogOpen(false);
      setTitle('');
      setDescription('');

      if (data) {
        // Only navigate if explicitly requested
        if (navigateToProject) {
          navigate(`/projects/${data.id}`);
        } else {
          // Just refresh the projects list by calling the callback if provided
          if (onProjectCreated) {
            onProjectCreated(data.id);
          }
          // For main projects page, just stay on the current page
          // We could add a window.location.reload() here, but that's probably too heavy-handed
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
      >
        <PlusCircle className="h-4 w-4 mr-1" />
        New Project
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#25384D] border-[#3A4D62]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#F1F5F9]">Create New Project</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#F1F5F9]">Project Title</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
                className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] focus:ring-neon-aqua focus:border-neon-aqua"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#F1F5F9]">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                className="min-h-[100px] bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] focus:ring-neon-aqua focus:border-neon-aqua"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-[#3A4D62] text-[#CBD5E1]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateProject}
              className="bg-neon-aqua hover:bg-neon-aqua/90 text-black"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
