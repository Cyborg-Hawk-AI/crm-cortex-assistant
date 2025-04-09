
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createTask } from '@/api/tasks';
import { useQueryClient } from '@tanstack/react-query';

interface MissionCreateButtonProps {
  onMissionCreated?: (missionId: string) => void;
}

export function MissionCreateButton({ onMissionCreated }: MissionCreateButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCreateMission = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create a new top-level task as a mission with all required fields
      const newTask = await createTask({
        title: title.trim(),
        description: '',
        status: 'open',
        priority: 'medium',
        tags: ['mission'],
        parent_task_id: null,
        reporter_id: '', // This will be filled by the API with current user ID
        user_id: '', // This will be filled by the API with current user ID
        due_date: null,
        assignee_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['recentTickets'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      
      toast({
        title: "Mission created",
        description: "Your new mission has been created successfully"
      });
      
      // Call the onMissionCreated callback if provided
      if (onMissionCreated && newTask && newTask.id) {
        onMissionCreated(newTask.id);
      }
      
      setTitle('');
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error",
        description: "Failed to create mission",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-neon-green to-neon-green/80 text-foreground hover:shadow-[0_0_12px_rgba(182,255,93,0.4)] hover:brightness-110"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        New Mission
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle>Create New Mission</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mission-title">Mission Title</Label>
              <Input 
                id="mission-title" 
                placeholder="Enter mission title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="border-[#3A4D62] text-[#F1F5F9]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMission}
              disabled={!title.trim() || isLoading}
              className="bg-neon-green hover:bg-neon-green/90 text-black"
            >
              {isLoading ? 'Creating...' : 'Create Mission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
