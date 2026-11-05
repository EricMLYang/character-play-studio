import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, sayAll, stopSpeech, voiceDuration } from '../lib/audio'
import { cheer, stroke as strokeTone, tap } from '../lib/sfx'
import { taiwanDay } from '../../shared/domain.mjs'
import { SPELLS, SPELL_FIXED } from '../../shared/spells.mjs'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { RADICAL_FIXED, familyOf } from '../../shared/radicals.mjs'
import Strokes, { loadChar } from './Strokes'
import Conjure, { inkBox } from './Conjure'
import Buddy, { useReaction, type ReactionState } from './Buddy'
import { partnersAt, type Partner } from './partners'
import { LEVEL_BADGE, levelAfter, nextStep, pickRound, powerOf, writeLevel, type Round, type Wish, type WriteLevel } from './wishes'
import Fuse, { type Written } from './Fuse'
import { stopAfter, type Stop, type StopGo } from './today'
import { dwellers, type Dweller } from './magicWorld'
import World from './World'
import { Confetti, SubBar, emojiArt } from './ui'
import { inkPath } from './conjuring'
import { holdCelebrations } from './hold'

/**
 * 魔法筆：寫出來，就變出來（docs/overnight/2026-11-06/PLAN.md）。
 *
 * 寫字從「看完影片的尾巴」變成「要什麼就寫什麼」的能力——研究上最有效的事（寫、遮起來寫）
 * 剛好是他最少做的事（2026-11-05 看紀錄：描字有史以來 13 次），這個遊戲就是為了把它翻過來。
 *
 * 一輪三個願望（wishes.ts 的 pickRound 挑字）：
 *   選   「你想先變哪一個？」三張圖卡，圖底下是字，他自己挑（剩一個就不用選）
 *   許願  夥伴說願望（「好冷喔，幫我寫一點火！」）
 *   寫   照這個字的魔法等級寫（✏️ 描 → 👀 看一眼 → 🙈 遮起來 → 🧙 聽寫，wishes.ts 的 writeLevel）
 *   變身  他寫的筆跡變成那個東西（Conjure.tsx），演完掉進背景他的魔法世界（World.tsx）
 *   謝謝  夥伴道謝；升級了、沒偷看就寫出來了都多誇一句
 *   合體  後兩個字湊得成一個詞就合起來（Fuse.tsx：火＋山＝火山）
 * 記成 trace 紀錄（小鎮搬家、長大、星星都跟字卡上描字一樣算）；合體記成 fuse。
 * 一輪還在演的時候，加冕、寶箱先等（hold.ts）。
 */
const RATE = 0.85
const lasts = (text: string) => (voiceDuration(text) ?? 0.28 * [...text].length + 0.5) * 1000
/** 遮起來寫之前給他看多久 */
const PREVIEW_MS = 2200
/** 寫字的時候多久沒動作算卡住（遮起來寫要先看兩秒、想一下，所以不能太短） */
const STUCK_MS = 15000
/** 結算點他寫的字重寫一次：每一筆隔多久 */
const REDRAW_MS = 320

/**
 * 這個字為什麼住在它的部首家（shared/radicals.mjs 的 members）。變出來的東西跟那句講的不是同一件事的不說：
 * 熊變出來是一隻熊，那句卻是「熊熊大火」；根變出來是紅蘿蔔，那句講的是樹根——會搞混。
 */
const WHY_SKIP = new Set(['熊', '根'])
const radicalWhy = (char: string) => (WHY_SKIP.has(char) ? undefined : familyOf(char)?.members[char])

type Phase = 'choose' | 'ask' | 'write' | 'conjure' | 'thanks' | 'fuse' | 'fused' | 'done'
/** 變出來的東西；blind＝那個字是沒偷看寫出來的（架子上戴一顆星） */
type Made = { char: string; emoji: string; blind?: boolean }

export default function Spell({ library, progress, stars, want, focus, path, onWalk, onTraced, onFused, onBack }: {
  library: CharEntry[]
  progress: Progress
  stars: number
  want?: string
  focus?: string[]
  /** 今天的路：做完「寫一寫」這一站，結算多一顆「下一站」 */
  path?: Stop[]
  onWalk?: (go: StopGo) => void
  onTraced: (char: string, strokes: number[][], blind: boolean) => void
  /** 合體合出一個詞（記下來，魔法世界裡一直住著它） */
  onFused?: (word: string) => void
  onBack: () => void
}) {
  const [round, setRound] = useState(0)
  /** 他自己挑的下一個（結算時「我想變別的」）：下一輪從這個字開始 */
  const [wantNext, setWantNext] = useState<string | undefined>(undefined)
  const [picker, setPicker] = useState(false)
  /** 結算時預告的下一輪（「再變三個」按鈕上露出來的那三個）：按下去就是它們，不重挑 */
  const ahead = useRef<Round | null>(null)
  // 一輪：三個願望；後兩個湊得成一個詞的話最後合體（wishes.ts 的 pickRound）
  const plan = useMemo(() => (round > 0 && ahead.current) || pickRound(library, progress, { want: round === 0 ? want : wantNext, focus, today: taiwanDay() }), [round])
  const { wishes, combo } = plan
  /** 這一輪他寫的每個字（合體時並排他自己的筆跡） */
  const writtenRef = useRef<Written[]>([])
  const partner = useMemo<Partner>(() => { const crew = partnersAt(stars); return crew[Math.floor(Math.random() * crew.length)] }, [round])
  /** 現在寫第幾個願望；-1＝還在選 */
  const [index, setIndex] = useState(-1)
  /** 每開始寫一個願望 +1（同一個 index 也要重新開始：換一輪的時候） */
  const [turn, setTurn] = useState(0)
  const [phase, setPhase] = useState<Phase>('choose')
  const [made, setMade] = useState<Made[]>([])
  /** 筆順抓不到、跳過的字（不算變出來，架子上不放） */
  const [skipped, setSkipped] = useState<string[]>([])
  const [conjure, setConjure] = useState<{ key: number; strokes: number[][]; from: ReturnType<typeof inkBox>; land?: { x: number; y: number }; rad?: number[] } | null>(null)
  const [reaction, react] = useReaction()
  const grid = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const voice = useRef<(() => void) | null>(null)
  const speak = (lines: string[]) => { voice.current?.(); voice.current = sayAll(lines, RATE, 160) }
  useEffect(() => () => { timers.current.forEach(clearTimeout); voice.current?.(); stopSpeech() }, [])
  // 一輪還在演：加冕、寶箱先等（hold.ts）；結算那兩句唸完（finishRound）、或離開魔法筆才放行
  useEffect(() => { if (phase !== 'done') holdCelebrations(true) }, [phase])
  useEffect(() => () => holdCelebrations(false), [])

  const wish: Wish | undefined = index >= 0 ? wishes[index] : undefined
  const emojiOf = (c: string) => library.find((e) => e.char === c)?.emoji
  const world = useMemo(() => dwellers(progress.town || {}, emojiOf, progress.fused), [progress.town, progress.fused])

  /**
   * 讓他自己選下一個要變什麼（剩兩個以上的時候）：圖底下寫著字，挑的時候就在認字；
   * 自己選的，寫起來比被派的有勁。他為了某個字來的（want）第一個直接寫那個字。
   */
  const start = (i: number) => { setIndex(i); setTurn((t) => t + 1) }
  /** 「魔法筆來了！」只在第一次說 */
  const greeted = useRef(false)
  /** 下一步（wishes.ts 的 nextStep 決定）：挑卡片、直接寫、合體、結算 */
  const goNext = (doneChars: string[]) => {
    const step = nextStep(plan, doneChars, writtenRef.current.map((w) => w.char), round === 0 ? want : wantNext)
    if (step.kind === 'start') { start(step.index); return }
    if (step.kind === 'fuse') { setPhase('fuse'); return }
    if (step.kind === 'finish') { finishRound(); return }
    setIndex(-1)
    setPhase('choose')
    react('wave')
    speak(greeted.current ? [SPELL_FIXED.choose] : [SPELL_FIXED.hello, SPELL_FIXED.choose])
    greeted.current = true
  }
  useEffect(() => { goNext([]) }, [round])
  // 點了一張卡：先唸那個字（看著卡上的字聽到字音，就是一次認字），再開始許願
  const picking = useRef(false)
  const pick = (i: number) => {
    if (picking.current) return
    picking.current = true
    tap()
    speak([wishes[i].char])
    later(() => { picking.current = false; start(i) }, lasts(wishes[i].char) + 150)
  }

  // 這一輪會唸到的話先抓好
  useEffect(() => {
    preloadVoice([SPELL_FIXED.hello, SPELL_FIXED.choose, SPELL_FIXED.pick, SPELL_FIXED.memory, SPELL_FIXED.levelUp, SPELL_FIXED.master, SPELL_FIXED.yours, SPELL_FIXED.lastOne, SPELL_FIXED.stuckBlind, SPELL_FIXED.stuckTrace, SPELL_FIXED.look, SPELL_FIXED.gone, SPELL_FIXED.hint, SPELL_FIXED.done, SPELL_FIXED.world, ...wishes.flatMap((w) => [w.wish, w.thanks, w.char]),
      ...wishes.flatMap((w) => (w.level === 'trace' && radicalWhy(w.char) ? [radicalWhy(w.char)!] : [])),
      ...(combo ? [SPELL_FIXED.fuse, combo.word, combo.thanks, RADICAL_FIXED.buildPlus, RADICAL_FIXED.buildMake] : [])])
  }, [wishes])
  useEffect(() => {
    if (!wish) return
    setPhase('ask')
    react('wave')
    // 招呼只說一次：有得選的話選之前已經說過了，沒得選（want 來的）就在這裡說
    const hello = !greeted.current
    greeted.current = true
    const lines = hello ? [SPELL_FIXED.hello, wish.wish] : [wish.wish]
    speak(lines)
    const helloMs = hello ? lasts(SPELL_FIXED.hello) + 160 : 0
    if (wish.level === 'memory') {
      // 聽寫：願望唸完，「這次不給你看了！你記得怎麼寫嗎？」，格子一出來就是空的
      const at = helloMs + lasts(wish.wish) + 200
      later(() => { setPhase('write'); speak([SPELL_FIXED.memory]) }, at)
      return
    }
    if (wish.level !== 'blind') {
      // 招呼唸完、願望一開始唸格子就出來（示範邊聽邊看）；不要等整句唸完，六歲等不住
      later(() => setPhase('write'), helloMs + 700)
      return
    }
    // 遮起來寫：願望唸完才出格子，「看一眼，記住喔！」字亮兩秒，「變不見了！你自己寫出來！」
    const at = helloMs + lasts(wish.wish) + 200
    later(() => { setPhase('write'); speak([SPELL_FIXED.look]) }, at)
    later(() => speak([SPELL_FIXED.gone]), at + PREVIEW_MS + 300)
  }, [turn])

  /**
   * 寫錯一筆：夥伴歪頭（不是罵他）。同一筆錯第二次 hanzi-writer 會讓那一筆閃，這時說一次「跟著亮亮的那一筆寫」——
   * 一個願望只說一次，說多了變成嘮叨。
   */
  const hinted = useRef(-1)
  const missed = (mistakes: number) => {
    poke()
    react('oops')
    if (mistakes >= 2 && hinted.current !== turn) { hinted.current = turn; speak([SPELL_FIXED.hint]) }
  }
  /** 寫到只剩最後一筆（五筆以上的字）：夥伴喊「最後一筆！」——六歲寫一個八筆的字要一分鐘，快好的時候有人打氣才撐得住 */
  const stroke = (left: number, total: number) => {
    poke()
    if (left === 1 && total >= 5) { react('cheer'); speak([SPELL_FIXED.lastOne]) }
  }
  /**
   * 卡住了：寫字的時候 15 秒都沒動（沒寫對也沒寫錯），夥伴歪頭問一次——遮起來寫就提醒可以偷看，
   * 描的就說跟著灰灰的線。一個願望只問一次；他一動就重新計時。
   */
  const idle = useRef<number | undefined>(undefined)
  const askedStuck = useRef(-1)
  const poke = () => {
    clearTimeout(idle.current)
    if (!wish || askedStuck.current === turn) return
    const blindish = wish.level === 'blind' || wish.level === 'memory'
    idle.current = window.setTimeout(() => {
      askedStuck.current = turn
      react('think')
      speak([blindish ? SPELL_FIXED.stuckBlind : SPELL_FIXED.stuckTrace])
    }, STUCK_MS)
  }
  // 開始寫就開始計時；不在寫的時候（變身、謝謝、換下一個）一律停掉
  useEffect(() => {
    if (phase === 'write') poke()
    else clearTimeout(idle.current)
    return () => clearTimeout(idle.current)
  }, [phase, turn])
  /** 這一個是沒有偷看、憑記憶寫出來的：謝謝之前先大大誇他一句（小鎮的居民也長大一號） */
  const wroteBlind = useRef(false)
  const told = useRef(false)
  /** 說「你寫的字，變成真的了！」的是哪一個願望（泡泡也要寫出來，畫面上的話都唸得出來） */
  const toldTurn = useRef(-1)
  /** 這一次寫完升到哪一級（徽章換掉、多誇一句「魚，升級了！」）；沒升級是 null */
  const [levelUp, setLevelUp] = useState<WriteLevel | null>(null)
  const written = (strokes: number[][], blind: boolean) => {
    if (!wish) return
    wroteBlind.current = blind
    setLevelUp(levelAfter(progress.town?.[wish.char], blind))
    writtenRef.current = [...writtenRef.current.filter((w) => w.char !== wish.char), { char: wish.char, strokes }]
    onTraced(wish.char, strokes, blind)
    const from = inkBox(grid.current)
    setPhase('conjure')
    // 第一次變身多說一句「你寫的字，變成真的了！」：讓他知道那是「他寫的」變出來的；之後只唸字
    if (!told.current) { told.current = true; toldTurn.current = turn; speak([wish.char, SPELL_FIXED.yours]) } else say(wish.char, RATE)
    // 好吃的東西飛進夥伴嘴裡（他的頭大約在圖的上三分之一）
    const buddy = wish.act === 'yum' ? document.querySelector('.spell-buddy')?.getBoundingClientRect() : null
    const land = buddy ? { x: buddy.left + buddy.width / 2, y: buddy.top + buddy.height * 0.38 } : undefined
    if (from) {
      const key = Date.now()
      setConjure({ key, strokes, from, land })
      // 部首那幾筆（筆順檔的 radStrokes；loadChar 有快取，剛剛寫的時候就抓過了）
      loadChar(wish.char).then((d) => setConjure((c) => (c && c.key === key ? { ...c, rad: (d as { radStrokes?: number[] }).radStrokes } : c))).catch(() => {})
    }
    else finishConjure()
  }
  /** 這個字的筆順檔抓不到（理論上不會，spells 測試有擋）：不要卡在這裡，跳到下一個願望 */
  const skip = () => {
    if (!wish) return
    const doneChars = [...made.map((m) => m.char), ...skipped, wish.char]
    setSkipped((s) => [...s, wish.char])
    goNext(doneChars)
  }
  const finishConjure = () => {
    if (!wish) return
    setConjure(null)
    setMade((m) => [...m, { char: wish.char, emoji: wish.emoji, blind: wroteBlind.current }])
    setPhase('thanks')
    react('cheer')
    // 升到 🧙 聽寫級＝這個字真的會了（不看就寫得出來）：比一般升級更大聲地慶祝
    const master = levelUp === 'memory'
    if (master) cheer()
    // 大魔法師那句已經說了「不用看就寫得出來」，就不再先說「沒有偷看」（話太長他聽不完）
    // 第一次寫這個字（✏️ 描）而且它有部首家族：謝謝後面接它為什麼住那一家（「海裡有好多好多水」，音檔本來就有）——
    // 部首跟意思連起來；之後再寫就不說了（那時要的是想起來，不是聽說明）
    const why = wish.level === 'trace' ? radicalWhy(wish.char) : undefined
    const lines = [...(wroteBlind.current && !master ? [FIXED_LINES.wroteBlind] : []), ...(master ? [SPELL_FIXED.master] : levelUp ? [wish.char, SPELL_FIXED.levelUp] : []), wish.thanks, ...(why ? [why] : [])]
    speak(lines)
    const doneChars = [...made.map((m) => m.char), ...skipped, wish.char]
    later(() => goNext(doneChars), lines.reduce((t, l) => t + lasts(l) + 160, 0) + 700)
  }
  /** 合體要的兩個字（照詞的順序），他都寫了才合 */
  const fuseParts = (): [Written, Written] | null => {
    if (!combo) return null
    const [a, b] = [...combo.word].map((c) => writtenRef.current.find((w) => w.char === c))
    return a && b ? [a, b] : null
  }
  const fused = () => {
    if (!combo) return
    onFused?.(combo.word)
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
    later(() => holdCelebrations(false), lasts(SPELL_FIXED.done) + lasts(SPELL_FIXED.world) + 600)
  }

  // 結算的時候就先挑好下一輪（這時候這一輪的紀錄都記進去了），按鈕上露出那三個東西：想看它們變出來，就會想再寫
  const upcoming = useMemo(() => (phase === 'done' ? pickRound(library, progress, { focus, today: taiwanDay() }) : null), [phase, round])
  const again = (next?: string) => {
    tap()
    // 自己挑了別的（我想變別的）就照他挑的重排；不然就是預告的那三個
    ahead.current = next ? null : upcoming
    setWantNext(next)
    setPicker(false)
    timers.current.forEach(clearTimeout)
    timers.current = []
    setMade([])
    setSkipped([])
    writtenRef.current = []
    setIndex(-1)
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
  /**
   * 點魔法世界裡的東西，它自我介紹：「我是火！火車的火」（跟小鎮居民同一句，音檔本來就有），每次隨機挑一個詞——
   * 把字放進他知道的詞裡（詞素意識）。合體的詞（火山）就唸詞本身；沒有詞的字只唸字。
   */
  const introOf = (c: string) => {
    const words = library.find((e) => e.char === c)?.words?.filter((w) => w?.text) ?? []
    if ([...c].length > 1 || !words.length) return c
    return LINES.townWord(c, words[Math.floor(Math.random() * words.length)].text)
  }
  /** 夥伴泡泡裡的話（畫面上的話都唸得出來：每一段跟當下唸的那句一樣） */
  const bubble = (w: Wish) => {
    if (phase === 'fused' && combo) return combo.thanks
    if (phase === 'fuse') return SPELL_FIXED.fuse
    if (phase === 'conjure' && toldTurn.current === turn) return SPELL_FIXED.yours
    if (phase !== 'thanks') return w.wish
    const praise = made[made.length - 1]?.blind && levelUp !== 'memory' ? FIXED_LINES.wroteBlind : ''
    const up = levelUp === 'memory' ? SPELL_FIXED.master : levelUp ? `${w.char}${SPELL_FIXED.levelUp}` : ''
    const why = w.level === 'trace' ? radicalWhy(w.char) : undefined
    return `${praise}${up}${w.thanks}${why ? `（${why}）` : ''}`
  }
  // 正在寫、正在變身的那個字：紀錄已經記了，但東西要等變身演完才住進來
  const hidden = wish && (phase === 'write' || phase === 'conjure') ? [wish.char] : []
  return (
    // data-combo、底下 spell-pad 的 data-char：給自動測試讀（docs/testing/autowrite.md），畫面不用
    <div className={`spell spell-is-${phase}`} data-combo={combo?.word}>
      {/* 背景就是他的魔法世界：每變出一個東西，演完就掉進它住的地方（done 的時候換成正中間那一個大的） */}
      {phase !== 'done' && <World dwellers={world} fresh={made.map((m) => m.char)} hide={hidden} backdrop />}
      <SubBar title="🪄 魔法筆" onBack={onBack}
        stat={<span className="spell-steps" aria-label={`變出 ${made.length} 個了，一共 ${wishes.length} 個`}>
          {wishes.map((w, i) => <span key={w.char} className={i < made.length ? 'spell-on' : i === made.length && phase !== 'done' ? 'spell-now' : ''} />)}
        </span>} />

      {phase === 'done' ? (
        <SpellDone world={world} fresh={made.map((m) => m.char)} next={showNext} written={writtenRef.current} upcoming={upcoming?.wishes ?? []} onPicker={() => { tap(); setPicker(true); speak([SPELL_FIXED.pick]) }}
          onPick={(c) => { tap(); say(introOf(c), RATE) }} onNext={(go) => { tap(); stopSpeech(); onWalk?.(go) }} onAgain={() => again()} onBack={() => { tap(); onBack() }} />
      ) : phase === 'choose' ? (
        <div className="spell-main">
          <Friend text={SPELL_FIXED.choose} onReplay={() => { tap(); speak([SPELL_FIXED.choose]) }} partner={partner} reaction={reaction} />
          {/* 還沒變的願望一張一張擺出來，圖底下是字：他自己挑 */}
          <div className="spell-choose">{wishes.map((w, i) => made.some((m) => m.char === w.char) || skipped.includes(w.char) ? null : (
            <button key={w.char} className={'spell-card' + (index === i ? ' spell-picked' : '')} onClick={() => { setIndex(i); pick(i) }} aria-label={w.char}>
              {emojiArt(w.emoji) ? <img src={emojiArt(w.emoji)!} alt="" draggable={false} /> : <span>{w.emoji}</span>}
              <b>{w.char}</b>
              {/* 這個字的魔法等級：熟的、新的一眼看得出來，他也許會想挑一個快升級的 */}
              <i className="spell-card-level" aria-hidden>{LEVEL_BADGE[w.level]}</i>
            </button>
          ))}</div>
          <Shelf made={made} />
        </div>
      ) : wish && (
        <div className="spell-main">
          <Friend text={bubble(wish)} onReplay={() => { tap(); speak([wish.wish]) }} partner={partner} reaction={reaction} />
          <div className="spell-pad" ref={grid} data-char={wish.char}>
            {/* 要寫的那個字是什麼東西：給他一個圖當線索（還不會讀「火」的時候，看得到 🔥） */}
            <span className="spell-clue" aria-hidden>{art ? <img src={art} alt="" /> : wish.emoji}</span>
            {/* 這個字的魔法等級：✏️ 描 → 👀 看一眼 → 🙈 遮起來 → 🧙 聽寫；升級的那一下換新的、跳一下 */}
            <span key={levelUp && phase === 'thanks' ? 'up' : 'now'} className={'spell-level' + (levelUp && phase === 'thanks' ? ' spell-level-up' : '')} aria-hidden>
              {LEVEL_BADGE[levelUp && phase === 'thanks' ? levelUp : wish.level]}
            </span>
            {phase !== 'ask' && (
              <Strokes key={`${round}-${turn}`} char={wish.char} radical={Boolean(familyOf(wish.char))}
                startLook={wish.level === 'look'} startBlind={wish.level === 'blind' || wish.level === 'memory'} preview={wish.level === 'blind' ? PREVIEW_MS : 0}
                onTraced={(strokes, blind) => { if (phase === 'write') written(strokes, blind) }} onMiss={missed} onStroke={stroke} onWritten={poke}
                onUnavailable={skip} />
            )}
          </div>
          <Shelf made={made} />
        </div>
      )}
      {phase === 'thanks' && levelUp === 'memory' && <Confetti />}
      {picker && <SpellPicker library={library} progress={progress} onPick={(c) => { say(c, RATE); again(c) }} onClose={() => { tap(); setPicker(false) }} />}
      {phase === 'fuse' && combo && fuseParts() && <Fuse parts={fuseParts()!} combo={combo} onDone={fused} />}
      {conjure?.from && wish && (
        <Conjure key={conjure.key} strokes={conjure.strokes} emoji={wish.emoji} act={wish.act} from={conjure.from} land={conjure.land} char={wish.char} sound={wish.sound}
          power={powerOf(wish.level, wroteBlind.current)} radStrokes={familyOf(wish.char) ? conjure.rad : undefined} onDone={finishConjure} />
      )}
    </div>
  )
}

/** 夥伴和他的泡泡（點泡泡再聽一次） */
function Friend({ text, onReplay, partner, reaction }: { text: string; onReplay: () => void; partner: Partner; reaction: ReactionState }) {
  return (
    <div className="spell-friend">
      <button className="spell-bubble" onClick={onReplay} aria-label={`再聽一次：${text}`}>{text} <span aria-hidden>🔊</span></button>
      <Buddy hero={partner.id} reaction={reaction} className="spell-buddy" alt={partner.name} />
    </div>
  )
}

/** 這一輪變出來的東西排在旁邊的架子上；沒偷看寫出來的戴一顆星 */
function Shelf({ made }: { made: Made[] }) {
  return (
    <div className="spell-shelf" aria-label="變出來的東西">{made.map((m) => (
      <span key={m.char} className="spell-made spell-tiny">{emojiArt(m.emoji) ? <img src={emojiArt(m.emoji)!} alt="" /> : m.emoji}{m.blind && <i className="spell-star">🌟</i>}</span>
    ))}</div>
  )
}

/** 結算：他寫出來的世界攤開（這一輪變出來的從天上掉進來），做完寫一寫這一站就多一顆「下一站」 */
function SpellDone({ world, fresh, next, written, upcoming, onPick, onNext, onAgain, onPicker, onBack }: {
  /** 「我想變別的」：打開整面圖卡讓他自己挑 */
  onPicker: () => void
  world: Dweller[]
  /** 這一輪他寫的字（他自己的筆跡）：結算的時候排一排給他看「這是我寫的」 */
  written: Written[]
  /** 下一輪會變的東西（按鈕上露出來，讓他想看它們變出來） */
  upcoming: Wish[]
  fresh: string[]
  next?: Stop
  onPick: (char: string) => void
  onNext: (go: StopGo) => void
  onAgain: () => void
  onBack: () => void
}) {
  /** 點他寫的字：唸出來，同時用他自己的筆跡照筆順一筆一筆重寫一次（「看，我是這樣寫的」）；n 換了就重播 */
  const [redraw, setRedraw] = useState<{ char: string; n: number } | null>(null)
  // 每一筆畫出來的時候響一聲（跟描字同一個音，越寫越高）
  const tones = useRef<number[]>([])
  useEffect(() => () => tones.current.forEach(clearTimeout), [])
  const replay = (w: Written) => {
    onPick(w.char)
    setRedraw((r) => ({ char: w.char, n: (r?.n || 0) + 1 }))
    tones.current.forEach(clearTimeout)
    tones.current = w.strokes.map((_, k) => window.setTimeout(() => strokeTone(k, w.strokes.length), k * REDRAW_MS))
  }
  return (
    <div className="spell-done">
      <Confetti />
      <p className="spell-done-title">{SPELL_FIXED.done}</p>
      <p className="spell-done-sub">{SPELL_FIXED.world}</p>
      {written.length > 0 && (
        <div className="spell-done-hand" aria-label="你這一輪寫的字">
          {written.map((w, i) => (
            <button key={w.char} onClick={() => replay(w)} style={{ animationDelay: `${i * 0.15}s` }} aria-label={w.char}>
              {/* 一進結算就自己一筆一筆寫出來（快一點、不出聲）：他看得出那是他寫的；點了再慢慢重寫一次 */}
              <svg key={redraw?.char === w.char ? redraw.n : 0} viewBox="0 0 1024 1024" className={!redraw || redraw.char === w.char ? 'spell-redraw' : undefined} aria-hidden>
                <g transform="scale(1, -1) translate(0, -900)">{w.strokes.map((st, k) => <path key={k} d={inkPath(st)} pathLength={1}
                  style={{ animationDelay: `${redraw ? k * REDRAW_MS : 400 + i * 150 + k * 110}ms` }} />)}</g>
              </svg>
            </button>
          ))}
        </div>
      )}
      {/* 他寫過的東西都住在這裡（從小鎮的紀錄推出來） */}
      <World dwellers={world} fresh={fresh} onPick={onPick} />
      <div className="spell-actions">
        {next && <button className="spell-btn spell-go" onClick={() => onNext(next.go)}>下一站：{next.icon} {next.title} →</button>}
        <button className={'spell-btn' + (next ? '' : ' spell-go')} onClick={onAgain}>🪄 再變三個
          {upcoming.length > 0 && <span className="spell-peek" aria-hidden>{upcoming.map((w, i) => (
            <i key={w.char} style={{ animationDelay: `${i * 0.2}s` }}>{emojiArt(w.emoji) ? <img src={emojiArt(w.emoji)!} alt="" draggable={false} /> : w.emoji}</i>
          ))}</span>}
        </button>
        <button className="spell-btn" onClick={onPicker}>🎨 我想變別的</button>
        <button className="spell-btn" onClick={onBack}>🏠 回首頁</button>
      </div>
    </div>
  )
}

/**
 * 「我想變別的」：會變身的東西整面攤開（看過的字排前面），他點哪個，下一輪就從那個字開始。
 * 喜歡恐龍的就是想寫龍——自己想要的最有勁；他是看圖挑的，寫的時候就把圖跟字連起來。
 * 太難的字（龍 16 筆）照樣是 ✏️ 示範＋描，不會卡住。
 */
function SpellPicker({ library, progress, onPick, onClose }: {
  library: CharEntry[]
  progress: Progress
  onPick: (char: string) => void
  onClose: () => void
}) {
  const byChar = new Map(library.map((e) => [e.char, e]))
  const seen = (c: string) => (progress.watched?.[c]?.count || 0) > 0
  const list = SPELLS.filter((s) => byChar.get(s.char)?.emoji).sort((a, b) => Number(seen(b.char)) - Number(seen(a.char)))
  return (
    <div className="spell-picker" role="dialog" aria-label={SPELL_FIXED.pick}>
      <div className="spell-picker-card">
        <p className="spell-picker-title">{SPELL_FIXED.pick}</p>
        <div className="spell-picker-grid">
          {list.map((s) => {
            const e = byChar.get(s.char)!
            const art = emojiArt(e.emoji)
            return (
              <button key={s.char} className="spell-picker-item" onClick={() => onPick(s.char)} aria-label={s.char}>
                {art ? <img src={art} alt="" draggable={false} /> : <span>{e.emoji}</span>}
                <b>{s.char}</b>
                {/* 寫過的字標等級（沒寫過的不標，不然一整面都是 ✏️） */}
                {progress.town?.[s.char]?.traces ? <i className="spell-card-level" aria-hidden>{LEVEL_BADGE[writeLevel(progress.town[s.char])]}</i> : null}
              </button>
            )
          })}
        </div>
        <button className="spell-btn" onClick={onClose}>✖ 不用了</button>
      </div>
    </div>
  )
}
