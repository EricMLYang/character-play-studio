import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { boing, cheer, drum, gulp, hic, tap } from '../lib/sfx'
import { taiwanDay } from '../../shared/domain.mjs'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { DISHES, pickDecoy, pickDishes, recap, requeue } from './dishes'
import { Confetti, SubBar } from './ui'

/**
 * 餵大怪獸：怪獸說「我要吃火！」，孩子從兩張只有字的卡片裡找出來餵牠。
 * 卡片上沒有圖、沒有顏色：要靠讀字，不是看圖。找對了，卡片上才變出圖，怪獸把那個圖吃掉，那是獎勵。
 * 找錯不是錯：怪獸說「這是水耶！」，翻開給他看那是什麼，再提示正確的那張，一定吃得到；
 * 這個字隔兩道菜會再上一次，讓他自己再找一次。
 * 最後怪獸只把他自己找對的字一個一個唸出來，靠提示才吃到的放在旁邊「再去看看」。
 */
type Phase = 'hello' | 'ask' | 'oops' | 'got' | 'chomp' | 'yum' | 'recap' | 'full'

const POSE: Record<Phase, string> = { hello: 'roar', ask: 'idle', oops: 'oops', got: 'surprised', chomp: 'surprised', yum: 'happy', recap: 'happy', full: 'happy' }
/** 這句話大概要唸多久（有音檔就用音檔長度），下一句才不會蓋掉它 */
const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000
/** 句子之間的空拍：固定長度，聽起來才有節奏 */
const BEAT = 380
/** 點完菜他還沒選，隔多久再提醒一次、最多提醒幾次 */
const REMIND_AFTER = 4500
const REMINDERS = 2

type Served = { char: string; ok: boolean }

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
  // 這一輪實際上的菜：點錯的字會再插進來一次
  const [queue, setQueue] = useState(dishes)
  const [at, setAt] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('hello')
  const [missed, setMissed] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const [served, setServed] = useState<Served[]>([])
  /** 結算時正在唸第幾個字 */
  const [reading, setReading] = useState(-1)
  const recorded = useRef(new Set<string>())
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const target = queue[at]
  const entry = target ? byChar.get(target) : undefined
  const wordOf = (c: string) => byChar.get(c)?.words?.[0]?.text ?? c
  const record = (char: string, ok: boolean) => {
    if (recorded.current.has(char)) return
    recorded.current.add(char)
    onRecall(char, ok)
  }

  /**
   * 有節奏地點菜：咚、咚 →「我要吃火！」→「火！」→「火！」。
   * 題目字一次唸三遍，他還沒點就隔一下整段再唸，最多提醒 REMINDERS 次。
   */
  const ask = (char: string, reminders = REMINDERS, lead = 0) => {
    let t = lead
    later(drum, t)
    later(drum, t + 200)
    t += 520
    for (const text of [LINES.feedAsk(char), char, char]) {
      later(() => say(text, 0.8), t)
      t += lasts(text) + BEAT
    }
    if (reminders > 0) later(() => ask(char, reminders - 1), t + REMIND_AFTER)
  }

  const serve = (list: string[], i: number) => {
    const char = list[i]
    const decoy = pickDecoy(char, pool, everyone)
    setAt(i)
    setOptions(Math.random() < 0.5 ? [char, decoy] : [decoy, char])
    setMissed(false)
    setWrong(null)
    setPhase('ask')
    ask(char, REMINDERS, 350)
  }

  /** 吃完了：「我吃到了這些字！」，再把他自己找對的字一個一個唸出來，最後打個嗝說吃飽了 */
  const finish = (all: Served[]) => {
    const { good } = recap(all)
    cheer()
    const full = () => { setReading(-1); setPhase('full'); hic(); say(FIXED_LINES.feedFull, 0.8) }
    if (!good.length) { setPhase('full'); later(full, 500); return }
    setPhase('recap')
    let t = 500
    later(() => say(FIXED_LINES.feedRecap, 0.8), t)
    t += lasts(FIXED_LINES.feedRecap) + BEAT
    good.forEach((c, i) => {
      later(() => { setReading(i); say(c, 0.8) }, t)
      t += Math.max(lasts(c), 500) + BEAT
    })
    later(full, t + 200)
  }

  // 一進來先喊肚子餓，再點第一道菜
  useEffect(() => {
    if (!dishes.length) return
    preloadVoice([FIXED_LINES.feedHungry, FIXED_LINES.feedFull, FIXED_LINES.feedRecap, ...dishes.flatMap((c) => [LINES.feedAsk(c), c, wordOf(c)])])
    recorded.current = new Set()
    setQueue(dishes)
    setServed([])
    setReading(-1)
    setPhase('hello')
    say(FIXED_LINES.feedHungry, 0.8)
    later(() => serve(dishes, 0), lasts(FIXED_LINES.feedHungry) + 300)
    return () => { clear(); stopSpeech() }
  }, [dishes])

  const pick = (char: string) => {
    if (phase !== 'ask' || char === wrong) return
    clear()   // 還沒唸完的題目與提醒都停掉
    if (char === target) {
      record(target, !missed)
      // 找到了：卡片上變出圖，唸一個有這個字的詞，把字放回他會說的話
      const word = wordOf(target)
      const all = [...served, { char: target, ok: !missed }]
      setPhase('got')
      say(word, 0.8)
      const shown = Math.max(1300, lasts(word) + 300)
      // 怪獸把圖吃掉，盤子上出現那個圖
      later(() => { setPhase('chomp'); gulp() }, shown)
      later(() => { setServed(all); setPhase('yum') }, shown + 650)
      later(() => (at + 1 < queue.length ? serve(queue, at + 1) : finish(all)), shown + 650 + 900)
      return
    }
    // 點錯：怪獸說那是什麼字，翻開給他看，再點一次菜；正確的那張發亮。這個字等一下會再上一次
    record(target, false)
    if (!missed) setQueue((q) => requeue(q, at, target))
    setMissed(true)
    setWrong(char)
    setPhase('oops')
    boing()
    say(LINES.feedNotThis(char), 0.8)
    const pause = lasts(LINES.feedNotThis(char)) + BEAT
    later(() => setPhase('ask'), pause)
    ask(target, REMINDERS, pause)
  }

  const again = () => {
    tap()
    clear()
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

  const { good, again: review } = recap(served)
  const done = phase === 'recap' || phase === 'full'
  /** 這道是剛剛點錯、再上一次的字 */
  const encore = queue.indexOf(target) < at

  return (
    <div className="feed">
      <SubBar title="🍽️ 餵大怪獸" stat={`餵了 ${served.length} / ${queue.length} 道`} onBack={onBack} />
      <div className="feed-plates" aria-label={`已經餵了 ${served.length} 道`}>
        {queue.map((c, i) => (
          <span key={i} className={'feed-plate' + (i < served.length ? ' done' : '') + (queue.indexOf(c) < i ? ' encore' : '')}>
            {i < served.length ? byChar.get(served[i].char)?.emoji || '✨' : ''}
          </span>
        ))}
      </div>

      <div className={`feed-main phase-${phase}`}>
        <section className="feed-stage" aria-live="polite">
          <div className="feed-bubble">
            {phase === 'hello' && '我肚子好餓喔！'}
            {phase === 'ask' && (
              <button className="feed-ask" onClick={() => { tap(); clear(); ask(target, 1) }} aria-label="再聽一次要吃什麼">
                我要吃…<span aria-hidden>🔊</span>
              </button>
            )}
            {phase === 'oops' && wrong && <>這是「<b>{wrong}</b>」耶！</>}
            {phase === 'got' && '哇！'}
            {phase === 'chomp' && '啊嗚～'}
            {phase === 'yum' && '好好吃！'}
            {phase === 'recap' && (reading >= 0 ? <>「<b>{good[reading]}</b>」！</> : '我吃到了這些字！')}
            {phase === 'full' && '我吃飽了！謝謝你！'}
          </div>
          <img className="feed-monster" src={`/hero/monster/${POSE[phase]}.png`} alt="大怪獸"
            style={{ ['--full' as any]: Math.min(1, served.length / DISHES) }} />
          {/* 預先載入其他表情，換的時候不會閃 */}
          <span className="feed-preload" aria-hidden>
            {[...new Set(Object.values(POSE))].map((p) => <img key={p} src={`/hero/monster/${p}.png`} alt="" />)}
          </span>
        </section>

        <section className="feed-table" aria-label="盤子上的字">
          {done ? (
            <div className="feed-reveal feed-done" role="status">
              {good.length > 0 ? <>
                <p className="feed-done-title">你自己找到的字：</p>
                <div className="feed-done-row">
                  {good.map((c, i) => (
                    <button key={c} className={'feed-done-char' + (i === reading ? ' reading' : '')} onClick={() => onPick(c)} aria-label={`去看「${c}」`}>
                      <span aria-hidden>{byChar.get(c)?.emoji}</span>{c}
                    </button>
                  ))}
                </div>
              </> : <p className="feed-done-title">下次再來找找看！</p>}
              {review.length > 0 && phase === 'full' && (
                <div className="feed-review">
                  <span>再去看看 👀</span>
                  {review.map((c) => (
                    <button key={c} className="feed-review-char" onClick={() => onPick(c)} aria-label={`去看「${c}」`}>{c}</button>
                  ))}
                </div>
              )}
              {phase === 'full' && (
                <div className="game-actions">
                  <button className="nav-btn primary" onClick={again}>🍽️ 再餵一次</button>
                  <button className="nav-btn" onClick={onBack}>回字卡</button>
                </div>
              )}
              {phase === 'full' && good.length > 0 && <Confetti />}
            </div>
          ) : phase === 'yum' ? null : (
            <div className="feed-pick">
              <div className="feed-cards">
                {options.map((c) => {
                  const flipped = c === wrong
                  const hint = missed && c === target && phase === 'ask'
                  const mine = c === target && (phase === 'got' || phase === 'chomp')
                  const gone = c !== target && (phase === 'got' || phase === 'chomp')
                  return (
                    <button key={`${at}-${c}`}
                      className={'feed-card' + (flipped ? ' flipped' : '') + (hint ? ' hint' : '') + (mine ? ' got' : '') + (mine && phase === 'chomp' ? ' eaten' : '') + (gone ? ' gone' : '')}
                      disabled={phase !== 'ask' || flipped} onClick={() => pick(c)} aria-label={flipped ? `這是「${c}」` : `餵「${c}」`}>
                      {(flipped || mine) && <span className="feed-card-emoji" aria-hidden>{byChar.get(c)?.emoji}</span>}
                      <span className="feed-card-char">{c}</span>
                    </button>
                  )
                })}
              </div>
              {phase === 'got' && entry?.words?.[0] && (
                <span className="feed-got-word" role="status">{entry.words[0].emoji} {entry.words[0].text}</span>
              )}
            </div>
          )}
        </section>
      </div>
      {phase === 'ask' && !missed && at === 0 && <p className="game-hint feed-tip">聽聽看牠要吃哪個字，點那一張餵牠！</p>}
      {phase === 'ask' && encore && !missed && <p className="game-hint feed-tip">剛剛那個字又來了，這次自己找找看！</p>}
    </div>
  )
}
