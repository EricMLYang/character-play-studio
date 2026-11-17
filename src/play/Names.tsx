import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import type { CharEntry, Progress } from '../types'
import AnimPlayer from '../anim/AnimPlayer'
import type { Clip } from '../anim/clip'
import { hasNameScene, loadNameScene } from '../names/scenes'
import { lineOf } from '../story/scene'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { blip, cheer, magic, rightNote, tap, whoosh } from '../lib/sfx'
import { NAMES, NAME_FIXED, askLine, spellChars } from '../../shared/names.mjs'
import { fits, nextSlot, revealOf, slotsOf, tilesFor, wallOf, type Card, type Slot, type Tile } from './nameplay'
import { litIndex } from './stories'
import { Confetti, SubBar, emojiArt } from './ui'
import { holdCelebrations } from './hold'

/**
 * 主角館：他把名字一個字一個字拼出來，那個主角就出場演一段（為什麼做、名字的資料在 shared/names.mjs）。
 *
 *   牆      一張一張卡片：拼過的是名字＋貼紙，沒拼過的是問號剪影。看過的字多的名字排前面，不鎖
 *   拼      上面一排空格、下面字塊（只有名字的字打散；2026-11-18 爸爸說先不要這麼難，干擾字先拿掉，
 *           要加回來改 nameplay.ts 的 DECOYS）。字塊**點之前不唸**，要他自己讀；
 *           點對了唸那個字、字飛進空格：落定時格子啵一下、噴一圈小星星，上面的主角開心跳一下，
 *           叮咚一聲一個字比一個字高（rightNote）；沒拼過的主角是黑剪影，每拼對一個字亮一點，拼完完全現形。
 *           整個小獎勵 0.6 秒內結束、不擋下一次點。點錯了搖一下、唸出他點的那個字（讓他知道那是什麼字），不扣分
 *   演      拼完那個名字的動畫就演出來，下面名字跟著聲音一個字一個字亮（故事屋的 karaoke）
 *   亮相    停在最後一格、貼紙蓋上去。點舞台主角就再演一次（不用重拼）
 *
 * 拼過的卡片再點，先給兩個大按鈕：▶ 看動畫、🧩 再拼一次（他讀不到按鈕上的字：有圖示，打開時唸出來）。
 * 舞台是識字動畫同一個播放器（AnimPlayer），每個名字一份沒有國字的劇本（src/names/scenes/）。
 * 紀錄：每拼完、看完一次記一筆 name（progress.names[id]）。
 */
type Step = 'wall' | 'choose' | 'spell' | 'spelled' | 'show' | 'pose'
type Fly = { dx: number; dy: number }

const RATE = 0.85
/** 字落進格子時噴出去的小星星：八顆，各往一個方向（角度） */
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315]
const lasts = (text: string) => (voiceDuration(text) ?? 0.28 * [...text].length + 0.5) * 1000

export default function Names({ library, progress, onBack, onDone }: {
  library: CharEntry[]
  progress: Progress
  onBack: () => void
  /** 拼完、看完一個名字 */
  onDone: (id: string) => void
}) {
  // 只放有動畫的名字（資料寫好、動畫還沒寫的先不上牆）
  const wall = useMemo(() => wallOf(library, progress, hasNameScene), [library, progress])
  const [step, setStep] = useState<Step>('wall')
  const [card, setCard] = useState<Card | null>(null)
  const [clip, setClip] = useState<Clip | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [tiles, setTiles] = useState<Tile[]>([])
  /** 每一格填好了沒（given 的一開始就是 true） */
  const [filled, setFilled] = useState<boolean[]>([])
  /** 用掉的字塊 */
  const [used, setUsed] = useState<string[]>([])
  /** 字從哪裡飛進格子（字塊與格子的距離，px） */
  const [flies, setFlies] = useState<Record<number, Fly>>({})
  /** 剛剛點錯、在搖的那一塊 */
  const [nope, setNope] = useState('')
  /** 這一格點錯幾次（兩次以後對的那塊會輕輕跳，提示他） */
  const [misses, setMisses] = useState(0)
  const [run, setRun] = useState(0)
  const [t, setT] = useState(0)
  /** 剛拿到貼紙的那一張（回到牆上時蓋章） */
  const [stamped, setStamped] = useState('')
  const slotEls = useRef<(HTMLSpanElement | null)[]>([])
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  /** 這一次拼完記過紀錄了沒（重看不再記） */
  const recorded = useRef(false)
  /** 他打開時，這張拼過沒（拿到的是新貼紙還是又拼對一次） */
  const before = useRef(0)

  useEffect(() => {
    preloadVoice([...Object.values(NAME_FIXED), ...wall.flatMap((c) => [c.name.text, askLine(c.name)])])
    say(NAME_FIXED.nameHello, RATE)
    return () => { clear(); stopSpeech(); holdCelebrations(false) }
  }, [])
  // 拼字、演戲的時候，加冕、寶箱先等（跟故事屋一樣）；回到牆上就放行
  useEffect(() => { holdCelebrations(step !== 'wall' && step !== 'choose') }, [step])

  const name = card?.name

  /** 點一張卡片 */
  const open = (c: Card) => {
    tap()
    clear()
    stopSpeech()
    setCard(c)
    setClip(null)
    before.current = c.count
    void loadNameScene(c.name.id).catch(() => undefined).then((loaded) => {
      // 動畫載不進來：回牆上，不要卡住
      if (!loaded) { clear(); stopSpeech(); setCard(null); setStep('wall'); return }
      setClip(loaded)
    })
    if (c.count > 0) {
      setStep('choose')
      say(NAME_FIXED.nameChoose, RATE)
      return
    }
    spell(c)
  }

  /** 開始拼：唸名字與「把他的名字拼出來」，字塊先不唸 */
  const spell = (c: Card) => {
    clear()
    stopSpeech()
    const s = slotsOf(c.name)
    setSlots(s)
    setFilled(s.map((x) => x.given))
    setTiles(tilesFor(c.name, library))
    setUsed([])
    setFlies({})
    setNope('')
    setMisses(0)
    recorded.current = false
    setStep('spell')
    preloadVoice([askLine(c.name), c.name.text, ...library.map((e) => e.char).filter((ch) => c.name.text.includes(ch))])
    const ask = askLine(c.name)
    say(ask, RATE)
    let w = lasts(ask) + 300
    if (c.fresh.length) { later(() => say(NAME_FIXED.nameNew, RATE), w); w += lasts(NAME_FIXED.nameNew) }
    // 一直沒動：再提醒一次（只提醒一次，不催）
    later(() => say(ask, RATE), w + 10000)
  }

  /** 點一塊字 */
  const pick = (tile: Tile, e: MouseEvent<HTMLButtonElement>) => {
    if (step !== 'spell' || used.includes(tile.key)) return
    clear()
    stopSpeech()
    if (!fits(slots, filled, tile)) {
      // 點錯：搖一下、唸出他點的那個字，不扣分
      blip()
      say(tile.char, RATE)
      setNope(tile.key)
      later(() => setNope(''), 520)
      setMisses((n) => n + 1)
      if (misses + 1 === 2) later(() => say(NAME_FIXED.nameAgain, RATE), lasts(tile.char) + 150)
      return
    }
    const i = nextSlot(slots, filled)
    const from = e.currentTarget.getBoundingClientRect()
    const to = slotEls.current[i]?.getBoundingClientRect()
    const fly = to ? { dx: from.left + from.width / 2 - (to.left + to.width / 2), dy: from.top + from.height / 2 - (to.top + to.height / 2) } : { dx: 0, dy: 60 }
    const nextFilled = filled.map((f, k) => f || k === i)
    // 越拼越高：第幾個點對的字（用掉的字塊都是點對的）
    rightNote(used.length + 1)
    say(tile.char, RATE)
    setFlies({ ...flies, [i]: fly })
    setFilled(nextFilled)
    setUsed([...used, tile.key])
    setMisses(0)
    if (nextSlot(slots, nextFilled) >= 0) return
    // 拼好了：格子亮一下，主角出場
    setStep('spelled')
    later(() => { magic(); say(NAME_FIXED.nameDone, RATE) }, lasts(tile.char) + 250)
    later(() => show(), lasts(tile.char) + 250 + lasts(NAME_FIXED.nameDone) + 200)
  }

  const show = () => { whoosh(); clear(); setRun((n) => n + 1); setT(0); setStep('show') }

  /** 演完了：停在亮相那一格，貼紙蓋上去 */
  const ended = () => {
    setStep('pose')
    if (!name) return
    let w = 300
    if (!recorded.current) {
      recorded.current = true
      onDone(name.id)
      cheer()
      const line = before.current > 0 ? NAME_FIXED.nameSeen : NAME_FIXED.nameSticker
      later(() => say(line, RATE), w)
      w += lasts(line) + 300
      setStamped(name.id)
    }
    later(() => say(NAME_FIXED.nameTapHero, RATE), w)
  }

  /** 點舞台上的主角：再演一次 */
  const replay = () => { if (step !== 'pose') return; tap(); clear(); stopSpeech(); setRun((n) => n + 1); setT(0); setStep('show') }

  const leave = () => { clear(); stopSpeech(); setCard(null); setClip(null); setStep('wall') }

  // ---------- 牆 ----------
  if (step === 'wall' || !card || !name) {
    const got = wall.filter((c) => c.count > 0).length
    return (
      <div className="names">
        <SubBar title="🦸 主角館" stat={wall.length ? `${got} / ${wall.length} 張` : undefined} onBack={onBack} />
        {!wall.length && <p className="names-empty">主角還在路上！</p>}
        <div className="names-wall">
          {wall.map((c, i) => (
            <button key={c.name.id} className={'names-card' + (c.count ? ' got' : '') + (stamped === c.name.id ? ' stamped' : '')} style={{ ['--i' as any]: i }}
              onClick={() => open(c)} aria-label={c.count ? c.name.text : `還沒拼過的主角（${spellChars(c.name).length} 個字）`}>
              <span className="names-card-art" aria-hidden>
                <Emoji emoji={c.name.emoji} className={c.count ? '' : 'names-shadow'} />
                {!c.count && <b className="names-card-q">?</b>}
              </span>
              {c.count
                ? <b className="names-card-title">{c.name.text}</b>
                : <span className="names-card-boxes" aria-hidden>{[...c.name.text].map((_, k) => <i key={k} />)}</span>}
              {c.fresh.length > 0 && <span className="names-card-fresh">有新字</span>}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---------- 拼過的：看動畫還是再拼一次 ----------
  if (step === 'choose') {
    return (
      <div className="names">
        <SubBar title={`🦸 ${name.text}`} onBack={leave} backLabel="← 主角館" />
        <div className="names-choose">
          <span className="names-choose-art" aria-hidden><Emoji emoji={name.emoji} /></span>
          <b className="names-choose-title">{name.text}</b>
          <div className="names-choose-btns">
            <button className="names-big go" disabled={!clip} onClick={() => { say(NAME_FIXED.nameWatch, RATE); recorded.current = true; show() }} aria-label="看動畫">
              <span aria-hidden>▶</span><b>看動畫</b>
            </button>
            <button className="names-big" onClick={() => { tap(); spell(card) }} aria-label="再拼一次">
              <span aria-hidden>🧩</span><b>再拼一次</b>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- 拼 ----------
  if (step === 'spell' || step === 'spelled') {
    const i = nextSlot(slots, filled)
    // 點對一個字主角跳一下：兩個一樣的 keyframes 輪流用，每點對一次動畫都從頭來（不重掛元素，剪影變亮才有過場）
    const hop = used.length ? (used.length % 2 ? ' hop-a' : ' hop-b') : ''
    return (
      <div className={`names step-${step}`}>
        <SubBar title="🦸 拼出名字" onBack={leave} backLabel="← 主角館" />
        <div className="names-spell">
          <button className="names-ask" style={{ ['--reveal' as any]: revealOf(slots, filled) }} onClick={() => { stopSpeech(); say(askLine(name), RATE) }} aria-label="再聽一次名字">
            <span className={'names-ask-hop' + hop}><Emoji emoji={name.emoji} className={card.count ? '' : 'names-shadow'} /></span>
            <span className="names-ask-ear" aria-hidden>🔊</span>
          </button>
          <div className={'names-slots' + (step === 'spelled' ? ' done' : '')} aria-label={step === 'spelled' ? name.text : `${slots.length} 個格子`}>
            {slots.map((s, k) => (
              <span key={k} ref={(el) => { slotEls.current[k] = el }} className={'names-slot' + (s.given ? ' given' : '') + (filled[k] ? ' full' : '') + (k === i ? ' now' : '') + (flies[k] ? ' landed' : '')} style={{ ['--k' as any]: k }}>
                {filled[k] && <b style={flies[k] ? { ['--dx' as any]: `${flies[k].dx}px`, ['--dy' as any]: `${flies[k].dy}px` } : undefined} className={flies[k] ? 'flew' : ''}>{s.char}</b>}
                {flies[k] && <span className="names-burst" aria-hidden>{SPARKS.map((a) => <i key={a} style={{ ['--a' as any]: `${a}deg` }} />)}</span>}
              </span>
            ))}
          </div>
          <div className="names-tiles">
            {tiles.map((tile, k) => {
              const gone = used.includes(tile.key)
              const hint = misses >= 2 && !gone && i >= 0 && slots[i].char === tile.char
              return (
                <button key={tile.key} className={'names-tile' + (gone ? ' gone' : '') + (nope === tile.key ? ' nope' : '') + (hint ? ' hint' : '')} style={{ ['--i' as any]: k }}
                  disabled={gone || step !== 'spell'} onClick={(e) => pick(tile, e)} aria-label={gone ? '用掉了' : '字塊'}>
                  <b>{tile.char}</b>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ---------- 演、亮相 ----------
  const line = clip ? lineOf(clip) : undefined
  const lit = step === 'show' && line ? litIndex(name.text, t - line.at, lasts(line.say) / 1000) : -1
  return (
    <div className={`names step-${step}`}>
      <SubBar title={`🦸 ${name.text}`} onBack={leave} backLabel="← 主角館" />
      <div className="names-show">
        <div className="names-frame">
          <div className="names-stage" onClick={replay} role={step === 'pose' ? 'button' : undefined} aria-label={step === 'pose' ? '再演一次' : undefined}>
            {clip && <NameStage clip={clip} run={run} onTime={setT} onEnd={ended} />}
            {step === 'pose' && <>
              <Confetti />
              <span className="names-sticker" aria-hidden><Emoji emoji={name.emoji} /></span>
              <span className="names-again" aria-hidden>👆</span>
            </>}
          </div>
        </div>
        <div className="names-panel">
          <p className="names-line" aria-label={name.text}>
            {[...name.text].map((c, k) => <span key={k} className={'names-char' + (lit === k ? ' lit' : '')}>{c}</span>)}
          </p>
          {step === 'pose' && (
            <div className="names-actions">
              <button className="names-btn" onClick={replay} aria-label="再演一次">🔁</button>
              <button className="names-btn go pulse" onClick={() => { tap(); leave() }} aria-label="回到主角館">🖼️ ←</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 舞台：把那一段演完，然後時間繼續走（角色繼續呼吸），停在亮相的樣子等他點。
 */
function NameStage({ clip, run, onTime, onEnd }: { clip: Clip; run: number; onTime: (t: number) => void; onEnd: () => void }) {
  const [t, setT] = useState(0)
  const [over, setOver] = useState(false)
  useEffect(() => { setT(0); setOver(false) }, [clip, run])
  useEffect(() => {
    if (!over) return
    let raf = 0
    let last = performance.now()
    const step = (now: number) => { setT((v) => v + (now - last) / 1000); last = now; raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [over])
  return (
    <AnimPlayer key={run} clip={clip} playing={!over} t={t}
      onTime={(v) => { setT(v); onTime(v) }} onEnd={() => { setOver(true); onEnd() }} />
  )
}

/** 有 3D 圖就用圖，沒有就用 emoji 字 */
function Emoji({ emoji, className = '' }: { emoji: string; className?: string }) {
  const art = emojiArt(emoji)
  return art ? <img className={`names-emoji ${className}`} src={art} alt="" draggable={false} /> : <span className={`names-emoji ${className}`}>{emoji}</span>
}

/** 牆上有幾個名字（首頁入口的小字用）：只算有動畫的 */
export const namesOnWall = () => NAMES.filter((n) => hasNameScene(n.id)).length
