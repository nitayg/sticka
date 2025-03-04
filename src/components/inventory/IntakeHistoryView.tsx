
import { useState, useEffect } from 'react';
import { useIntakeLogStore } from '@/store/useIntakeLogStore';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const IntakeHistoryView = () => {
  const { intakeLog } = useIntakeLogStore();
  const [logEntries, setLogEntries] = useState(intakeLog);

  useEffect(() => {
    setLogEntries(intakeLog);
  }, [intakeLog]);

  return (
    <div className="space-y-4 animate-fade-in">
      <Header 
        title="היסטוריית קליטת מדבקות" 
        subtitle="צפייה בהיסטוריית הוספת מדבקות למלאי"
        action={
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link to="/inventory" className="flex items-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              חזרה למלאי
            </Link>
          </Button>
        }
      />

      {logEntries.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground">אין רשומות היסטוריה להצגה</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card rounded-lg border shadow-sm">
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
      )}
    </div>
  );
};

export default IntakeHistoryView;
