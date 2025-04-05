
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api';

export function useUsers() {
  const { 
    data: users = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsers(),
  });
  
  const { 
    data: currentUser, 
    isLoading: isLoadingCurrentUser 
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userApi.getCurrentUserProfile(),
  });

  return {
    users,
    currentUser,
    isLoading: isLoading || isLoadingCurrentUser,
    error
  };
}
