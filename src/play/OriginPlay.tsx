import { useEffect, useState } from 'react'
import { holdSpeech, sayAll, stopSpeech } from '../lib/audio'
import { magic, tap } from '../lib/sfx'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { ORIGINS, strokeTiming } from './origins'

/**
 * 「以前長這樣」（origins.ts 有為什麼）：蓋在字卡上的一張卡。
 *   1. 簡筆圖一筆一筆畫出來（約一秒半），唸「火！以前長這樣！」
 *   2. 圖淡下去、縮到後面，現在的字從前面浮出來，兩個疊在一起停著給他比
 * 點「再看一次」從頭演；點外面或「好」關掉。
 */
type Step = 'draw' | 'morph'

export default function OriginPlay({ char, onClose }: { char: string; onClose: () => void }) {
  const lines = ORIGINS[char] ?? []
  const timing = strokeTiming(lines.length)
  const drawn = (timing.at(-1)?.delay ?? 0) + (timing.at(-1)?.dur ?? 0)
  const [round, setRound] = useState(0)
  const [step, setStep] = useState<Step>('draw')
  // 背後的字卡還活著（影片、筆順示範會自己往下走、會講話）：開著的時候壓住它的聲音、影片先暫停
  useEffect(() => {
    const release = holdSpeech()
    document.querySelectorAll('video').forEach((v) => v.pause())
    return release
  }, [])
  useEffect(() => {
    setStep('draw')
    const stop = sayAll([char, FIXED_LINES.originSay], 0.8, 120, true)
    const t = window.setTimeout(() => { setStep('morph'); magic() }, drawn + 1300)
    return () => { clearTimeout(t); stop(); stopSpeech() }
  }, [round])
  return (
    <div className="origin" role="dialog" aria-label={`「${char}」以前長這樣`} onClick={onClose}>
      <div className="origin-card" onClick={(e) => e.stopPropagation()}>
        <div key={round} className={'origin-stage step-' + step}>
          <svg className="origin-pic" viewBox="0 0 100 100" aria-hidden>
            {lines.map((d, i) => (
              <path key={i} d={d} pathLength={1} style={{ animationDelay: `${timing[i].delay}ms`, animationDuration: `${timing[i].dur}ms` }} />
            ))}
          </svg>
          <span className="origin-char" aria-hidden>{char}</span>
        </div>
        <p className="origin-say">{step === 'draw' ? '以前長這樣！' : `後來變成「${char}」`}</p>
        <div className="origin-actions">
          <button className="nav-btn" onClick={() => { tap(); setRound((r) => r + 1) }}>🔁 再看一次</button>
          <button className="nav-btn primary" onClick={onClose}>好！</button>
        </div>
      </div>
    </div>
  )
}
