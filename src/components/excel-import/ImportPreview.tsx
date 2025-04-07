
import { useState } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Check, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { addSticker } from "@/lib/sticker-operations";
import { Badge } from "../ui/badge";

interface ImportPreviewProps {
  excelData: any[];
  mappings: {
    number: string;
    name: string;
    team: string;
    isOwned: string;
    isDuplicate: string;
    category?: string; // Added category mapping
  };
  albumId: string;
  onImportComplete: () => void;
}

const ImportPreview = ({ 
  excelData, 
  mappings, 
  albumId,
  onImportComplete 
}: ImportPreviewProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Transform excel data to sticker objects based on mappings
  const stickersToImport = excelData.map(row => {
    const isOwned = mappings.isOwned 
      ? parseBooleanValue(row[mappings.isOwned])
      : true; // Default to owned if not mapped
    
    return {
      number: String(row[mappings.number]),
      name: mappings.name ? String(row[mappings.name]) : "",
      team: mappings.team ? String(row[mappings.team]) : "",
      category: mappings.category ? String(row[mappings.category]) : "general", // Add default category
      albumId,
      isOwned,
      isDuplicate: isOwned && mappings.isDuplicate 
        ? parseBooleanValue(row[mappings.isDuplicate]) 
        : false
    };
  }).filter(sticker => sticker.number && (sticker.name || sticker.team));
  
  const handleImport = async () => {
    if (stickersToImport.length === 0) {
      setError("אין מדבקות תקינות ליבוא");
      return;
    }
    
    setIsImporting(true);
    setError(null);
    
    try {
      // Add stickers one by one as batch import isn't available
      for (const sticker of stickersToImport) {
        await addSticker(sticker);
        setImportedCount(prev => prev + 1);
      }
      
      // Trigger data refresh and notify the parent
      window.dispatchEvent(new CustomEvent('stickerDataChanged'));
      onImportComplete();
    } catch (error) {
      console.error("Error importing stickers:", error);
      setError("אירעה שגיאה ביבוא המדבקות");
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-medium">תצוגה מקדימה</h3>
          <Badge variant="outline">
            {stickersToImport.length} מדבקות
          </Badge>
        </div>
        
        <ScrollArea className="h-[250px] border rounded-md p-2">
          {stickersToImport.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stickersToImport.slice(0, 50).map((sticker, index) => (
                <div key={index} className="border rounded-md p-2 text-xs">
                  <div className="font-medium">{sticker.number}</div>
                  {sticker.name && <div>{sticker.name}</div>}
                  {sticker.team && <div>{sticker.team}</div>}
                  <div className="flex gap-2 mt-1">
                    {sticker.isOwned && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        יש ברשותי
                      </Badge>
                    )}
                    {sticker.isDuplicate && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        כפול
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {stickersToImport.length > 50 && (
                <div className="col-span-2 text-center text-muted-foreground text-xs py-2">
                  + עוד {stickersToImport.length - 50} מדבקות
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>לא נמצאו מדבקות תקינות ליבוא</p>
                <p className="text-xs mt-1">וודא שמיפוי השדות נכון</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      <Button 
        onClick={handleImport} 
        disabled={stickersToImport.length === 0 || isImporting}
        className="w-full"
      >
        {isImporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            מייבא... ({importedCount}/{stickersToImport.length})
          </>
        ) : (
          <>
            <Check className="h-4 w-4 mr-2" />
            ייבא {stickersToImport.length} מדבקות
          </>
        )}
      </Button>
    </div>
  );
};

// Helper function to parse boolean values from Excel
function parseBooleanValue(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    return normalized === 'true' || 
           normalized === 'yes' || 
           normalized === 'y' || 
           normalized === '1' || 
           normalized === 'כן' || 
           normalized === 'יש' || 
           normalized === 'v';
  }
  
  if (typeof value === 'number') {
    return value === 1;
  }
  
  return false;
}

export default ImportPreview;
