
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/hooks/use-theme";

// Lazy-load the main Index component
const Index = lazy(() => import("./pages/Index"));

// Create a loading fallback
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
      <div className="h-4 w-32 bg-primary/20 rounded mb-2"></div>
      <div className="h-3 w-24 bg-primary/10 rounded"></div>
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
      <TooltipProvider>
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
