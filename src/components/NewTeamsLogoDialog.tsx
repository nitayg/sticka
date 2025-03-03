
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";
import { Shield, Upload, Image, Link as LinkIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface TeamLogoInput {
  team: string;
  logoUrl: string;
  logoFile: File | null;
}

interface NewTeamsLogoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teams: string[];
  onSave: (teamLogos: Record<string, string>) => void;
}

const NewTeamsLogoDialog = ({ open, onOpenChange, teams, onSave }: NewTeamsLogoDialogProps) => {
  const { toast } = useToast();
  const [teamInputs, setTeamInputs] = useState<TeamLogoInput[]>(
    teams.map(team => ({ team, logoUrl: "", logoFile: null }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUrlChange = (index: number, url: string) => {
    const newInputs = [...teamInputs];
    newInputs[index].logoUrl = url;
    newInputs[index].logoFile = null;
    setTeamInputs(newInputs);
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    
    const newInputs = [...teamInputs];
    newInputs[index].logoFile = file;
    newInputs[index].logoUrl = "";
    setTeamInputs(newInputs);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      const teamLogos: Record<string, string> = {};
      
      // בדיקה אם יש סמלים להוסיף
      const hasLogos = teamInputs.some(input => input.logoFile || input.logoUrl);
      
      if (!hasLogos) {
        toast({
          title: "לא נוספו סמלים",
          description: "לא נבחרו סמלים לקבוצות החדשות. האם להמשיך?",
        });
      }
      
      // בפועל היינו מעלים את הקבצים לשרת
      // כרגע נמיר את הקבצים ל-data URLs להדגמה
      for (const input of teamInputs) {
        if (input.logoFile) {
          const dataUrl = await readFileAsDataURL(input.logoFile);
          teamLogos[input.team] = dataUrl;
        } else if (input.logoUrl) {
          teamLogos[input.team] = input.logoUrl;
        }
      }
      
      onSave(teamLogos);
      onOpenChange(false);
      
      toast({
        title: "סמלי קבוצות נשמרו",
        description: `נשמרו סמלים ל-${Object.keys(teamLogos).length} קבוצות.`,
      });
    } catch (error) {
      toast({
        title: "שגיאה בשמירת הסמלים",
        description: "אירעה שגיאה בעיבוד קבצי הסמלים",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת סמלים לקבוצות חדשות</DialogTitle>
          <DialogDescription>
            זיהינו {teams.length} קבוצות חדשות בקובץ שטענת. באפשרותך להוסיף סמלים לקבוצות אלו.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-6 py-4 flex-grow">
          {teamInputs.map((input, index) => (
            <div key={input.team} className="border border-border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">{input.team}</h3>
              </div>
              
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-3">
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <span>קישור לסמל</span>
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    <span>העלאת קובץ</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="mt-0">
                  <div className="flex gap-3 items-center">
                    <div className="flex-grow">
                      <Input
                        id={`logo-url-${index}`}
                        value={input.logoUrl}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        placeholder="הכנס URL לתמונת הסמל"
                      />
                    </div>
                    
                    {input.logoUrl && (
                      <div className="w-16 h-16 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                        <img 
                          src={input.logoUrl} 
                          alt={`${input.team} logo`} 
                          className="w-full h-full object-contain"
                          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/64?text=Error")}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-0">
                  <div className="flex gap-3 items-center">
                    <div className="flex-grow">
                      <Input
                        id={`logo-file-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                      />
                    </div>
                    
                    {input.logoFile && (
                      <div className="w-16 h-16 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                        <img 
                          src={URL.createObjectURL(input.logoFile)} 
                          alt={`${input.team} logo`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
        
        <DialogFooter className="pt-4 border-t mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="ml-2">
            ביטול
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-1"
          >
            <Image className="h-4 w-4" />
            {isSubmitting ? "שומר..." : "שמור סמלים"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewTeamsLogoDialog;
