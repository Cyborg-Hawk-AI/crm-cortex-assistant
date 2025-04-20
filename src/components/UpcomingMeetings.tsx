
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, Users, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { upcomingMeetings } from '@/utils/mockData';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { MeetingCreateModal } from '@/components/modals/MeetingCreateModal';
import { Meeting } from '@/utils/types';
import { useMeetings } from '@/hooks/useMeetings';

export function UpcomingMeetings() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { createMeeting } = useMeetings();

  const handleCreateMeeting = (meetingData: Partial<Meeting>) => {
    createMeeting(meetingData);
  };

  const getRelativeDateLabel = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (date < addDays(new Date(), 7)) {
      return format(date, 'EEEE'); // Day name
    } else {
      return format(date, 'MMM d'); // Month and day
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  return (
    <>
      <Card className="border border-[#C1EDEA] bg-white shadow-[0_0_15px_rgba(136,217,206,0.15)] hover:shadow-[0_0_20px_rgba(136,217,206,0.25)]">
        <CardHeader className="pb-2 border-b border-[#C1EDEA]">
          <CardTitle className="text-lg text-[#264E46] flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-[#88D9CE]" />
              Upcoming SyncUps
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-[#264E46] hover:text-[#88D9CE] hover:bg-[#F5F7FA]/50"
              onClick={() => setShowCreateModal(true)}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span className="text-xs">Schedule</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-6 text-[#A8A29E]">
              <p>No upcoming SyncUps scheduled</p>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-2 text-[#88D9CE]"
                onClick={() => setShowCreateModal(true)}
              >
                Schedule a SyncUp
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="p-3 rounded-lg border border-[#C1EDEA] bg-[#F5F7FA]/70 hover:bg-[#F5F7FA] hover:shadow-[0_0_10px_rgba(136,217,206,0.15)] transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-[#404040]">{meeting.title}</h4>
                        <div className="flex items-center mt-1 text-xs text-[#A8A29E]">
                          <Clock className="h-3 w-3 mr-1 text-[#88D9CE]" />
                          <span>
                            {getRelativeDateLabel(meeting.date)} at {formatTime(meeting.date)}
                            {meeting.duration && ` · ${meeting.duration} min`}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-[#A8A29E]">
                          <Users className="h-3 w-3 mr-1 text-[#264E46]" />
                          <span>{meeting.clientName}</span>
                        </div>
                        
                        {meeting.meetingLink ? (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#88D9CE] underline flex items-center text-xs mt-2"
                          >
                            <Video className="h-3 w-3 mr-1" />
                            Join SyncUp
                          </a>
                        ) : null}
                      </div>
                      
                      <Badge variant="outline" className="text-xs bg-[#F5F7FA] text-[#264E46] border-[#C1EDEA]">
                        {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    {meeting.attendees.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-[#88D9CE] mb-1">Attendees</h4>
                        <div className="flex flex-wrap gap-1">
                          {meeting.attendees.map((attendee, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-[#F5F7FA]/30 text-[#404040] border-[#C1EDEA]">
                              {typeof attendee === 'string' 
                                ? attendee 
                                : ((attendee as any).name || 'Unnamed')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {meeting.agenda && (
                      <div className="mt-2">
                        <h4 className="text-xs font-medium text-[#88D9CE] mb-1">Agenda</h4>
                        <p className="text-xs text-[#A8A29E] whitespace-pre-line line-clamp-2">
                          {meeting.agenda}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-1 pb-2 border-t border-[#C1EDEA]">
          <Button variant="ghost" size="sm" className="text-[#264E46] hover:text-[#88D9CE] w-full justify-center text-xs">
            View All SyncUps <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
      
      <MeetingCreateModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateMeeting}
      />
    </>
  );
}
