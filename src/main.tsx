import React from 'react'
import { createRoot } from 'react-dom/client'
import PlayApp from './play/PlayApp'
import StudioApp from './studio/StudioApp'
import './play/play.css'
import './studio/studio.css'

const isStudio = location.pathname.startsWith('/studio')
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isStudio ? <StudioApp /> : <PlayApp />}</React.StrictMode>,
)
