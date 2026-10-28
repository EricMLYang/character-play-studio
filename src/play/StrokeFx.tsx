import type { CSSProperties } from 'react'
import { along, pathOf, STROKE_THEMES, zigzag, type Point, type Trail } from './strokeThemes'

/** 寫對的一筆：哪一種特效、他手指畫的那條線（相對 .strokes 的位置，px） */
export type Hit = { id: number; theme: Trail; points: Point[] }
/** 整個字寫完：在字的正中間炸開一圈 */
export type Burst = { id: number; theme: Trail; at: Point; size: number }

const css = (vars: Record<string, string | number>) => vars as CSSProperties
const themeOf = (id: Trail) => STROKE_THEMES.find((t) => t.id === id) ?? STROKE_THEMES[0]

/**
 * 寫字特效那一層：整個蓋在描字區上面、不擋手指（pointer-events: none）。
 * 每一筆演完就被 Strokes 拿掉，這裡只負責畫；樣式在 styles/strokefx.css。
 */
export default function StrokeFx({ hits, burst }: { hits: Hit[]; burst: Burst | null }) {
  return (
    <div className="stroke-fx" aria-hidden>
      <svg className="fx-lines">
        {hits.map((h) => <Lines key={h.id} hit={h} />)}
      </svg>
      {hits.map((h) => <Bits key={h.id} hit={h} />)}
      {burst && <BurstRing key={burst.id} burst={burst} />}
    </div>
  )
}

/** 那一條線：pathLength=1，CSS 用 dashoffset 從 1 畫到 0，就是順著他寫的方向一路畫過去 */
function Lines({ hit }: { hit: Hit }) {
  const theme = themeOf(hit.theme)
  if (!theme.line || hit.points.length < 2) return null
  const d = pathOf(hit.points)
  if (hit.theme === 'bolt') {
    const bolt = pathOf(zigzag(hit.points, 10))
    return <g className="fx-trail fx-trail-bolt"><path d={bolt} pathLength={1} /><path className="core" d={bolt} pathLength={1} /></g>
  }
  if (hit.theme === 'rainbow') {
    return (
      <g className="fx-trail fx-trail-rainbow">
        {['#FF6B6B', '#FF9F43', '#FFC53D', '#6BD37B', '#4CC3FF', '#8A6BFF'].map((c, i) => (
          <path key={c} d={d} pathLength={1} style={css({ stroke: c, strokeWidth: 26 - i * 4 })} />
        ))}
      </g>
    )
  }
  return <g className={`fx-trail fx-trail-${hit.theme}`}><path d={d} pathLength={1} /><path className="core" d={d} pathLength={1} /></g>
}

/** 沿著線冒出來的小東西：照筆順方向一個接一個（--i 決定先後） */
function Bits({ hit }: { hit: Hit }) {
  const theme = themeOf(hit.theme)
  const spots = along(hit.points, theme.count)
  if (hit.theme === 'rocket' && hit.points.length > 1) {
    return <>
      <span className="fx-rocket" style={css({ offsetPath: `path('${pathOf(hit.points)}')` })}><span>🚀</span></span>
      {spots.map((p, i) => (
        <span key={i} className="fx-bit fx-bit-rocket" style={css({ left: `${p.x}px`, top: `${p.y}px`, '--i': i, '--n': spots.length })}>💨</span>
      ))}
    </>
  }
  return <>
    {spots.map((p, i) => {
      // 腳印左右交錯踩在線的兩邊；其他的稍微散開一點，不要排成一直線
      const side = hit.theme === 'steps' ? (i % 2 ? 1 : -1) * 14 : ((i * 37) % 11) - 5
      const r = ((p.angle + 90) * Math.PI) / 180
      return (
        <span key={i} className={`fx-bit fx-bit-${hit.theme}`}
          style={css({ left: `${p.x + Math.cos(r) * side}px`, top: `${p.y + Math.sin(r) * side}px`, '--i': i, '--n': spots.length, '--a': `${p.angle}deg`, '--s': (i * 53) % 7 })}>
          {theme.bits[i % theme.bits.length]}
        </span>
      )
    })}
  </>
}

/** 寫完整個字：那一種特效的東西從中間往外炸成一圈 */
function BurstRing({ burst }: { burst: Burst }) {
  const theme = themeOf(burst.theme)
  const n = 14
  return <>
    {Array.from({ length: n }, (_, i) => (
      <span key={i} className={`fx-burst fx-burst-${burst.theme}`}
        style={css({ left: `${burst.at.x}px`, top: `${burst.at.y}px`, '--a': `${(360 * i) / n}deg`, '--d': `${burst.size * (0.42 + (i % 3) * 0.1)}px`, '--i': i })}>
        {i % 2 ? theme.icon : theme.bits[i % theme.bits.length]}
      </span>
    ))}
  </>
}
