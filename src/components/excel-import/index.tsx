
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { Album } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadExcel from "./UploadExcel";
import MappingExcelFields from "./MappingExcelFields";
import ImportPreview from "./ImportPreview";
import { useToast } from "@/components/ui/use-toast";

interface ImportExcelDialogProps {
  albums: Album[];
  selectedAlbum: string;
  setSelectedAlbum: (albumId: string) => void;
  onImportComplete: () => void;
  iconOnly?: boolean;
}

const ImportExcelDialog = ({
  albums,
  selectedAlbum,
  setSelectedAlbum,
  onImportComplete,
  iconOnly = false
}: ImportExcelDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [excelData, setExcelData] = useState<any[] | null>(null);
  const [mappings, setMappings] = useState({
    number: "",
    name: "",
    team: "",
    isOwned: "",
    isDuplicate: "",
  });
  const { toast } = useToast();
  
  const resetState = () => {
    setExcelData(null);
    setActiveStep("upload");
    setMappings({
      number: "",
      name: "",
      team: "",
      isOwned: "",
      isDuplicate: "",
    });
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };
  
  const handleExcelDataLoaded = (data: any[]) => {
    setExcelData(data);
    
    // Auto-detect column mappings
    const sampleRow = data[0];
    const columnNames = Object.keys(sampleRow);
    
    const autoMappings = {
      number: columnNames.find(col => 
        col.toLowerCase().includes("number") || 
        col.toLowerCase().includes("מספר") ||
        col.toLowerCase().includes("#")
      ) || "",
      name: columnNames.find(col => 
        col.toLowerCase().includes("name") || 
        col.toLowerCase().includes("שם")
      ) || "",
      team: columnNames.find(col => 
        col.toLowerCase().includes("team") || 
        col.toLowerCase().includes("קבוצה")
      ) || "",
      isOwned: columnNames.find(col => 
        col.toLowerCase().includes("owned") || 
        col.toLowerCase().includes("have") ||
        col.toLowerCase().includes("יש") ||
        col.toLowerCase().includes("נאסף")
      ) || "",
      isDuplicate: columnNames.find(col => 
        col.toLowerCase().includes("duplicate") || 
        col.toLowerCase().includes("כפול")
      ) || "",
    };
    
    setMappings(autoMappings);
    setActiveStep("mapping");
  };
  
  const handleMappingComplete = (fieldMappings: typeof mappings) => {
    setMappings(fieldMappings);
    setActiveStep("preview");
  };
  
  const handleImportComplete = () => {
    setIsOpen(false);
    resetState();
    onImportComplete();
    toast({
      title: "היבוא הושלם",
      description: "המדבקות יובאו בהצלחה לאלבום",
    });
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              יבוא מדבקות מאקסל
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeStep} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" disabled>העלאת קובץ</TabsTrigger>
              <TabsTrigger value="mapping" disabled>מיפוי שדות</TabsTrigger>
              <TabsTrigger value="preview" disabled>תצוגה מקדימה</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <UploadExcel 
                onDataLoaded={handleExcelDataLoaded} 
                albums={albums}
                selectedAlbum={selectedAlbum}
                setSelectedAlbum={setSelectedAlbum}
              />
            </TabsContent>
            
            <TabsContent value="mapping">
              {excelData && (
                <MappingExcelFields 
                  excelData={excelData} 
                  initialMappings={mappings}
                  onComplete={handleMappingComplete}
                />
              )}
            </TabsContent>
            
            <TabsContent value="preview">
              {excelData && (
                <ImportPreview 
                  excelData={excelData} 
                  mappings={mappings}
                  albumId={selectedAlbum}
                  onImportComplete={handleImportComplete}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
        
        <Button 
          variant="ghost" 
          size={iconOnly ? "icon" : "default"}
          className={iconOnly ? "h-8 w-8 rounded-full bg-gray-800" : ""}
          onClick={() => setIsOpen(true)}
        >
          <FileSpreadsheet className={iconOnly ? "h-4 w-4" : "h-5 w-5 mr-2"} />
          {!iconOnly && "יבא מאקסל"}
        </Button>
      </Dialog>
    </>
  );
};

export default ImportExcelDialog;
