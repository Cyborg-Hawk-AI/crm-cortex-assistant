
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { createTask } from '@/api/tasks';
import { getCurrentUserId } from '@/lib/supabase';

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.string().optional(),
  assignee_id: z.string().optional(),
  labels: z.array(z.string()).optional()
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export function TaskCreateModal({ open, onOpenChange, onTaskCreated }: TaskCreateModalProps) {
  const { toast } = useToast();
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      labels: []
    }
  });

  const { mutate: createTaskMutation, isPending } = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully'
      });
      form.reset();
      setLabels([]);
      if (onTaskCreated) onTaskCreated();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create task: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: TaskFormValues) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'User ID is not available. Please try again.',
        variant: 'destructive'
      });
      return;
    }
    
    const taskData = {
      title: data.title,
      description: data.description || null,
      status: data.priority === 'urgent' ? 'in-progress' as const : 'open' as const,
      priority: data.priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
      reporter_id: userId,
      user_id: userId,
      assignee_id: data.assignee_id || null,
      parent_task_id: null,
      due_date: data.dueDate ? data.dueDate.toISOString() : null,
      tags: labels,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    createTaskMutation(taskData);
  };

  const handleAddLabel = () => {
    if (newLabel.trim() !== '' && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
        <DialogHeader>
          <DialogTitle className="text-neon-aqua">Create New Task</DialogTitle>
          <DialogDescription className="text-[#CBD5E1]">
            Add a new task to your workflow.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F1F5F9]">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]" />
                  </FormControl>
                  <FormMessage className="text-neon-red" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F1F5F9]">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Task description" 
                      className="resize-none bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-neon-red" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[#F1F5F9]">Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal bg-[#1C2A3A] border-[#3A4D62]",
                              !field.value && "text-[#64748B]"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#25384D] border-[#3A4D62]" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="bg-[#25384D] text-[#F1F5F9]"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-neon-red" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#F1F5F9]">Priority</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-[#3A4D62] bg-[#1C2A3A] px-3 py-2 text-sm text-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="medium"
                        {...field}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </FormControl>
                    <FormMessage className="text-neon-red" />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="assignee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#F1F5F9]">Assignee</FormLabel>
                  <FormControl>
                    <Input placeholder="Assignee ID" {...field} className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]" />
                  </FormControl>
                  <FormMessage className="text-neon-red" />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel className="text-[#F1F5F9]">Labels</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((label, index) => (
                  <div 
                    key={index} 
                    className="bg-neon-aqua/10 text-neon-aqua px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="text-neon-aqua hover:text-neon-red"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex mt-2 gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add label"
                  className="flex-1 bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddLabel}
                  className="border-[#3A4D62] text-[#F1F5F9] hover:bg-[#3A4D62]/30"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-[#3A4D62] text-[#F1F5F9] hover:bg-[#3A4D62]/30">
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isPending} 
                className="bg-neon-aqua text-black hover:bg-neon-aqua/90"
              >
                {isPending ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
