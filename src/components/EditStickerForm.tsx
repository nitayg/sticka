import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sticker } from "@/lib/types";
import { useToast } from "./ui/use-toast";
import { updateSticker, stickerData, setStickerData } from "@/lib/sticker-operations";
import { getAllAlbums } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Upload, Link as LinkIcon } from "lucide-react";

interface EditStickerFormProps {
  sticker: Sticker | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EditStickerForm = ({ sticker, isOpen, onClose, onUpdate }: EditStickerFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [team, setTeam] = useState("");
  const [originalTeam, setOriginalTeam] = useState("");
  const [teamLogo, setTeamLogo] = useState("");
  const [category, setCategory] = useState("");
  const [albumId, setAlbumId] = useState("");
  const albums = getAllAlbums();
  const categories = ["שחקנים", "קבוצות", "אצטדיונים", "סמלים", "אחר"];
  
  // For logo upload
  const [logoSource, setLogoSource] = useState<"url" | "file">("url");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (sticker) {
      setName(sticker.name);
      setNumber(sticker.number.toString());
      setTeam(sticker.team);
      setOriginalTeam(sticker.team);
      setTeamLogo(sticker.teamLogo || "");
      setCategory(sticker.category);
      setAlbumId(sticker.albumId);
      setLogoFile(null);
      setLogoSource("url");
    }
  }, [sticker]);

  if (!sticker) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Process logo file if one was selected
      let finalLogoUrl = teamLogo;
      if (logoFile) {
        finalLogoUrl = await readFileAsDataURL(logoFile);
      }
      
      // Update this sticker (the updateSticker function now handles team name propagation)
      updateSticker(sticker.id, {
        name,
        number: parseInt(number),
        team,
        teamLogo: finalLogoUrl || undefined,
        category,
        albumId,
      });
      
      // If team name changed and the update was successful
      if (team !== originalTeam) {
        toast({
          title: "שם קבוצה עודכן",
          description: `שם הקבוצה עודכן מ-${originalTeam} ל-${team} עבור כל המדבקות הרלוונטיות`,
        });
      }
      
      toast({
        title: "מדבקה עודכנה",
        description: `מדבקה ${number} (${name}) עודכנה בהצלחה`,
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "שגיאה בעדכון",
        description: "אירעה שגיאה בניסיון לעדכן את המדבקה",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת מדבקה</DialogTitle>
          <DialogDescription>
            עדכן את פרטי המדבקה. שדות עם * הינם שדות חובה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="albumId" className="text-right">אלבום *</Label>
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
            <Label htmlFor="number" className="text-right">מספר *</Label>
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
            <Label htmlFor="name" className="text-right">שם *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right">קבוצה/סדרה *</Label>
            <Input
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          {team !== originalTeam && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div></div>
              <div className="col-span-3">
                <div className="text-sm text-muted-foreground">
                  שים לב: שינוי שם הקבוצה יעדכן את כל המדבקות של קבוצה זו באלבום
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2">סמל קבוצה</Label>
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
                    onChange={(e) => setTeamLogo(e.target.value)}
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
              
              {(teamLogo || logoFile) && (
                <div className="flex justify-start mt-2">
                  <div className="w-12 h-12 border rounded-md overflow-hidden bg-gray-50">
                    <img 
                      src={logoFile ? URL.createObjectURL(logoFile) : teamLogo} 
                      alt="Team logo preview" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Handle image loading error
                        e.currentTarget.src = "https://via.placeholder.com/48?text=X";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">קטגוריה</Label>
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
            <Button type="submit">שמור שינויים</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStickerForm;
