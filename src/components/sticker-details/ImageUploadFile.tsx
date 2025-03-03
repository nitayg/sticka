
import { useState, useRef, useEffect } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface ImageUploadFileProps {
  onUpload: (dataUrl: string) => void;
}

const ImageUploadFile = ({ onUpload }: ImageUploadFileProps) => {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleImageFileUpload = () => {
    if (!imageFile) {
      toast({
        title: "שגיאה",
        description: "לא נבחרה תמונה",
        variant: "destructive",
      });
      return;
    }
    
    if (imagePreview) {
      onUpload(imagePreview);
      
      // Reset after upload
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-1">
      <Label className="text-base font-medium">העלאת תמונה מהמכשיר</Label>
      <div className="space-y-2">
        <Input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {imageFile && (
          <Button size="sm" onClick={handleImageFileUpload}>
            <Upload className="h-4 w-4 mr-2" />
            העלה תמונה
          </Button>
        )}
        {imagePreview && (
          <div className="mt-2 relative w-full max-w-[150px] aspect-square rounded-lg overflow-hidden border">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadFile;
