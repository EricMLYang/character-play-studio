import { useEffect, useState } from 'react'
import type { Partner } from './partners'
import { boom, cheer, magic } from '../lib/sfx'
import { Confetti } from './ui'

/**
 * 集滿一段星星就開一個寶箱，裡面跳出一位新夥伴（partners.ts）。
 * 箱子先抖三下再爆開——那一秒的等待就是整件事最好玩的地方。
 *
 * 新夥伴不是只拿到一張圖：他馬上會出現在「跳石頭過河」陪他過河。
 */
const SHAKE_MS = 1300

export default function Chest({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    magic()
    const t1 = setTimeout(() => { setOpen(true); boom(); cheer() }, SHAKE_MS)
    return () => clearTimeout(t1)
  }, [partner.id])

  return (
    <div className={'chest' + (open ? ' open' : '')} role="dialog" aria-modal="true"
      aria-label={open ? `${partner.name}來陪你玩了！` : '寶箱要打開了'}>
      <div className="chest-back" />
      {open && <Confetti />}
      {open ? (
        <div className="chest-prize">
          <div className="chest-rays" aria-hidden />
          <img className="chest-hero" src={`/hero/${partner.id}/happy.png`} alt={partner.name} />
          <h2><b>{partner.name}</b>來陪你玩了！</h2>
          <p>牠會在「🌊 跳石頭過河」等你</p>
          <button className="nav-btn primary" onClick={onClose}>太好了！</button>
        </div>
      ) : (
        <div className="chest-box">
          <span className="chest-lid" aria-hidden>🎁</span>
          <p>星星集滿了！寶箱要打開囉…</p>
        </div>
      )}
    </div>
  )
}
