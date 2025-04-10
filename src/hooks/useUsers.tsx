
import { useQuery } from '@tanstack/react-query';
import { getUsers, getCurrentUserProfile } from '@/api/users';

export function useUsers() {
  const { 
    data: users = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
  
  const { 
    data: currentUser, 
    isLoading: isLoadingCurrentUser 
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUserProfile,
  });

  return {
    users,
    currentUser,
    isLoading: isLoading || isLoadingCurrentUser,
    error
  };
}
