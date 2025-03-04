
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";

// Lazy-load the main Index component
const Index = lazy(() => import("./pages/Index"));

// Create a loading fallback with improved visual indicators
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 right-0 bottom-0 animate-ping rounded-full bg-interactive/30 opacity-75"></div>
        <div className="relative rounded-full w-16 h-16 bg-interactive/40 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-interactive animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="text-foreground/80 text-sm font-medium">טוען את האפליקציה...</div>
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

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="sticker-album-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner position="top-center" closeButton />
        <Suspense fallback={<LoadingFallback />}>
          <Index />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
