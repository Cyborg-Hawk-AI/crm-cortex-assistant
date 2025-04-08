
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in-progress", "resolved", "closed"]),
});

// We'll use a singleton pattern to control the modal
let modalOpenState = false;
let setModalOpenState: React.Dispatch<React.SetStateAction<boolean>> | null = null;

export const openTaskCreateModal = () => {
  if (setModalOpenState) {
    setModalOpenState(true);
  } else {
    modalOpenState = true;
  }
};

export function TaskCreateModal() {
  const [isOpen, setIsOpen] = useState(modalOpenState);
  // Store the setter for external access
  setModalOpenState = setIsOpen;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id;

      if (!userId) {
        toast({
          title: "Authentication Error",
          description: "You need to be signed in to create tasks",
          variant: "destructive"
        });
        return;
      }

      // Create the task with the mission tag
      const newTask = {
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        reporter_id: userId,
        tags: ["mission:"+values.title.toLowerCase().replace(/\s+/g, '-')],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Mission Created",
        description: "Your new mission has been created successfully."
      });

      // Reset form and close modal
      form.reset();
      setIsOpen(false);

      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['recentTickets'] });
      queryClient.invalidateQueries({ queryKey: ['mission-tasks'] });
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: `Failed to create mission: ${error.message || "Unknown error"}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#1C2A3A] border-[#3A4D62] text-[#F1F5F9] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-neon-aqua">Create New Mission</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter mission title" 
                      {...field} 
                      className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]"
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter mission details" 
                      {...field} 
                      className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9] min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
                        <SelectItem value="low" className="text-neon-green">Low</SelectItem>
                        <SelectItem value="medium" className="text-neon-blue">Medium</SelectItem>
                        <SelectItem value="high" className="text-neon-yellow">High</SelectItem>
                        <SelectItem value="urgent" className="text-neon-red">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#25384D] border-[#3A4D62] text-[#F1F5F9]">
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-[#3A4D62] text-[#F1F5F9]"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-neon-aqua/20 hover:bg-neon-aqua/30 text-neon-aqua hover:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
              >
                Create Mission
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
