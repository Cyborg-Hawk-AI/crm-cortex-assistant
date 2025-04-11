import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  TagIcon, 
  UserIcon, 
  Flag, 
  MessageCircle, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X 
} from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/utils/types';

interface TaskDetailProps {
  task: Task;
  subtasks: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskDetail({ task, subtasks, onClose, onRefresh }: TaskDetailProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status || 'open');
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [dueDate, setDueDate] = useState<Date | null>(task.due_date ? new Date(task.due_date) : null);
  const [isCompleted, setIsCompleted] = useState(task.status === 'completed');
  const [assignee, setAssignee] = useState(task.assignee_id || '');
  const [tags, setTags] = useState(task.tags || []);
  
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setStatus(task.status || 'open');
    setPriority(task.priority || 'medium');
    setDueDate(task.due_date ? new Date(task.due_date) : null);
    setIsCompleted(task.status === 'completed');
    setAssignee(task.assignee_id || '');
    setTags(task.tags || []);
  }, [task]);
  
  const handleSave = () => {
    toast({
      title: "Task updated",
      description: "Task details have been updated successfully."
    });
    onRefresh();
  };
  
  const handleDelete = () => {
    toast({
      title: "Task deleted",
      description: "Task has been deleted."
    });
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-[#F1F5F9]">Task Details</h3>
          <Badge variant="secondary">#{task.id.substring(0, 8)}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="hover:bg-secondary/50" onClick={onClose}>
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm text-[#CBD5E1]">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm text-[#CBD5E1]">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="text-sm text-[#CBD5E1]">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] data-[placeholder=true]:text-[#CBD5E1]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority" className="text-sm text-[#CBD5E1]">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] data-[placeholder=true]:text-[#CBD5E1]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="text-sm text-[#CBD5E1]">Due Date</Label>
              <Input
                type="date"
                id="dueDate"
                value={dueDate ? format(dueDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
                className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
              />
            </div>
            
            <div>
              <Label htmlFor="assignee" className="text-sm text-[#CBD5E1]">Assignee</Label>
              <Input 
                id="assignee" 
                value={assignee} 
                onChange={(e) => setAssignee(e.target.value)} 
                className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm text-[#CBD5E1] flex items-center space-x-2">
              <span>Completed</span>
              <Switch 
                checked={isCompleted} 
                onCheckedChange={setIsCompleted} 
                className="bg-neon-green/50 data-[state=checked]:bg-neon-green"
              />
            </Label>
          </div>
          
          <div>
            <Label htmlFor="tags" className="text-sm text-[#CBD5E1]">Tags</Label>
            <Input 
              id="tags" 
              value={tags.join(', ')} 
              onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))} 
              className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
            />
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-6 border-t border-border/40 flex justify-end space-x-2">
        <Button variant="ghost" className="text-[#CBD5E1]" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
