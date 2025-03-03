
import { cn } from "@/lib/utils";

interface NumberRangeViewProps {
  ranges: string[];
  selectedRange: string | null;
  onRangeSelect: (range: string | null) => void;
}

const NumberRangeView = ({ ranges, selectedRange, onRangeSelect }: NumberRangeViewProps) => {
  if (ranges.length === 0) {
    return <div className="text-center text-muted-foreground p-4">אין מדבקות באלבום</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => onRangeSelect(selectedRange === range ? null : range)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors text-right w-full",
              "hover:bg-accent hover:text-accent-foreground",
              selectedRange === range
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            )}
            dir="rtl"
          >
            {range}
          </button>
        ))}
      </div>

      {selectedRange && (
        <button
          onClick={() => onRangeSelect(null)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors text-right w-full"
        >
          הצג הכל
        </button>
      )}
    </div>
  );
};

export default NumberRangeView;
