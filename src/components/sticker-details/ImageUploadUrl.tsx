
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FileImage } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface ImageUploadUrlProps {
  onUpload: (url: string) => void;
}

const ImageUploadUrl = ({ onUpload }: ImageUploadUrlProps) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");

  const handleImageUrlUpdate = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין כתובת תמונה תקינה",
        variant: "destructive",
      });
      return;
    }
    
    onUpload(imageUrl);
    setImageUrl("");
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium">עדכון תמונה מקישור URL</Label>
      <div className="flex space-x-2">
        <Input 
          className="h-8 text-xs"
          placeholder="הכנס כתובת URL לתמונה" 
          value={imageUrl} 
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Button size="sm" onClick={handleImageUrlUpdate} className="h-8">
          <FileImage className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadUrl;
