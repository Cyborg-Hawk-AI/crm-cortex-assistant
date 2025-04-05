
import { supabase } from '@/lib/supabase';

// Define the Ticket type for proper TypeScript support
export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  date: string;
  user_id?: string;
}

// Function to fetch recent tickets
export async function getRecentTickets(): Promise<Ticket[]> {
  try {
    // Fetch real tickets data from Supabase
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent tickets:', error);
      return getMockTickets(); // Fallback to mock data on error
    }

    // Transform the data to match the Ticket interface
    return data.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status || 'Open',
      priority: task.priority || 'Medium',
      date: new Date(task.created_at).toLocaleDateString(),
      user_id: task.user_id
    }));
  } catch (error) {
    console.error('Failed to fetch recent tickets:', error);
    return getMockTickets(); // Fallback to mock data
  }
}

// Mock data function for fallback or development
function getMockTickets(): Ticket[] {
  return [
    {
      id: '1',
      title: 'Fix navigation bug in dashboard',
      status: 'Open',
      priority: 'High',
      date: new Date().toLocaleDateString()
    },
    {
      id: '2',
      title: 'Implement dark mode toggle',
      status: 'In Progress',
      priority: 'Medium',
      date: new Date().toLocaleDateString()
    },
    {
      id: '3',
      title: 'Optimize database queries',
      status: 'Resolved',
      priority: 'Medium',
      date: new Date(Date.now() - 86400000).toLocaleDateString()
    },
    {
      id: '4',
      title: 'Update user authentication flow',
      status: 'In Progress',
      priority: 'High',
      date: new Date(Date.now() - 172800000).toLocaleDateString()
    }
  ];
}
