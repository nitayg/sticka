
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StickerIntakeForm from "@/components/StickerIntakeForm";
import { exchangeOffers } from "@/lib/data";
import { useInventoryStore } from "@/store/useInventoryStore";
import UpdateExchangeDialog from "../UpdateExchangeDialog";

interface ExchangeActionsProps {
  exchange: {
    id: string;
    wantedStickerId: string[];
    userName: string;
  };
  onRefresh: () => void;
}

const ExchangeActions = ({ exchange, onRefresh }: ExchangeActionsProps) => {
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [isIntakeFormOpen, setIntakeFormOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { toast } = useToast();
  const { handleStickerIntake } = useInventoryStore();

  const handleUpdate = () => {
    setUpdateDialogOpen(true);
  };

  const handleComplete = () => {
    setIntakeFormOpen(true);
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    // Находим индекс обмена в массиве
    const exchangeIndex = exchangeOffers.findIndex(e => e.id === exchange.id);
    if (exchangeIndex !== -1) {
      // Удаляем обмен из массива
      exchangeOffers.splice(exchangeIndex, 1);
      
      // Показываем уведомление об успешной отмене
      toast({
        title: "עסקה בוטלה",
        description: `עסקת החלפה עם ${exchange.userName} בוטלה בהצלחה.`,
      });
      
      // Обновляем экран
      onRefresh();
      
      // Закрываем диалог
      setCancelDialogOpen(false);
    }
  };

  const handleStickerIntakeSubmit = (albumId: string, stickerNumbers: number[]) => {
    handleStickerIntake(albumId, stickerNumbers)
      .then((result) => {
        toast({
          title: "מדבקות נקלטו בהצלחה",
          description: `נוספו ${result.newlyOwned.length} מדבקות חדשות ועודכנו ${result.duplicatesUpdated.length} כפולות`,
        });
        onRefresh();
      })
      .catch((error) => {
        toast({
          title: "שגיאה בקליטת מדבקות",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  return (
    <div className="mt-4 flex space-x-2">
      <Button 
        variant="outline"
        onClick={handleUpdate}
        className="flex-1 py-2 text-sm font-medium"
      >
        <ArrowRightLeft className="mr-2 h-4 w-4" />
        עדכן עסקה
      </Button>
      
      <Button 
        onClick={handleComplete}
        className="flex-1 py-2 text-sm font-medium"
      >
        <ArrowRightLeft className="mr-2 h-4 w-4 rotate-90" />
        השלם עסקה
      </Button>
      
      <Button 
        variant="destructive"
        onClick={handleCancel}
        className="flex-1 py-2 text-sm font-medium"
      >
        ביטול עסקה
      </Button>

      {/* Dialog for cancellation confirmation */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ביטול עסקת החלפה</DialogTitle>
            <DialogDescription>
              האם אתה בטוח שברצונך לבטל את עסקת ההחלפה עם {exchange.userName}?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="cancelReason" className="text-right text-sm font-medium">
                סיבת ביטול (אופציונלי)
              </label>
              <textarea
                id="cancelReason"
                className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="הסבר מדוע אתה מבטל את העסקה"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>
              חזור
            </Button>
            <Button type="button" variant="destructive" onClick={confirmCancel}>
              בטל עסקה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticker Intake Form for completing the exchange */}
      <StickerIntakeForm
        isOpen={isIntakeFormOpen}
        onClose={() => setIntakeFormOpen(false)}
        onIntake={handleStickerIntakeSubmit}
        defaultStickerNumbers={exchange.wantedStickerId.join(", ")}
        defaultExchangePartner={exchange.userName}
      />

      {/* Update Exchange Dialog */}
      <UpdateExchangeDialog
        isOpen={isUpdateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        exchange={exchange}
        onUpdate={onRefresh}
      />
    </div>
  );
};

export default ExchangeActions;
