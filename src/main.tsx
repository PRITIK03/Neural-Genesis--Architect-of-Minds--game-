import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadSettings } from './lib/playerProgress'

const bootSettings = loadSettings()
document.documentElement.dataset.theme = bootSettings.theme
document.documentElement.dataset.reducedMotion = bootSettings.reducedMotion ? 'true' : 'false'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)