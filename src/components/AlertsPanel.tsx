
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { criticalAlerts } from "@/utils/mockData";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export function AlertsPanel() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-[#88D9CE] text-[#264E46] border-[#C1EDEA]';
      case 'high':
        return 'bg-[#C1EDEA] text-[#264E46] border-[#88D9CE]';
      case 'medium':
        return 'bg-[#ECEAE3] text-[#404040] border-[#A8A29E]';
      case 'low':
        return 'bg-[#F5F7FA] text-[#404040] border-[#BFBFBF]';
      default:
        return 'bg-[#F5F7FA] text-[#404040] border-[#BFBFBF]';
    }
  };

  return (
    <Card className="border-2 border-[#88D9CE] bg-white shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 border-b border-[#C1EDEA]">
        <CardTitle className="text-xl text-[#264E46] flex items-center">
          <AlertCircle className="mr-2 h-6 w-6 text-[#264E46]" />
          Critical Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {criticalAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, x: 3 }}
            className="p-3 rounded-lg border-2 border-[#C1EDEA] bg-white shadow-md"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-bold text-[#404040]">{alert.title}</h4>
                <p className="text-sm text-[#BFBFBF] mt-1">{alert.description}</p>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-[#A8A29E]">
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-[#264E46] hover:bg-[#F5F7FA] hover:text-[#88D9CE]">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-[#A8A29E]">
              Client: <span className="text-[#404040]">{alert.clientName}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
