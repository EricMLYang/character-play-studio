import type { ReactNode } from 'react'
import { fxFor, particle } from './radicalFx'
import { emojiArt } from './ui'

/**
 * 把一個部首包起來，讓它演出自己的意思（radicalFx.ts 有為什麼）。
 *
 *   <MeaningFx family="water" on loop><Glyph char="氵" /></MeaningFx>
 *
 * - on：演不演（變身故事裡部首出現的那一刻才打開）
 * - loop：一直演（故事裡）；不 loop 就演一次（找家人找對的那一下、字卡上點部首的時候）
 * - playKey：換一個值就從頭再演一次
 * 沒有特效的家、或系統設定「減少動態效果」時，只顯示原本的部首。
 */
export default function MeaningFx({ family, on = true, loop = false, playKey, small = false, children }: {
  family: string
  on?: boolean
  loop?: boolean
  playKey?: string | number
  /** 小的（字卡上那顆標籤）：粒子少一點、小一點 */
  small?: boolean
  children: ReactNode
}) {
  const fx = fxFor(family)
  if (!fx || !on) return <>{children}</>
  const count = small ? Math.min(fx.count, 3) : fx.count
  return (
    <span key={playKey} className={`mfx mfx-${fx.motion} mfx-glyph-${fx.glyph}` + (loop ? ' loop' : '') + (small ? ' small' : '')}>
      <span className="mfx-glyph">{children}</span>
      <span className="mfx-bits" aria-hidden>
        {Array.from({ length: count }, (_, i) => {
          const p = particle(i, count)
          const art = emojiArt(fx.emoji)
          return (
            <i key={i} style={{ left: `${p.x}%`, animationDelay: `${p.delay}s`, ['--i' as any]: i }}>
              {art ? <img src={art} alt="" draggable={false} /> : fx.emoji}
            </i>
          )
        })}
      </span>
    </span>
  )
}
