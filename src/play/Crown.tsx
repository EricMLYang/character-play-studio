import { useEffect, useState } from 'react'
import { boom, cheer, magic, stash } from '../lib/sfx'
import { preloadVoice, sayAll, stopSpeech } from '../lib/audio'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { Confetti } from './ui'

/**
 * 一個字的星星集滿了。
 *
 * 這是這裡最難拿到的東西：同一個字要看過、自己寫、自己認出來、拼進一個詞、還要在魔法鍋變出來，
 * 五件事散在五個地方。開寶箱有一整個畫面，加冕以前只有一顆小藥丸閃一下——不成比例。
 *
 * 星星一顆一顆亮完，皇冠才掉下來戴上去：那幾秒的等待跟寶箱先抖三下是同一件事。
 */
/** 一顆星星亮一下要多久（跟 base.css 的 .crown-stars i 對齊） */
const STAR_MS = 320
/** 最後一顆亮完，皇冠掉下來之前再等一下 */
const BEFORE_HAT = 500

export default function Crown({ char, stars, onClose }: {
  char: string
  /** 這個字總共幾顆星（做得到的全部，不一定是五顆——有些字變不出來、也沒有畫得出來的詞） */
  stars: number
  onClose: () => void
}) {
  const [lit, setLit] = useState(0)
  const [on, setOn] = useState(false)

  useEffect(() => {
    // 加冕可能在遊戲進行到一半跳出來，先把正在唸的那句停掉
    stopSpeech()
    preloadVoice([char, FIXED_LINES.crownFull])
    magic()
    const timers = Array.from({ length: stars }, (_, i) =>
      window.setTimeout(() => { setLit(i + 1); stash() }, i * STAR_MS))
    timers.push(window.setTimeout(() => {
      setOn(true)
      boom()
      cheer()
      sayAll([char, FIXED_LINES.crownFull], 0.85)
    }, stars * STAR_MS + BEFORE_HAT))
    return () => timers.forEach(clearTimeout)
  }, [char, stars])

  return (
    <div className={'crown' + (on ? ' on' : '')} role="dialog" aria-modal="true"
      aria-label={`「${char}」的 ${stars} 顆星星全部集滿了`}>
      <div className="crown-back" />
      {on && <Confetti />}
      <div className="crown-prize">
        <div className="crown-rays" aria-hidden />
        <div className="crown-card">
          <span className="crown-hat" aria-hidden>👑</span>
          <b className="crown-char">{char}</b>
        </div>
        <span className="crown-stars" aria-hidden>
          {Array.from({ length: stars }, (_, i) => (
            <i key={i} className={i < lit ? 'lit' : ''}>⭐</i>
          ))}
        </span>
        {on && <>
          <h2>「<b>{char}</b>」的星星集滿了！</h2>
          <p>{stars} 顆星星，每一顆都是你自己拿到的</p>
          <button className="nav-btn primary" onClick={onClose}>太棒了！</button>
        </>}
      </div>
    </div>
  )
}
