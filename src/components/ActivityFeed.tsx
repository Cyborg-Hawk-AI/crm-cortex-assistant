
import React, { useState } from 'react';
import { FileText, CheckSquare, MessageSquare, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from 'framer-motion';

interface ActivityFeedProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch(type) {
    case 'task_updated':
    case 'task_created':
      return <CheckSquare className="h-4 w-4 text-neon-green glow-text" />;
    case 'note_created':
    case 'note_updated':
      return <FileText className="h-4 w-4 text-neon-blue glow-text" />;
    case 'comment_added':
      return <MessageSquare className="h-4 w-4 text-neon-yellow glow-text" />;
    default:
      return <Plus className="h-4 w-4 text-neon-aqua glow-text" />;
  }
};

const getActivityText = (activity: Activity) => {
  switch(activity.type) {
    case 'task_updated':
      return `updated a mission`;
    case 'task_created':
      return `created a new mission`;
    case 'note_created':
      return `created a mindboard note`;
    case 'note_updated':
      return `updated a mindboard note`;
    case 'comment_added':
      return `added a comment`;
    default:
      return `performed an action`;
  }
};

const getActivityColor = (type: string) => {
  switch(type) {
    case 'task_updated':
    case 'task_created':
      return 'border-neon-green/60 bg-gradient-to-r from-green-900/40 to-green-800/60 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
    case 'note_created':
    case 'note_updated':
      return 'border-neon-blue/60 bg-gradient-to-r from-blue-900/40 to-blue-800/60 shadow-[0_0_8px_rgba(14,165,233,0.15)]';
    case 'comment_added':
      return 'border-neon-yellow/60 bg-gradient-to-r from-yellow-900/40 to-amber-800/60 shadow-[0_0_8px_rgba(251,191,36,0.15)]';
    default:
      return 'border-neon-aqua/60 bg-gradient-to-r from-cyan-900/40 to-cyan-800/60 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  return (
    <>
      <div className="space-y-2 max-h-[40vh] overflow-y-auto p-2 grid-pattern rounded-lg backdrop-blur-sm">
        {activities.map((activity, index) => (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 5, scale: 1.02 }}
            className={`flex items-start space-x-2 cursor-pointer hover:bg-white/5 rounded-lg p-2 border ${getActivityColor(activity.type)} transition-all duration-300`}
            onClick={() => setSelectedActivity(activity)}
          >
            <div className="bg-black/40 p-1.5 rounded-full border border-white/30 shadow-inner flex-shrink-0">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs">
                <span className="font-bold text-white">{activity.userId}</span>{' '}
                <span className="text-white/90">{getActivityText(activity)}</span>
              </p>
              <p className="text-xs text-white/80 mt-0.5 truncate">
                {activity.content} 
                <span className="ml-1 text-neon-aqua/80">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Activity Details Dialog */}
      <Dialog open={selectedActivity !== null} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-[#1C2A3A]/90 to-[#111827]/80 border-2 border-neon-aqua/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              {selectedActivity && getActivityIcon(selectedActivity.type)}
              <span className="ml-2">Activity Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${getActivityColor(selectedActivity.type)} border border-white/30`}>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-black/40 border border-white/30 flex items-center justify-center mr-2 text-white">
                    {selectedActivity.userId.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedActivity.userId}</p>
                    <p className="text-xs text-white/80">
                      {formatDistanceToNow(selectedActivity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-bold text-white mb-1">
                    {getActivityText(selectedActivity)} 
                  </p>
                  <p className="text-sm text-white/90 whitespace-pre-line">{selectedActivity.content}</p>
                </div>
              </div>

              <div className="text-sm text-white/90">
                <p className="mb-1"><strong>Activity Type:</strong> {selectedActivity.type.replace('_', ' ')}</p>
                <p className="mb-1"><strong>Related Item:</strong> {selectedActivity.relatedItem || selectedActivity.entityId}</p>
                <p className="mb-1"><strong>Date:</strong> {selectedActivity.timestamp.toLocaleString()}</p>
              </div>
              
              {selectedActivity.additionalInfo && (
                <div className="mt-2">
                  <h4 className="text-sm font-semibold mb-1 text-white">Additional Information</h4>
                  <div className="bg-black/40 border border-white/30 p-2 rounded-lg">
                    <pre className="text-xs text-white/80 whitespace-pre-wrap">
                      {JSON.stringify(selectedActivity.additionalInfo, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
