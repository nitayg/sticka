
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Palette, Globe, Info, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import AppearanceSettings from "./AppearanceSettings";
import ApplicationDetails from "./ApplicationDetails";
import { useToast } from "@/hooks/use-toast";

interface AppSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSettingsPanel = ({ isOpen, onClose }: AppSettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState("appearance");
  const { theme } = useTheme();
  const { toast } = useToast();

  // פונקציה להצגת הודעת הצלחה לאחר שמירת ההגדרות
  const showSuccessToast = (message: string) => {
    toast({
      title: "הגדרות נשמרו",
      description: message,
      duration: 3000,
    });
  };

  // פונקציית סגירה עם אפקט אנימציה
  const handleClose = () => {
    onClose();
  };

  // אם הפאנל לא פתוח, לא להציג אותו
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
      dir="rtl"
    >
      <div 
        className="w-full max-w-3xl animate-scale-in rounded-lg border bg-card shadow-lg"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium">הגדרות אפליקציה</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">סגור</span>
          </Button>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="p-0"
        >
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-2 gap-2">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>מראה</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>פרטי אפליקציה</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="appearance" className="mt-2 p-0">
              <AppearanceSettings onSave={() => showSuccessToast("הגדרות מראה עודכנו בהצלחה")} />
            </TabsContent>

            <TabsContent value="details" className="mt-2 p-0">
              <ApplicationDetails onSave={() => showSuccessToast("פרטי האפליקציה עודכנו בהצלחה")} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 p-4 border-t bg-muted/20">
          <Button 
            variant="outline"
            onClick={handleClose}
          >
            סגור
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppSettingsPanel;
