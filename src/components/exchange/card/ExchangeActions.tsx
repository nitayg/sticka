
interface ExchangeActionsProps {
  onUpdate: () => void;
  onCancel: () => void;
}

const ExchangeActions = ({ onUpdate, onCancel }: ExchangeActionsProps) => {
  return (
    <div className="mt-4 flex space-x-2">
      <button 
        onClick={onUpdate}
        className="flex-1 py-2 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors"
      >
        עדכן עסקה
      </button>
      <button 
        onClick={onCancel}
        className="flex-1 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors"
      >
        בטל עסקה
      </button>
    </div>
  );
};

export default ExchangeActions;
