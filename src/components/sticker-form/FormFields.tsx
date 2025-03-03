
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { getAllAlbums } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Upload, Link as LinkIcon } from "lucide-react";

interface FormFieldsProps {
  name: string;
  setName: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  team: string;
  setTeam: (value: string) => void;
  teamLogo: string;
  setTeamLogo: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  albumId: string;
  setAlbumId: (value: string) => void;
  isOwned: boolean;
  setIsOwned: (value: boolean) => void;
  isDuplicate: boolean;
  setIsDuplicate: (value: boolean) => void;
}

const FormFields = ({
  name,
  setName,
  number,
  setNumber,
  team,
  setTeam,
  teamLogo,
  setTeamLogo,
  category,
  setCategory,
  albumId,
  setAlbumId,
  isOwned,
  setIsOwned,
  isDuplicate,
  setIsDuplicate
}: FormFieldsProps) => {
  const albums = getAllAlbums();
  const categories = ["שחקנים", "קבוצות", "אצטדיונים", "סמלים", "אחר"];
  const [logoSource, setLogoSource] = useState<"url" | "file">("url");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(teamLogo ? teamLogo : null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setLogoPreview(imageUrl);
      
      // In a real app, we would upload this file to a server
      // For now, we'll use the objectURL as the logo URL for demonstration
      setTeamLogo(imageUrl);
    }
  };

  const handleUrlChange = (url: string) => {
    setTeamLogo(url);
    setLogoPreview(url);
    setLogoFile(null);
  };

  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="albumId" className="text-right">
          אלבום *
        </Label>
        <Select
          value={albumId}
          onValueChange={setAlbumId}
          required
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="בחר אלבום" />
          </SelectTrigger>
          <SelectContent>
            {albums.map((album) => (
              <SelectItem key={album.id} value={album.id}>
                {album.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="number" className="text-right">
          מספר *
        </Label>
        <Input
          id="number"
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          שם *
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="team" className="text-right">
          קבוצה/סדרה *
        </Label>
        <Input
          id="team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="col-span-3"
          required
        />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right mt-2">
          סמל קבוצה
        </Label>
        <div className="col-span-3 space-y-2">
          <Tabs value={logoSource} onValueChange={(v) => setLogoSource(v as "url" | "file")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <span>קישור</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-1">
                <Upload className="h-4 w-4" />
                <span>העלאה</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="url">
              <Input
                id="teamLogo"
                value={teamLogo}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full"
                placeholder="URL של סמל הקבוצה"
              />
            </TabsContent>
            
            <TabsContent value="file">
              <Input
                id="teamLogoFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full"
              />
            </TabsContent>
          </Tabs>
          
          {logoPreview && (
            <div className="flex justify-start mt-2">
              <div className="w-12 h-12 border rounded-md overflow-hidden bg-gray-50">
                <img 
                  src={logoPreview} 
                  alt="Team logo preview" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Handle image loading error
                    setLogoPreview(null);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          קטגוריה
        </Label>
        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="בחר קטגוריה" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">
          סטטוס
        </Label>
        <div className="col-span-3 flex gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="isOwned"
              checked={isOwned}
              onChange={(e) => setIsOwned(e.target.checked)}
              className="form-checkbox h-4 w-4"
            />
            <Label htmlFor="isOwned" className="cursor-pointer">יש ברשותי</Label>
          </div>
          
          {isOwned && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <input
                type="checkbox"
                id="isDuplicate"
                checked={isDuplicate}
                onChange={(e) => setIsDuplicate(e.target.checked)}
                className="form-checkbox h-4 w-4"
              />
              <Label htmlFor="isDuplicate" className="cursor-pointer">כפול</Label>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormFields;
