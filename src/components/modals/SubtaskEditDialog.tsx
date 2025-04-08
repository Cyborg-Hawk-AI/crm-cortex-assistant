
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
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { SubTask } from '@/utils/types';

const subtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  parent_task_id: z.string(),
  user_id: z.string(), // Added user_id to the schema
  is_completed: z.boolean(),
  created_by: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

type SubtaskFormValues = z.infer<typeof subtaskSchema>;

interface SubtaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtask: SubTask;
  onSubmit: (data: SubTask) => void;
}

export function SubtaskEditDialog({ 
  open, 
  onOpenChange, 
  subtask,
  onSubmit 
}: SubtaskEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Convert dates to strings for form compatibility
  const normalizedSubtask = {
    ...subtask,
    created_at: typeof subtask.created_at === 'object' 
      ? (subtask.created_at as Date).toISOString() 
      : subtask.created_at,
    updated_at: typeof subtask.updated_at === 'object'
      ? (subtask.updated_at as Date).toISOString()
      : subtask.updated_at
  };

  const form = useForm<SubtaskFormValues>({
    resolver: zodResolver(subtaskSchema),
    defaultValues: normalizedSubtask,
  });

  // Update the form when the subtask changes
  useEffect(() => {
    if (subtask) {
      // Convert dates to strings
      const formattedSubtask = {
        ...subtask,
        created_at: typeof subtask.created_at === 'object' 
          ? (subtask.created_at as Date).toISOString() 
          : subtask.created_at,
        updated_at: typeof subtask.updated_at === 'object'
          ? (subtask.updated_at as Date).toISOString()
          : subtask.updated_at
      };
      
      form.reset(formattedSubtask);
    }
  }, [subtask, form]);

  const handleSubmit = async (values: SubtaskFormValues) => {
    setIsSubmitting(true);
    try {
      // Ensure all required properties are included
      await onSubmit({
        id: values.id,
        title: values.title,
        parent_task_id: values.parent_task_id,
        user_id: values.user_id, // Include the user_id in the submit
        is_completed: values.is_completed,
        created_by: values.created_by || null,
        created_at: values.created_at,
        updated_at: new Date().toISOString(),
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating subtask:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Subtask</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Subtask description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_completed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Mark as completed
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
