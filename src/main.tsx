import React from 'react'
import { createRoot } from 'react-dom/client'
import PlayApp from './play/PlayApp'
import StudioApp from './studio/StudioApp'
import AnimLab from './anim/AnimLab'
import './play/play.css'
import './studio/studio.css'

const isStudio = location.pathname.startsWith('/studio')
const isAnim = location.pathname.startsWith('/anim')
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{isAnim ? <AnimLab /> : isStudio ? <StudioApp /> : <PlayApp />}</React.StrictMode>,
)
