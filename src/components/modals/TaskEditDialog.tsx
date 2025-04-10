
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
import { Task, TaskStatus, TaskPriority } from '@/utils/types';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUsers } from '@/hooks/useUsers';
import { updateTask } from '@/api/tasks';
import { useToast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed', 'completed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.date().optional().nullable(),
  assignee_id: z.string().uuid('Must be a valid user ID').optional().nullable(),
  tags: z.array(z.string()).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onRefresh: () => void;
}

export function TaskEditDialog({ 
  open, 
  onOpenChange, 
  task,
  onRefresh
}: TaskEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { users, isLoading: isLoadingUsers } = useUsers();
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date) : null,
      assignee_id: task.assignee_id || null,
      tags: task.tags || [],
    },
  });

  useEffect(() => {
    // Update the form values when the task prop changes
    form.reset({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date) : null,
      assignee_id: task.assignee_id || null,
      tags: task.tags || [],
    });
  }, [task, form]);

  const handleSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const taskId = task.id;

      await updateTask({
        id: taskId,
        title: values.title,
        description: values.description || null,
        status: values.status as TaskStatus,
        priority: values.priority as TaskPriority,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        assignee_id: values.assignee_id || null,
        reporter_id: task.reporter_id,
        user_id: task.user_id,
        parent_task_id: task.parent_task_id,
        tags: task.tags || [],
        created_at: task.created_at,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "Task updated",
        description: "Task details have been saved successfully"
      });

      onRefresh();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle immediate field updates when selections change
  const handleFieldChange = async (field: string, value: any) => {
    try {
      const updatedTask = {
        ...task,
        [field]: value,
        updated_at: new Date().toISOString()
      };
      
      await updateTask(updatedTask);
      onRefresh();
      
      toast({
        title: "Field updated",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} has been updated`
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
        <DialogHeader>
          <DialogTitle className="text-neon-aqua">Edit Task</DialogTitle>
          <DialogDescription className="text-[#CBD5E1]">Edit task details</DialogDescription>
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldChange('status', value);
                      }}
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
                        <SelectItem value="completed">Completed</SelectItem>
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFieldChange('priority', value);
                      }}
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
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleFieldChange('assignee_id', value);
                    }}
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
                        selected={field.value || undefined}
                        onSelect={(date) => {
                          field.onChange(date);
                          if (date) {
                            handleFieldChange('due_date', date.toISOString());
                          } else {
                            handleFieldChange('due_date', null);
                          }
                        }}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
