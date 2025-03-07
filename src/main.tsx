
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
import { initializeFromStorage } from './lib/sync-manager.ts'

// Log the app version and initialization
console.log('App starting - initializing...');

// Initialize Supabase synchronization
initializeFromStorage()
  .then(() => {
    console.log('Supabase connection initialized');
  })
  .catch(err => {
    console.error('Failed to initialize Supabase:', err);
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <SyncIndicator />
  </React.StrictMode>,
)
