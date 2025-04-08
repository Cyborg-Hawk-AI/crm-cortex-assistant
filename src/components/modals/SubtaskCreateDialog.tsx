
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
import { SubTask } from '@/utils/types';
import { getCurrentUserId } from '@/lib/supabase';

const subtaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

type SubtaskFormValues = z.infer<typeof subtaskSchema>;

interface SubtaskCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onSubmit: (data: Omit<SubTask, 'id'>) => void;
}

export function SubtaskCreateDialog({ 
  open, 
  onOpenChange, 
  taskId,
  onSubmit 
}: SubtaskCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user ID when component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const form = useForm<SubtaskFormValues>({
    resolver: zodResolver(subtaskSchema),
    defaultValues: {
      title: '',
    },
  });

  const handleSubmit = async (values: SubtaskFormValues) => {
    setIsSubmitting(true);
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      await onSubmit({
        title: values.title,
        parent_task_id: taskId,
        is_completed: false,
        created_by: userId || null,
        user_id: userId, // Added the required user_id field
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating subtask:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Subtask</DialogTitle>
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
            
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Subtask'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
