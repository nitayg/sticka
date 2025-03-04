
import React, { useEffect, useState, useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";

interface AlbumImageUploaderProps {
  albumImage: File | null;
  setAlbumImage: (file: File | null) => void;
  albumImagePreview: string | null;
  setAlbumImagePreview: (preview: string | null) => void;
}

const AlbumImageUploader = ({
  albumImage,
  setAlbumImage,
  albumImagePreview,
  setAlbumImagePreview
}: AlbumImageUploaderProps) => {
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (albumImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAlbumImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(albumImage);
    } else {
      setAlbumImagePreview(null);
    }
  }, [albumImage, setAlbumImagePreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setAlbumImage(selectedFile);
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
      <div className="space-y-3">
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
        
        {albumImagePreview && (
          <div className="mt-4 relative w-full max-w-[300px] mx-auto aspect-square rounded-lg overflow-hidden border">
            <img 
              src={albumImagePreview} 
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
