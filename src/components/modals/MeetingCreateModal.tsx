
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Meeting } from '@/utils/types';
import { useMeetings } from '@/hooks/useMeetings';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface MeetingCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (meetingData: Partial<Meeting>) => void;
}

export function MeetingCreateModal({ open, onOpenChange, onSubmit }: MeetingCreateModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [clientName, setClientName] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [agenda, setAgenda] = useState('');
  const { toast } = useToast();
  const { createMeeting } = useMeetings();
  const { user } = useAuth();

  const resetForm = () => {
    setTitle('');
    setDate(new Date());
    setTime('09:00');
    setDuration(30);
    setClientName('');
    setMeetingLink('');
    setAgenda('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !meetingLink) {
      toast({
        title: "Missing fields",
        description: "Please provide both a meeting name and URL",
        variant: "destructive"
      });
      return;
    }

    try {
      const userId = user?.id;
      
      if (!userId) {
        toast({
          title: "Authentication error",
          description: "Please log in to create a meeting",
          variant: "destructive"
        });
        return;
      }
      
      // Create meeting bot via Edge Function
      const botResponse = await supabase.functions.invoke('create-meeting-bot', {
        body: { 
          meetingUrl: meetingLink,
          meetingName: title,
          userId 
        }
      });

      if (botResponse.error) {
        throw new Error(botResponse.error.message);
      }

      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const meetingDate = new Date(date);
      meetingDate.setHours(hours, minutes, 0, 0);
      
      const meetingData: Partial<Meeting> = {
        title,
        date: meetingDate.toISOString(),
        duration,
        client_name: clientName,
        meeting_link: meetingLink,
        agenda,
        bot_id: botResponse.data.id // Store the bot_id from Recall.ai
      };
      
      await createMeeting(meetingData);
      
      toast({
        title: "Success",
        description: "SyncUp meeting created successfully"
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule New SyncUp</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Name</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Weekly Team Sync" 
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input 
                  id="time" 
                  type="time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Client Name</Label>
              <Input 
                id="client" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                placeholder="John Doe" 
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="link">Meeting Link</Label>
            <Input 
              id="link" 
              value={meetingLink} 
              onChange={(e) => setMeetingLink(e.target.value)} 
              placeholder="https://meet.google.com/..." 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea 
              id="agenda" 
              value={agenda} 
              onChange={(e) => setAgenda(e.target.value)} 
              placeholder="Meeting agenda and topics to discuss..." 
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Schedule SyncUp
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
