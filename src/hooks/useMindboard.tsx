import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mindboard, MindSection, MindPage, MindBlock } from '@/utils/types';
import * as mindboardApi from '@/api/mindboard';
import { useToast } from '@/hooks/use-toast';

export function useMindboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeMindboardId, setActiveMindboardId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  const [lastToastTime, setLastToastTime] = useState<Record<string, number>>({
    block: 0,
    page: 0,
    section: 0,
    mindboard: 0
  });
  
  const TOAST_THROTTLE = 5000;
  
  const shouldShowToast = (type: 'block' | 'page' | 'section' | 'mindboard'): boolean => {
    const now = Date.now();
    const lastShown = lastToastTime[type] || 0;
    const shouldShow = now - lastShown > TOAST_THROTTLE;
    
    if (shouldShow) {
      setLastToastTime(prev => ({
        ...prev,
        [type]: now
      }));
    }
    
    return shouldShow;
  };
  
  const { 
    data: mindboards = [], 
    isLoading: isLoadingMindboards,
    error: mindboardsError
  } = useQuery({
    queryKey: ['mindboards'],
    queryFn: mindboardApi.getMindboards,
  });
  
  const {
    data: sections = [],
    isLoading: isLoadingSections,
    error: sectionsError
  } = useQuery({
    queryKey: ['mind_sections', activeMindboardId],
    queryFn: () => activeMindboardId 
      ? mindboardApi.getMindSections(activeMindboardId) 
      : Promise.resolve([]),
    enabled: !!activeMindboardId,
  });
  
  const {
    data: pages = [],
    isLoading: isLoadingPages,
    error: pagesError
  } = useQuery({
    queryKey: ['mind_pages', activeSectionId],
    queryFn: () => activeSectionId 
      ? mindboardApi.getMindPages(activeSectionId) 
      : Promise.resolve([]),
    enabled: !!activeSectionId,
  });
  
  const {
    data: blocks = [],
    isLoading: isLoadingBlocks,
    error: blocksError
  } = useQuery({
    queryKey: ['mind_blocks', activePageId],
    queryFn: () => activePageId 
      ? mindboardApi.getMindBlocks(activePageId) 
      : Promise.resolve([]),
    enabled: !!activePageId,
  });
  
  const createMindboardMutation = useMutation({
    mutationFn: (params: { title: string, description?: string, color?: string, icon?: string }) => 
      mindboardApi.createMindboard(params.title, params),
    onSuccess: (newMindboard) => {
      queryClient.invalidateQueries({ queryKey: ['mindboards'] });
      setActiveMindboardId(newMindboard.id);
      toast({
        title: 'Mindboard created',
        description: `${newMindboard.title} has been created successfully`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create mindboard: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const updateMindboardMutation = useMutation({
    mutationFn: mindboardApi.updateMindboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindboards'] });
      if (shouldShowToast('mindboard')) {
        toast({
          title: 'Mindboard updated',
          description: 'Mindboard has been updated successfully'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update mindboard: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const deleteMindboardMutation = useMutation({
    mutationFn: mindboardApi.deleteMindboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindboards'] });
      if (activeMindboardId) {
        setActiveMindboardId(null);
      }
      toast({
        title: 'Mindboard deleted',
        description: 'Mindboard has been deleted successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete mindboard: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const createSectionMutation = useMutation({
    mutationFn: (params: { 
      mindboardId: string, 
      title: string, 
      description?: string, 
      color?: string, 
      icon?: string 
    }) => mindboardApi.createMindSection(
      params.mindboardId, 
      params.title, 
      { 
        description: params.description, 
        color: params.color, 
        icon: params.icon 
      }
    ),
    onSuccess: (newSection) => {
      queryClient.invalidateQueries({ queryKey: ['mind_sections', activeMindboardId] });
      setActiveSectionId(newSection.id);
      toast({
        title: 'Section created',
        description: `${newSection.title} has been created successfully`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create section: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const updateSectionMutation = useMutation({
    mutationFn: mindboardApi.updateMindSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind_sections', activeMindboardId] });
      if (shouldShowToast('section')) {
        toast({
          title: 'Section updated',
          description: 'Section has been updated successfully'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update section: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const deleteSectionMutation = useMutation({
    mutationFn: mindboardApi.deleteMindSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind_sections', activeMindboardId] });
      if (activeSectionId) {
        setActiveSectionId(null);
      }
      toast({
        title: 'Section deleted',
        description: 'Section has been deleted successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete section: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const createPageMutation = useMutation({
    mutationFn: (params: { 
      sectionId: string, 
      title: string, 
      description?: string, 
      parentPageId?: string,
      isPinned?: boolean
    }) => mindboardApi.createMindPage(
      params.sectionId, 
      params.title, 
      { 
        description: params.description, 
        parentPageId: params.parentPageId,
        isPinned: params.isPinned
      }
    ),
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ['mind_pages', activeSectionId] });
      setActivePageId(newPage.id);
      toast({
        title: 'Page created',
        description: `${newPage.title} has been created successfully`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create page: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const updatePageMutation = useMutation({
    mutationFn: mindboardApi.updateMindPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind_pages', activeSectionId] });
      if (shouldShowToast('page')) {
        toast({
          title: 'Page updated',
          description: 'Page has been updated successfully'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update page: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const deletePageMutation = useMutation({
    mutationFn: mindboardApi.deleteMindPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind_pages', activeSectionId] });
      if (activePageId) {
        setActivePageId(null);
      }
      toast({
        title: 'Page deleted',
        description: 'Page has been deleted successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete page: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const createBlockMutation = useMutation({
    mutationFn: (params: { 
      pageId: string, 
      contentType: MindBlock['content_type'],
      content: any,
      position?: number,
      properties?: Record<string, any>
    }) => mindboardApi.createMindBlock(
      params.pageId, 
      params.contentType, 
      params.content,
      { 
        position: params.position,
        properties: params.properties
      }
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind_blocks', activePageId] });
      if (shouldShowToast('block')) {
        toast({
          title: 'Block added',
          description: 'New content block has been created'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create block: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const updateBlockMutation = useMutation({
    mutationFn: mindboardApi.updateMindBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind_blocks', activePageId] });
      if (shouldShowToast('block')) {
        toast({
          title: 'Block updated',
          description: 'Content block has been updated successfully'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update block: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  const deleteBlockMutation = useMutation({
    mutationFn: mindboardApi.deleteMindBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mind_blocks', activePageId] });
      toast({
        title: 'Block deleted',
        description: 'Content block has been deleted successfully'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete block: ${error.message}`,
        variant: 'destructive'
      });
    },
  });
  
  if (mindboards.length > 0 && !activeMindboardId) {
    setActiveMindboardId(mindboards[0].id);
  }
  
  if (sections.length > 0 && !activeSectionId) {
    setActiveSectionId(sections[0].id);
  }
  
  if (pages.length > 0 && !activePageId) {
    setActivePageId(pages[0].id);
  }

  return {
    mindboards,
    sections,
    pages,
    blocks,
    activeMindboardId,
    activeSectionId,
    activePageId,
    setActiveMindboardId,
    setActiveSectionId,
    setActivePageId,
    
    createMindboard: createMindboardMutation.mutateAsync,
    updateMindboard: updateMindboardMutation.mutateAsync,
    deleteMindboard: deleteMindboardMutation.mutateAsync,
    
    createSection: createSectionMutation.mutateAsync,
    updateSection: updateSectionMutation.mutateAsync,
    deleteSection: deleteSectionMutation.mutateAsync,
    
    createPage: createPageMutation.mutateAsync,
    updatePage: updatePageMutation.mutateAsync,
    deletePage: deletePageMutation.mutateAsync,
    
    createBlock: createBlockMutation.mutateAsync,
    updateBlock: updateBlockMutation.mutateAsync,
    deleteBlock: deleteBlockMutation.mutateAsync,
    
    isLoading: 
      isLoadingMindboards || 
      isLoadingSections || 
      isLoadingPages || 
      isLoadingBlocks,
      
    isCreatingMindboard: createMindboardMutation.isPending,
    isUpdatingMindboard: updateMindboardMutation.isPending,
    isDeletingMindboard: deleteMindboardMutation.isPending,
    isCreatingSection: createSectionMutation.isPending,
    isUpdatingSection: updateSectionMutation.isPending,
    isDeletingSection: deleteSectionMutation.isPending,
    isCreatingPage: createPageMutation.isPending,
    isUpdatingPage: updatePageMutation.isPending,
    isDeletingPage: deletePageMutation.isPending,
    isCreatingBlock: createBlockMutation.isPending,
    isUpdatingBlock: updateBlockMutation.isPending,
    isDeletingBlock: deleteBlockMutation.isPending,
    
    error: mindboardsError || sectionsError || pagesError || blocksError
  };
}
