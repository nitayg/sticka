
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeftRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ExchangeHistoryLog from "./ExchangeHistoryLog";

const ExchangeHistoryButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            היסטוריית החלפות
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>צפה בהיסטוריית קליטת מדבקות</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>היסטוריית קליטת מדבקות</DialogTitle>
          </DialogHeader>
          <ExchangeHistoryLog />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default ExchangeHistoryButton;
