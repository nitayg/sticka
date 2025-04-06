
import { Progress } from "@/components/ui/progress";
import { Check, Loader2 } from "lucide-react";

interface ImportProgressIndicatorProps {
  value: number;
  status?: "importing" | "complete" | "error";
}

const ImportProgressIndicator = ({ 
  value,
  status = "importing" 
}: ImportProgressIndicatorProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="flex items-center">
          {status === "importing" && (
            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
          )}
          {status === "complete" && (
            <Check className="h-3.5 w-3.5 mr-2 text-green-500" />
          )}
          {status === "importing" ? "מייבא מדבקות..." : "הייבוא הושלם"}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress 
        value={value} 
        className={`h-2 ${status === "complete" ? "bg-green-100" : ""}`} 
      />
    </div>
  );
};

export default ImportProgressIndicator;
