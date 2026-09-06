import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Library, Progress } from '../types'
import { getLibrary, saveProgress } from '../lib/api'
import { pickToday, todayKey } from '../lib/daily'
import { blip } from '../lib/audio'
import { completeWatch, taiwanDay } from '../../shared/domain.mjs'
import { browseCharacters } from '../../shared/selection.mjs'
import { pendingWatches, queueWatch, flushWatches } from '../lib/watchQueue'
import Home from './Home'
import Viewer from './Viewer'
import Stickers from './Stickers'

type Screen = 'gate' | 'home' | 'viewer' | 'done' | 'stickers'
const EMPTY: Progress = { watched: {}, days: {}, stickers: [] }

export default function PlayApp() {
  const [lib, setLib] = useState<Library | null>(null)
  const [progress, setProgress] = useState<Progress>(EMPTY)
  const [screen, setScreen] = useState<Screen>('gate')
  const [activeIdx, setActiveIdx] = useState(0)
  const [mode, setMode] = useState<'all' | 'auto'>('all')
  const [page, setPage] = useState(0)
  const [day, setDay] = useState(todayKey())
  const [error, setError] = useState('')
  const [syncError, setSyncError] = useState(false)

  const sync = useCallback(() => {
    flushWatches().then(() => setSyncError(false)).catch(() => setSyncError(true))
  }, [])

  useEffect(() => {
    getLibrary().then((l) => {
      setLib(l)
      const pending = pendingWatches()
      const completed = (l.progress as Progress & { completedEvents?: Record<string, string> }).completedEvents || {}
      setProgress(pending.filter((e) => !completed[e.id]).reduce((p, e) => completeWatch(p, e.char, e.at), { ...EMPTY, ...l.progress }))
      sync()
    }).catch(() => setError('暫時開不起來，請確認服務已啟動後重新整理。'))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = todayKey()
      if (now !== day) { setDay(now); setScreen('gate') }
    }, 30000)
    window.addEventListener('online', sync)
    return () => { clearInterval(timer); window.removeEventListener('online', sync) }
  }, [day, sync])

  const today = useMemo(
    () => (lib ? pickToday(lib.characters, progress) : []),
    // 只在資料載入時算一次；看完一個字不該重排今天的清單
    [lib, day], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const all = useMemo(() => browseCharacters(lib?.characters || []), [lib])
  const items = mode === 'all' ? all : today

  // 儲存自動推薦；重新載入時仍依目前上架狀態優先挑影片。
  useEffect(() => {
    if (!lib || !today.length) return
    const key = todayKey()
    if (progress.days?.[key]?.length) return
    const next = { ...progress, days: { ...progress.days, [key]: today.map((c) => c.char) } }
    setProgress(next)
    saveProgress(next).catch(() => {})
  }, [lib, today]) // eslint-disable-line react-hooks/exhaustive-deps

  const doneSet = useMemo(() => {
    const key = todayKey()
    return new Set(
      all.filter((c) => progress.watched[c.char]?.last && taiwanDay(progress.watched[c.char].last) === key).map((c) => c.char),
    )
  }, [all, progress, day])

  const markWatched = useCallback((entry: CharEntry, id: string) => {
    const at = new Date().toISOString()
    queueWatch({ char: entry.char, id, at })
    setProgress((p) => completeWatch(p, entry.char, at))
    sync()
  }, [sync])

  // ---- 小孩防呆：鎖鍵盤、擋右鍵、擋拖曳 ----
  useEffect(() => {
    const allow = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape', 'Tab'])
    const onKey = (e: KeyboardEvent) => { if (!allow.has(e.key)) e.preventDefault() }
    const stop = (e: Event) => e.preventDefault()
    window.addEventListener('keydown', onKey)
    window.addEventListener('contextmenu', stop)
    window.addEventListener('dragstart', stop)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('contextmenu', stop)
      window.removeEventListener('dragstart', stop)
    }
  }, [])

  const enter = () => {
    // 先進畫面，全螢幕是加分項 —— 它失敗絕對不能讓「開始」按了沒反應
    setScreen('home')
    blip(880)
    try { document.documentElement.requestFullscreen?.()?.catch(() => {}) } catch { /* 沒全螢幕也能玩 */ }
  }

  const openCard = (i: number) => { setActiveIdx(i); setScreen('viewer') }

  const nextCard = () => {
    const next = activeIdx + 1
    if (next >= items.length) setScreen(mode === 'auto' ? 'done' : 'home')
    else { setActiveIdx(next); setPage(Math.floor(next / 6)); setScreen('viewer') }
  }

  if (!lib) return <div className="boot">{error || '載入中…'}</div>

  return (
    <div className="play">
      <Blobs />
      {screen === 'gate' && <Gate count={all.length} onStart={enter} />}
      {screen === 'home' && (
        <Home
          items={items}
          done={doneSet}
          stickerCount={progress.stickers.length}
          onPick={openCard}
          onStickers={() => setScreen('stickers')}
          mode={mode}
          onModeChange={(next) => { setMode(next); setPage(0) }}
          page={page}
          onPageChange={setPage}
        />
      )}
      {screen === 'viewer' && items[activeIdx] && (
        <Viewer
          key={`${day}-${items[activeIdx].char}`}
          entry={items[activeIdx]}
          index={activeIdx}
          onDone={() => setScreen('home')}
          onComplete={markWatched}
          onNext={nextCard}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'done' && (
        <DoneScreen onChoose={() => setScreen('home')} onStickers={() => setScreen('stickers')} />
      )}
      {screen === 'stickers' && (
        <Stickers
          all={lib.characters}
          owned={progress.stickers}
          onBack={() => setScreen('home')}
        />
      )}
      <ExitDot />
      {syncError && <button className="sync-note" onClick={sync}>觀看紀錄已暫存，點此重試儲存</button>}
    </div>
  )
}

function Gate({ count, onStart }: { count: number; onStart: () => void }) {
  return (
    <div className="gate">
      <div className="gate-title">字字樂園</div>
      <button className="gate-btn" onClick={onStart}>
        <span className="gate-btn-icon">▶</span>
        <span>開始</span>
      </button>
      <div className="gate-sub">{count} 個字，想看哪個就挑哪個</div>
    </div>
  )
}

function DoneScreen({ onChoose, onStickers }: { onChoose: () => void; onStickers: () => void }) {
  useEffect(() => { blip(880, 0.2); setTimeout(() => blip(1320, 0.3), 150) }, [])
  return (
    <div className="done">
      <div className="done-star">🌟</div>
      <div className="done-title">這一輪看完囉！</div>
      <div className="done-sub">想再看，可以回去挑喜歡的字</div>
      <button className="big-btn" onClick={onChoose}>繼續選字 ↩︎</button>
      <button className="big-btn ghost" onClick={onStickers}>看我的字 📖</button>
    </div>
  )
}

/** 左下角的隱藏出口：長按 2.5 秒才會離開（小孩按不住）。 */
function ExitDot() {
  const [held, setHeld] = useState(0)
  const timer = useRef<number | null>(null)
  const start = () => {
    const t0 = Date.now()
    timer.current = window.setInterval(() => {
      const p = (Date.now() - t0) / 2500
      setHeld(p)
      if (p >= 1) { stop(); location.href = '/studio' }
    }, 40)
  }
  const stop = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setHeld(0)
  }
  return (
    <button
      className="exit-dot"
      aria-label="離開"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      style={{ ['--held' as any]: held }}
    />
  )
}

function Blobs() {
  return (
    <div className="blobs" aria-hidden>
      <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
    </div>
  )
}
