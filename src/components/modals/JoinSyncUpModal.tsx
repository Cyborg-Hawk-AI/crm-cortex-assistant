
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface JoinSyncUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinSyncUpModal({ open, onOpenChange }: JoinSyncUpModalProps) {
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingName, setMeetingName] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingLink || !meetingName) {
      toast({
        title: "Missing fields",
        description: "Please provide both a meeting URL and name",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = user?.id;
      
      if (!userId) {
        toast({
          title: "Authentication error",
          description: "Please log in to join a SyncUp",
          variant: "destructive"
        });
        return;
      }
      
      // Create meeting bot via Edge Function
      const botResponse = await supabase.functions.invoke('create-meeting-bot', {
        body: { 
          meetingUrl: meetingLink,
          meetingName: meetingName,
          userId 
        }
      });

      if (botResponse.error) {
        throw new Error(botResponse.error.message);
      }

      toast({
        title: "Success",
        description: "SyncUp bot created successfully"
      });
      
      // Reset form and close modal
      setMeetingLink('');
      setMeetingName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error joining SyncUp:', error);
      toast({
        title: "Error",
        description: "Failed to join SyncUp. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join SyncUp</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meetingName">SyncUp Name</Label>
            <Input 
              id="meetingName" 
              value={meetingName} 
              onChange={(e) => setMeetingName(e.target.value)} 
              placeholder="Team Weekly Sync" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting URL</Label>
            <Input 
              id="meetingLink" 
              value={meetingLink} 
              onChange={(e) => setMeetingLink(e.target.value)} 
              placeholder="https://meet.google.com/..." 
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Join SyncUp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

