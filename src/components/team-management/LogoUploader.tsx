
import React from "react";
import { Input } from "../ui/input";
import { Link as LinkIcon, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface LogoUploaderProps {
  logoSource: "url" | "file";
  setLogoSource: (value: "url" | "file") => void;
  logoUrl: string;
  setLogoUrl: (value: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  logoFile: File | null;
  newTeamName: string;
}

const LogoUploader = ({
  logoSource,
  setLogoSource,
  logoUrl,
  setLogoUrl,
  handleFileChange,
  logoFile,
  newTeamName
}: LogoUploaderProps) => {
  return (
    <div className="space-y-3">
      <Tabs value={logoSource} onValueChange={(v) => setLogoSource(v as "url" | "file")}>
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="url" className="flex items-center gap-1 text-xs">
            <LinkIcon className="h-3 w-3" />
            <span>URL</span>
          </TabsTrigger>
          <TabsTrigger value="file" className="flex items-center gap-1 text-xs">
            <Upload className="h-3 w-3" />
            <span>העלאה</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="mt-0">
          <Input 
            placeholder="הקלד URL של הסמל" 
            value={logoUrl} 
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </TabsContent>
        
        <TabsContent value="file" className="mt-0">
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </TabsContent>
      </Tabs>
      
      {/* Logo preview */}
      <div className="flex justify-end">
        <div className="w-10 h-10 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
          {(logoUrl || logoFile) && (
            <img 
              src={logoFile ? URL.createObjectURL(logoFile) : logoUrl} 
              alt={`${newTeamName} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=X";
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;
