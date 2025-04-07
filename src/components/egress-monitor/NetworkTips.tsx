
import { AlertTriangle } from "lucide-react";

const NetworkTips = () => {
  return (
    <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
      <div className="flex items-center gap-1 text-orange-500 mb-1">
        <AlertTriangle className="h-3 w-3" /> 
        <span className="font-medium">טיפים להפחתת תעבורת נתונים:</span>
      </div>
      <ul className="list-disc list-inside space-y-1">
        <li>השתמש במטמון (סנכרן פחות, שמור מקומית)</li>
        <li>שלוף רק את השדות הנחוצים (לא select *)</li>
        <li>השתמש בפילטרים בצד השרת</li>
        <li>יישם פיצול דפים (pagination) לנתונים רבים</li>
        <li>האזן לעדכונים בזמן-אמת במקום שליפה חוזרת</li>
      </ul>
      <p className="mt-2 font-semibold">
        ראית שיפור? <span className="text-primary">סגור את המוניטור כשלא צריך</span>
      </p>
    </div>
  );
};

export default NetworkTips;
