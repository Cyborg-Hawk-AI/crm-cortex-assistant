
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface MissionCreateButtonProps {
  onMissionCreated?: (missionId: string) => void;
}

export function MissionCreateButton({ onMissionCreated }: MissionCreateButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [missionName, setMissionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateMission = async () => {
    if (!missionName.trim()) {
      toast({
        title: "Mission name required",
        description: "Please enter a name for your mission",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error("You must be logged in to create a mission");
      }
      
      // Create a new mission (top-level task)
      const missionId = uuidv4();
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          id: missionId,
          title: missionName,
          description: null,
          status: 'open',
          priority: 'medium',
          user_id: userId,
          reporter_id: userId,
          assignee_id: null,
          due_date: null,
          parent_task_id: null,
          tags: [`mission:${missionId}`], // Tag it as a mission for easier querying
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Mission created",
        description: `${missionName} has been added to your command deck`
      });
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setMissionName('');
      
      // Notify parent component
      if (onMissionCreated && data) {
        onMissionCreated(data.id);
      }
    } catch (error: any) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error creating mission",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)}
        className="bg-neon-purple hover:bg-neon-purple/90 text-black"
      >
        <PlusCircle className="h-4 w-4 mr-1" /> New Mission
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#25384D] border-[#3A4D62]">
          <DialogHeader>
            <DialogTitle className="text-[#F1F5F9]">Create new mission</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mission-name" className="text-right text-[#CBD5E1]">
                Name
              </Label>
              <Input
                id="mission-name"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="col-span-3 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                placeholder="Enter mission name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateMission();
                  }
                }}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-[#3A4D62] text-[#CBD5E1] hover:bg-[#1C2A3A]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMission}
              disabled={isLoading}
              className="bg-neon-purple hover:bg-neon-purple/90 text-black"
            >
              {isLoading ? "Creating..." : "Create Mission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
