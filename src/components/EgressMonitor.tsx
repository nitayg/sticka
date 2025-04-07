
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ChevronDown, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNetworkMonitor } from "@/hooks/use-network-monitor";
import NetworkStatusDisplay from "./egress-monitor/NetworkStatusDisplay";
import NetworkTips from "./egress-monitor/NetworkTips";
import MonitorActions from "./egress-monitor/MonitorActions";

// Component to monitor and help reduce egress traffic
const EgressMonitor = () => {
  const {
    isExpanded,
    setIsExpanded,
    egressWarnings,
    bytesTransferred,
    isOffline
  } = useNetworkMonitor();
  
  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-4 left-4 z-50 w-80"
          >
            <Card className="shadow-lg border-blue-200/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {isOffline ? (
                      <WifiOff className="h-4 w-4 text-orange-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                    )}
                    מונה תעבורת רשת
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsExpanded(false)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  מסייע בצמצום תעבורת נתונים ועלויות
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NetworkStatusDisplay 
                  isOffline={isOffline} 
                  egressWarnings={egressWarnings} 
                  bytesTransferred={bytesTransferred}
                />
                
                <MonitorActions />
                
                <NetworkTips />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EgressMonitor;
