
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
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';
import { getCurrentUserId } from '@/lib/supabase';

const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  status: z.string(),
  priority: z.string(),
  due_date: z.date().optional(),
  assignee_id: z.string().optional().nullable(),
  reporter_id: z.string(),
  user_id: z.string(), // Added user_id field
  parent_task_id: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSubmit: (data: Task) => void;
}

export function TaskEditDialog({ 
  open, 
  onOpenChange, 
  task,
  onSubmit 
}: TaskEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { users, isLoading: isLoadingUsers } = useUsers();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  // Convert dates to strings and handle null values for form compatibility
  const normalizedTask = {
    ...task,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    created_at: task.created_at ? (typeof task.created_at === 'object' 
      ? (task.created_at as Date).toISOString() 
      : task.created_at) : new Date().toISOString(),
    updated_at: task.updated_at ? (typeof task.updated_at === 'object' 
      ? (task.updated_at as Date).toISOString() 
      : task.updated_at) : new Date().toISOString(),
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: normalizedTask,
  });

  useEffect(() => {
    if (task) {
      const formattedTask = {
        ...task,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        created_at: task.created_at ? (typeof task.created_at === 'object' 
          ? (task.created_at as Date).toISOString() 
          : task.created_at) : new Date().toISOString(),
        updated_at: task.updated_at ? (typeof task.updated_at === 'object' 
          ? (task.updated_at as Date).toISOString() 
          : task.updated_at) : new Date().toISOString(),
      };
      form.reset(formattedTask);
    }
  }, [task, form]);

  const handleSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: values.id,
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        assignee_id: values.assignee_id || null,
        reporter_id: values.reporter_id,
        user_id: values.user_id, // Include user_id in the submit
        parent_task_id: values.parent_task_id || null,
        tags: values.tags || [],
        created_at: values.created_at,
        updated_at: new Date().toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#D946EF]">
            Edit Mission
          </DialogTitle>
          <DialogDescription>Make changes to your mission here</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Mission title" 
                      className="border-gray-200 focus:border-neon-purple focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mission description (optional)" 
                      rows={3} 
                      className="border-gray-200 focus:border-neon-purple focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-neon-purple focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-200 focus:border-neon-purple focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="assignee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Assignee</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''}
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-200 focus:border-neon-purple focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-medium">Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal border-gray-200 focus:border-neon-purple focus:shadow-[0_0_10px_rgba(168,85,247,0.2)]",
                            !field.value && "text-muted-foreground"
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-gray-200 hover:border-gray-300"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-[#C084FC] to-[#D946EF] text-white hover:brightness-110 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
