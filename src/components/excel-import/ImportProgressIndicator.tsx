
import { Progress } from "@/components/ui/progress";

interface ImportProgressIndicatorProps {
  value: number;
}

const ImportProgressIndicator = ({ value }: ImportProgressIndicatorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>מייבא מדבקות...</span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
};

export default ImportProgressIndicator;
