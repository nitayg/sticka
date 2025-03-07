
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
import { toast } from './components/ui/use-toast.tsx'

// Log the app version and initialization
console.log('App starting - initializing...');

// Initialize Supabase synchronization
initializeFromStorage()
  .then(() => {
    console.log('Supabase connection initialized');
    // Force a sync after initialization to make sure we have the latest data
    return syncWithSupabase(true);
  })
  .then(() => {
    console.log('Initial sync complete');
  })
  .catch(err => {
    console.error('Failed to initialize Supabase:', err);
    // Notify user about initialization error
    toast({
      title: "שגיאת אתחול",
      description: "אירעה שגיאה בהתחברות למסד הנתונים. ייתכן שחלק מהנתונים לא יוצגו כראוי.",
      variant: "destructive",
      duration: 5000,
    });
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <SyncIndicator />
  </React.StrictMode>,
)
