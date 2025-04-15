
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MindSection } from '@/utils/types';

interface SectionTabsProps {
  sections: MindSection[];
  activeSection: string | null;
  onSelectSection: (id: string) => void;
}

export function SectionTabs({ sections, activeSection, onSelectSection }: SectionTabsProps) {
  return (
    <Tabs value={activeSection || undefined} className="w-full" onValueChange={onSelectSection}>
      <TabsList className="h-auto justify-start bg-background/50 p-0 gap-1">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TabsTrigger
              value={section.id}
              className={cn(
                "relative h-9 rounded-none border-b-2 border-transparent px-4",
                "data-[state=active]:border-primary data-[state=active]:shadow-[0_0_8px_rgba(0,247,239,0.3)]"
              )}
            >
              <div
                className="h-2 w-2 rounded-full mr-2"
                style={{ backgroundColor: section.color || '#4f46e5' }}
              />
              {section.title}
            </TabsTrigger>
          </motion.div>
        ))}
      </TabsList>
    </Tabs>
  );
}
