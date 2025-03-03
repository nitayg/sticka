
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Upload, Link as LinkIcon } from "lucide-react";

interface LogoUploaderProps {
  teamLogo: string;
  setTeamLogo: (value: string) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
}

const LogoUploader = ({ teamLogo, setTeamLogo, logoFile, setLogoFile }: LogoUploaderProps) => {
  const [logoSource, setLogoSource] = useState<"url" | "file">("url");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  return (
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
  );
};

export default LogoUploader;
