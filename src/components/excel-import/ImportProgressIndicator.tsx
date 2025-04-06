
import { Progress } from "@/components/ui/progress";
import { Check, Loader2, XCircle } from "lucide-react";

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
          {status === "error" && (
            <XCircle className="h-3.5 w-3.5 mr-2 text-red-500" />
          )}
          {status === "importing" 
            ? "מייבא מדבקות..." 
            : status === "complete" 
              ? "הייבוא הושלם" 
              : "שגיאה בייבוא"}
        </span>
        <span>{Math.round(value)}%</span>
      </div>
      <Progress 
        value={value} 
        className={`h-2 ${
          status === "complete" 
            ? "bg-green-100" 
            : status === "error" 
              ? "bg-red-100" 
              : ""
        }`} 
      />
    </div>
  );
};

export default ImportProgressIndicator;
