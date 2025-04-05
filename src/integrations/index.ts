
// Central integration manager

import { Integration } from '@/utils/types';
import * as notionApi from './notion/api';

// Get available integrations
export const getAvailableIntegrations = (): Integration[] => {
  return [
    {
      id: 'notion',
      name: 'Notion',
      type: 'notion',
      status: notionApi.isNotionConfigured() ? 'active' : 'inactive',
      lastSync: notionApi.isNotionConfigured() ? new Date() : undefined,
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      type: 'salesforce',
      status: 'inactive',
    },
    {
      id: 'freshservice',
      name: 'Freshservice',
      type: 'freshservice',
      status: 'inactive',
    }
  ];
};

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
