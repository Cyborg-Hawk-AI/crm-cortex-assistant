
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Check } from 'lucide-react';

export const NotionSync = () => {
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'syncing' | 'synced' | 'error'>('synced');
  const [lastSynced, setLastSynced] = React.useState<string>("Today at 10:45 AM");
  
  const handleSync = () => {
    setSyncStatus('syncing');
    
    // Simulate sync process
    setTimeout(() => {
      setSyncStatus('synced');
      setLastSynced(`Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
    }, 2000);
  };
  
  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 relative z-20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">Notion Sync</h3>
        </div>
        {syncStatus === 'synced' && (
          <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            <Check className="h-3 w-3 mr-1" />
            <span>Connected</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-3">
        Sync your Notion workspaces, tasks, and pages with Action.it to manage everything in one place.
      </p>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Last synced: {lastSynced}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 text-xs border-indigo-200 text-indigo-700"
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
        >
          {syncStatus === 'syncing' ? (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3" />
              <span>Sync Now</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
