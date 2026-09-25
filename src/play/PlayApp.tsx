import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Library, Progress } from '../types'
import { getLibrary } from '../lib/api'
import { taiwanDay } from '../../shared/domain.mjs'
import { browseCharacters, hasPublishedVideo } from '../../shared/selection.mjs'
import { applyEvent, pendingEvents, queueEvent, flushEvents, type PlayEvent } from '../lib/playQueue'
import Home from './Home'
import Viewer from './Viewer'
import Town from './Town'
import Lab from './Lab'

export type Filter = 'all' | 'video' | 'unwatched'
export type Screen = 'home' | 'town' | 'lab'
const EMPTY: Progress = { watched: {} }

export default function PlayApp() {
  const [lib, setLib] = useState<Library | null>(null)
  const [progress, setProgress] = useState<Progress>(EMPTY)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [active, setActive] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [error, setError] = useState('')
  const [syncError, setSyncError] = useState(false)
  const home = useRef<HTMLDivElement>(null)
  const lastActive = useRef<string | null>(null)

  // 觀看層開著時，背後的字庫要完全退出（不能被 Tab 進去、讀屏也不該唸）；關閉後回到剛才那張字卡
  useEffect(() => {
    const el = home.current as (HTMLDivElement & { inert?: boolean }) | null
    if (el) el.inert = Boolean(active)
    if (active) { lastActive.current = active; return }
    const char = lastActive.current
    lastActive.current = null
    if (!char || !el) return
    const card = el.querySelector<HTMLButtonElement>(`.card[data-char="${CSS.escape(char)}"]`)
    if (card) {
      card.scrollIntoView({ block: 'nearest' })
      card.focus({ preventScroll: true })
    } else {
      el.querySelector<HTMLButtonElement>('.chip[aria-pressed="true"]')?.focus()
    }
  }, [active])

  const sync = useCallback(() => {
    flushEvents().then(() => setSyncError(false)).catch(() => setSyncError(true))
  }, [])

  useEffect(() => {
    getLibrary().then((l) => {
      setLib(l)
      const completed = (l.progress as Progress & { completedEvents?: Record<string, string> }).completedEvents || {}
      setProgress(pendingEvents().filter((e) => !completed[e.id]).reduce(applyEvent, { ...EMPTY, ...l.progress }))
      sync()
    }).catch(() => setError('暫時開不起來，請確認服務已啟動後重新整理。'))
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [sync])

  const all = useMemo(() => browseCharacters(lib?.characters || []), [lib])
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((c) =>
      (filter === 'all' || (filter === 'video' ? hasPublishedVideo(c) : !progress.watched[c.char])) &&
      (!q || q.includes(c.char) || c.zhuyin.includes(q) || c.meaning.toLowerCase().includes(q)))
  }, [all, query, filter, progress])

  // 今天看過幾個「不同的字」：重播同一個字不會多一顆星，鼓勵他往下一個字走
  const todayCount = useMemo(() => {
    const today = taiwanDay()
    return Object.values(progress.watched).filter((w) => taiwanDay(w.last) === today).length
  }, [progress])

  // 選擇困難時的出口：優先給還沒看過的字，都看過了就在目前清單裡隨機
  const surprise = useCallback(() => {
    const pool = items.filter((c) => !progress.watched[c.char])
    const from = pool.length ? pool : items
    if (from.length) setActive(from[Math.floor(Math.random() * from.length)].char)
  }, [items, progress])

  const record = useCallback((event: PlayEvent) => {
    queueEvent(event)
    setProgress((p) => applyEvent(p, event))
    sync()
  }, [sync])
  const markWatched = useCallback((entry: CharEntry, id: string) => {
    record({ char: entry.char, id, at: new Date().toISOString() })
  }, [record])
  // 描完一個字 → 搬進小鎮（用他自己的筆跡）
  const markTraced = useCallback((entry: CharEntry, strokes: number[][]) => {
    record({ kind: 'trace', char: entry.char, id: crypto.randomUUID(), at: new Date().toISOString(), strokes })
  }, [record])
  const markDiscovered = useCallback((char: string) => {
    if (progress.lab?.[char]) return
    record({ kind: 'discover', char, id: crypto.randomUUID(), at: new Date().toISOString() })
  }, [record, progress.lab])

  if (!lib) return <div className="boot">{error || '載入中…'}</div>

  const entry = all.find((c) => c.char === active)
  const index = items.findIndex((c) => c.char === active)

  return (
    <div className="play">
      <Blobs />
      <div className="screen" ref={home}>
      {screen === 'town' ? (
        <Town residents={progress.town || {}} library={all} onPick={setActive} onBack={() => setScreen('home')} />
      ) : screen === 'lab' ? (
        <Lab library={all} found={progress.lab || {}} onDiscover={markDiscovered} onPick={setActive} onBack={() => setScreen('home')} />
      ) : (
      <Home
        items={items}
        total={all.length}
        watched={progress.watched}
        todayCount={todayCount}
        query={query}
        onQuery={setQuery}
        filter={filter}
        onFilter={setFilter}
        onPick={setActive}
        onSurprise={surprise}
        onReset={() => { setQuery(''); setFilter('all') }}
        residents={Object.keys(progress.town || {}).length}
        onScreen={setScreen}
      />
      )}
      </div>
      {entry && (
        <Viewer
          key={entry.char}
          entry={entry}
          count={progress.watched[entry.char]?.count || 0}
          traces={progress.town?.[entry.char]?.traces || 0}
          library={all}
          prev={index > 0 ? items[index - 1] : undefined}
          next={index >= 0 && index < items.length - 1 ? items[index + 1] : undefined}
          onGo={(c) => setActive(c.char)}
          onJump={setActive}
          onClose={() => setActive(null)}
          onBrowseVideos={() => { setQuery(''); setFilter('video'); setActive(null) }}
          onComplete={markWatched}
          onTraced={markTraced}
          onTown={() => { setActive(null); setScreen('town') }}
        />
      )}
      {syncError && <button className="sync-note" onClick={sync}>觀看紀錄已暫存，點此重試儲存</button>}
    </div>
  )
}

function Blobs() {
  return (
    <div className="blobs" aria-hidden>
      <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
    </div>
  )
}
