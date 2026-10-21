import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { blip, boing, cheer, magic, tap } from '../lib/sfx'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { loadChar, type CharData } from './Strokes'
import { howFast, pickRounds, rounds, type GuessRound, type Speed } from './guessing'
import { exampleWord } from './puzzles'
import { Confetti, SubBar } from './ui'

/**
 * 小偵探：一筆一筆把字畫出來，猜猜我是誰。越早認出來越厲害。
 *
 * 筆順資料（public/strokes/）直接畫成 SVG，一筆一個 <path>，露幾筆就畫幾筆——
 * 不用 hanzi-writer 的動畫，因為這裡要的是「停在第幾筆」，不是一口氣寫完。
 * 沒有筆順資料的字跳過（那種字連孩子端的描字都沒有）。
 */
/** wait：換題後的頭半秒不收答案，手指還停在上一題的卡片上，不要讓他誤點就答掉下一題 */
type Phase = 'wait' | 'draw' | 'right' | 'wrong' | 'reveal' | 'done'

/** 每隔多久多畫一筆，跟整個字加起來大概幾秒畫完（筆畫多的字要畫快一點，不然他等不住） */
const STROKE_MS = 950
const WHOLE_MS = 8200
/** 換題後多久才開始收答案 */
const READY_MS = 500
const strokePace = (total: number) => Math.max(420, Math.min(STROKE_MS, WHOLE_MS / Math.max(total, 1)))
/** 這句話大概要唸多久 */
const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000

export default function Detective({ library, progress, onRecall, onPick, onBack }: {
  library: CharEntry[]
  progress: Progress
  onRecall: (char: string, ok: boolean) => void
  onPick: (char: string) => void
  onBack: () => void
}) {
  const byChar = useMemo(() => new Map(library.map((c) => [c.char, c])), [library])
  const newRounds = () => pickRounds(library, progress)
  const [list, setList] = useState<GuessRound[]>(newRounds)
  const [at, setAt] = useState(0)
  const [data, setData] = useState<CharData | null>(null)
  /** 已經畫出來幾筆 */
  const [shown, setShown] = useState(0)
  const [phase, setPhase] = useState<Phase>('draw')
  /** 猜錯的那幾張 */
  const [missed, setMissed] = useState<string[]>([])
  const [speed, setSpeed] = useState<Speed | null>(null)
  const [done, setDone] = useState<{ char: string; ok: boolean }[]>([])
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const round = list[at]
  const total = data?.strokes.length ?? 0

  // 這一題的筆順：拿不到就跳過這個字（沒有筆順資料的字畫不出來）
  useEffect(() => {
    if (!round) return
    let alive = true
    setData(null)
    setShown(0)
    setMissed([])
    setSpeed(null)
    setPhase('wait')
    later(() => setPhase('draw'), READY_MS)
    say(FIXED_LINES.guessWho, 0.8)
    preloadVoice([round.char, ...round.options.map((c) => LINES.feedNotThis(c)), exampleWord(byChar.get(round.char)!)?.text])
    loadChar(round.char).then((d) => { if (alive) setData(d) }).catch(() => {
      if (alive) setList((l) => l.filter((r) => r.char !== round.char))
    })
    return () => { alive = false; clear(); stopSpeech() }
  }, [round?.char])

  // 一筆一筆露出來。全部畫完他還沒猜：把答案指出來
  useEffect(() => {
    if (!data || phase !== 'draw') return
    if (shown >= data.strokes.length) {
      later(() => reveal(), 900)
      return
    }
    const t = window.setTimeout(() => { setShown((n) => n + 1); blip() }, shown === 0 ? 650 : strokePace(data.strokes.length))
    timers.current.push(t)
    return () => clearTimeout(t)
  }, [data, shown, phase])

  const record = (ok: boolean) => {
    onRecall(round.char, ok)
    setDone((d) => [...d, { char: round.char, ok }])
  }

  /** 全部畫完還是沒猜到：把對的那張指出來，算沒自己認出來 */
  const reveal = () => {
    if (phase !== 'draw') return
    clear()
    record(false)
    setPhase('reveal')
    say(round.char, 0.8)
    later(next, Math.max(1600, lasts(round.char) + 1200))
  }

  const next = () => {
    clear()
    stopSpeech()
    if (at + 1 < list.length) setAt(at + 1)
    else { setPhase('done'); cheer() }
  }

  const guess = (char: string) => {
    if (phase !== 'draw' || missed.includes(char)) return
    clear()
    if (char !== round.char) {
      setMissed((m) => [...m, char])
      setPhase('wrong')
      boing()
      say(LINES.feedNotThis(char), 0.8)
      later(() => setPhase('draw'), lasts(LINES.feedNotThis(char)) + 320)
      return
    }
    // 猜到了：剩下的筆畫一次補完，再唸字跟一個詞
    const used = Math.max(shown, 1)
    record(missed.length === 0)
    setSpeed(howFast(used, total))
    setShown(total)
    setPhase('right')
    if (used <= 2) magic(); else cheer()
    const word = exampleWord(byChar.get(round.char)!)
    say(round.char, 0.8)
    let t = lasts(round.char) + 360
    if (word) { later(() => say(word.text, 0.8), t); t += lasts(word.text) + 360 }
    later(next, t + 900)
  }

  const again = () => {
    tap()
    clear()
    setAt(0)
    setDone([])
    setList(newRounds())
  }

  if (list.length < 2) {
    return (
      <div className="spy">
        <SubBar title="🔍 小偵探" onBack={onBack} />
        <div className="spy-empty">
          <img className="spy-boss" src="/hero/pig/think.png" alt="" />
          <p>我只畫你看過的字。<br />先去看幾個字，再回來猜！</p>
          <button className="nav-btn primary" onClick={onBack}>去看字 →</button>
        </div>
      </div>
    )
  }

  const result = rounds(done)
  const pose = phase === 'right' ? 'happy' : phase === 'wrong' ? 'surprised' : phase === 'done' ? 'happy' : 'think'
  const word = phase === 'right' ? exampleWord(byChar.get(round?.char ?? '')!) : undefined

  // round 沒了：最後一個字剛好沒有筆順資料被跳掉，直接當作猜完
  if (phase === 'done' || !round) {
    return (
      <div className="spy">
        <SubBar title="🔍 小偵探" stat="猜完了！" onBack={onBack} />
        <div className="spy-done">
          <img className="spy-boss" src="/hero/pig/happy.png" alt="" />
          {result.good.length > 0 ? <>
            <p className="spy-done-title">你自己猜到的字：</p>
            <div className="spy-done-row">
              {result.good.map((c) => (
                <button key={c} className="spy-done-char" onClick={() => onPick(c)} aria-label={`去看「${c}」`}>
                  <span aria-hidden>{byChar.get(c)?.emoji}</span>{c}
                </button>
              ))}
            </div>
          </> : <p className="spy-done-title">下次再來猜猜看！</p>}
          {result.again.length > 0 && (
            <div className="spy-review">
              <span>再去看看 👀</span>
              {result.again.map((c) => (
                <button key={c} className="spy-review-char" onClick={() => onPick(c)} aria-label={`去看「${c}」`}>{c}</button>
              ))}
            </div>
          )}
          <div className="game-actions">
            <button className="nav-btn primary" onClick={again}>🔍 再猜一次</button>
            <button className="nav-btn" onClick={onBack}>回字卡</button>
          </div>
          {result.good.length > 0 && <Confetti />}
        </div>
      </div>
    )
  }

  return (
    <div className="spy">
      <SubBar title="🔍 小偵探" stat={`第 ${at + 1} / ${list.length} 個`} onBack={onBack} />

      <div className={`spy-main phase-${phase}`}>
        <div className="spy-stage">
          <img className="spy-boss" src={`/hero/pig/${pose}.png`} alt="" />
          <div className="spy-bubble">
            {(phase === 'draw' || phase === 'wait') && '猜猜我是誰？'}
            {phase === 'wrong' && <>這是「<b>{missed[missed.length - 1]}</b>」耶！</>}
            {phase === 'right' && speed && <>{speed.icon} {speed.text}</>}
            {phase === 'reveal' && <>是「<b>{round.char}</b>」！</>}
          </div>
        </div>

        {/* 一筆一個 path，露幾筆就畫幾筆。座標是筆順資料的 1024 格、y 朝上 */}
        <div className="spy-paper">
          <svg className="spy-ink" viewBox="0 0 1024 1024" aria-label={phase === 'draw' ? `已經畫了 ${shown} 筆` : `這個字是「${round.char}」`}>
            <g transform="translate(0 900) scale(1 -1)">
              {data?.strokes.slice(0, shown).map((d, i) => (
                <path key={i} d={d} className={i === shown - 1 ? 'fresh' : ''} />
              ))}
            </g>
          </svg>
          {!data && <span className="spy-wait" aria-hidden>🔍</span>}
          {phase === 'draw' && total > 0 && (
            <div className="spy-dots" aria-hidden>
              {Array.from({ length: total }, (_, i) => <span key={i} className={i < shown ? 'on' : ''} />)}
            </div>
          )}
          {word && <span className="spy-word" role="status">{word.emoji} {word.text}</span>}
        </div>

        <div className="spy-cards" aria-label="猜猜看是哪個字">
          {round.options.map((c) => {
            const out = missed.includes(c)
            const win = (phase === 'right' || phase === 'reveal') && c === round.char
            return (
              <button key={`${at}-${c}`} className={'spy-card' + (out ? ' out' : '') + (win ? ' win' : '')}
                disabled={phase !== 'draw' || out} onClick={() => guess(c)}
                aria-label={out ? `「${c}」不是` : `猜「${c}」`}>
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {phase === 'draw' && at === 0 && <p className="game-hint">一筆一筆畫出來，猜到了就點那個字！</p>}
      {phase === 'draw' && at > 0 && shown <= 2 && <p className="game-hint">越早猜到越厲害！</p>}
    </div>
  )
}
