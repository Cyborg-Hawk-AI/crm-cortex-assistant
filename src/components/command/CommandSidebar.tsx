
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { StatusOverview } from '@/components/StatusOverview';
import { TodaySyncUps } from '@/components/TodaySyncUps';
import { RecentTickets } from '@/components/RecentTickets';
import { RecentMindboardNotes } from '@/components/RecentMindboardNotes';
import { useIsMobile } from '@/hooks/use-mobile';

export function CommandSidebar() {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar variant="floating" className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarContent>
          <div className="flex h-full flex-col gap-4 p-4">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-neon-aqua to-neon-purple">
                Command View
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </Button>
            </div>

            {/* Status Overview with reduced padding */}
            <div className="space-y-3">
              <StatusOverview />
            </div>

            {/* Quick Actions - Compact View */}
            <div className="grid grid-cols-2 gap-2">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TodaySyncUps />
              </motion.div>
              
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <RecentTickets onTaskClick={() => {}} />
              </motion.div>
            </div>

            {/* Recent Notes - Scrollable Area */}
            <div className="flex-1 overflow-y-auto">
              <RecentMindboardNotes />
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
