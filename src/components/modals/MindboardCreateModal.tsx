
import { useState } from 'react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

const mindboardSchema = z.object({
  title: z.string().min(1, 'Mindboard title is required'),
});

type MindboardFormValues = z.infer<typeof mindboardSchema>;

interface MindboardCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string) => void;
}

export function MindboardCreateModal({
  open,
  onOpenChange,
  onSubmit
}: MindboardCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<MindboardFormValues>({
    resolver: zodResolver(mindboardSchema),
    defaultValues: {
      title: '',
    },
  });

  const handleSubmit = async (values: MindboardFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      await onSubmit(values.title);
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Mindboard created successfully",
      });
    } catch (error: any) {
      console.error('Error creating mindboard:', error);
      const message = error instanceof Error ? error.message : "Failed to create mindboard";
      
      setErrorMessage(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Mindboard</DialogTitle>
          <DialogDescription>
            Give your new mindboard a title to get started.
          </DialogDescription>
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
                    <Input 
                      placeholder="Mindboard title" 
                      {...field} 
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {errorMessage && (
              <div className="text-sm text-red-500 p-3 bg-red-50 rounded-md border border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Mindboard'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
