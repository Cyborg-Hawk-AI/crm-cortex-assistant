
import { CheckCircle, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { criticalAlerts, mockTickets, upcomingMeetings } from "@/utils/mockData";
import { motion } from "framer-motion";
import { isToday } from "date-fns";

export function StatusOverview() {
  // Calculate counts
  const todayMeetingsCount = upcomingMeetings.filter(meeting => {
    const today = new Date();
    const meetingDate = new Date(meeting.date);
    return isToday(meetingDate);
  }).length;
  
  // Calculate missions without mindboard notes
  const missionsWithoutNotes = mockTickets.filter(ticket => 
    !ticket.comments || ticket.comments.length === 0
  ).length;
  
  // Calculate time since last mission update (in hours)
  const lastUpdateTimes = mockTickets.map(ticket => new Date(ticket.updated).getTime());
  const mostRecentUpdate = Math.max(...lastUpdateTimes);
  const hoursSinceUpdate = Math.floor((Date.now() - mostRecentUpdate) / (1000 * 60 * 60));
  
  // Daily action score (sample value)
  const dailyActionScore = 82;

  const statuses = [
    {
      name: "Today's SyncUps",
      value: todayMeetingsCount,
      icon: <Clock className="h-6 w-6 text-[#88D9CE]" />,
      bgColor: "bg-white",
      textColor: "text-[#404040]",
      borderColor: "border-[#C1EDEA]",
      glowColor: "shadow-md"
    },
    {
      name: "Missions w/o Notes",
      value: missionsWithoutNotes,
      icon: <AlertTriangle className="h-6 w-6 text-[#264E46]" />,
      bgColor: "bg-white",
      textColor: "text-[#404040]",
      borderColor: "border-[#C1EDEA]",
      glowColor: "shadow-md"
    },
    {
      name: "Hours Since Update",
      value: hoursSinceUpdate,
      icon: <AlertCircle className="h-6 w-6 text-[#264E46]" />,
      bgColor: "bg-white",
      textColor: "text-[#404040]",
      borderColor: "border-[#C1EDEA]",
      glowColor: "shadow-md"
    },
    {
      name: "Daily Action Score",
      value: dailyActionScore,
      icon: <CheckCircle className="h-6 w-6 text-[#88D9CE]" />,
      bgColor: "bg-white",
      textColor: "text-[#404040]", 
      borderColor: "border-[#C1EDEA]",
      glowColor: "shadow-md"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {statuses.map((status, index) => (
        <motion.div
          key={status.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, scale: 1.03 }}
        >
          <Card className={`${status.bgColor} border-2 ${status.borderColor} ${status.glowColor} hover:shadow-lg transition-all duration-300`}>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-[#F5F7FA] p-3 rounded-full shadow-inner border border-[#ECEAE3]">
                {status.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-[#A8A29E]">{status.name}</p>
                <p className={`text-2xl font-bold ${status.textColor}`}>{status.value}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
