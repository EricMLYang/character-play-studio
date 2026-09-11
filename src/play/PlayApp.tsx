import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Library, Progress } from '../types'
import { getLibrary } from '../lib/api'
import { completeWatch } from '../../shared/domain.mjs'
import { browseCharacters, hasPublishedVideo } from '../../shared/selection.mjs'
import { pendingWatches, queueWatch, flushWatches } from '../lib/watchQueue'
import Home from './Home'
import Viewer from './Viewer'

export type Filter = 'all' | 'video' | 'unwatched'
const EMPTY: Progress = { watched: {} }

export default function PlayApp() {
  const [lib, setLib] = useState<Library | null>(null)
  const [progress, setProgress] = useState<Progress>(EMPTY)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [active, setActive] = useState<string | null>(null)
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
    card?.scrollIntoView({ block: 'nearest' })
    card?.focus()
  }, [active])

  const sync = useCallback(() => {
    flushWatches().then(() => setSyncError(false)).catch(() => setSyncError(true))
  }, [])

  useEffect(() => {
    getLibrary().then((l) => {
      setLib(l)
      const completed = (l.progress as Progress & { completedEvents?: Record<string, string> }).completedEvents || {}
      setProgress(pendingWatches().filter((e) => !completed[e.id]).reduce((p, e) => completeWatch(p, e.char, e.at), { ...EMPTY, ...l.progress }))
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

  const markWatched = useCallback((entry: CharEntry, id: string) => {
    const at = new Date().toISOString()
    queueWatch({ char: entry.char, id, at })
    setProgress((p) => completeWatch(p, entry.char, at))
    sync()
  }, [sync])

  if (!lib) return <div className="boot">{error || '載入中…'}</div>

  const entry = all.find((c) => c.char === active)
  const index = items.findIndex((c) => c.char === active)

  return (
    <div className="play">
      <Blobs />
      <Home
        rootRef={home}
        items={items}
        total={all.length}
        watched={progress.watched}
        query={query}
        onQuery={setQuery}
        filter={filter}
        onFilter={setFilter}
        onPick={setActive}
        onReset={() => { setQuery(''); setFilter('all') }}
      />
      {entry && (
        <Viewer
          key={entry.char}
          entry={entry}
          count={progress.watched[entry.char]?.count || 0}
          prev={index > 0 ? items[index - 1] : undefined}
          next={index >= 0 && index < items.length - 1 ? items[index + 1] : undefined}
          onGo={(c) => setActive(c.char)}
          onClose={() => setActive(null)}
          onComplete={markWatched}
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
