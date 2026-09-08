import type { CharEntry, Progress } from '../types'
import { hasPublishedVideo } from '../../shared/selection.mjs'
import type { Filter } from './PlayApp'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'video', label: '有影片' },
  { id: 'unwatched', label: '還沒看過' },
]

export default function Home({
  items, total, watched, query, onQuery, filter, onFilter, onPick,
}: {
  items: CharEntry[]
  total: number
  watched: Progress['watched']
  query: string
  onQuery: (q: string) => void
  filter: Filter
  onFilter: (f: Filter) => void
  onPick: (char: string) => void
}) {
  return (
    <div className="home">
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
        <a className="home-studio" href="/studio">Studio</a>
      </header>

      <div className="grid">
        {items.map((c) => {
          const count = watched[c.char]?.count || 0
          const video = hasPublishedVideo(c)
          return (
            <button
              key={c.char}
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
        {!items.length && <p className="home-empty">{total ? '沒有符合的字，換個關鍵字試試。' : '字庫還沒有字，請先到 Studio 加入。'}</p>}
      </div>
    </div>
  )
}
