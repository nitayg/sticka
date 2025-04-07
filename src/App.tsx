
import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import SyncProvider from "./components/SyncProvider";
import SyncInitializer from "./components/SyncInitializer";
import LoadingIndicator from "./components/LoadingIndicator";
import SplashScreen from "./components/SplashScreen";
import { useToast } from "./components/ui/use-toast";

// Lazy load main components for better performance
const AlbumView = lazy(() => import("./components/AlbumView"));
const AddStickerForm = lazy(() => import("./components/AddStickerForm"));
const TeamManagementTab = lazy(() => import("./components/team-management"));

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use direct import for the SyncInitializer while we transition to the new SyncProvider
  useEffect(() => {
    // Initialize the app version
    const appVersion = "1.1.0";
    console.log(`Album Stickers App version ${appVersion}`);
    
    try {
      // Log device info for debugging
      console.log("User agent:", navigator.userAgent);
      console.log("Device memory:", (navigator as any).deviceMemory || "unknown");
      console.log("Platform:", navigator.platform);
    } catch (error) {
      console.error("Error getting device info:", error);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleInitError = (error: Error) => {
    console.error("Application initialization error:", error);
    setInitError(error.message);
    toast({
      title: "שגיאת אתחול",
      description: "אירעה שגיאה בטעינת האפליקציה. אנא נסה שוב.",
      variant: "destructive",
    });
  };

  // Show splash screen on initial load
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-destructive">שגיאת אתחול</h1>
          <p className="text-muted-foreground">{initError}</p>
          <button 
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SyncProvider notifications={false}>
        <Suspense fallback={<LoadingIndicator text="טוען..." />}>
          <Routes>
            <Route path="/" element={
              <Layout>
                <AlbumView />
              </Layout>
            } />
            <Route path="/add" element={
              <Layout>
                <AddStickerForm />
              </Layout>
            } />
            <Route path="/teams" element={
              <Layout>
                <TeamManagementTab 
                  teams={[]} 
                  teamLogos={{}} 
                  onTeamSelect={() => {}} 
                  selectedTeam="" 
                  onTeamsUpdate={() => {}}
                />
              </Layout>
            } />
          </Routes>
        </Suspense>
        <Toaster />
        <SyncInitializer />
      </SyncProvider>
    </BrowserRouter>
  );
}

export default App;
