
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
    createBlock,
    updateBlock,
    deleteBlock,
    deleteMindboard,
    deleteSection,
    deletePage,
    updateMindboard,
    updateSection,
    updatePage,
    isLoading
  } = useMindboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Helper to create a board and return the created board
  const handleCreateBoard = async ({ title }: { title: string }) => {
    const newBoard = await createMindboard({ title });
    return newBoard;
  };

  // Helper to create a section and return the created section
  const handleCreateSection = async ({ mindboardId, title }: { mindboardId: string, title: string }) => {
    const newSection = await createSection({ mindboardId, title });
    return newSection;
  };

  // Helper to create a page and return the created page
  const handleCreatePage = async ({ sectionId, title }: { sectionId: string, title: string }) => {
    console.log("Mindboard - Creating page with title:", title);
    const newPage = await createPage({ sectionId, title });
    console.log("Mindboard - Created page:", newPage);
    // Immediately set this as the active page to ensure it appears selected in the UI
    setActivePageId(newPage.id);
    return newPage;
  };

  // Helper to rename a mindboard
  const handleRenameMindboard = async (id: string, title: string) => {
    await updateMindboard({ id, title });
  };

  // Helper to rename a section
  const handleRenameSection = async (id: string, title: string) => {
    await updateSection({ id, title });
  };

  // Helper to rename a page
  const handleRenamePage = async (id: string, title: string) => {
    console.log("Mindboard - Renaming page:", id, "to:", title);
    await updatePage({ id, title });
  };

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
      onCreateBoard={handleCreateBoard}
      onCreateSection={handleCreateSection}
      onCreatePage={handleCreatePage}
      onCreateBlock={(type, content, position, parentId) => createBlock({ 
        pageId: activePageId || '', 
        contentType: type, 
        content: content,
        position: position,
        properties: parentId ? { parent_block_id: parentId } : undefined
      })}
      onUpdateBlock={(id, content, properties) => updateBlock({ id, content, ...properties })}
      onDeleteBlock={(id) => deleteBlock(id)}
      onDeleteMindboard={(id) => deleteMindboard(id)}
      onDeleteSection={(id) => deleteSection(id)}
      onDeletePage={(id) => deletePage(id)}
      onRenameMindboard={handleRenameMindboard}
      onRenameSection={handleRenameSection}
      onRenamePage={handleRenamePage}
    />
  );
}
