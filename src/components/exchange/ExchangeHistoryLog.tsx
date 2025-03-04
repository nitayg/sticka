
import { useState, useEffect } from 'react';
import { useIntakeLogStore } from '@/store/useIntakeLogStore';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

const ExchangeHistoryLog = () => {
  const { intakeLog } = useIntakeLogStore();
  const [logEntries, setLogEntries] = useState(intakeLog);

  useEffect(() => {
    setLogEntries(intakeLog);
  }, [intakeLog]);

  if (logEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">אין רשומות היסטוריה להצגה</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-muted">
          <tr>
            <th className="p-2 text-right border-b">תאריך ושעה</th>
            <th className="p-2 text-right border-b">מקור</th>
            <th className="p-2 text-right border-b">קלפים חדשים</th>
            <th className="p-2 text-right border-b">כפולים חדשים</th>
            <th className="p-2 text-right border-b">כפולים שעודכנו</th>
            <th className="p-2 text-right border-b">סה"כ קלפים שנקלטו</th>
          </tr>
        </thead>
        <tbody>
          {logEntries.map((entry, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
              <td className="p-2 border-b">
                <div className="font-medium">{new Date(entry.timestamp).toLocaleDateString('he-IL')}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.timestamp), { 
                    addSuffix: true, 
                    locale: he 
                  })}
                </div>
              </td>
              <td className="p-2 border-b">{entry.source}</td>
              <td className="p-2 border-b">{entry.newStickers.length}</td>
              <td className="p-2 border-b">{entry.newDuplicates.length}</td>
              <td className="p-2 border-b">{entry.updatedDuplicates.length}</td>
              <td className="p-2 border-b font-medium">
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
