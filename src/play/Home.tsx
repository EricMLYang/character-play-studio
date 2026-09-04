import { useEffect, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { blip, say } from '../lib/audio'

const COLORS = 8

export default function Home({
  items, done, stickerCount, onPick, onStickers,
}: {
  items: CharEntry[]
  done: Set<string>
  stickerCount: number
  onPick: (i: number) => void
  onStickers: () => void
}) {
  const [focus, setFocus] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => { refs.current[focus]?.focus() }, [focus])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const cols = 3
      if (e.key === 'ArrowRight') setFocus((f) => Math.min(items.length - 1, f + 1))
      else if (e.key === 'ArrowLeft') setFocus((f) => Math.max(0, f - 1))
      else if (e.key === 'ArrowDown') setFocus((f) => Math.min(items.length - 1, f + cols))
      else if (e.key === 'ArrowUp') setFocus((f) => Math.max(0, f - cols))
      else return
      blip(520, 0.06)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length])

  return (
    <div className="home">
      <header className="home-bar">
        <div className="progress-dots" aria-label="今天的進度">
          {items.map((c) => (
            <span key={c.char} className={'dot' + (done.has(c.char) ? ' dot-on' : '')} />
          ))}
        </div>
        <button className="sticker-btn" onClick={() => { blip(700); onStickers() }}>
          <span className="sticker-btn-icon">📖</span>
          <span className="sticker-btn-count">{stickerCount}</span>
        </button>
      </header>

      <div className="grid">
        {items.map((c, i) => (
          <button
            key={c.char}
            ref={(el) => { refs.current[i] = el }}
            className={'card' + (done.has(c.char) ? ' card-done' : '')}
            style={{ ['--i' as any]: i, ['--hue' as any]: `var(--c${i % COLORS})` }}
            onMouseEnter={() => setFocus(i)}
            onClick={() => { blip(880); say(c.char); setTimeout(() => onPick(i), 220) }}
          >
            <span className="card-emoji">{c.emoji}</span>
            <span className="card-char">{c.char}</span>
            {c.media?.length ? <span className="card-badge">🎬</span> : null}
            {done.has(c.char) && <span className="card-star">⭐</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
