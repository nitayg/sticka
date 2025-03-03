
import { useState } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import { Camera, Image, Check, X } from "lucide-react";
import EmptyState from "./EmptyState";

const ScanView = () => {
  const [scanStep, setScanStep] = useState<"initial" | "scanning" | "result">("initial");
  const [scanResult, setScanResult] = useState<any>(null);
  
  const handleScan = () => {
    setScanStep("scanning");
    // Simulate scanning process
    setTimeout(() => {
      setScanResult({
        name: "Lionel Messi",
        team: "Inter Miami",
        number: 10,
        alreadyOwned: false
      });
      setScanStep("result");
    }, 2000);
  };
  
  const resetScan = () => {
    setScanStep("initial");
    setScanResult(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Header 
        title="Scan Stickers" 
        subtitle="Add stickers to your collection by scanning them"
      />
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            className={cn(
              "aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-border relative",
              scanStep === "scanning" && "border-interactive",
              scanStep === "result" && "border-solid border-interactive"
            )}
          >
            {scanStep === "initial" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 text-center p-6">
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready to scan</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Point your camera at a sticker to scan and add it to your collection
                </p>
              </div>
            )}
            
            {scanStep === "scanning" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <div className="h-20 w-20 rounded-full bg-interactive/20 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-interactive/30 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-interactive/40 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-interactive animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {scanStep === "result" && scanResult && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-8">
                <div className="p-4 rounded-lg bg-white shadow-lg w-full max-w-sm animate-scale-in">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-secondary flex items-center justify-center">
                      <Image className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">#{scanResult.number} • {scanResult.team}</div>
                      <h3 className="text-lg font-semibold">{scanResult.name}</h3>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={resetScan}
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button 
                      onClick={resetScan}
                      className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground font-medium transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <video 
              className="w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"
            />
          </div>
          
          <div className="flex space-x-4">
            {scanStep === "initial" && (
              <>
                <button 
                  onClick={handleScan}
                  className="flex-1 py-3 rounded-md bg-interactive hover:bg-interactive-hover text-interactive-foreground text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Camera className="h-4 w-4" />
                  Scan Sticker
                </button>
                <button className="flex-1 py-3 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                  <Image className="h-4 w-4" />
                  Upload Photo
                </button>
              </>
            )}
            
            {scanStep !== "initial" && (
              <button 
                onClick={resetScan}
                className="flex-1 py-3 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Instructions</h3>
          <div className="rounded-xl border border-border p-5 space-y-4">
            <ScanStep 
              number={1} 
              title="Position the sticker"
              description="Place the sticker on a flat surface with good lighting"
            />
            <ScanStep 
              number={2} 
              title="Align the camera"
              description="Make sure the entire sticker is visible in the camera frame"
            />
            <ScanStep 
              number={3} 
              title="Hold steady"
              description="Keep your device steady while scanning"
            />
            <ScanStep 
              number={4} 
              title="Verify and add"
              description="Confirm the details are correct before adding to your collection"
            />
          </div>
          
          <div className="p-4 rounded-xl border border-border bg-card mt-6">
            <h3 className="text-sm font-medium mb-2">Recently Scanned</h3>
            <EmptyState
              title="No recently scanned stickers"
              description="Stickers you scan will appear here"
              className="py-6"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScanStepProps {
  number: number;
  title: string;
  description: string;
}

const ScanStep = ({ number, title, description }: ScanStepProps) => {
  return (
    <div className="flex items-start gap-4">
      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

export default ScanView;
