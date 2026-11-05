import { useEffect, useMemo, useRef, useState } from 'react'
import type { Act } from '../../shared/spells.mjs'
import * as sfx from '../lib/sfx'
import { ACT_SOUND, CONJURE_MS, MANY, flipFor, inkCenter, inkPath } from './conjuring'
import { emojiArt } from './ui'

/**
 * 變身：他自己寫的那幾筆（不是標準字形，是他的手抖、他的歪）從格子上浮起來、發光、
 * 收攏成一點，「啵」一聲變成那個東西，再照它的意思動（conjuring.ts、shared/spells.mjs）。
 *
 * 蓋在整個畫面上（position: fixed），從 from（描字格子在畫面上的位置）開始演。
 * 不擋點擊：變身的時候他還可以點別的地方，不會卡住。
 */
export type ConjureProps = {
  /** 他寫的每一筆（字座標，Strokes 的 onTraced 給的） */
  strokes: number[][]
  emoji: string
  act: Act
  /** 描字格子在畫面上的位置（getBoundingClientRect） */
  from: { left: number; top: number; width: number; height: number }
  /** 東西演完要停在哪裡（畫面座標）；沒給就演完淡出 */
  land?: { x: number; y: number }
  onDone?: () => void
}

/**
 * 描字格子在畫面上的「字座標框」：hanzi-writer 畫字那一層的矩陣換算，
 * 這樣筆跡浮起來的位置跟他剛剛寫的地方一模一樣（格子有內距，不能直接用 svg 的框）。
 */
export function inkBox(host: Element | null | undefined): ConjureProps['from'] | null {
  const g = host?.querySelector('svg g[transform]') as SVGGElement | null
  const m = g?.getScreenCTM()
  if (!m || !m.a) return null
  return { left: m.e, top: m.f - 900 * m.a, width: 1024 * m.a, height: 1024 * m.a }
}

type Step = 'glow' | 'gather' | 'pop' | 'act' | 'end'

export default function Conjure({ strokes, emoji, act, from, land, onDone }: ConjureProps) {
  const [step, setStep] = useState<Step>('glow')
  const done = useRef(onDone)
  done.current = onDone
  const center = useMemo(() => inkCenter(strokes), [strokes])
  const art = emojiArt(emoji)

  useEffect(() => {
    const t: number[] = []
    let at = 0
    const next = (s: Step, ms: number, fx?: () => void) => {
      at += ms
      t.push(window.setTimeout(() => { setStep(s); try { fx?.() } catch { /* 少一聲沒關係 */ } }, at))
    }
    try { sfx.magic() } catch { /* 同上 */ }
    next('gather', CONJURE_MS.glow, () => sfx.swipe())
    next('pop', CONJURE_MS.gather, () => sfx.poof())
    const sound = () => (sfx as unknown as Record<string, (a?: number, b?: number) => void>)[ACT_SOUND[act]]?.(3, 5)
    // 飛進夥伴嘴裡的：吃到的那一下（動畫 80%）才「咕嚕」
    next('act', CONJURE_MS.pop, () => {
      if (land) t.push(window.setTimeout(() => { try { sound() } catch { /* 同上 */ } }, CONJURE_MS.act * 0.8))
      else sound()
    })
    next('end', CONJURE_MS.act, () => done.current?.())
    return () => t.forEach(clearTimeout)
  }, [])

  // 筆跡收攏的那一點、東西冒出來的地方：他寫的字的重心（換成畫面座標；字座標 y 朝上、基線在 900）
  const sx = from.width / 1024
  const px = from.left + center.x * sx
  const py = from.top + (900 - center.y) * sx
  const size = Math.max(90, Math.min(from.width * 0.62, 260))
  const count = MANY[act] ?? 1
  const thing = art ? <img src={art} alt="" draggable={false} /> : <span className="cj-emoji">{emoji}</span>

  return (
    <div className={`cj cj-${step}`} aria-hidden>
      <svg className="cj-ink" viewBox="0 0 1024 1024"
        style={{ left: from.left, top: from.top, width: from.width, height: from.height, transformOrigin: `${(center.x / 1024) * 100}% ${((900 - center.y) / 1024) * 100}%` }}>
        <g transform="scale(1, -1) translate(0, -900)">
          {strokes.map((s, i) => <path key={i} d={inkPath(s)} style={{ animationDelay: `${i * 40}ms` }} />)}
        </g>
      </svg>
      {(step === 'pop' || step === 'act' || step === 'end') && <span className="cj-flash" style={{ left: px, top: py }} />}
      {(step === 'pop' || step === 'act' || step === 'end') && Array.from({ length: count }, (_, i) => (
        <span key={i} className={`cj-thing cj-act-${act}${count > 1 ? ' many' : ''}${land ? ' cj-land' : ''}${flipFor(emoji, act) ? ' cj-flip' : ''}`}
          style={{
            left: px, top: py, width: size, height: size,
            ['--i' as string]: i, ['--n' as string]: count,
            ...(land ? { ['--dx' as string]: `${land.x - px}px`, ['--dy' as string]: `${land.y - py}px` } : {}),
          }}>
          <span className="cj-body">{thing}</span>
        </span>
      ))}
    </div>
  )
}
