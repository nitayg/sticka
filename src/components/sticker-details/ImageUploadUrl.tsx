
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ImageUploadUrlProps {
  onUpload: (url: string) => void;
}

const ImageUploadUrl = ({ onUpload }: ImageUploadUrlProps) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUrlUpdate = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין כתובת תמונה תקינה",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // בדיקה שהקישור אכן מוביל לתמונה
    const img = new Image();
    img.onload = () => {
      onUpload(imageUrl);
      setImageUrl("");
      setIsLoading(false);
      toast({
        title: "התמונה נוספה בהצלחה",
        description: "התמונה נוספה למדבקה",
      });
    };
    
    img.onerror = () => {
      setIsLoading(false);
      toast({
        title: "שגיאה",
        description: "הקישור אינו מוביל לתמונה תקינה",
        variant: "destructive",
      });
    };
    
    img.src = imageUrl;
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">עדכון תמונה מקישור URL</Label>
      <div className="flex space-x-2">
        <Input 
          className="h-9 text-xs"
          placeholder="הכנס כתובת URL לתמונה" 
          value={imageUrl} 
          onChange={(e) => setImageUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleImageUrlUpdate()}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              size="sm" 
              onClick={handleImageUrlUpdate} 
              className="h-9 px-3"
              disabled={isLoading}
            >
              <Link className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" align="end">
            <p>הוסף תמונה מקישור</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default ImageUploadUrl;
