
import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
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
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the app version
    const appVersion = "1.1.1";
    console.log(`Album Stickers App version ${appVersion}`);
    
    // Set a safety timeout to prevent the app from getting stuck indefinitely
    const safetyTimeout = setTimeout(() => {
      console.log("Safety timeout triggered - forcing app to load");
      setShowSplash(false);
      setIsTimeoutActive(true);
    }, 8000); // 8 seconds timeout

    // Log basic device info for debugging
    try {
      console.log("User agent:", navigator.userAgent);
      console.log("Platform:", navigator.platform);
    } catch (error) {
      console.error("Error getting device info:", error);
    }

    return () => {
      clearTimeout(safetyTimeout);
    };
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

  // If safety timeout was triggered, show simplified app with minimal dependencies
  if (isTimeoutActive) {
    return (
      <BrowserRouter>
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-md mx-auto mt-8 p-4 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-4">מצב חירום - טעינה מהירה</h2>
            <p className="mb-4">האפליקציה נטענת במצב חירום בשל בעיית טעינה.</p>
            <div className="flex justify-center">
              <button
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 mr-2"
                onClick={() => window.location.reload()}
              >
                טען מחדש
              </button>
              <button
                className="bg-muted text-foreground px-4 py-2 rounded hover:bg-muted/90"
                onClick={() => localStorage.clear()}
              >
                נקה נתונים
              </button>
            </div>
          </div>
        </div>
        <Toaster />
      </BrowserRouter>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
        {/* Load sync initializer with error handling */}
        <div id="sync-container" style={{ display: 'none' }}>
          <SyncInitializer onError={handleInitError} />
        </div>
      </SyncProvider>
    </BrowserRouter>
  );
}

export default App;
