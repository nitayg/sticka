
import { useState, useEffect } from 'react';
import { useIntakeLogStore } from '@/store/useIntakeLogStore';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

const ExchangeHistoryLog = () => {
  const { intakeLog } = useIntakeLogStore();
  const [logEntries, setLogEntries] = useState(intakeLog);

  useEffect(() => {
    setLogEntries(intakeLog);
  }, [intakeLog]);

  if (logEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">אין רשומות היסטוריה להצגה</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-right border-b font-medium">תאריך ושעה</th>
            <th className="p-3 text-right border-b font-medium">מקור</th>
            <th className="p-3 text-right border-b font-medium">קלפים חדשים</th>
            <th className="p-3 text-right border-b font-medium">כפולים חדשים</th>
            <th className="p-3 text-right border-b font-medium">כפולים שעודכנו</th>
            <th className="p-3 text-right border-b font-medium">סה"כ קלפים</th>
          </tr>
        </thead>
        <tbody>
          {logEntries.map((entry, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20 hover:bg-muted/30 transition-colors'}>
              <td className="p-3 border-b">
                <div className="font-medium">{new Date(entry.timestamp).toLocaleDateString('he-IL')}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.timestamp), { 
                    addSuffix: true, 
                    locale: he 
                  })}
                </div>
              </td>
              <td className="p-3 border-b">
                <Badge variant="outline" className="font-normal">
                  {entry.source === "exchange" ? "החלפה" : 
                   entry.source === "pack" ? "מעטפה" : "אחר"}
                  {entry.sourceDetails ? ` - ${entry.sourceDetails}` : ""}
                </Badge>
              </td>
              <td className="p-3 border-b text-center">
                <Badge variant="secondary" className={entry.newStickers.length > 0 ? "bg-green-100 text-green-800" : ""}>
                  {entry.newStickers.length}
                </Badge>
              </td>
              <td className="p-3 border-b text-center">
                <Badge variant="secondary" className={entry.newDuplicates.length > 0 ? "bg-blue-100 text-blue-800" : ""}>
                  {entry.newDuplicates.length}
                </Badge>
              </td>
              <td className="p-3 border-b text-center">
                <Badge variant="secondary" className={entry.updatedDuplicates.length > 0 ? "bg-amber-100 text-amber-800" : ""}>
                  {entry.updatedDuplicates.length}
                </Badge>
              </td>
              <td className="p-3 border-b text-center font-medium">
                {entry.newStickers.length + entry.newDuplicates.length + entry.updatedDuplicates.length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExchangeHistoryLog;
