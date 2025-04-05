
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Meeting } from '@/utils/types';
import { meetingApi } from '@/api';
import { useToast } from '@/hooks/use-toast';

export function useMeetings() {
  const { toast } = useToast();
  
  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => meetingApi.getMeetings(),
  });
  
  const queryClient = useQueryClient();
  
  const createMeetingMutation = useMutation({
    mutationFn: (meetingData: Partial<Meeting>) => meetingApi.createMeeting(meetingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Meeting scheduled',
        description: 'Meeting has been scheduled successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to schedule meeting: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const updateMeetingMutation = useMutation({
    mutationFn: meetingApi.updateMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Meeting updated',
        description: 'Meeting has been updated successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update meeting: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const deleteMeetingMutation = useMutation({
    mutationFn: meetingApi.deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast({
        title: 'Meeting cancelled',
        description: 'Meeting has been cancelled successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to cancel meeting: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  return {
    meetings,
    isLoading,
    error,
    createMeeting: createMeetingMutation.mutate,
    updateMeeting: updateMeetingMutation.mutate,
    deleteMeeting: deleteMeetingMutation.mutate,
    isCreating: createMeetingMutation.isPending,
    isUpdating: updateMeetingMutation.isPending,
    isDeleting: deleteMeetingMutation.isPending
  };
}
