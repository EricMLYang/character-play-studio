import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import PlayApp from './play/PlayApp'

// 家長的 Studio 與動畫試播頁另外打包：孩子端打開時不必下載
const StudioApp = lazy(() => import('./studio/StudioApp'))
const AnimLab = lazy(() => import('./anim/AnimLab'))

const isStudio = location.pathname.startsWith('/studio')
const isAnim = location.pathname.startsWith('/anim')
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="boot">載入中…</div>}>
      {isAnim ? <AnimLab /> : isStudio ? <StudioApp /> : <PlayApp />}
    </Suspense>
  </React.StrictMode>,
)
