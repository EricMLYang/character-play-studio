import { useEffect, useState } from 'react'
import type { Partner } from './partners'
import { boom, cheer, magic } from '../lib/sfx'
import { holdSpeech, preloadVoice, say } from '../lib/audio'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { Confetti } from './ui'

/**
 * 集滿一段星星就開一個寶箱，裡面跳出一位新夥伴（partners.ts）。
 * 箱子先抖三下再爆開——那一秒的等待就是整件事最好玩的地方。
 *
 * 新夥伴不是只拿到一張圖：他馬上會來餵大怪獸幫他端菜。
 */
const SHAKE_MS = 1300

export default function Chest({ partner, onGo, onClose }: {
  partner: Partner
  /** 馬上去找牠（新夥伴真的會來端菜，不是只拿到一張圖） */
  onGo: () => void
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // 寶箱可能在遊戲進行到一半時跳出來（剛好集滿）：那個遊戲還活著、計時器照跑，
    // 不壓下來的話箱子在抖、背後還在唸「跳到火！」，而且它會蓋掉「哇！新朋友來了！」
    const release = holdSpeech()
    preloadVoice([FIXED_LINES.chestOpen])
    magic()
    const t1 = setTimeout(() => { setOpen(true); boom(); cheer(); say(FIXED_LINES.chestOpen, 0.85, 1, true) }, SHAKE_MS)
    return () => { clearTimeout(t1); release() }
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
          <p>牠會來「🍽️ 餵大怪獸」幫你端菜</p>
          <div className="chest-actions">
            {/* 說了牠在河邊等，就要能馬上去——不然這句話只是一行字 */}
            <button className="nav-btn primary" onClick={onGo}>🍽️ 去找牠！</button>
            <button className="nav-btn" onClick={onClose}>等一下再去</button>
          </div>
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
