
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

const notebookSchema = z.object({
  title: z.string().min(1, 'Notebook title is required'),
});

type NotebookFormValues = z.infer<typeof notebookSchema>;

interface NotebookCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string) => void;
}

export function NotebookCreateModal({
  open,
  onOpenChange,
  onSubmit
}: NotebookCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<NotebookFormValues>({
    resolver: zodResolver(notebookSchema),
    defaultValues: {
      title: '',
    },
  });

  const handleSubmit = async (values: NotebookFormValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setErrorCode(null);
    
    try {
      await onSubmit(values.title);
      form.reset();
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Notebook created successfully",
      });
    } catch (error: any) {
      console.error('Error creating notebook:', error);
      const message = error instanceof Error ? error.message : "Failed to create notebook";
      
      // Try to extract error code if available
      const code = error.code || (error.error && error.error.code) || null;
      setErrorCode(code);
      
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
          <DialogTitle>Create New Notebook</DialogTitle>
          <DialogDescription>
            Give your new notebook a title to get started.
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
                      placeholder="Notebook title" 
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
                
                {errorCode && (
                  <p className="text-xs ml-6">Error code: {errorCode}</p>
                )}
                
                <p className="mt-2 text-xs ml-6">
                  This might be due to Supabase Row Level Security (RLS) policies. 
                  Make sure you've run the notebook-rls-fix.sql script in your Supabase SQL editor.
                </p>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Notebook'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
