
import { Button } from "../../ui/button";
import { DialogFooter } from "../../ui/dialog";

interface ExchangeFormFooterProps {
  onClose: () => void;
  isSubmitting: boolean;
}

const ExchangeFormFooter = ({ onClose, isSubmitting }: ExchangeFormFooterProps) => {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        ביטול
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'שומר...' : 'צור עסקה'}
      </Button>
    </DialogFooter>
  );
};

export default ExchangeFormFooter;
