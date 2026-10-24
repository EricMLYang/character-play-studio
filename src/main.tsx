import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import PlayApp from './play/PlayApp'

import { STANDALONE } from './lib/target'

// 家長的 Studio 與動畫試播頁另外打包：孩子端打開時不必下載。
// iPad 單機版（STANDALONE）完全不打包它們：App 裡沒有 Studio 的程式碼，也就進不去
const StudioApp = STANDALONE ? null : lazy(() => import('./studio/StudioApp'))
const AnimLab = STANDALONE ? null : lazy(() => import('./anim/AnimLab'))

const isStudio = StudioApp && location.pathname.startsWith('/studio')
const isAnim = AnimLab && location.pathname.startsWith('/anim')
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div className="boot">載入中…</div>}>
      {isAnim ? <AnimLab /> : isStudio ? <StudioApp /> : <PlayApp />}
    </Suspense>
  </React.StrictMode>,
)
