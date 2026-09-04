import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Library, Progress } from '../types'
import { getLibrary, saveProgress } from '../lib/api'
import { pickToday, todayKey } from '../lib/daily'
import { blip } from '../lib/audio'
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

  useEffect(() => {
    getLibrary().then((l) => {
      setLib(l)
      setProgress({ ...EMPTY, ...l.progress })
    })
  }, [])

  const today = useMemo(
    () => (lib ? pickToday(lib.characters, progress) : []),
    // 只在資料載入時算一次；看完一個字不該重排今天的清單
    [lib], // eslint-disable-line react-hooks/exhaustive-deps
  )

  // 今天的清單一決定就寫回去，重新整理不會換一批
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
      today.filter((c) => progress.watched[c.char]?.last?.startsWith(key)).map((c) => c.char),
    )
  }, [today, progress])

  const markWatched = useCallback((entry: CharEntry) => {
    setProgress((p) => {
      const prev = p.watched[entry.char]
      const next: Progress = {
        ...p,
        watched: { ...p.watched, [entry.char]: { count: (prev?.count ?? 0) + 1, last: new Date().toISOString() } },
        stickers: p.stickers.includes(entry.char) ? p.stickers : [...p.stickers, entry.char],
      }
      saveProgress(next).catch(() => {})
      return next
    })
  }, [])

  // ---- 小孩防呆：鎖鍵盤、擋右鍵、擋拖曳 ----
  useEffect(() => {
    const allow = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape'])
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

  const finishCard = (entry: CharEntry) => {
    markWatched(entry)
    const remaining = today.findIndex((c, i) => i !== activeIdx && !doneSet.has(c.char) && c.char !== entry.char)
    if (remaining === -1) setScreen('done')
    else setScreen('home')
  }

  const nextCard = (entry: CharEntry) => {
    markWatched(entry)
    const order = [...today.keys()].slice(activeIdx + 1).concat([...today.keys()].slice(0, activeIdx))
    const nxt = order.find((i) => !doneSet.has(today[i].char) && today[i].char !== entry.char)
    if (nxt === undefined) setScreen('done')
    else { setActiveIdx(nxt); setScreen('viewer') }
  }

  if (!lib) return <div className="boot">載入中…</div>

  return (
    <div className="play">
      <Blobs />
      {screen === 'gate' && <Gate count={today.length} onStart={enter} />}
      {screen === 'home' && (
        <Home
          items={today}
          done={doneSet}
          stickerCount={progress.stickers.length}
          onPick={openCard}
          onStickers={() => setScreen('stickers')}
        />
      )}
      {screen === 'viewer' && today[activeIdx] && (
        <Viewer
          entry={today[activeIdx]}
          index={activeIdx}
          onDone={finishCard}
          onNext={nextCard}
          onBack={() => setScreen('home')}
        />
      )}
      {screen === 'done' && (
        <DoneScreen count={today.length} onStickers={() => setScreen('stickers')} />
      )}
      {screen === 'stickers' && (
        <Stickers
          all={lib.characters}
          owned={progress.stickers}
          onBack={() => setScreen(doneSet.size >= today.length ? 'done' : 'home')}
        />
      )}
      <ExitDot />
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
      <div className="gate-sub">今天有 {count} 個字在等你</div>
    </div>
  )
}

function DoneScreen({ count, onStickers }: { count: number; onStickers: () => void }) {
  useEffect(() => { blip(880, 0.2); setTimeout(() => blip(1320, 0.3), 150) }, [])
  return (
    <div className="done">
      <div className="done-star">🌟</div>
      <div className="done-title">今天看完囉！</div>
      <div className="done-sub">你今天學會了 {count} 個字</div>
      <button className="big-btn" onClick={onStickers}>看我的字 📖</button>
      <div className="done-note">明天再來喔</div>
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
