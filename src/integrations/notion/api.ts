
// Notion API integration

interface NotionIntegrationConfig {
  apiKey: string;
  workspaceId?: string;
}

// In a real implementation, we would store this in Supabase or environment variables
let config: NotionIntegrationConfig | null = null;

export const configureNotionIntegration = (apiKey: string, workspaceId?: string): void => {
  config = { apiKey, workspaceId };
  localStorage.setItem('notion_integration', JSON.stringify(config));
};

export const getNotionConfig = (): NotionIntegrationConfig | null => {
  if (config) return config;
  
  const savedConfig = localStorage.getItem('notion_integration');
  if (savedConfig) {
    config = JSON.parse(savedConfig);
    return config;
  }
  
  return null;
};

export const isNotionConfigured = (): boolean => {
  return getNotionConfig() !== null;
};

// Example function to fetch tasks from Notion
export const fetchNotionTasks = async (): Promise<any[]> => {
  const notionConfig = getNotionConfig();
  if (!notionConfig) {
    throw new Error('Notion integration not configured');
  }
  
  // In a real implementation, we would make an API call to Notion
  // For now, return mock data
  return [
    {
      id: 'notion-1',
      title: 'Review PRs for frontend update',
      status: 'In Progress',
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      notionPageId: 'abc123'
    },
    {
      id: 'notion-2',
      title: 'Prepare presentation for client meeting',
      status: 'Not Started',
      dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      notionPageId: 'def456'
    },
    {
      id: 'notion-3',
      title: 'Finalize Q2 planning document',
      status: 'In Progress',
      dueDate: new Date(Date.now() + 86400000 * 1), // 1 day from now
      notionPageId: 'ghi789'
    }
  ];
};

// Example function to search Notion for tasks
export const searchNotionTasks = async (query: string): Promise<any[]> => {
  if (!isNotionConfigured()) {
    throw new Error('Notion integration not configured');
  }
  
  // In a real implementation, we would make a search API call to Notion
  // For now, filter mock data
  const allTasks = await fetchNotionTasks();
  if (!query) return allTasks;
  
  const lowerQuery = query.toLowerCase();
  return allTasks.filter(task => 
    task.title.toLowerCase().includes(lowerQuery) || 
    task.status.toLowerCase().includes(lowerQuery)
  );
};
