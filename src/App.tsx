
import { Suspense, lazy } from "react";
import { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import SyncProvider from "./components/SyncProvider";
import SyncInitializer from "./components/SyncInitializer";
import LoadingIndicator from "./components/LoadingIndicator";

// Lazy load main components for better performance
const AlbumView = lazy(() => import("./components/album/AlbumView"));
const AddStickerForm = lazy(() => import("./components/AddStickerForm"));
const TeamManagementTab = lazy(() => import("./components/team-management"));

function App() {
  // Use direct import for the SyncInitializer while we transition to the new SyncProvider
  useEffect(() => {
    // Initialize the app version
    const appVersion = "1.1.0";
    console.log(`Album Stickers App version ${appVersion}`);
    
    // Log device info for debugging
    console.log("User agent:", navigator.userAgent);
    console.log("Device memory:", (navigator as any).deviceMemory || "unknown");
    console.log("Platform:", navigator.platform);
  }, []);

  return (
    <SyncProvider notifications={false}>
      <Suspense fallback={<LoadingIndicator text="טוען..." />}>
        <Routes>
          <Route element={<Layout><div></div></Layout>}>
            <Route path="/" element={<AlbumView />} />
            <Route path="/add" element={<AddStickerForm />} />
            <Route path="/teams" element={
              <TeamManagementTab 
                teams={[]} 
                teamLogos={{}} 
                onTeamSelect={() => {}} 
                selectedTeam="" 
                onTeamsUpdate={() => {}}
              />
            } />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
      <SyncInitializer />
    </SyncProvider>
  );
}

export default App;
