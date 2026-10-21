import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { boing, cheer, splash, tap, whoosh } from '../lib/sfx'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { crosserFor, forgetCrossRequest, pickCrossing, trip, type Step } from './crossing'
import { partnersAt, skyFor } from './partners'
import { Confetti, SubBar } from './ui'

/**
 * 跳石頭過河：主角要到對岸去拿牠想要的東西，河上一排一排的石頭，每顆上面一個字。
 * 聽到「跳到『火』！」就踩那一顆；踩錯噗通掉進水裡，看清楚那是什麼字，再跳一次。
 *
 * 其他遊戲都是「答對一題、再答一題」，這裡多了一件事：看得到自己走到哪、還有多遠。
 * 五顆石頭跳完就上岸拿到東西，那是整趟的獎勵，不是每一題的獎勵。
 *
 * 考的能力跟餵大怪獸一樣（聽音認字），規則也共用（crossing.ts → dishes.ts），
 * 所以同一個字的記住程度只有一套，在哪個遊戲認出來都算數。
 */
type Phase = 'ready' | 'ask' | 'oops' | 'hop' | 'arrive' | 'done'

/** 這句話大概要唸多久（有音檔就用音檔長度），下一句才不會蓋掉它 */
const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000
/** 句子之間的空拍 */
const BEAT = 360
/** 說完他還沒點，隔多久再說一次、最多幾次 */
const REMIND_AFTER = 5000
const REMINDERS = 2
/** 再說完還是沒點：對的那顆石頭發亮，不要讓他卡在河中間 */
const HINT_AFTER = 4000
/** 跳一次要多久（跟 river.css 的 .river-hero transition 對齊） */
const HOP_MS = 520

/** 過幾次河了：換一次主角。一開機先隨機挑一位，不然每次打開都是同一隻 */
let trips = Math.floor(Math.random() * 100)

export default function River({ library, progress, stars, onRecall, onPick, onBack }: {
  library: CharEntry[]
  progress: Progress
  /** 總共幾顆星星：決定有哪幾位夥伴可以陪他過河（partners.ts） */
  stars: number
  /** 這個字第一次就跳對了沒有（每個字每趟只記一次） */
  onRecall: (char: string, ok: boolean) => void
  onPick: (char: string) => void
  onBack: () => void
}) {
  const byChar = useMemo(() => new Map(library.map((c) => [c.char, c])), [library])
  const newCrossing = () => pickCrossing(library, progress)
  const [steps, setSteps] = useState<Step[]>(newCrossing)
  const crew = partnersAt(stars)
  const [hero, setHero] = useState(() => crosserFor(trips, crew))
  // 指定的那一位只算這一趟。清在掛載後，不是 useState 的初始值裡——
  // StrictMode 會把初始值算兩次，在那裡清會讓第二次拿不到
  useEffect(() => forgetCrossRequest, [])
  /**
   * 這一趟是為了什麼：「小老鼠想要起司！」。對岸那個東西本來就畫在那裡，
   * 但他讀不到那幾個字——十八位夥伴各有一句，同一個玩法換一位就換一個理由。
   * 句子的字面在 shared/voice-lines.mjs 的 PARTNER_WANTS（音檔先做好），測試會擋住兩邊對不上。
   */
  const wish = `${hero.name}想要${hero.want}！`
  const [at, setAt] = useState(0)
  const [phase, setPhase] = useState<Phase>('ready')
  /** 這一步已經提示過了（算沒自己認出來） */
  const [missed, setMissed] = useState(false)
  /** 踩到水裡的那顆石頭 */
  const [sunk, setSunk] = useState<string[]>([])
  /** 主角站在這一排的第幾顆石頭上（-1 是還在岸上） */
  const [lane, setLane] = useState(-1)
  const [jumped, setJumped] = useState<{ char: string; ok: boolean }[]>([])
  const recorded = useRef(new Set<string>())
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  // 排好的提醒觸發時要看「現在」是第幾步、有沒有提示過
  const now = useRef({ at, missed })
  now.current = { at, missed }
  const step = steps[at]

  const record = (char: string, ok: boolean) => {
    if (recorded.current.has(char)) return
    recorded.current.add(char)
    onRecall(char, ok)
  }

  /** 說要跳到哪個字，他沒反應就再說一次，最後讓對的那顆發亮 */
  const ask = (char: string, reminders = REMINDERS, lead = 0) => {
    let t = lead
    for (const text of [LINES.riverJump(char), char]) {
      later(() => say(text, 0.8), t)
      t += lasts(text) + BEAT
    }
    if (reminders > 0) later(() => ask(char, reminders - 1), t + REMIND_AFTER)
    else later(() => hint(char), t + HINT_AFTER)
  }

  const hint = (char: string) => {
    if (now.current.missed) return
    record(char, false)
    setMissed(true)
    tap()
  }

  const start = (list: Step[], i: number) => {
    setAt(i)
    setMissed(false)
    setSunk([])
    setPhase('ask')
    ask(list[i].char, REMINDERS, 300)
  }

  /** 上岸：拿到對岸的東西，彩帶，再把他自己跳對的字唸一遍 */
  const arrive = (all: { char: string; ok: boolean }[]) => {
    setPhase('arrive')
    setLane(-1)
    whoosh()
    later(() => {
      cheer()
      say(FIXED_LINES.riverArrive, 0.8)
    }, HOP_MS)
    const { good, again: review } = trip(all)
    let t = HOP_MS + lasts(FIXED_LINES.riverArrive) + BEAT
    // 五顆都自己跳對：先講這件事，這是一趟裡最值得講的
    if (good.length === all.length && !review.length && all.length >= 2) {
      later(() => say(FIXED_LINES.riverPerfect, 0.8), t)
      t += lasts(FIXED_LINES.riverPerfect) + BEAT
    }
    if (good.length) {
      later(() => say(FIXED_LINES.riverRecap, 0.8), t)
      t += lasts(FIXED_LINES.riverRecap) + BEAT
      good.forEach((c) => {
        later(() => say(c, 0.8), t)
        t += Math.max(lasts(c), 500) + BEAT
      })
    }
    later(() => setPhase('done'), HOP_MS + 900)
  }

  // 一趟開始：主角在岸上說要過河，再開始第一步
  useEffect(() => {
    if (steps.length < 2) return
    preloadVoice([wish, FIXED_LINES.riverArrive, FIXED_LINES.riverRecap, FIXED_LINES.riverPerfect,
      ...steps.flatMap((s) => [LINES.riverJump(s.char), s.char, LINES.feedNotThis(s.char)])])
    recorded.current = new Set()
    setAt(0)
    setLane(-1)
    setJumped([])
    setSunk([])
    setMissed(false)
    setPhase('ready')
    say(wish, 0.8)
    later(() => start(steps, 0), lasts(wish) + 300)
    return () => { clear(); stopSpeech() }
  }, [steps])

  const jump = (char: string, i: number) => {
    if (phase !== 'ask' || sunk.includes(char)) return
    clear()
    if (char !== step.char) {
      // 踩錯：那顆沉下去，說清楚那是什麼字，對的那顆發亮，再跳一次
      record(step.char, false)
      setMissed(true)
      setSunk((s) => [...s, char])
      setPhase('oops')
      splash()
      say(LINES.feedNotThis(char), 0.8)
      const pause = lasts(LINES.feedNotThis(char)) + BEAT
      later(() => setPhase('ask'), pause)
      ask(step.char, REMINDERS, pause)
      return
    }
    record(step.char, !missed)
    const all = [...jumped, { char: step.char, ok: !missed }]
    setJumped(all)
    setLane(i)
    setPhase('hop')
    boing()
    // 跳到哪就站在哪：下一排石頭出來的時候他還在河中間，才像真的在過河
    later(() => {
      if (at + 1 < steps.length) start(steps, at + 1)
      else arrive(all)
    }, HOP_MS + 380)
  }

  const again = () => {
    tap()
    clear()
    trips += 1
    setHero(crosserFor(trips, partnersAt(stars)))
    setSteps(newCrossing())
  }

  if (steps.length < 2) {
    return (
      <div className={`river sky-${skyFor(hero)}`}>
        <SubBar title="🌊 跳石頭過河" onBack={onBack} />
        <div className="river-empty">
          <img className="river-hero-img" src={`/hero/${hero.id}/idle.png`} alt="" />
          <p>石頭上只會放你看過的字。<br />先去看幾個字，再回來過河！</p>
          <button className="nav-btn primary" onClick={onBack}>去看字 →</button>
        </div>
      </div>
    )
  }

  const { good, again: review } = trip(jumped)
  const pose = phase === 'oops' ? 'surprised' : phase === 'hop' ? 'happy' : phase === 'arrive' || phase === 'done' ? 'happy' : 'idle'
  const done = phase === 'done'

  return (
    <div className={`river sky-${skyFor(hero)}`}>
      <SubBar title="🌊 跳石頭過河" stat={done ? '過河了！' : `第 ${at + 1} / ${steps.length} 顆`} onBack={onBack} />

      {/* 還有多遠：一眼看得出走到哪、對岸有什麼在等 */}
      <div className="river-trail" aria-label={`跳到第 ${jumped.length} 顆，一共 ${steps.length} 顆`}>
        <span className="trail-bank" aria-hidden>🏝️</span>
        {steps.map((s, i) => (
          <span key={i} className={'trail-dot' + (i < jumped.length ? ' done' : '') + (i === at && !done ? ' here' : '')} aria-hidden>
            {i < jumped.length ? (jumped[i].ok ? '⭐' : '🪨') : ''}
          </span>
        ))}
        <span className={'trail-goal' + (done ? ' got' : '')} aria-hidden>{hero.goal}</span>
      </div>

      <div className={`river-stage phase-${phase}`}>
        <div className="river-sky" aria-hidden>
          <span className="river-cloud" /><span className="river-cloud" /><span className="river-cloud" />
          {/* 下雪的河才有雪花，晚上的河才有星星（天色看 partners.ts 的 skyFor） */}
          {Array.from({ length: 9 }, (_, i) => <span key={i} className="river-flake" style={{ ['--i' as any]: i }} />)}
        </div>
        <div className="river-water" aria-hidden><span /><span /><span /></div>

        {/* 主角是石頭那一排的小孩：--lane 就是第幾欄，位置照格線算，石頭多寬都對得準 */}
        <div className="river-stones" aria-label={done ? '走過的石頭' : '河上的石頭'}
          style={{ ['--lanes' as any]: (done ? jumped.length : step?.stones.length) || 2, ['--lane' as any]: lane }}>
          <div className="river-bank left" aria-hidden />
          <div className={'river-bank right' + (done ? ' got' : '')} aria-hidden><span>{hero.goal}</span></div>

          <div className={'river-hero' + (phase === 'arrive' || done ? ' landed' : lane < 0 ? ' ashore' : '')}>
            <img className="river-hero-img" src={`/hero/${hero.id}/${pose}.png`} alt={hero.name} />
            <div className="river-bubble">
              {phase === 'ready' && <>我要過河！<span aria-hidden>{hero.goal}</span></>}
              {phase === 'ask' && (
                <button className="river-say" onClick={() => { tap(); clear(); ask(step.char, 1) }} aria-label="再聽一次要跳到哪個字">
                  跳到…<span aria-hidden>🔊</span>
                </button>
              )}
              {phase === 'oops' && <>這是「<b>{sunk[sunk.length - 1]}</b>」耶！</>}
              {phase === 'hop' && '呼！'}
              {(phase === 'arrive' || done) && <>拿到{hero.want}了！</>}
            </div>
          </div>

          {/* 上岸之後：剛剛踩過的五顆留在河上，變成他走過來的那條路 */}
          {done && jumped.map((j, i) => (
            <span key={i} className={'stone stood walked' + (j.ok ? ' mine' : '')} style={{ ['--i' as any]: i }}>
              <span className="stone-char">{j.char}</span>
            </span>
          ))}
          {!done && step.stones.map((c, i) => {
            const gone = sunk.includes(c)
            const lit = missed && c === step.char && phase === 'ask'
            const stood = phase === 'hop' && c === step.char
            return (
              <button key={`${at}-${c}`} className={'stone' + (gone ? ' sunk' : '') + (lit ? ' lit' : '') + (stood ? ' stood' : '')}
                disabled={phase !== 'ask' || gone} onClick={() => jump(c, i)}
                aria-label={gone ? `「${c}」沉下去了` : `跳到「${c}」`}>
                <span className="stone-char">{c}</span>
              </button>
            )
          })}
        </div>

        {done && good.length > 0 && <Confetti />}

        {/* 預先載入其他表情，換的時候不會閃 */}
        <span className="river-preload" aria-hidden>
          {['idle', 'happy', 'surprised', 'dizzy'].map((p) => <img key={p} src={`/hero/${hero.id}/${p}.png`} alt="" />)}
        </span>
      </div>

      {done && (
        <div className="river-done" role="status">
          {good.length > 0 ? <>
            <p className="river-done-title">你自己跳對的字：</p>
            <div className="river-done-row">
              {good.map((c) => (
                <button key={c} className="river-done-char" onClick={() => onPick(c)} aria-label={`去看「${c}」`}>
                  <span aria-hidden>{byChar.get(c)?.emoji}</span>{c}
                </button>
              ))}
            </div>
          </> : <p className="river-done-title">下次再來跳跳看！</p>}
          {review.length > 0 && (
            <div className="river-review">
              <span>再去看看 👀</span>
              {review.map((c) => (
                <button key={c} className="river-review-char" onClick={() => onPick(c)} aria-label={`去看「${c}」`}>{c}</button>
              ))}
            </div>
          )}
          <div className="game-actions">
            <button className="nav-btn primary" onClick={again}>🌊 再過一次河</button>
            <button className="nav-btn" onClick={onBack}>回字卡</button>
          </div>
        </div>
      )}

      {phase === 'ask' && at === 0 && !missed && <p className="game-hint">聽聽看要跳到哪個字，點那一顆石頭！</p>}
      {phase === 'ask' && missed && <p className="game-hint">跳到發亮的那一顆！</p>}
    </div>
  )
}
