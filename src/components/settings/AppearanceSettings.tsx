
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, RotateCcw, AlertTriangle } from "lucide-react";
import { clearAllStorageData } from "@/lib/sync/storage-utils";
import { syncWithSupabase } from "@/lib/sync/sync-manager";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppearanceSettingsProps {
  onSave: () => void;
}

// Define the Theme type to match what's in use-theme.tsx
type Theme = "dark" | "light" | "system";

const AppearanceSettings = ({ onSave }: AppearanceSettingsProps) => {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme);
  const [fontSize, setFontSize] = useState(localStorage.getItem("app-font-size") || "medium");

  // עדכון הערך הנבחר כאשר התימה משתנה
  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  // שמירת הגדרות הפונט
  useEffect(() => {
    localStorage.setItem("app-font-size", fontSize);
    const htmlElem = document.documentElement;
    
    // הסרת כל קלאסים קודמים
    htmlElem.classList.remove("text-sm", "text-base", "text-lg");
    
    // הוספת הקלאס המתאים
    switch (fontSize) {
      case "small":
        htmlElem.classList.add("text-sm");
        break;
      case "medium":
        htmlElem.classList.add("text-base");
        break;
      case "large":
        htmlElem.classList.add("text-lg");
        break;
    }
  }, [fontSize]);

  // שמירת ההגדרות
  const handleSave = () => {
    setTheme(selectedTheme);
    onSave();
  };

  // Helper function to handle theme change with proper typing
  const handleThemeChange = (value: string) => {
    // Only set if it's a valid theme value
    if (value === "dark" || value === "light" || value === "system") {
      setSelectedTheme(value);
    }
  };

  // פונקציה לאיפוס כל הנתונים המקומיים
  const handleResetStorage = async () => {
    // Clear all localStorage and memory storage
    clearAllStorageData();
    
    // Reload data from Supabase
    await syncWithSupabase(true);
    
    // Show success message
    onSave();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>הגדרות מראה</CardTitle>
        <CardDescription>
          התאם את המראה של האפליקציה לפי העדפותיך
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">ערכת נושא</Label>
          <RadioGroup 
            id="theme" 
            value={selectedTheme} 
            onValueChange={handleThemeChange}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="light" id="theme-light" />
              <Sun className="h-4 w-4 text-orange-400 ml-2" />
              <Label htmlFor="theme-light" className="font-normal">בהיר</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Moon className="h-4 w-4 text-indigo-400 ml-2" />
              <Label htmlFor="theme-dark" className="font-normal">כהה</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="system" id="theme-system" />
              <Monitor className="h-4 w-4 text-gray-400 ml-2" />
              <Label htmlFor="theme-system" className="font-normal">לפי הגדרות המערכת</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fontSize">גודל טקסט</Label>
          <RadioGroup 
            id="fontSize" 
            value={fontSize} 
            onValueChange={setFontSize}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="small" id="font-small" />
              <Label htmlFor="font-small" className="font-normal text-sm">טקסט קטן</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="medium" id="font-medium" />
              <Label htmlFor="font-medium" className="font-normal">טקסט בינוני</Label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="large" id="font-large" />
              <Label htmlFor="font-large" className="font-normal text-lg">טקסט גדול</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2 pt-4 border-t">
          <Label className="font-semibold">פעולות מערכת</Label>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full mt-2 gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>איפוס נתונים מקומיים</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>לאפס את כל הנתונים המקומיים?</AlertDialogTitle>
                <AlertDialogDescription>
                  פעולה זו תמחק את כל הנתונים השמורים באחסון המקומי ותטען מחדש את המידע מהשרת.
                  <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                    <AlertTriangle className="h-4 w-4" />
                    <span>פעולה זו אינה ניתנת לביטול.</span>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ביטול</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetStorage}>איפוס נתונים</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
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

export default AppearanceSettings;
