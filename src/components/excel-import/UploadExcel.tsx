
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Upload, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Album } from "@/lib/types";
import * as XLSX from 'xlsx';

interface UploadExcelProps {
  onDataLoaded: (data: any[]) => void;
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (albumId: string) => void;
}

const UploadExcel = ({ 
  onDataLoaded, 
  albums, 
  selectedAlbum, 
  setSelectedAlbum 
}: UploadExcelProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // If there's only one album, select it automatically
    if (albums.length === 1 && !selectedAlbum) {
      setSelectedAlbum(albums[0].id);
    }
  }, [albums, selectedAlbum, setSelectedAlbum]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if it's an Excel file
      if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
        setError("הקובץ אינו בפורמט אקסל (xlsx/xls)");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError("נא לבחור קובץ");
      return;
    }
    
    if (!selectedAlbum) {
      setError("נא לבחור אלבום");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await readExcelFile(file);
      if (data.length === 0) {
        setError("הקובץ ריק או לא ניתן לקרוא ממנו נתונים");
        return;
      }
      
      onDataLoaded(data);
    } catch (error) {
      console.error("Error reading Excel file:", error);
      setError("אירעה שגיאה בקריאת הקובץ. וודא שהקובץ בפורמט אקסל תקין.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get the first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsBinaryString(file);
    });
  };
  
  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label>בחר אלבום</Label>
        <Select 
          value={selectedAlbum} 
          onValueChange={setSelectedAlbum}
        >
          <SelectTrigger>
            <SelectValue placeholder="בחר אלבום" />
          </SelectTrigger>
          <SelectContent>
            {albums.map(album => (
              <SelectItem key={album.id} value={album.id}>
                {album.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>העלה קובץ אקסל</Label>
        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            גרור לכאן קובץ אקסל או לחץ לבחירת קובץ
          </p>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="max-w-xs"
          />
          {file && (
            <p className="text-sm mt-2">{file.name}</p>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      
      <Button 
        onClick={handleUpload} 
        disabled={!file || !selectedAlbum || isLoading}
        className="w-full"
      >
        {isLoading ? "מעבד..." : "המשך"}
      </Button>
    </div>
  );
};

export default UploadExcel;
