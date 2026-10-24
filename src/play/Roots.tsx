import { useEffect, useMemo, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { blip, boing, cheer, magic, tap, whoosh } from '../lib/sfx'
import { LINES } from '../../shared/voice-lines.mjs'
import { RADICAL_FIXED, RADICAL_LINES } from '../../shared/radicals.mjs'
import { loadChar } from './Strokes'
import { familiesIn, familyFor, foundIn, nameFamilies, pickFinds, storyMembers, type Family, type FindRound } from './families'
import { PARTNERS } from './partners'
import { Confetti, SubBar, hueVar } from './ui'

/**
 * 部首家族：一個部首原本是什麼字、怎麼變身成部首、家裡住了哪些字、它們有什麼共同點。
 *
 * - 大廳：每一家一棟房子，門牌是部首；最上面一條是「你的名字住在哪三家」
 * - 變身故事：圖 → 原本的字 → 變身成部首 → 家人一個一個出來（部首那幾筆亮藍色）→ 共同點。全程唸出來
 * - 找家人：三張字卡裡哪一張有這個部首？找到的家人飛進房子，記一筆 radical 紀錄
 *
 * 內容（每一家的故事、每個家人為什麼住這裡）在 shared/radicals.mjs，規則在 families.ts。
 */
type Screen = { kind: 'hall' } | { kind: 'story'; family: Family } | { kind: 'find'; family: Family } | { kind: 'done'; family: Family }
type Stage = 'origin' | 'change' | 'members' | 'common' | 'end'

/** 這句話大概要唸多久 */
const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000
/** 句子之間的空拍 */
const BEAT = 360
const RATE = 0.8

export default function Roots({ library, progress, want, onFind, onPick, onBack }: {
  library: CharEntry[]
  progress: Progress
  want?: string
  onFind: (family: string, char: string, ok: boolean) => void
  onPick: (char: string) => void
  onBack: () => void
}) {
  const families = useMemo(() => familiesIn(library), [library])
  const [screen, setScreen] = useState<Screen>(() => {
    const family = want ? familyFor(want, families) : undefined
    return family ? { kind: 'story', family } : { kind: 'hall' }
  })
  const hue = (family: Family) => families.indexOf(family) % 8
  const total = families.reduce((n, f) => n + foundIn(f, progress), 0)
  const toHall = () => { stopSpeech(); setScreen({ kind: 'hall' }) }

  return (
    <div className="roots">
      <SubBar title="🏠 部首家族" stat={`找到 ${total} 個家人`}
        onBack={screen.kind === 'hall' ? onBack : toHall} backLabel={screen.kind === 'hall' ? '← 回字卡' : '← 回部首家族'} />
      {screen.kind === 'hall' && <Hall families={families} progress={progress} hue={hue} onOpen={(family) => setScreen({ kind: 'story', family })} />}
      {screen.kind === 'story' && (
        <Story key={screen.family.id} family={screen.family} lead={want} progress={progress} hue={hue(screen.family)}
          onFind={() => setScreen({ kind: 'find', family: screen.family })} onHall={toHall} onPick={onPick} />
      )}
      {screen.kind === 'find' && (
        <Find key={screen.family.id} family={screen.family} families={families} progress={progress} hue={hue(screen.family)}
          onFind={onFind} onDone={() => setScreen({ kind: 'done', family: screen.family })} />
      )}
      {screen.kind === 'done' && (
        <Done family={screen.family} progress={progress} hue={hue(screen.family)}
          onAgain={() => setScreen({ kind: 'find', family: screen.family })} onHall={toHall} />
      )}
    </div>
  )
}

/** 一個字一筆一筆寫出來；glow 的話部首那幾筆是藍色（筆順資料的 radStrokes 就是部首） */
function Glyph({ char, glow = false, color = '#2E2A26' }: { char: string; glow?: boolean; color?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [missing, setMissing] = useState(false)
  useEffect(() => {
    const host = box.current
    if (!host) return
    let alive = true
    setMissing(false)
    loadChar(char).then((data) => {
      if (!alive) return
      const size = Math.max(60, Math.min(host.clientWidth, host.clientHeight))
      const writer = HanziWriter.create(host, char, {
        width: size, height: size, padding: Math.round(size * 0.06),
        showCharacter: false, showOutline: false, strokeColor: color,
        radicalColor: glow ? '#0F7FA8' : null,
        strokeAnimationSpeed: 2.2, delayBetweenStrokes: 60,
        charDataLoader: () => data,
      })
      writer.animateCharacter()
    }).catch(() => { if (alive) setMissing(true) })
    return () => { alive = false; host.replaceChildren() }
  }, [char, glow, color])
  return <div className="roots-glyph" ref={box}>{missing && <span>{char}</span>}</div>
}

/** 部首本身的樣子（變成部首後的那一個） */
const shapeOf = (family: Family) => family.forms[family.forms.length - 1]

function Hall({ families, progress, hue, onOpen }: {
  families: Family[]
  progress: Progress
  hue: (family: Family) => number
  onOpen: (family: Family) => void
}) {
  const name = PARTNERS[0].name
  const homes = useMemo(() => nameFamilies(name, families), [name, families])
  const timers = useRef<number[]>([])
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => {
    say(RADICAL_FIXED.hello, RATE)
    preloadVoice([RADICAL_FIXED.hello, RADICAL_FIXED.nameHome, ...families.map((f) => RADICAL_LINES.home(f))])
    return () => { clear(); stopSpeech() }
  }, [])
  const sayName = () => {
    clear()
    stopSpeech()
    let t = 0
    const lines = [RADICAL_FIXED.nameHome, ...homes.flatMap((h) => [h.char, RADICAL_LINES.home(h.family)])]
    for (const line of lines) { timers.current.push(window.setTimeout(() => say(line, RATE), t)); t += lasts(line) + BEAT }
  }
  return (
    <div className="roots-hall">
      {homes.length > 0 && (
        <div className="roots-name">
          <button className="roots-name-say" onClick={sayName} aria-label="聽你的名字住在哪裡">🔊</button>
          {homes.map((h) => (
            <button key={h.char} className="roots-name-home" style={{ ['--hue' as any]: hueVar(hue(h.family)) }}
              onClick={() => { tap(); onOpen(h.family) }} aria-label={`${h.char}住在${h.family.name}的家`}>
              <b>{h.char}</b><span>{h.family.emoji} {h.family.name}</span>
            </button>
          ))}
        </div>
      )}
      <div className="roots-houses">
        {families.map((family) => {
          const found = foundIn(family, progress)
          return (
            <button key={family.id} className={'roots-house' + (found >= family.list.length ? ' full' : '')}
              style={{ ['--hue' as any]: hueVar(hue(family)) }} onClick={() => { tap(); say(RADICAL_LINES.home(family), RATE); onOpen(family) }}>
              <span className="roots-roof" aria-hidden />
              <span className="roots-house-emoji" aria-hidden>{family.emoji}</span>
              <b className="roots-house-shape">{shapeOf(family)}</b>
              <span className="roots-house-name">{family.name}</span>
              <span className="roots-house-count">{found >= family.list.length ? '👑 ' : ''}{found} / {family.list.length}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 變身故事：一句一句唸、畫面跟著換。時間照音檔長度排，他按「跳過」就直接到結尾。
 * 家人那一排可以點，點了重唸那個字和它住這裡的原因。
 */
function Story({ family, lead, progress, hue, onFind, onHall, onPick }: {
  family: Family
  /** 從哪個字的字卡點進來：那個字第一個出場 */
  lead?: string
  progress: Progress
  hue: number
  onFind: () => void
  onHall: () => void
  onPick: (char: string) => void
}) {
  const members = useMemo(() => storyMembers(family, progress, lead), [family, lead, progress.watched])
  const [stage, setStage] = useState<Stage>('origin')
  const [shown, setShown] = useState(0)
  const timers = useRef<number[]>([])
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const at = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)) }

  const play = () => {
    clear()
    stopSpeech()
    setStage('origin')
    setShown(0)
    let t = 300
    at(t, () => { say(family.intro, RATE); boing() })
    t += lasts(family.intro) + BEAT
    at(t, () => { setStage('change'); magic(); say(family.change, RATE) })
    t += Math.max(lasts(family.change), 1600) + BEAT
    at(t, () => setStage('members'))
    members.forEach((c, i) => {
      at(t, () => { setShown(i + 1); blip(); say(c.char, RATE) })
      t += Math.max(lasts(c.char), 600) + 200
      at(t, () => say(family.members[c.char], RATE))
      t += lasts(family.members[c.char]) + BEAT
    })
    at(t, () => { setStage('common'); cheer(); say(family.common, RATE) })
    t += lasts(family.common) + BEAT
    at(t, () => setStage('end'))
  }
  useEffect(() => {
    preloadVoice([family.intro, family.change, family.common, ...members.flatMap((c) => [c.char, family.members[c.char]])])
    play()
    return () => { clear(); stopSpeech() }
  }, [family.id])

  const skip = () => { clear(); stopSpeech(); setShown(members.length); setStage('end') }
  const replay = (c: CharEntry) => {
    stopSpeech()
    say(c.char, RATE)
    window.setTimeout(() => say(family.members[c.char], RATE), Math.max(lasts(c.char), 600) + 200)
  }
  const changed = stage !== 'origin'
  const origin = family.forms.length > 1 ? family.forms[0] : undefined

  return (
    <div className={`roots-story stage-${stage}`} style={{ ['--hue' as any]: hueVar(hue) }}>
      <div className="roots-change">
        <span className="roots-picture" aria-hidden>{family.emoji}</span>
        {origin && <div className={'roots-origin' + (changed ? ' gone' : '')}><Glyph char={origin} color="#2E2A26" /></div>}
        {origin && <span className={'roots-arrow' + (changed ? ' on' : '')} aria-hidden>➜</span>}
        <div className={'roots-shape' + (changed || !origin ? ' on' : '')}>
          {(changed || !origin) && <Glyph char={shapeOf(family)} color="#0F7FA8" />}
          <span className="roots-shape-name">{family.name}</span>
        </div>
      </div>
      <div className="roots-members">
        {members.slice(0, shown).map((c) => (
          <button key={c.char} className="roots-member" onClick={() => replay(c)} aria-label={`${c.char}：${family.members[c.char]}`}>
            <span className="roots-member-emoji" aria-hidden>{c.emoji}</span>
            <Glyph char={c.char} glow />
            <span className="roots-member-why">{family.members[c.char]}</span>
          </button>
        ))}
      </div>
      {stage === 'common' || stage === 'end' ? <p className="roots-common">{family.common}</p> : <p className="roots-common" aria-hidden />}
      <div className="roots-actions">
        {stage === 'end' ? (
          <>
            <button className="roots-btn" onClick={() => { tap(); play() }}>🔁 再看一次</button>
            <button className="roots-btn go" onClick={() => { tap(); onFind() }}>🔍 找家人</button>
            <button className="roots-btn" onClick={() => { tap(); onHall() }}>🏠 換一家</button>
          </>
        ) : (
          <button className="roots-btn" onClick={skip}>跳過 ⏭</button>
        )}
        {stage === 'end' && members[0] && (
          <button className="roots-btn ghost" onClick={() => onPick(members[0].char)}>看「{members[0].char}」的字卡</button>
        )}
      </div>
    </div>
  )
}

/** 找家人：三張字卡選一張有這個部首的，找到就飛進房子 */
function Find({ family, families, progress, hue, onFind, onDone }: {
  family: Family
  families: Family[]
  progress: Progress
  hue: number
  onFind: (family: string, char: string, ok: boolean) => void
  onDone: () => void
}) {
  const [rounds] = useState<FindRound[]>(() => pickFinds(family, families, progress))
  const [index, setIndex] = useState(0)
  const [missed, setMissed] = useState<string[]>([])
  const [right, setRight] = useState(false)
  const [home, setHome] = useState<string[]>([])
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const round = rounds[index]
  const ask = RADICAL_LINES.ask(family)

  useEffect(() => {
    preloadVoice([ask, RADICAL_FIXED.play, ...rounds.flatMap((r) => [r.char, family.members[r.char], ...r.options.map((c) => LINES.feedNotThis(c))])])
    say(RADICAL_FIXED.play, RATE)
    later(() => say(ask, RATE), lasts(RADICAL_FIXED.play) + BEAT)
    return () => { timers.current.forEach(clearTimeout); stopSpeech() }
  }, [])

  // 每一家至少兩個家人（families.ts 的 MIN_MEMBERS），不會沒有題目
  if (!round) return null

  const pick = (char: string) => {
    if (right || missed.includes(char)) return
    stopSpeech()
    if (char !== round.char) {
      boing()
      setMissed((m) => [...m, char])
      say(LINES.feedNotThis(char), RATE)
      return
    }
    setRight(true)
    whoosh()
    onFind(family.id, char, missed.length === 0)
    say(char, RATE)
    later(() => say(family.members[char], RATE), Math.max(lasts(char), 600) + 200)
    later(() => {
      setHome((h) => [...h, char])
      if (index + 1 >= rounds.length) { cheer(); onDone(); return }
      setIndex(index + 1)
      setMissed([])
      setRight(false)
      say(ask, RATE)
    }, Math.max(lasts(char), 600) + 200 + lasts(family.members[char]) + 600)
  }

  return (
    <div className="roots-find" style={{ ['--hue' as any]: hueVar(hue) }}>
      <button className="roots-find-house" onClick={() => say(ask, RATE)} aria-label={ask}>
        <span className="roots-roof" aria-hidden />
        <div className="roots-find-shape"><Glyph char={shapeOf(family)} color="#0F7FA8" /></div>
        <span className="roots-house-name">{family.name}的家 🔊</span>
        <span className="roots-find-home">{home.map((c) => <b key={c}>{c}</b>)}</span>
      </button>
      <div className="roots-find-cards">
        {round.options.map((c) => (
          <button key={`${index}-${c}`} disabled={missed.includes(c)}
            className={'roots-card' + (missed.includes(c) ? ' wrong' : '') + (right && c === round.char ? ' right' : '')}
            onClick={() => pick(c)} aria-label={c}>
            {right && c === round.char ? <Glyph char={c} glow /> : <span className="roots-card-char">{c}</span>}
          </button>
        ))}
      </div>
      <p className="roots-find-step">{index + 1} / {rounds.length}</p>
    </div>
  )
}

/** 家族大合照：這一家他找到的家人全部站出來 */
function Done({ family, progress, hue, onAgain, onHall }: {
  family: Family
  progress: Progress
  hue: number
  onAgain: () => void
  onHall: () => void
}) {
  const found = family.list.filter((c) => progress.radicals?.[family.id]?.[c.char])
  useEffect(() => {
    say(RADICAL_FIXED.allFound, RATE)
    const t = window.setTimeout(() => say(family.common, RATE), lasts(RADICAL_FIXED.allFound) + BEAT)
    return () => { clearTimeout(t); stopSpeech() }
  }, [])
  return (
    <div className="roots-done" style={{ ['--hue' as any]: hueVar(hue) }}>
      <Confetti />
      <div className="roots-photo">
        <span className="roots-roof" aria-hidden />
        <b className="roots-house-shape">{shapeOf(family)}</b>
        <div className="roots-photo-row">{found.map((c, i) => (
          <span key={c.char} className="roots-photo-member" style={{ ['--i' as any]: i }}>
            <span aria-hidden>{c.emoji}</span><b>{c.char}</b>
          </span>
        ))}</div>
      </div>
      <p className="roots-common">{family.common}</p>
      <div className="roots-actions">
        <button className="roots-btn go" onClick={() => { tap(); onAgain() }}>🔍 再找一次</button>
        <button className="roots-btn" onClick={() => { tap(); onHall() }}>🏠 換一家</button>
      </div>
    </div>
  )
}
