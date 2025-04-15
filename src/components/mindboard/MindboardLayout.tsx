import React from 'react';
import { MindboardSidebar } from './MindboardSidebar';
import { useMindboard } from '@/hooks/useMindboard';

export function MindboardLayout() {
  const { 
    mindboards, 
    activeMindboardId, 
    setActiveMindboardId,
    createMindboard,
    updateMindboard,
    deleteMindboard,
    isLoading
  } = useMindboard();

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-[#3A4D62] bg-[#1C2A3A] h-full overflow-hidden">
        <MindboardSidebar 
          mindboards={mindboards}
          activeMindboardId={activeMindboardId}
          setActiveMindboardId={setActiveMindboardId}
          onCreateMindboard={(title) => createMindboard(title)}
          onRenameMindboard={(id) => {/* Implement renaming logic */}}
          onDeleteMindboard={(id) => deleteMindboard(id)}
          isLoading={isLoading}
        />
      </div>
      <div className="flex-1 bg-[#0F172A] overflow-hidden">
        {/* Main content area */}
        <div className="h-full flex items-center justify-center text-[#CBD5E1]">
          {activeMindboardId ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                {mindboards.find(m => m.id === activeMindboardId)?.title || 'Mindboard'}
              </h2>
              <p className="text-[#64748B]">
                Select or create a section to get started
              </p>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Mindboards</h2>
              <p className="text-[#64748B]">
                Create your first mindboard to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
