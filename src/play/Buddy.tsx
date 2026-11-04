import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { POSES, REACT_MS, poseFor, type Reaction } from './poses'

/**
 * 會動的角色（poses.ts 有為什麼）。四層各管一件事，疊起來才不會互相打架：
 *
 *   .rig            位置與大小（呼叫端的 className 決定）；地上的影子
 *   .rig-body     反應：跳、歪頭、揮手（key 換掉就重演一次）
 *   .rig-breathe  一直在呼吸（從腳底往上微微伸縮）
 *   .rig-look     頭往手指那邊轉
 *
 * 用法：`const [reaction, react] = useReaction()`，答對 `react('cheer')`、點錯 `react('oops')`，
 * 再把 reaction 傳給 <Buddy>。
 */
export type ReactionState = { kind: Reaction; key: number } | null

export function useReaction() {
  const [reaction, setReaction] = useState<ReactionState>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const react = useCallback((kind: Reaction | null) => {
    clearTimeout(timer.current)
    if (!kind) { setReaction(null); return }
    setReaction({ kind, key: Date.now() })
    if (Number.isFinite(REACT_MS[kind])) timer.current = setTimeout(() => setReaction(null), REACT_MS[kind])
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  return [reaction, react] as const
}

export default function Buddy({ hero, pose = 'idle', reaction = null, greet = false, className = '', alt = '', title, onClick }: {
  hero: string
  /** 平常站著的那張（餵大怪獸會自己換：吃飽、睡著…） */
  pose?: string
  reaction?: ReactionState
  /** 一出場先揮手 */
  greet?: boolean
  className?: string
  alt?: string
  title?: string
  onClick?: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [hello, setHello] = useState(greet)
  useEffect(() => {
    if (!hello) return
    const t = setTimeout(() => setHello(false), REACT_MS.wave)
    return () => clearTimeout(t)
  }, [hello])
  const kind: Reaction | null = reaction?.kind ?? (hello ? 'wave' : null)
  const src = `/hero/${hero}/${poseFor(hero, kind, pose)}.png`

  // 自己在畫面上的哪裡（-1..1），頭才知道手指在左邊還是右邊
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const place = () => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--bx', (((r.left + r.width / 2) / Math.max(1, window.innerWidth)) * 2 - 1).toFixed(3))
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])
  // 換姿勢的那一下不能閃白：這位的姿勢圖先全部載好
  useEffect(() => {
    for (const p of POSES[hero] ?? []) { const img = new Image(); img.src = `/hero/${hero}/${p}.png` }
  }, [hero])

  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag ref={box as any} className={`rig ${className}` + (kind ? ` react-${kind}` : '')} onClick={onClick} title={title}
      {...(onClick ? { type: 'button', 'aria-label': alt || title } : {})}>
      <span className="rig-shadow" aria-hidden />
      <span className="rig-body" key={reaction?.key ?? (hello ? 'hello' : 'still')}>
        <span className="rig-breathe">
          <span className="rig-look">
            <img src={src} alt={onClick ? '' : alt} draggable={false} />
          </span>
        </span>
      </span>
      {kind === 'think' && <span className="rig-bubble" aria-hidden>?</span>}
      {kind === 'sleep' && <span className="rig-zzz" aria-hidden><i>z</i><i>z</i><i>Z</i></span>}
      {kind === 'cheer' && <span className="rig-sparks" aria-hidden><i>✦</i><i>✦</i><i>✦</i><i>✦</i></span>}
    </Tag>
  )
}
