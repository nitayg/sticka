
import React, { useEffect, useState, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

interface AlbumImageUploaderProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
}

const AlbumImageUploader = ({
  imageUrl,
  onImageChange
}: AlbumImageUploaderProps) => {
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    setPreviewUrl(imageUrl || null);
  }, [imageUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onImageChange(result);
      };
      reader.readAsDataURL(selectedFile);
      
      toast({
        title: "התמונה נקלטה בהצלחה",
        description: `${selectedFile.name} נבחרה כתמונת האלבום.`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="albumImage">תמונת אלבום</Label>
      <div className="space-y-2">
        <Input 
          id="albumImage" 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          ref={imageInputRef}
        />
        <p className="text-xs text-muted-foreground">
          בחר תמונה עבור האלבום. תמונה זו תשמש גם כתמונת ברירת מחדל למדבקות שאין להן תמונה.
        </p>
        
        {previewUrl && (
          <div className="mt-2 relative w-20 h-20 mx-auto rounded-md overflow-hidden border">
            <img 
              src={previewUrl} 
              alt="Album preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumImageUploader;
