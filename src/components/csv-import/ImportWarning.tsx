
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ImportWarning = () => {
  return (
    <Alert className="mb-2">
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        כדי להימנע משגיאות שרת, מומלץ לייבא קבצים המכילים עד 200 רשומות בלבד בכל פעם.
      </AlertDescription>
    </Alert>
  );
};
