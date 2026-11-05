import { useEffect, useRef, useState } from 'react'
import type { Combo } from '../../shared/spells.mjs'
import { SPELL_FIXED } from '../../shared/spells.mjs'
import { RADICAL_FIXED } from '../../shared/radicals.mjs'
import { sayAll, voiceDuration } from '../lib/audio'
import * as sfx from '../lib/sfx'
import { ACT_SOUND, CONJURE_MS, MANY, inkPath } from './conjuring'
import { emojiArt } from './ui'

/**
 * 合體魔法（shared/spells.mjs 的 COMBOS）：他剛寫的兩個字（他自己的筆跡）並排成一張詞卡，
 * 「等一下！這兩個字合在一起，會變成什麼？」→ 兩個字滑到一起 →「月，加上，餅，變成，月餅！」→ 啵！🥮
 * 動作跟單字的變身共用 conjure.css 的 .cj-act-*。
 */
const RATE = 0.85
const lasts = (t: string) => (voiceDuration(t) ?? 0.28 * [...t].length + 0.5) * 1000
type Step = 'show' | 'join' | 'pop' | 'act' | 'end'
export type Written = { char: string; strokes: number[][] }

export default function Fuse({ parts, combo, onDone }: { parts: [Written, Written]; combo: Combo; onDone: () => void }) {
  const [step, setStep] = useState<Step>('show')
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    const t: number[] = []
    let stop: (() => void) | null = null
    let at = 0
    const after = (ms: number, fn: () => void) => { at += ms; t.push(window.setTimeout(fn, at)) }
    try { sfx.magic() } catch { /* 少一聲沒關係 */ }
    stop = sayAll([SPELL_FIXED.fuse], RATE)
    const line = [parts[0].char, RADICAL_FIXED.buildPlus, parts[1].char, RADICAL_FIXED.buildMake, combo.word]
    after(lasts(SPELL_FIXED.fuse) + 300, () => { setStep('join'); try { sfx.swipe() } catch { /* 同上 */ } stop = sayAll(line, RATE, 140) })
    // 唸到「變成」的時候啵出來，唸出詞的時候東西已經在了
    after(line.slice(0, 4).reduce((n, l) => n + lasts(l) + 140, 0), () => { setStep('pop'); try { sfx.poof() } catch { /* 同上 */ } })
    after(CONJURE_MS.pop, () => {
      setStep('act')
      try { (sfx as unknown as Record<string, (a?: number, b?: number) => void>)[ACT_SOUND[combo.act]]?.(3, 5) } catch { /* 同上 */ }
    })
    after(Math.max(CONJURE_MS.act, lasts(combo.word) + 400), () => { setStep('end'); done.current() })
    return () => { t.forEach(clearTimeout); stop?.() }
  }, [])

  const art = emojiArt(combo.emoji)
  const count = MANY[combo.act] ?? 1
  const thing = art ? <img src={art} alt="" draggable={false} /> : <span className="cj-emoji">{combo.emoji}</span>
  const popped = step === 'pop' || step === 'act' || step === 'end'
  return (
    <div className={`fuse fuse-${step} cj cj-${step === 'show' || step === 'join' ? 'glow' : step}`} aria-label={combo.word}>
      <div className="fuse-card">
        {parts.map((p, i) => (
          <svg key={p.char} className={`fuse-ink fuse-ink-${i}`} viewBox="0 0 1024 1024" aria-hidden>
            <g transform="scale(1, -1) translate(0, -900)">{p.strokes.map((s, k) => <path key={k} d={inkPath(s)} />)}</g>
          </svg>
        ))}
        <span className="fuse-plus" aria-hidden>＋</span>
      </div>
      {popped && <span className="cj-flash" style={{ left: '50%', top: '50%' }} />}
      {popped && Array.from({ length: count }, (_, i) => (
        <span key={i} className={`cj-thing cj-act-${combo.act}${count > 1 ? ' many' : ''}`}
          style={{ left: '50%', top: '50%', width: 'min(38vh, 300px)', height: 'min(38vh, 300px)', ['--i' as string]: i, ['--n' as string]: count }}>
          <span className="cj-body">{thing}</span>
        </span>
      ))}
      {popped && <b className="fuse-word">{combo.word}</b>}
    </div>
  )
}
