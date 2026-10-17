import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { boing, cheer, gulp, hic, tap } from '../lib/sfx'
import { taiwanDay } from '../../shared/domain.mjs'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { DISHES, pickDecoy, pickDishes } from './dishes'
import { Confetti, SubBar } from './ui'

/**
 * 餵大怪獸：怪獸說「我要吃火！」，孩子從兩張只有字的卡片裡找出來餵牠。
 * 卡片上沒有圖、沒有顏色：要靠讀字，不是看圖。找對了圖才變出來，那是獎勵。
 * 找錯不是錯：怪獸說「這是水耶！」，翻開給他看那是什麼，再提示正確的那張，一定吃得到。
 */
type Phase = 'hello' | 'ask' | 'oops' | 'chomp' | 'yum' | 'full'

const POSE: Record<Phase, string> = { hello: 'roar', ask: 'idle', oops: 'oops', chomp: 'surprised', yum: 'happy', full: 'happy' }
/** 這句話大概要唸多久（有音檔就用音檔長度），下一句才不會蓋掉它 */
const lasts = (text: string) => (voiceDuration(text) ?? 1.3) * 1000

export default function Feed({ library, progress, onRecall, onPick, onBack }: {
  library: CharEntry[]
  progress: Progress
  /** 這個字第一次就找對了沒有（每個字每輪只記一次） */
  onRecall: (char: string, ok: boolean) => void
  onPick: (char: string) => void
  onBack: () => void
}) {
  const byChar = useMemo(() => new Map(library.map((c) => [c.char, c])), [library])
  // 只考他看過的字
  const pool = useMemo(() => library.filter((c) => progress.watched[c.char]).map((c) => c.char), [library, progress.watched])
  const everyone = useMemo(() => library.map((c) => c.char), [library])
  const newDishes = () => pickDishes(pool, progress, taiwanDay())
  const [dishes, setDishes] = useState(newDishes)
  const [at, setAt] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('hello')
  const [missed, setMissed] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const [eaten, setEaten] = useState<string[]>([])
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const target = dishes[at]
  const entry = target ? byChar.get(target) : undefined

  const serve = (list: string[], i: number) => {
    const char = list[i]
    const decoy = pickDecoy(char, pool, everyone)
    setAt(i)
    setOptions(Math.random() < 0.5 ? [char, decoy] : [decoy, char])
    setMissed(false)
    setWrong(null)
    setPhase('ask')
    later(() => say(LINES.feedAsk(char), 0.8), 350)
  }

  // 一進來先喊肚子餓，再點第一道菜
  useEffect(() => {
    if (!dishes.length) return
    preloadVoice([FIXED_LINES.feedHungry, FIXED_LINES.feedFull, ...dishes.flatMap((c) => [LINES.feedAsk(c), byChar.get(c)?.words?.[0]?.text ?? c])])
    setPhase('hello')
    say(FIXED_LINES.feedHungry, 0.8)
    later(() => serve(dishes, 0), lasts(FIXED_LINES.feedHungry) + 300)
    return () => { clear(); stopSpeech() }
  }, [dishes])

  const pick = (char: string) => {
    if (phase !== 'ask' || char === wrong) return
    if (char === target) {
      if (!missed) onRecall(target, true)
      setPhase('chomp')
      gulp()
      later(() => {
        // 吃到了：圖變出來，唸一個有這個字的詞，把字放回他會說的話
        const word = entry?.words?.[0]?.text ?? target
        setPhase('yum')
        setEaten((e) => [...e, target])
        say(word, 0.8)
        later(() => {
          if (at + 1 < dishes.length) return serve(dishes, at + 1)
          setPhase('full')
          cheer()
          later(() => { hic(); say(FIXED_LINES.feedFull, 0.8) }, 500)
        }, Math.max(1900, lasts(word) + 900))
      }, 650)
      return
    }
    // 點錯：怪獸說那是什麼字，翻開給他看，再點一次菜；正確的那張發亮
    if (!missed) onRecall(target, false)
    setMissed(true)
    setWrong(char)
    setPhase('oops')
    boing()
    say(LINES.feedNotThis(char), 0.8)
    later(() => { setPhase('ask'); say(LINES.feedAsk(target), 0.8) }, lasts(LINES.feedNotThis(char)) + 300)
  }

  const again = () => {
    tap()
    clear()
    setEaten([])
    setDishes(newDishes())
  }

  if (dishes.length < 2) {
    return (
      <div className="feed">
        <SubBar title="🍽️ 餵大怪獸" onBack={onBack} />
        <div className="feed-empty">
          <img className="feed-monster" src="/hero/monster/idle.png" alt="" />
          <p>大怪獸只吃你看過的字。<br />先去看幾個字，再回來餵牠！</p>
          <button className="nav-btn primary" onClick={onBack}>去看字 →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="feed">
      <SubBar title="🍽️ 餵大怪獸" stat={`餵了 ${eaten.length} / ${dishes.length} 道`} onBack={onBack} />
      <div className="feed-plates" aria-label={`已經餵了 ${eaten.length} 道`}>
        {dishes.map((c, i) => (
          <span key={i} className={'feed-plate' + (i < eaten.length ? ' done' : '')}>{i < eaten.length ? byChar.get(eaten[i])?.emoji || '✨' : ''}</span>
        ))}
      </div>

      <div className={`feed-main phase-${phase}`}>
        <section className="feed-stage" aria-live="polite">
          <div className="feed-bubble">
            {phase === 'hello' && '我肚子好餓喔！'}
            {phase === 'ask' && (
              <button className="feed-ask" onClick={() => { tap(); say(LINES.feedAsk(target), 0.8) }} aria-label="再聽一次要吃什麼">
                我要吃…<span aria-hidden>🔊</span>
              </button>
            )}
            {phase === 'oops' && wrong && <>這是「<b>{wrong}</b>」耶！</>}
            {phase === 'chomp' && '啊嗚～'}
            {phase === 'yum' && '好好吃！'}
            {phase === 'full' && '我吃飽了！謝謝你！'}
          </div>
          <img className="feed-monster" src={`/hero/monster/${POSE[phase]}.png`} alt="大怪獸"
            style={{ ['--full' as any]: eaten.length / DISHES }} />
          {/* 預先載入其他表情，換的時候不會閃 */}
          <span className="feed-preload" aria-hidden>
            {Object.values(POSE).map((p) => <img key={p} src={`/hero/monster/${p}.png`} alt="" />)}
          </span>
        </section>

        <section className="feed-table" aria-label="盤子上的字">
          {phase === 'yum' && entry ? (
            <div className="feed-reveal" role="status">
              <span className="feed-reveal-emoji" aria-hidden>{entry.emoji}</span>
              <b className="feed-reveal-char">{entry.char}</b>
              {entry.words?.[0] && <span className="feed-reveal-word">{entry.words[0].emoji} {entry.words[0].text}</span>}
            </div>
          ) : phase === 'full' ? (
            <div className="feed-reveal feed-done" role="status">
              <p className="feed-done-title">今天餵了這些字：</p>
              <div className="feed-done-row">
                {eaten.map((c, i) => (
                  <button key={i} className="feed-done-char" onClick={() => onPick(c)} aria-label={`去看「${c}」`}>
                    <span aria-hidden>{byChar.get(c)?.emoji}</span>{c}
                  </button>
                ))}
              </div>
              <div className="game-actions">
                <button className="nav-btn primary" onClick={again}>🍽️ 再餵一次</button>
                <button className="nav-btn" onClick={onBack}>回字卡</button>
              </div>
              <Confetti />
            </div>
          ) : (
            <div className="feed-cards">
              {options.map((c) => {
                const flipped = c === wrong
                const hint = missed && c === target && phase === 'ask'
                const flying = c === target && phase === 'chomp'
                return (
                  <button key={`${at}-${c}`} className={'feed-card' + (flipped ? ' flipped' : '') + (hint ? ' hint' : '') + (flying ? ' flying' : '')}
                    disabled={phase !== 'ask' || flipped} onClick={() => pick(c)} aria-label={flipped ? `這是「${c}」` : `餵「${c}」`}>
                    {flipped && <span className="feed-card-emoji" aria-hidden>{byChar.get(c)?.emoji}</span>}
                    <span className="feed-card-char">{c}</span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      </div>
      {phase === 'ask' && !missed && at === 0 && <p className="game-hint feed-tip">聽聽看牠要吃哪個字，點那一張餵牠！</p>}
    </div>
  )
}
