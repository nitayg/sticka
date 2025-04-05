
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImportProgressProps {
  value: number;
}

export const ImportProgress = ({ value }: ImportProgressProps) => {
  return (
    <div className="space-y-2">
      <Progress value={value} className="h-2" />
      <div className="flex items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        מייבא מדבקות... {value}%
      </div>
    </div>
  );
};
