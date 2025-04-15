
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
    isLoading
  } = useMindboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Helper to create a section and return the created section
  const handleCreateSection = async ({ mindboardId, title }: { mindboardId: string, title: string }) => {
    const newSection = await createSection({ mindboardId, title });
    return newSection;
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
      onCreateBoard={() => createMindboard({ title: "New Board" })}
      onCreateSection={handleCreateSection}
      onCreatePage={(data) => createPage({ sectionId: data.sectionId, title: data.title })}
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
    />
  );
}
