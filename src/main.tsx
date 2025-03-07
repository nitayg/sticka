
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/base.css'
import './styles/components.css'
import './styles/theme.css'
import './styles/animations.css'
import './styles/pwa.css'
import './styles/smooth-animations.css'
import SyncIndicator from './components/SyncIndicator.tsx'
import { initializeFromStorage, syncWithSupabase } from './lib/sync-manager.ts'
import { toast } from './hooks/use-toast'  // Updated import path

// Log the app version and initialization
console.log('App starting - initializing...');

// Initialize Supabase synchronization with better error handling
const initApp = async () => {
  try {
    // Attempt to initialize storage
    const initialized = await initializeFromStorage();
    
    if (initialized) {
      console.log('Supabase connection initialized');
      
      // Force an immediate sync after initialization
      const syncResult = await syncWithSupabase(true);
      
      if (syncResult) {
        console.log('Initial sync complete');
      } else {
        console.warn('Initial sync failed or was incomplete');
      }
    } else {
      console.warn('Initialization completed with warnings');
    }
    
    // Regardless of result, force another sync attempt after a delay
    setTimeout(() => {
      if (navigator.onLine) {
        console.log('Running follow-up sync...');
        syncWithSupabase(true);
      }
    }, 5000);
  } catch (err) {
    console.error('Failed to initialize Supabase:', err);
    
    // Notify user about initialization error
    toast({
      title: "שגיאת אתחול",
      description: "אירעה שגיאה בהתחברות למסד הנתונים. ייתכן שחלק מהנתונים לא יוצגו כראוי.",
      variant: "destructive",
      duration: 5000,
    });
  }
};

// Start initialization process
initApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <SyncIndicator />
  </React.StrictMode>,
)
