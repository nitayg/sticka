
import { Suspense, lazy, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";
import SplashScreen from "@/components/SplashScreen";
import ManifestUpdater from "@/components/settings/ManifestUpdater";
import { initializeFromStorage } from "@/lib/sync";
import { motion } from "framer-motion";

// Lazy-load the main Index component
const Index = lazy(() => import("./pages/Index"));

// Create a loading fallback with improved visual indicators
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-20 h-20">
        <motion.div 
          className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-interactive/20 opacity-75"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-0 left-0 right-0 bottom-0 rounded-full bg-interactive/30 opacity-85"
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.7, 0.85, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
        />
        <div className="relative rounded-full w-20 h-20 bg-interactive/10 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
            <motion.div 
              className="w-10 h-10 rounded-full bg-interactive"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
      <motion.div 
        className="text-foreground/80 text-sm font-medium"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        טוען את האפליקציה...
      </motion.div>
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
      refetchOnReconnect: "always", // Refetch on reconnection
    },
  },
});

// Create a flag to ensure initialize only happens once
let hasInitialized = false;

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnectionRestored, setIsConnectionRestored] = useState(false);
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsConnectionRestored(true);
      setTimeout(() => setIsConnectionRestored(false), 5000);
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  
  // Initialize Supabase and synchronize data
  useEffect(() => {
    // Check if already initialized to prevent duplicate initialization
    if (hasInitialized) {
      console.log('App already initialized, skipping initialization');
      setIsAppReady(true);
      return;
    }
    
    const initSupabase = async () => {
      try {
        setIsSyncing(true);
        hasInitialized = true;
        await initializeFromStorage();
        setIsSyncing(false);
        setIsAppReady(true);
        
        // Listen for sync-complete events
        const handleSyncComplete = () => {
          queryClient.invalidateQueries();
        };
        
        window.addEventListener('sync-complete', handleSyncComplete);
        
        return () => {
          window.removeEventListener('sync-complete', handleSyncComplete);
        };
      } catch (error) {
        console.error("Error initializing Supabase:", error);
        setIsSyncing(false);
        setIsAppReady(true);
      }
    };
    
    initSupabase();
    
    // Add performance monitoring
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              console.log(`LCP: ${entry.startTime}`);
            } else if (entry.entryType === 'layout-shift') {
              console.log(`CLS: ${entry.value}`);
            }
          }
        });
        
        // Observe LCP and CLS
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('Performance Observer error:', e);
      }
    }
    
  }, []);
  
  // Apply custom PWA manifest settings
  useEffect(() => {
    ManifestUpdater.applyManifestOverrides();
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
          
          {isConnectionRestored && (
            <motion.div 
              className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-green-100 dark:bg-green-900 px-4 py-2 rounded-md z-50 shadow-lg"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring" }}
            >
              <div className="text-sm text-green-800 dark:text-green-100 font-medium flex items-center gap-2">
                <span>החיבור לרשת חזר. מסנכרן נתונים...</span>
              </div>
            </motion.div>
          )}
          
          <Suspense fallback={<LoadingFallback />}>
            <Index />
          </Suspense>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
