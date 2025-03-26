
import { Suspense, lazy, useEffect, useState, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import SplashScreen from "@/components/SplashScreen";
import ManifestUpdater from "@/components/settings/ManifestUpdater";

// Lazy-load the main Index component
const Index = lazy(() => import("./pages/Index"));

// Create a loading fallback with improved visual indicators
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 right-0 bottom-0 animate-ping rounded-full bg-interactive/20 opacity-75"></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 animate-pulse rounded-full bg-interactive/30 opacity-85 delay-75"></div>
        <div className="relative rounded-full w-20 h-20 bg-interactive/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-interactive animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="text-foreground/80 text-sm font-medium animate-pulse">טוען את האפליקציה...</div>
    </div>
  </div>
);

// Create QueryClient with improved configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes - using gcTime instead of deprecated cacheTime
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const syncRegistered = useRef(false);
  
  // החלת הגדרות ה-manifest המותאמות בטעינת האפליקציה
  useEffect(() => {
    ManifestUpdater.applyManifestOverrides();
  }, []);

  // Set up listener for sync-complete events only once
  useEffect(() => {
    if (syncRegistered.current) return;
    
    const handleSyncComplete = () => {
      queryClient.invalidateQueries();
    };
    
    window.addEventListener('sync-complete', handleSyncComplete);
    syncRegistered.current = true;
    
    // We'll eventually mark the app as ready after a short delay
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1000);
    
    return () => {
      window.removeEventListener('sync-complete', handleSyncComplete);
      clearTimeout(timer);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="sticker-album-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={300}>
          {showSplash && <SplashScreen onComplete={handleSplashComplete} minDisplayTime={2500} />}
          <Toaster />
          <Sonner position="top-center" closeButton />
          <Suspense fallback={<LoadingFallback />}>
            <Index />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
