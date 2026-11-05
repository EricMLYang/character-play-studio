import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, sayAll, stopSpeech, voiceDuration } from '../lib/audio'
import { cheer, tap } from '../lib/sfx'
import { taiwanDay } from '../../shared/domain.mjs'
import { SPELL_FIXED } from '../../shared/spells.mjs'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { RADICAL_FIXED } from '../../shared/radicals.mjs'
import Strokes from './Strokes'
import Conjure, { inkBox } from './Conjure'
import Buddy, { useReaction } from './Buddy'
import Stage from './Stage'
import { partnersAt, type Partner } from './partners'
import { pickRound, type Wish } from './wishes'
import Fuse, { type Written } from './Fuse'
import { stopAfter, type Stop, type StopGo } from './today'
import { dwellers } from './magicWorld'
import World from './World'
import { Confetti, SubBar, emojiArt } from './ui'

/**
 * 魔法筆：夥伴許一個願望（「好冷喔，幫我寫一點火！」），他把那個字寫出來，
 * 他寫的筆跡就變成那個東西（Conjure.tsx）。一輪三個願望（wishes.ts 挑字、決定怎麼寫）。
 *
 * 寫字從「看完影片的尾巴」變成「要什麼就寫什麼」的能力——研究上最有效的事（寫、遮起來寫）
 * 剛好是他最少做的事（2026-11-05 看紀錄：描字有史以來 13 次），這個遊戲就是為了把它翻過來。
 * 記成 trace 紀錄：小鎮搬家、長大、星星都跟字卡上描字一樣算。
 */
const RATE = 0.85
const lasts = (text: string) => (voiceDuration(text) ?? 0.28 * [...text].length + 0.5) * 1000
/** 遮起來寫之前給他看多久 */
const PREVIEW_MS = 2200

type Phase = 'ask' | 'write' | 'conjure' | 'thanks' | 'fuse' | 'fused' | 'done'
/** 變出來的東西；blind＝那個字是沒偷看寫出來的（架子上戴一顆星） */
type Made = { char: string; emoji: string; blind?: boolean }

export default function Spell({ library, progress, stars, want, focus, path, onWalk, onTraced, onBack }: {
  library: CharEntry[]
  progress: Progress
  stars: number
  want?: string
  focus?: string[]
  /** 今天的路：做完「寫一寫」這一站，結算多一顆「下一站」 */
  path?: Stop[]
  onWalk?: (go: StopGo) => void
  onTraced: (char: string, strokes: number[][], blind: boolean) => void
  onBack: () => void
}) {
  const [round, setRound] = useState(0)
  // 一輪：三個願望；後兩個湊得成一個詞的話最後合體（wishes.ts 的 pickRound）
  const { wishes, combo } = useMemo(() => pickRound(library, progress, { want: round === 0 ? want : undefined, focus, today: taiwanDay() }), [round])
  /** 這一輪他寫的每個字（合體時並排他自己的筆跡） */
  const writtenRef = useRef<Written[]>([])
  const partner = useMemo<Partner>(() => { const crew = partnersAt(stars); return crew[Math.floor(Math.random() * crew.length)] }, [round])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ask')
  const [made, setMade] = useState<Made[]>([])
  const [conjure, setConjure] = useState<{ key: number; strokes: number[][]; from: ReturnType<typeof inkBox>; land?: { x: number; y: number } } | null>(null)
  const [reaction, react] = useReaction()
  const grid = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const voice = useRef<(() => void) | null>(null)
  const speak = (lines: string[]) => { voice.current?.(); voice.current = sayAll(lines, RATE, 160) }
  useEffect(() => () => { timers.current.forEach(clearTimeout); voice.current?.(); stopSpeech() }, [])

  const wish: Wish | undefined = wishes[index]

  // 這一輪會唸到的話先抓好；第一個願望前先打招呼
  useEffect(() => {
    preloadVoice([SPELL_FIXED.hello, SPELL_FIXED.look, SPELL_FIXED.gone, SPELL_FIXED.done, SPELL_FIXED.world, SPELL_FIXED.again, ...wishes.flatMap((w) => [w.wish, w.thanks, w.char]),
      ...(combo ? [SPELL_FIXED.fuse, combo.word, combo.thanks, RADICAL_FIXED.buildPlus, RADICAL_FIXED.buildMake] : [])])
  }, [wishes])
  useEffect(() => {
    if (!wish) return
    setPhase('ask')
    react('wave')
    const hello = index === 0 && round === 0
    const lines = hello ? [SPELL_FIXED.hello, wish.wish] : [wish.wish]
    speak(lines)
    const helloMs = hello ? lasts(SPELL_FIXED.hello) + 160 : 0
    if (wish.level !== 'blind') {
      // 招呼唸完、願望一開始唸格子就出來（示範邊聽邊看）；不要等整句唸完，六歲等不住
      later(() => setPhase('write'), helloMs + 700)
      return
    }
    // 遮起來寫：願望唸完才出格子，「看一眼，記住喔！」字亮兩秒，「變不見了！你自己寫出來！」
    const at = helloMs + lasts(wish.wish) + 200
    later(() => { setPhase('write'); speak([SPELL_FIXED.look]) }, at)
    later(() => speak([SPELL_FIXED.gone]), at + PREVIEW_MS + 300)
  }, [wish, index, round])

  /** 這一個是沒有偷看、憑記憶寫出來的：謝謝之前先大大誇他一句（小鎮的居民也長大一號） */
  const wroteBlind = useRef(false)
  const written = (strokes: number[][], blind: boolean) => {
    if (!wish) return
    wroteBlind.current = blind
    writtenRef.current = [...writtenRef.current.filter((w) => w.char !== wish.char), { char: wish.char, strokes }]
    onTraced(wish.char, strokes, blind)
    const from = inkBox(grid.current)
    setPhase('conjure')
    say(wish.char, RATE)
    // 好吃的東西飛進夥伴嘴裡（他的頭大約在圖的上三分之一）
    const buddy = wish.act === 'yum' ? document.querySelector('.spell-buddy')?.getBoundingClientRect() : null
    const land = buddy ? { x: buddy.left + buddy.width / 2, y: buddy.top + buddy.height * 0.38 } : undefined
    if (from) setConjure({ key: Date.now(), strokes, from, land })
    else finishConjure()
  }
  const finishConjure = () => {
    if (!wish) return
    setConjure(null)
    setMade((m) => [...m, { char: wish.char, emoji: wish.emoji, blind: wroteBlind.current }])
    setPhase('thanks')
    react('cheer')
    const lines = wroteBlind.current ? [FIXED_LINES.wroteBlind, wish.thanks] : [wish.thanks]
    speak(lines)
    later(() => {
      if (index + 1 < wishes.length) { setIndex(index + 1); return }
      if (fuseParts()) { setPhase('fuse'); return }
      finishRound()
    }, lines.reduce((t, l) => t + lasts(l) + 160, 0) + 700)
  }
  /** 合體要的兩個字（照詞的順序），他都寫了才合 */
  const fuseParts = (): [Written, Written] | null => {
    if (!combo) return null
    const [a, b] = [...combo.word].map((c) => writtenRef.current.find((w) => w.char === c))
    return a && b ? [a, b] : null
  }
  const fused = () => {
    if (!combo) return
    setMade((m) => [...m, { char: combo.word, emoji: combo.emoji }])
    setPhase('fused')
    react('cheer')
    speak([combo.thanks])
    later(finishRound, lasts(combo.thanks) + 700)
  }
  const finishRound = () => {
    cheer()
    setPhase('done')
    speak([SPELL_FIXED.done, SPELL_FIXED.world])
  }

  const again = () => {
    tap()
    timers.current.forEach(clearTimeout)
    timers.current = []
    setMade([])
    writtenRef.current = []
    setIndex(0)
    setRound((r) => r + 1)
  }

  if (!wishes.length) {
    return (
      <div className="spell">
        <SubBar title="🪄 魔法筆" onBack={onBack} />
        <p className="spell-empty">先去看幾個字，魔法筆才知道要變什麼！</p>
      </div>
    )
  }

  // 寫一寫這一站做完了（今天寫滿三個字）：下一站
  const { stopDone, nextStop: next } = stopAfter(path, 'write')
  const showNext = phase === 'done' && stopDone ? next : undefined
  const art = wish ? emojiArt(wish.emoji) : null
  const emojiOf = (c: string) => library.find((e) => e.char === c)?.emoji
  const world = phase === 'done' ? dwellers(progress.town || {}, emojiOf) : []
  return (
    <div className={`spell spell-is-${phase}`} data-combo={combo?.word}>
      <Stage screen="spell" />
      <SubBar title="🪄 魔法筆" onBack={onBack}
        stat={<span className="spell-steps" aria-label={`第 ${Math.min(index + 1, wishes.length)} 個願望`}>
          {wishes.map((w, i) => <span key={w.char} className={i < made.length ? 'spell-on' : i === index && phase !== 'done' ? 'spell-now' : ''} />)}
        </span>} />

      {phase === 'done' ? (
        <div className="spell-done">
          <Confetti />
          <p className="spell-done-title">{SPELL_FIXED.done}</p>
          <p className="spell-done-sub">{SPELL_FIXED.world}</p>
          {/* 他寫過的東西都住在這裡（從小鎮的紀錄推出來），這一輪變出來的從天上掉進來 */}
          <World dwellers={world} fresh={made.map((m) => m.char)} onPick={(c) => { tap(); say(c, RATE) }} />
          <div className="spell-actions">
            {showNext && <button className="spell-btn spell-go" onClick={() => { tap(); stopSpeech(); onWalk?.(showNext.go) }}>下一站：{showNext.icon} {showNext.title} →</button>}
            <button className={'spell-btn' + (showNext ? '' : ' spell-go')} onClick={again}>🪄 再變三個</button>
            <button className="spell-btn" onClick={() => { tap(); onBack() }}>🏠 回首頁</button>
          </div>
        </div>
      ) : wish && (
        <div className="spell-main">
          <div className="spell-friend">
            <button className="spell-bubble" onClick={() => { tap(); speak([wish.wish]) }} aria-label={`再聽一次：${wish.wish}`}>
              {phase === 'fused' && combo ? combo.thanks : phase === 'fuse' ? SPELL_FIXED.fuse
                : phase === 'thanks' ? (made[made.length - 1]?.blind ? `${FIXED_LINES.wroteBlind}${wish.thanks}` : wish.thanks) : wish.wish} <span aria-hidden>🔊</span>
            </button>
            <Buddy hero={partner.id} reaction={reaction} className="spell-buddy" alt={partner.name} />
          </div>
          <div className="spell-pad" ref={grid} data-char={wish.char}>
            {/* 要寫的那個字是什麼東西：給他一個圖當線索（還不會讀「火」的時候，看得到 🔥） */}
            <span className="spell-clue" aria-hidden>{art ? <img src={art} alt="" /> : wish.emoji}</span>
            {phase !== 'ask' && (
              <Strokes key={`${round}-${index}`} char={wish.char}
                startLook={wish.level === 'look'} startBlind={wish.level === 'blind'} preview={wish.level === 'blind' ? PREVIEW_MS : 0}
                onTraced={(strokes, blind) => { if (phase === 'write') written(strokes, blind) }} />
            )}
          </div>
          <div className="spell-shelf" aria-label="變出來的東西">{made.map((m) => (
            <span key={m.char} className="spell-made spell-tiny">{emojiArt(m.emoji) ? <img src={emojiArt(m.emoji)!} alt="" /> : m.emoji}{m.blind && <i className="spell-star">🌟</i>}</span>
          ))}</div>
        </div>
      )}
      {phase === 'fuse' && combo && fuseParts() && <Fuse parts={fuseParts()!} combo={combo} onDone={fused} />}
      {conjure?.from && wish && (
        <Conjure key={conjure.key} strokes={conjure.strokes} emoji={wish.emoji} act={wish.act} from={conjure.from} land={conjure.land} onDone={finishConjure} />
      )}
    </div>
  )
}
