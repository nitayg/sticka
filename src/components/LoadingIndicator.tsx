
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  text?: string;
}

const LoadingIndicator = ({ text = "טוען..." }: LoadingIndicatorProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
};

export default LoadingIndicator;
