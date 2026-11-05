import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, sayAll, stopSpeech, voiceDuration } from '../lib/audio'
import { cheer, tap } from '../lib/sfx'
import { taiwanDay } from '../../shared/domain.mjs'
import { SPELL_FIXED } from '../../shared/spells.mjs'
import Strokes from './Strokes'
import Conjure, { inkBox } from './Conjure'
import Buddy, { useReaction } from './Buddy'
import Stage from './Stage'
import { partnersAt, type Partner } from './partners'
import { pickWishes, type Wish } from './wishes'
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

type Phase = 'ask' | 'write' | 'conjure' | 'thanks' | 'done'
type Made = { char: string; emoji: string }

export default function Spell({ library, progress, stars, want, onTraced, onBack }: {
  library: CharEntry[]
  progress: Progress
  stars: number
  want?: string
  onTraced: (char: string, strokes: number[][], blind: boolean) => void
  onBack: () => void
}) {
  const [round, setRound] = useState(0)
  const wishes = useMemo(() => pickWishes(library, progress, { want: round === 0 ? want : undefined, today: taiwanDay() }), [round])
  const partner = useMemo<Partner>(() => { const crew = partnersAt(stars); return crew[Math.floor(Math.random() * crew.length)] }, [round])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('ask')
  const [made, setMade] = useState<Made[]>([])
  const [conjure, setConjure] = useState<{ key: number; strokes: number[][]; from: ReturnType<typeof inkBox> } | null>(null)
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
    preloadVoice([SPELL_FIXED.hello, SPELL_FIXED.look, SPELL_FIXED.gone, SPELL_FIXED.done, SPELL_FIXED.again, ...wishes.flatMap((w) => [w.wish, w.thanks, w.char])])
  }, [wishes])
  useEffect(() => {
    if (!wish) return
    setPhase('ask')
    react('wave')
    const hello = index === 0 && round === 0
    const lines = hello ? [SPELL_FIXED.hello, wish.wish] : [wish.wish]
    speak(lines)
    // 招呼唸完、願望一開始唸格子就出來（示範邊聽邊看）；不要等整句唸完，六歲等不住
    later(() => setPhase('write'), (hello ? lasts(SPELL_FIXED.hello) + 160 : 0) + 700)
  }, [wish, index, round])

  const written = (strokes: number[][], blind: boolean) => {
    if (!wish) return
    onTraced(wish.char, strokes, blind)
    const from = inkBox(grid.current)
    setPhase('conjure')
    say(wish.char, RATE)
    if (from) setConjure({ key: Date.now(), strokes, from })
    else finishConjure()
  }
  const finishConjure = () => {
    if (!wish) return
    setConjure(null)
    setMade((m) => [...m, { char: wish.char, emoji: wish.emoji }])
    setPhase('thanks')
    react('cheer')
    speak([wish.thanks])
    later(() => {
      if (index + 1 < wishes.length) { setIndex(index + 1); return }
      cheer()
      setPhase('done')
      speak([SPELL_FIXED.done])
    }, lasts(wish.thanks) + 700)
  }

  const again = () => {
    tap()
    timers.current.forEach(clearTimeout)
    timers.current = []
    setMade([])
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

  const art = wish ? emojiArt(wish.emoji) : null
  return (
    <div className={`spell spell-is-${phase}`}>
      <Stage screen="spell" />
      <SubBar title="🪄 魔法筆" onBack={onBack}
        stat={<span className="spell-steps" aria-label={`第 ${Math.min(index + 1, wishes.length)} 個願望`}>
          {wishes.map((w, i) => <span key={w.char} className={i < made.length ? 'spell-on' : i === index && phase !== 'done' ? 'spell-now' : ''} />)}
        </span>} />

      {phase === 'done' ? (
        <div className="spell-done">
          <Confetti />
          <p className="spell-done-title">{SPELL_FIXED.done}</p>
          <div className="spell-done-row">{made.map((m) => (
            <span key={m.char} className="spell-made">
              {emojiArt(m.emoji) ? <img src={emojiArt(m.emoji)!} alt="" /> : <span>{m.emoji}</span>}
              <b>{m.char}</b>
            </span>
          ))}</div>
          <div className="spell-actions">
            <button className="spell-btn spell-go" onClick={again}>🪄 再變三個</button>
            <button className="spell-btn" onClick={() => { tap(); onBack() }}>🏠 回首頁</button>
          </div>
        </div>
      ) : wish && (
        <div className="spell-main">
          <div className="spell-friend">
            <button className="spell-bubble" onClick={() => { tap(); speak([wish.wish]) }} aria-label={`再聽一次：${wish.wish}`}>
              {phase === 'thanks' ? wish.thanks : wish.wish} <span aria-hidden>🔊</span>
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
            <span key={m.char} className="spell-made spell-tiny">{emojiArt(m.emoji) ? <img src={emojiArt(m.emoji)!} alt="" /> : m.emoji}</span>
          ))}</div>
        </div>
      )}
      {conjure?.from && wish && (
        <Conjure key={conjure.key} strokes={conjure.strokes} emoji={wish.emoji} act={wish.act} from={conjure.from} onDone={finishConjure} />
      )}
    </div>
  )
}
