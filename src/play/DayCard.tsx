import { useEffect, useMemo, useRef, useState } from 'react'
import type { Progress } from '../types'
import { holdSpeech, preloadVoice, say } from '../lib/audio'
import { cheer, ladder, magic } from '../lib/sfx'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { DEED_ICON, dayCard } from './todayRecap'
import { Handwriting } from './Glyphs'
import Buddy, { useReaction } from './Buddy'
import { Confetti } from './ui'

/**
 * 今日戰報（todayRecap.ts 有為什麼）：今天的路走完跳出來，蓋在整個畫面上（跟寶箱、加冕一樣）。
 * 字一個一個飛進來，每飛進一個唸一個、響一聲往上爬的音；楊捷睿在旁邊鼓掌。
 */
const EACH_MS = 900

export default function DayCard({ progress, onClose }: { progress: Progress; onClose: () => void }) {
  const chars = useMemo(() => dayCard(progress), [])
  const [shown, setShown] = useState(0)
  const [round, setRound] = useState(0)
  const [reaction, react] = useReaction()
  const timers = useRef<number[]>([])

  useEffect(() => {
    const release = holdSpeech()
    preloadVoice([FIXED_LINES.pathAllDone, FIXED_LINES.dayCard, ...chars.map((c) => c.char)])
    timers.current.forEach(clearTimeout)
    timers.current = []
    setShown(0)
    magic()
    say(FIXED_LINES.pathAllDone, 0.85, 1, true)
    const start = 2300
    timers.current.push(window.setTimeout(() => say(FIXED_LINES.dayCard, 0.85, 1, true), start))
    chars.forEach((c, i) => {
      timers.current.push(window.setTimeout(() => {
        setShown(i + 1)
        ladder(i + 1)
        react('cheer')
        say(c.char, 0.85, 1, true)
      }, start + 1900 + i * EACH_MS))
    })
    timers.current.push(window.setTimeout(cheer, start + 1900 + chars.length * EACH_MS))
    return () => { timers.current.forEach(clearTimeout); release() }
  }, [round])

  return (
    <div className="daycard" role="dialog" aria-modal="true" aria-label="今天的路走完了">
      <div className="chest-back" />
      <Confetti />
      <div className="daycard-card">
        <Buddy className="daycard-hero" hero="yang" pose="happy" reaction={reaction} greet />
        <h2>🎉 今天的路走完了！</h2>
        {chars.length > 0 && <p className="daycard-sub">今天你認識了這些字：</p>}
        <div className="daycard-row">
          {chars.map((c, i) => (
            <div key={`${round}-${c.char}`} className={'daycard-char' + (i < shown ? ' in' : '')} style={{ ['--i' as any]: i }}>
              <span className="daycard-glyph">{c.strokes ? <Handwriting strokes={c.strokes} char={c.char} /> : c.char}</span>
              {c.strokes && <small className="daycard-mine">你寫的</small>}
              <span className="daycard-deeds" aria-label={c.deeds.join('、')}>{c.deeds.map((d) => DEED_ICON[d]).join('')}</span>
            </div>
          ))}
        </div>
        <div className="chest-actions">
          {chars.length > 0 && <button className="nav-btn" onClick={() => setRound((r) => r + 1)}>🔁 再看一次</button>}
          <button className="nav-btn primary" onClick={onClose}>好！</button>
        </div>
      </div>
    </div>
  )
}
