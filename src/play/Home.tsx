import { useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import type { CharEntry, Progress } from '../types'
import { hasPublishedVideo } from '../../shared/selection.mjs'
import type { Filter } from './PlayApp'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'video', label: '有影片' },
  { id: 'unwatched', label: '還沒看過' },
]

export default function Home({
  items, total, watched, query, onQuery, filter, onFilter, onPick, onReset, rootRef,
}: {
  items: CharEntry[]
  total: number
  watched: Progress['watched']
  query: string
  onQuery: (q: string) => void
  filter: Filter
  onFilter: (f: Filter) => void
  onPick: (char: string) => void
  onReset: () => void
  rootRef?: Ref<HTMLDivElement>
}) {
  return (
    <div className="home" ref={rootRef}>
      <header className="home-bar">
        <h1 className="home-title">字字樂園</h1>
        <input
          className="search"
          type="search"
          autoFocus
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && items[0]) onPick(items[0].char) }}
          placeholder="找字：輸入國字、注音或英文"
          aria-label="找字"
        />
        <div className="home-filters" aria-label="篩選">
          {FILTERS.map((f) => (
            <button key={f.id} className={'chip' + (filter === f.id ? ' on' : '')} aria-pressed={filter === f.id} onClick={() => onFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <span className="home-stat">{items.length === total ? `${total} 個字` : `${items.length} / ${total} 個字`}</span>
        <ParentGate />
      </header>

      <div className="grid">
        {items.map((c) => {
          const count = watched[c.char]?.count || 0
          const video = hasPublishedVideo(c)
          return (
            <button
              key={c.char}
              data-char={c.char}
              className={'card' + (video ? ' card-video' : '')}
              style={{ ['--hue' as any]: `var(--c${c.priority % 8})` }}
              aria-label={`看「${c.char}」${video ? '，有影片' : ''}${count ? `，看過 ${count} 次` : ''}`}
              onClick={() => onPick(c.char)}
            >
              <span className="card-emoji">{c.emoji}</span>
              <span className="card-char">{c.char}</span>
              <span className="card-zhuyin">{c.zhuyin}</span>
              {video && <span className="card-badge">🎬</span>}
              {count > 0 && <span className="card-count">看過 {count} 次</span>}
            </button>
          )
        })}
        {!items.length && <Empty total={total} query={query} filter={filter} onReset={onReset} />}
      </div>
    </div>
  )
}

/** 每個空結果都要說清楚是哪一種空，並給一個回到全字庫的出口。 */
function Empty({ total, query, filter, onReset }: { total: number; query: string; filter: Filter; onReset: () => void }) {
  if (!total) return <p className="home-empty">字庫還沒有字，請大人到家長專區加入。</p>
  const reason = query.trim()
    ? `找不到「${query.trim()}」這個字。`
    : filter === 'video' ? '還沒有上架影片的字，先看其他字卡也可以。'
    : filter === 'unwatched' ? '每個字都看過了，好厲害！'
    : '這裡還沒有字。'
  return (
    <p className="home-empty">
      {reason}
      <br />
      <button onClick={onReset}>看全部 {total} 個字</button>
    </p>
  )
}

/** Studio 是家長的地方：要長按才進得去，孩子誤觸不會開到生成與回饋表單。 */
function ParentGate() {
  const [holding, setHolding] = useState(false)
  const [hint, setHint] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const hintTimer = useRef<number | undefined>(undefined)

  const start = () => {
    if (timer.current) return
    setHolding(true)
    timer.current = window.setTimeout(() => { timer.current = undefined; location.href = '/studio' }, 900)
  }
  const cancel = () => {
    setHolding(false)
    if (!timer.current) return
    clearTimeout(timer.current)
    timer.current = undefined
    setHint(true)
    clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHint(false), 2400)
  }
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(hintTimer.current) }, [])

  return (
    <>
      <button
        className={'home-parent' + (holding ? ' holding' : '')}
        aria-label="家長專區，長按一秒進入"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() } }}
        onKeyUp={cancel}
        onBlur={cancel}
        onContextMenu={(e) => e.preventDefault()}
      >👪 家長（長按）</button>
      {hint && <div className="home-parent-hint" role="status">長按一秒才會進入家長專區</div>}
    </>
  )
}
