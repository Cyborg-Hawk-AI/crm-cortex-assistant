import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Integration } from '@/utils/types';
import { getAvailableIntegrations, configureIntegration } from '@/integrations';
import { useToast } from '@/hooks/use-toast';

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load integrations on first render
  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const availableIntegrations = await getAvailableIntegrations();
        setIntegrations(availableIntegrations);
      } catch (error) {
        console.error('Error loading integrations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load integrations',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIntegrations();
  }, [toast]);
  
  const setupIntegration = async (
    integrationType: 'notion' | 'salesforce' | 'freshservice' | 'other',
    config: Record<string, any>
  ) => {
    try {
      setIsLoading(true);
      configureIntegration(integrationType, config);
      
      // Refresh integrations list
      const updatedIntegrations = await getAvailableIntegrations();
      setIntegrations(updatedIntegrations);
      
      toast({
        title: 'Integration set up',
        description: `${integrationType.charAt(0).toUpperCase() + integrationType.slice(1)} integration has been configured successfully`
      });
    } catch (error) {
      console.error(`Error setting up ${integrationType} integration:`, error);
      toast({
        title: 'Error',
        description: `Failed to configure ${integrationType} integration`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    integrations,
    isLoading,
    setupIntegration
  };
}
