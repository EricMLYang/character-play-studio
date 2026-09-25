import { useEffect, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { hasPublishedVideo } from '../../shared/selection.mjs'
import { tap } from '../lib/sfx'
import type { Filter, Screen } from './PlayApp'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '🌈 全部字卡' },
  { id: 'video', label: '🎬 有影片' },
  { id: 'unwatched', label: '✨ 還沒看過' },
]

export default function Home({
  items, total, watched, todayCount, query, onQuery, filter, onFilter, onPick, onSurprise, onReset, residents, onScreen,
}: {
  items: CharEntry[]
  total: number
  watched: Progress['watched']
  todayCount: number
  query: string
  onQuery: (q: string) => void
  filter: Filter
  onFilter: (f: Filter) => void
  onPick: (char: string) => void
  onSurprise: () => void
  onReset: () => void
  residents: number
  onScreen: (s: Screen) => void
}) {
  return (
    <div className="home">
      <header className="home-bar">
        <h1 className="home-title">字字樂園</h1>
        <input
          className="search"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && items[0]) onPick(items[0].char) }}
          placeholder="找字：輸入國字、注音或英文"
          aria-label="找字"
        />
        <div className="home-filters" aria-label="篩選">
          {FILTERS.map((f) => (
            <button key={f.id} data-filter={f.id} className={'chip' + (filter === f.id ? ' on' : '')} aria-pressed={filter === f.id} onClick={() => onFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        {/* 還不會打字的孩子也要有一個「我不知道要看什麼」的出口 */}
        <button className="chip surprise" onClick={() => { tap(); onSurprise() }} disabled={!items.length}>🎲 隨便給我一個</button>
        <span className="home-stat">{items.length === total ? `${total} 個字` : `${items.length} / ${total} 個字`}</span>
        <ParentGate />
      </header>

      <div className="home-invite">
        <span className="home-mascot" aria-hidden="true">🌟</span>
        <div>
          <h2>{filter === 'video' ? '選一張，來看小影片！' : '今天想認識哪個字？'}</h2>
          <p>看看小圖，點點字卡，自己選！</p>
        </div>
        {/* 看完字卡之後還有地方可以去：他寫的字住在小鎮，字丟進鍋子會變出別的字 */}
        <div className="home-places">
          <button className="place place-town" onClick={() => { tap(); onScreen('town') }}>
            <span className="place-icon" aria-hidden>🏡</span>
            <span><b>我的小鎮</b><small>{residents ? `住了 ${residents} 個字` : '寫一個字搬進來'}</small></span>
          </button>
          <button className="place place-lab" onClick={() => { tap(); onScreen('lab') }}>
            <span className="place-icon" aria-hidden>🧪</span>
            <span><b>魔法鍋</b><small>字會變成別的字</small></span>
          </button>
        </div>
        <TodayStars count={todayCount} />
      </div>

      <div className="grid" aria-label="字卡瀏覽">
        {items.map((c, i) => {
          const count = watched[c.char]?.count || 0
          const video = hasPublishedVideo(c)
          return (
            <button
              key={c.char}
              data-char={c.char}
              className={'card' + (video ? ' card-video' : '')}
              style={{ ['--hue' as any]: `var(--c${c.priority % 8})`, ['--i' as any]: i }}
              aria-label={`看「${c.char}」${video ? '，有影片' : ''}${count ? `，看過 ${count} 次` : ''}`}
              onClick={() => { tap(); onPick(c.char) }}
            >
              <span className="card-emoji" aria-hidden="true">{c.emoji || '✨'}</span>
              <span className="card-char">{c.char}</span>
              <span className="card-zhuyin">{c.zhuyin}</span>
              {video && <span className="card-badge" aria-hidden="true">▶ 影片</span>}
              {count > 0 && <span className="card-count">看過 {count} 次</span>}
            </button>
          )
        })}
        {!items.length && <Empty total={total} query={query} filter={filter} onReset={onReset} />}
      </div>
    </div>
  )
}

/** 今天看了幾個字。六歲看不懂累計數字，星星看得懂；滿五顆就換一行重新集。 */
function TodayStars({ count }: { count: number }) {
  if (!count) return null
  const row = count % 5 || 5
  return (
    <div className="today" aria-label={`今天看了 ${count} 個字`}>
      <div className="today-stars" aria-hidden>
        {Array.from({ length: row }, (_, i) => <span key={i} style={{ ['--i' as any]: i }}>⭐</span>)}
      </div>
      <span className="today-label">今天看了 {count} 個字</span>
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
