
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Import all styles
import './index.css'
import './styles/base.css'
import './styles/components.css'
import './styles/animations.css'
import './styles/theme.css'
import './styles/pwa.css'
import './styles/smooth-animations.css'
import './styles/drag-and-drop.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
