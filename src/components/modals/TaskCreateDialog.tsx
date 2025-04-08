
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Task } from '@/utils/types';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';
import { getCurrentUserId } from '@/lib/supabase';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.date().optional(),
  assignee_id: z.string().uuid('Must be a valid user ID').optional(),
  tags: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Task, 'id'>) => void;
}

export function TaskCreateDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: TaskCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { users, currentUser, isLoading: isLoadingUsers } = useUsers();

  // Get the current user ID when component mounts
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
      status: 'open',
      priority: 'medium',
      tags: [],
      assignee_id: currentUser?.id
    },
  });

  // Update default assignee when current user loads
  useEffect(() => {
    if (currentUser) {
      form.setValue('assignee_id', currentUser.id);
    }
  }, [currentUser, form]);

  const handleSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      await onSubmit({
        title: values.title || '', 
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        tags: values.tags || [],
        reporter_id: userId,
        user_id: userId, // Include user_id field
        assignee_id: values.assignee_id || null,
        parent_task_id: null, 
        due_date: values.due_date ? values.due_date.toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
        <DialogHeader>
          <DialogTitle className="text-neon-aqua">Create New Task</DialogTitle>
          <DialogDescription className="text-[#CBD5E1]">Create a new task and assign it to a user</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      placeholder="Task description (optional)" 
                      rows={3} 
                      {...field} 
                      value={field.value || ''}
                      className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] resize-none"
                    />
                  </FormControl>
                  <FormMessage className="text-neon-red" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#F1F5F9]">Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''}
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9]">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-neon-red" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[#F1F5F9]">Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-[#1C2A3A] border-[#3A4D62]",
                            !field.value && "text-[#64748B]"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#25384D] border-[#3A4D62]" align="start">
                      <CalendarComponent
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
            
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-[#3A4D62] text-[#F1F5F9] hover:bg-[#3A4D62]/30">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-neon-aqua text-black hover:bg-neon-aqua/90">
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
