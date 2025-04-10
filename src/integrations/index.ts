// Central integration manager

import { supabase } from '@/lib/supabase';
import { Integration } from '@/utils/types';
import * as notionApi from './notion/api';

// Get available integrations
export async function getAvailableIntegrations(): Promise<Integration[]> {
  try {
    const { data, error } = await supabase
      .from('integrations')
      .select('*');
      
    if (error) throw error;
    
    return data as Integration[];
  } catch (e) {
    console.error("Error fetching integrations:", e);
    
    // Return mock integrations for development
    return [
      {
        id: "notion-integration",
        name: "Notion",
        type: "note",
        status: "available",
        user_id: "system",
        config: {},
        last_sync: null
      },
      {
        id: "github-integration",
        name: "GitHub",
        type: "code",
        status: "available",
        user_id: "system",
        config: {}
      }
    ];
  }
}

// Configure an integration
export const configureIntegration = (
  integrationType: 'notion' | 'salesforce' | 'freshservice' | 'other',
  config: Record<string, any>
): void => {
  switch (integrationType) {
    case 'notion':
      notionApi.configureNotionIntegration(config.apiKey, config.workspaceId);
      break;
    case 'salesforce':
      // Implement Salesforce configuration
      break;
    case 'freshservice':
      // Implement Freshservice configuration
      break;
    default:
      throw new Error(`Integration type ${integrationType} not supported`);
  }
};

// Check if any integration is active
export const hasActiveIntegration = (): boolean => {
  const integrations = getAvailableIntegrations();
  return integrations.some(integration => integration.status === 'active');
};
