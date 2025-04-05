import React from 'react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Layers, CircleDot, FolderOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { MindSection } from '@/utils/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getMindSections } from '@/api/mindboard';

interface SectionTabsProps {
  notebookId: string | null;
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  onCreateSection: () => void;
}

export function SectionTabs({ 
  notebookId, 
  activeSectionId,
  setActiveSectionId,
  toggleSidebar,
  sidebarOpen,
  onCreateSection
}: SectionTabsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: sections = [], 
    isLoading 
  } = useQuery<MindSection[]>({
    queryKey: ['mind_sections', notebookId],
    queryFn: () => notebookId ? getMindSections(notebookId) : Promise.resolve([]),
    enabled: !!notebookId
  });
  
  // Set first section as active if none selected and sections exist
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId, setActiveSectionId]);
  
  if (!notebookId) {
    return (
      <div className="p-4 flex items-center justify-center border-b border-[#3A4D62] bg-[#1C2A3A]">
        <p className="text-[#CBD5E1] text-sm">Select a mindboard to view sections</p>
      </div>
    );
  }
  
  return (
    <div className="border-b border-[#3A4D62] bg-[#1C2A3A]">
      <div className="flex items-center">
        <ScrollArea className="flex-1">
          <Tabs 
            value={activeSectionId || ''}
            onValueChange={setActiveSectionId || (() => {})}
            className="w-full"
          >
            <TabsList className="bg-transparent p-0 h-12">
              {sections.map((section) => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className="data-[state=active]:shadow-[0_0_10px_rgba(0,247,239,0.3)] relative group h-10"
                >
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: section.color }}
                  />
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ScrollArea>
        
        <Button 
          onClick={onCreateSection}
          variant="ghost" 
          size="sm" 
          className="h-9 w-9 mr-1 text-[#CBD5E1] hover:text-neon-aqua"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add Section</span>
        </Button>
      </div>
    </div>
  );
}
