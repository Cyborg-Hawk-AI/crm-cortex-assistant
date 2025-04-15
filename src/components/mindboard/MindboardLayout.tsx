
import React from 'react';
import { MindboardSidebar } from './MindboardSidebar';
import { useMindboard } from '@/hooks/useMindboard';
import { Mindboard, MindSection, MindPage, MindBlock } from '@/utils/types';

// Define the props interface for MindboardLayout
interface MindboardLayoutProps {
  mindboards: Mindboard[];
  sections?: MindSection[];
  pages?: MindPage[];
  blocks?: MindBlock[];
  activeMindboardId: string | null;
  activeSectionId?: string | null;
  activePageId?: string | null;
  setActiveMindboardId: (id: string) => void;
  setActiveSectionId?: (id: string) => void;
  setActivePageId?: (id: string) => void;
  onCreateBoard: (title: string) => Promise<Mindboard>;
  onCreateSection?: (params: { mindboardId: string, title: string }) => Promise<MindSection>;
  onCreatePage?: (params: { sectionId: string, title: string }) => Promise<MindPage>;
  onCreateBlock?: (type: string, content: any, position?: number, parentId?: string) => Promise<MindBlock>;
  onUpdateBlock?: (id: string, content: any, properties?: any) => Promise<MindBlock>;
  onDeleteBlock?: (id: string) => Promise<void>;
  onDeleteMindboard: (id: string) => Promise<void>;
  onDeleteSection?: (id: string) => Promise<void>;
  onDeletePage?: (id: string) => Promise<void>;
  onRenameMindboard: (id: string, title: string) => Promise<void>;
  onRenameSection?: (id: string, title: string) => Promise<void>;
  onRenamePage?: (id: string, title: string) => Promise<void>;
  isLoading?: boolean;
}

export function MindboardLayout({
  mindboards,
  activeMindboardId,
  setActiveMindboardId,
  onCreateBoard,
  onRenameMindboard,
  onDeleteMindboard,
  isLoading
}: MindboardLayoutProps) {
  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-[#3A4D62] bg-[#1C2A3A] h-full overflow-hidden">
        <MindboardSidebar 
          mindboards={mindboards}
          activeMindboardId={activeMindboardId}
          setActiveMindboardId={setActiveMindboardId}
          onCreateMindboard={onCreateBoard}
          onRenameMindboard={onRenameMindboard}
          onDeleteMindboard={onDeleteMindboard}
          isLoading={isLoading || false}
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
