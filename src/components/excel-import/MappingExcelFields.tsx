
import { useState } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { AlertCircle } from "lucide-react";

interface MappingProps {
  number: string;
  name: string;
  team: string;
  isOwned: string;
  isDuplicate: string;
}

interface MappingExcelFieldsProps {
  excelData: any[];
  initialMappings: MappingProps;
  onComplete: (mappings: MappingProps) => void;
}

const MappingExcelFields = ({ 
  excelData, 
  initialMappings, 
  onComplete 
}: MappingExcelFieldsProps) => {
  const [mappings, setMappings] = useState(initialMappings);
  const [error, setError] = useState<string | null>(null);
  
  const handleMappingChange = (field: keyof MappingProps, value: string) => {
    setMappings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleContinue = () => {
    // Validate required mappings
    if (!mappings.number) {
      setError("חובה למפות את שדה המספר");
      return;
    }
    
    // At least one of name or team should be mapped
    if (!mappings.name && !mappings.team) {
      setError("חובה למפות לפחות אחד משדות השם או הקבוצה");
      return;
    }
    
    setError(null);
    onComplete(mappings);
  };
  
  // Get column names from excel data
  const columnNames = excelData.length > 0 ? Object.keys(excelData[0]) : [];
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <p className="text-sm">
          מפה את העמודות בקובץ האקסל לשדות המדבקה
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-right block">
              מספר מדבקה *
            </Label>
            <Select 
              value={mappings.number} 
              onValueChange={(value) => handleMappingChange("number", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עמודה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- לא ממופה --</SelectItem>
                {columnNames.map(col => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-right block">
              שם מדבקה
            </Label>
            <Select 
              value={mappings.name} 
              onValueChange={(value) => handleMappingChange("name", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עמודה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- לא ממופה --</SelectItem>
                {columnNames.map(col => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-right block">
              קבוצה
            </Label>
            <Select 
              value={mappings.team} 
              onValueChange={(value) => handleMappingChange("team", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עמודה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- לא ממופה --</SelectItem>
                {columnNames.map(col => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-right block">
              יש ברשותי
            </Label>
            <Select 
              value={mappings.isOwned} 
              onValueChange={(value) => handleMappingChange("isOwned", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עמודה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- לא ממופה --</SelectItem>
                {columnNames.map(col => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-right block">
              כפול
            </Label>
            <Select 
              value={mappings.isDuplicate} 
              onValueChange={(value) => handleMappingChange("isDuplicate", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר עמודה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- לא ממופה --</SelectItem>
                {columnNames.map(col => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
      
      <Button 
        onClick={handleContinue} 
        className="w-full"
      >
        המשך
      </Button>
    </div>
  );
};

export default MappingExcelFields;
