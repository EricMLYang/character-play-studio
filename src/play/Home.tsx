import { useEffect, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { blip, say } from '../lib/audio'
import { hasPublishedVideo } from '../../shared/selection.mjs'

const COLORS = 8

export default function Home({
  items, done, stickerCount, onPick, onStickers, mode, onModeChange, page, onPageChange,
}: {
  items: CharEntry[]
  done: Set<string>
  stickerCount: number
  onPick: (i: number) => void
  onStickers: () => void
  mode: 'all' | 'auto'
  onModeChange: (mode: 'all' | 'auto') => void
  page: number
  onPageChange: (page: number) => void
}) {
  const [focus, setFocus] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const pages = Math.max(1, Math.ceil(items.length / 6))
  const currentPage = Math.min(page, pages - 1)
  const visible = items.slice(currentPage * 6, currentPage * 6 + 6)
  useEffect(() => { setFocus(0) }, [currentPage, mode])

  useEffect(() => { refs.current[focus]?.focus() }, [focus])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cols = 3
      if (!(e.target instanceof HTMLElement) || !e.target.closest('.card')) return
      if (e.key === 'ArrowRight') setFocus((f) => Math.min(visible.length - 1, f + 1))
      else if (e.key === 'ArrowLeft') setFocus((f) => Math.max(0, f - 1))
      else if (e.key === 'ArrowDown') setFocus((f) => Math.min(visible.length - 1, f + cols))
      else if (e.key === 'ArrowUp') setFocus((f) => Math.max(0, f - cols))
      else return
      e.preventDefault()
      blip(520, 0.06)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible.length])

  return (
    <div className="home">
      <header className="home-bar">
        <div className="home-modes" aria-label="選字方式">
          <button aria-pressed={mode === 'all'} onClick={() => onModeChange('all')}>我自己挑</button>
          <button aria-pressed={mode === 'auto'} onClick={() => onModeChange('auto')}>幫我挑</button>
        </div>
        <button className="sticker-btn" onClick={() => { blip(700); onStickers() }}>
          <span className="sticker-btn-icon">📖</span>
          <span className="sticker-btn-count">{stickerCount}</span>
        </button>
      </header>
      <p className="home-hint">{mode === 'all' ? '想看哪個就點哪個，看過也可以再看！' : '幫你挑好這幾個，有影片的先看！'} <span>🎬 有影片　⭐ 今天看過</span></p>

      <div className="grid">
        {visible.map((c, i) => (
          <button
            key={c.char}
            aria-label={`看「${c.char}」${hasPublishedVideo(c) ? '，有影片' : ''}${done.has(c.char) ? '，今天看過，可再看' : ''}`}
            ref={(el) => { refs.current[i] = el }}
            className={'card' + (done.has(c.char) ? ' card-done' : '')}
            style={{ ['--i' as any]: i, ['--hue' as any]: `var(--c${i % COLORS})` }}
            onMouseEnter={() => setFocus(i)}
            onClick={() => { blip(880); say(c.char); onPick(currentPage * 6 + i) }}
          >
            <span className="card-emoji">{c.emoji}</span>
            <span className="card-char">{c.char}</span>
            {hasPublishedVideo(c) ? <span className="card-badge">🎬</span> : null}
            {done.has(c.char) && <span className="card-star">⭐</span>}
          </button>
        ))}
      </div>
      {!items.length && <p className="home-hint">字庫還沒有字，請大人先加入。</p>}
      {pages > 1 && <nav className="home-pages" aria-label="字庫翻頁">
        <button disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>← 上一頁</button>
        <span>第 {currentPage + 1} / {pages} 頁</span>
        <button disabled={currentPage === pages - 1} onClick={() => onPageChange(currentPage + 1)}>下一頁 →</button>
      </nav>}
    </div>
  )
}
