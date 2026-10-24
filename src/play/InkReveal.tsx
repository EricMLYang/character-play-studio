import { useEffect, useRef, useState } from 'react'
import { blip } from '../lib/sfx'
import { loadChar, type CharData } from './Strokes'

/**
 * 一筆一筆把字畫出來（餵大怪獸的「神秘料理」，原本是小偵探）：露幾筆就畫幾筆，
 * 要的是「停在第幾筆」，所以不用 hanzi-writer 的動畫，直接把筆順資料畫成 SVG path。
 * 全部畫完呼叫 onDrawn；拿不到筆順資料呼叫 onUnavailable（呼叫端改成一般的點菜）。
 */
/** 每隔多久多畫一筆，跟整個字加起來大概幾秒畫完（筆畫多的字要畫快一點，不然他等不住） */
const STROKE_MS = 950
const WHOLE_MS = 8200
const pace = (total: number) => Math.max(420, Math.min(STROKE_MS, WHOLE_MS / Math.max(total, 1)))

export default function InkReveal({ char, running, onDrawn, onUnavailable }: {
  char: string
  /** 停下來（他猜錯那一下、或已經猜到）就不再多畫 */
  running: boolean
  onDrawn?: () => void
  onUnavailable?: () => void
}) {
  const [data, setData] = useState<CharData | null>(null)
  const [shown, setShown] = useState(0)
  const drawn = useRef(onDrawn)
  drawn.current = onDrawn
  const unavailable = useRef(onUnavailable)
  unavailable.current = onUnavailable

  useEffect(() => {
    let alive = true
    setData(null)
    setShown(0)
    loadChar(char).then((d) => { if (alive) setData(d) }).catch(() => { if (alive) unavailable.current?.() })
    return () => { alive = false }
  }, [char])

  useEffect(() => {
    if (!data || !running) return
    if (shown >= data.strokes.length) { drawn.current?.(); return }
    const t = window.setTimeout(() => { setShown((n) => n + 1); blip() }, shown === 0 ? 650 : pace(data.strokes.length))
    return () => clearTimeout(t)
  }, [data, shown, running])

  const total = data?.strokes.length ?? 0
  return (
    <div className="ink-paper">
      <svg className="ink" viewBox="0 0 1024 1024" aria-label={data ? `已經畫了 ${shown} 筆` : '準備中'}>
        <g transform="translate(0 900) scale(1 -1)">
          {data?.strokes.slice(0, shown).map((d, i) => <path key={i} d={d} className={i === shown - 1 ? 'fresh' : ''} />)}
        </g>
      </svg>
      {!data && <span className="ink-wait" aria-hidden>🔍</span>}
      {total > 0 && (
        <div className="ink-dots" aria-hidden>
          {Array.from({ length: total }, (_, i) => <span key={i} className={i < shown ? 'on' : ''} />)}
        </div>
      )}
    </div>
  )
}

/** 畫完全部筆畫了沒（呼叫端用來決定要不要給提示） */
export const strokesOf = (data: CharData | null) => data?.strokes.length ?? 0
