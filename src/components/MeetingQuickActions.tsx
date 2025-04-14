
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, FileText, MessageSquare, Users, 
  Calendar, Clock, FileClock, ArrowRight,
  Mic, BookOpen, FileAudio, DownloadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MeetingAction } from '@/utils/types';

export function MeetingQuickActions() {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const actions: MeetingAction[] = [
    {
      id: 'join-meeting',
      label: 'Join Meeting',
      description: 'Join the scheduled meeting for this ticket',
      action: () => {
        toast({
          title: "Joining meeting",
          description: "Opening video conferencing tool..."
        });
      },
      icon: <Video className="h-4 w-4" />,
      color: 'from-violet-500 to-indigo-500'
    },
    {
      id: 'transcript',
      label: 'View Transcript',
      description: 'View the meeting transcript',
      action: () => {
        toast({
          title: "Opening transcript",
          description: "Loading meeting transcript..."
        });
      },
      icon: <FileText className="h-4 w-4" />,
      color: 'from-sky-500 to-blue-500'
    },
    {
      id: 'summary',
      icon: <FileAudio className="h-4 w-4" />,
      label: 'Meeting Summary',
      description: 'AI-generated summary of the meeting',
      action: () => {
        toast({
          title: "Generating summary",
          description: "Creating AI summary of the meeting..."
        });
      },
      color: 'from-emerald-500 to-green-500'
    },
    {
      id: 'schedule',
      icon: <Calendar className="h-4 w-4" />,
      label: 'Schedule',
      description: 'Schedule a follow-up meeting',
      action: () => {
        toast({
          title: "Opening scheduler",
          description: "Loading calendar to schedule a follow-up..."
        });
      },
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'attendees',
      icon: <Users className="h-4 w-4" />,
      label: 'Attendees',
      description: 'Manage meeting attendees',
      action: () => {
        toast({
          title: "Managing attendees",
          description: "Loading attendee management..."
        });
      },
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'record',
      icon: <Mic className="h-4 w-4" />,
      label: 'Record Meeting',
      description: 'Start or stop meeting recording',
      action: () => {
        toast({
          title: "Recording controls",
          description: "Opening recording controls..."
        });
      },
      color: 'from-red-500 to-rose-600'
    },
    {
      id: 'notes',
      icon: <BookOpen className="h-4 w-4" />,
      label: 'Meeting Notes',
      description: 'View and edit meeting notes',
      action: () => {
        toast({
          title: "Opening notes",
          description: "Loading meeting notes..."
        });
      },
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'download',
      icon: <DownloadCloud className="h-4 w-4" />,
      label: 'Download',
      description: 'Download meeting assets',
      action: () => {
        toast({
          title: "Preparing download",
          description: "Getting meeting assets ready for download..."
        });
      },
      color: 'from-gray-500 to-slate-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="mb-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
          Meeting Controls
        </h3>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-xs h-6 px-2 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
        >
          {expanded ? 'Collapse' : 'View all'}
          <ArrowRight className={`h-3 w-3 ml-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {actions.slice(0, expanded ? actions.length : 3).map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="flex"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={action.action}
              className={`w-full h-auto py-2 px-3 flex flex-col items-center justify-center gap-1.5 text-xs font-normal border-0 shadow-sm 
               ${action.id === 'join-meeting' ? 
                 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600' : 
                 `bg-gradient-to-br ${action.color} text-white hover:shadow-md hover:opacity-90`}`}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {action.icon}
              </div>
              <span>{action.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
