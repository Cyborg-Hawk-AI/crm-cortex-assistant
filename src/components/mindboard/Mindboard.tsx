
import React from 'react';
import { useMindboard } from '@/hooks/useMindboard';
import { MindboardLayout } from './MindboardLayout';

export function Mindboard() {
  const {
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
    createMindboard,
    createSection,
    createPage,
    isLoading
  } = useMindboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MindboardLayout
      mindboards={mindboards}
      sections={sections}
      pages={pages}
      blocks={blocks}
      activeMindboardId={activeMindboardId}
      activeSectionId={activeSectionId}
      activePageId={activePageId}
      setActiveMindboardId={setActiveMindboardId}
      setActiveSectionId={setActiveSectionId}
      setActivePageId={setActivePageId}
      onCreateBoard={() => createMindboard("New Board")}
      onCreateSection={() => activeMindboardId && createSection(activeMindboardId, "New Section")}
      onCreatePage={() => activeSectionId && createPage(activeSectionId, "New Note")}
    />
  );
}
