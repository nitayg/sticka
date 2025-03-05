
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ManifestUpdater from "./ManifestUpdater";

interface ApplicationDetailsProps {
  onSave: () => void;
}

const ApplicationDetails = ({ onSave }: ApplicationDetailsProps) => {
  // טעינת הנתונים מה-localStorage או קביעת ערכי ברירת מחדל
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [themeColor, setThemeColor] = useState("#0077ff");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // טעינת הנתונים מה-manifest
  useEffect(() => {
    const loadManifestData = async () => {
      try {
        const response = await fetch('/manifest.json');
        const data = await response.json();
        
        setAppName(data.name || "STICKA");
        setAppDescription(data.description || "אפליקציה לניהול אוסף מדבקות והחלפות");
        setThemeColor(data.theme_color || "#0077ff");
        setBgColor(data.background_color || "#ffffff");
        setIsLoading(false);
      } catch (error) {
        console.error("שגיאה בטעינת נתוני manifest:", error);
        setIsLoading(false);
        toast({
          title: "שגיאה בטעינת הנתונים",
          description: "לא הצלחנו לטעון את פרטי האפליקציה. אנא נסה שוב מאוחר יותר.",
          variant: "destructive",
        });
      }
    };

    loadManifestData();
  }, [toast]);

  // שמירת הנתונים
  const handleSave = async () => {
    try {
      // עדכון של ה-manifest דרך הקומפוננטה המיוחדת
      const success = await ManifestUpdater.updateManifest({
        name: appName,
        description: appDescription,
        themeColor: themeColor,
        backgroundColor: bgColor
      });
      
      if (success) {
        onSave();
      } else {
        toast({
          title: "שגיאה בשמירת הנתונים",
          description: "לא הצלחנו לעדכן את פרטי האפליקציה. אנא רענן את הדף ונסה שוב.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("שגיאה בשמירת נתוני manifest:", error);
      toast({
        title: "שגיאה בשמירה",
        description: "אירעה שגיאה בעת שמירת הנתונים. אנא נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <div className="animate-pulse h-32 w-full bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>פרטי אפליקציה</CardTitle>
        <CardDescription>
          התאם את המידע הבסיסי של האפליקציה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appName">שם האפליקציה</Label>
          <Input 
            id="appName" 
            value={appName} 
            onChange={(e) => setAppName(e.target.value)} 
            placeholder="הזן את שם האפליקציה"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="appDescription">תיאור האפליקציה</Label>
          <Textarea 
            id="appDescription" 
            value={appDescription} 
            onChange={(e) => setAppDescription(e.target.value)} 
            placeholder="הזן תיאור קצר של האפליקציה"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="themeColor">צבע נושא</Label>
            <div className="flex gap-2">
              <Input 
                id="themeColor" 
                type="color" 
                value={themeColor} 
                onChange={(e) => setThemeColor(e.target.value)} 
                className="w-12 h-10 p-1"
              />
              <Input 
                value={themeColor} 
                onChange={(e) => setThemeColor(e.target.value)} 
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bgColor">צבע רקע</Label>
            <div className="flex gap-2">
              <Input 
                id="bgColor" 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)} 
                className="w-12 h-10 p-1"
              />
              <Input 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)} 
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full mt-4"
        >
          שמור הגדרות
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApplicationDetails;
