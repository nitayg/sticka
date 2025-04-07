
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

// Log the app version and initialization
console.log('App starting - initializing...');

// We're no longer initializing Supabase here as it's handled in App.tsx

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
