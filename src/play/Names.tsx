import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import type { CharEntry, Progress } from '../types'
import AnimPlayer from '../anim/AnimPlayer'
import type { Clip } from '../anim/clip'
import { hasNameScene, loadNameScene } from '../names/scenes'
import { lineOf } from '../story/scene'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { blip, cheer, magic, rightNote, tap, whoosh } from '../lib/sfx'
import { NAMES, NAME_FIXED, askLine, partLine, partSpans } from '../../shared/names.mjs'
import { fits, litParts, nextSlot, slotsOf, tilesFor, wallOf, type Card, type Slot, type Tile } from './nameplay'
import { litIndex } from './stories'
import { Confetti, SubBar, emojiArt } from './ui'
import { holdCelebrations } from './hold'

/**
 * 主角館：他把名字一個字一個字拼出來，那個主角就出場演一段（為什麼做、名字的資料在 shared/names.mjs）。
 *
 *   牆      一張一張卡片，每張都是彩色的主角圖＋名字＋下面一排小小的「這段戲會演的東西」（名字的 parts）。
 *           主角圖可以是 3D emoji 或專門畫的圖（prop:，公版人物用；畫法都走 emojiArt，見檔尾的 Emoji）。
 *           以前沒拼過的是黑剪影加問號，他挑不到他要的那個（2026-11-23 看紀錄：當時 44 個只拼過 10 個），所以全部亮出來；
 *           拼過的另外有亮色底＋星星章，一眼分得出來。看過的字多的名字排前面，不鎖
 *   拼      上面主角（彩色，牆上已經看得到是誰了），下面一排「圖位」、一排空格、再下面字塊
 *           （只有名字的字打散；2026-11-18 爸爸說先不要這麼難，干擾字先拿掉，要加回來改 nameplay.ts 的 DECOYS）。
 *           字塊**點之前不唸**，要他自己讀；點對了唸那個字、字飛進空格：落定時格子啵一下、噴一圈小星星，上面的主角開心跳一下，
 *           叮咚一聲一個字比一個字高（rightNote）。整個小獎勵 0.6 秒內結束、不擋下一次點。點錯了搖一下、唸出他點的那個字，不扣分
 *           圖位：名字照動畫裡演的東西切成幾段（花｜生、拉｜布｜拉｜多｜警長），每段一個圖位置中在那幾格上面。一段的最後一個字放進去，
 *           那段的圖就「啵」地彈出來（0.5 秒內結束），唸完那個字接著唸「花朵的花」——動畫整支只唸名字，
 *           「花朵＋生出來＝花生」這個梗以前沒有人講，六歲看不出這段戲跟名字的關係。下一次點會打斷它，沒關係
 *   拼好    圖位上的圖照順序一個一個跳一下（像點名：花朵、花生），不另外唸、不多等
 *   演      拼完那個名字的動畫就演出來，下面名字跟著聲音一個字一個字亮（故事屋的 karaoke）
 *   亮相    停在最後一格、貼紙蓋上去，名字下面排出同一排圖（這段戲＝這幾個東西）。點舞台主角就再演一次（不用重拼）
 *
 * 拼過的卡片再點，先給兩個大按鈕：▶ 看動畫、🧩 再拼一次（他讀不到按鈕上的字：有圖示，打開時唸出來）。
 * 🆕：當時的 44 支在 2026-11-23 全部重做過，他之前看的是舊版（shared/names.mjs 的 NAME_SCENES_REDONE、hasNewScene）。
 *   牆上標 🆕；點進去先唸「有新的動畫喔！」、▶ 特別顯眼；從這裡看完記一筆（last 更新，🆕 就消失）。
 * 舞台是識字動畫同一個播放器（AnimPlayer），每個名字一份沒有國字的劇本（src/names/scenes/）。
 * 紀錄：每拼完、看完一次記一筆 name（progress.names[id]）；沒有 🆕 的卡片從「▶ 看動畫」進去只看不記。
 *   紀錄裡會有名單上已經拿掉的名字（2026-11-24 拿掉 29 個有版權疑慮的，shared/names.mjs 檔頭）：牆照 NAMES 排，自然不出現；
 *   要數張數用 collectedNames，不要直接數 progress.names。
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
  /** 這一次是從 🆕 卡片的「▶ 看動畫」進來的：看完要記一筆，但不說「又拼對了」 */
  const watchNew = useRef(false)

  useEffect(() => {
    preloadVoice([...Object.values(NAME_FIXED), ...wall.flatMap((c) => [c.name.text, askLine(c.name)])])
    say(NAME_FIXED.nameHello, RATE)
    return () => { clear(); stopSpeech(); holdCelebrations(false) }
  }, [])
  // 拼字、演戲的時候，加冕、寶箱先等（跟故事屋一樣）；回到牆上就放行
  useEffect(() => { holdCelebrations(step !== 'wall' && step !== 'choose') }, [step])

  const name = card?.name
  const spans = useMemo(() => (name ? partSpans(name) : []), [name])

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
      if (c.redo) {
        say(NAME_FIXED.nameNewScene, RATE)
        later(() => say(NAME_FIXED.nameChoose, RATE), lasts(NAME_FIXED.nameNewScene) + 300)
      } else say(NAME_FIXED.nameChoose, RATE)
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
    watchNew.current = false
    setStep('spell')
    const partLines = c.name.parts.map(partLine).filter((l): l is string => Boolean(l))
    preloadVoice([askLine(c.name), c.name.text, ...partLines, ...library.map((e) => e.char).filter((ch) => c.name.text.includes(ch))])
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
    // 這一格是某一段的最後一個字：那段的圖跳出來（畫面照 litParts），唸完字接著唸「皮球的皮」
    const part = spans.find((s) => s.last === i)
    const line = part ? partLine(part.part) : null
    let w = lasts(tile.char)
    if (line) { later(() => say(line, RATE), w + 120); w += 120 + lasts(line) }
    if (nextSlot(slots, nextFilled) >= 0) return
    // 拼好了：格子亮一下、圖位點名，主角出場（最後一段的話要唸完，不然被「拼好了」蓋掉）
    setStep('spelled')
    later(() => { magic(); say(NAME_FIXED.nameDone, RATE) }, w + 250)
    later(() => show(), w + 250 + lasts(NAME_FIXED.nameDone) + 200)
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
      // 從 🆕 看完：沒有拼，不說「又拼對了」，蓋章就好
      if (!watchNew.current) {
        const line = before.current > 0 ? NAME_FIXED.nameSeen : NAME_FIXED.nameSticker
        later(() => say(line, RATE), w)
        w += lasts(line) + 300
      }
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
            <button key={c.name.id} className={'names-card' + (c.count ? ' got' : ' todo') + (c.redo ? ' redo' : '') + (stamped === c.name.id ? ' stamped' : '')} style={{ ['--i' as any]: i }}
              data-name={c.name.id} data-got={c.count ? '1' : '0'} data-new={c.redo ? '1' : '0'}
              onClick={() => open(c)} aria-label={c.name.text + (c.count ? '，拿到了' : '') + (c.redo ? '，有新的動畫' : '')}>
              <span className="names-card-art" aria-hidden><Emoji emoji={c.name.emoji} /></span>
              <b className="names-card-title">{c.name.text}</b>
              <span className="names-card-parts" aria-hidden>
                {c.name.parts.map((p, k) => <i key={k} className="names-card-part" data-part={k}><Emoji emoji={p.emoji} /></i>)}
              </span>
              {c.count > 0 && <span className="names-card-got" aria-hidden><Emoji emoji="⭐" /></span>}
              {c.redo && <span className="names-card-new" aria-hidden>🆕</span>}
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
            {/* 🆕 的卡片從這裡看完要記一筆（last 更新，🆕 才會消失）；其他的只看不記 */}
            <button className={'names-big go' + (card.redo ? ' fresh' : '')} data-new={card.redo ? '1' : '0'} disabled={!clip}
              onClick={() => { say(NAME_FIXED.nameWatch, RATE); watchNew.current = card.redo; recorded.current = !card.redo; show() }} aria-label={card.redo ? '看新的動畫' : '看動畫'}>
              {card.redo && <i className="names-big-new" aria-hidden>🆕</i>}
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
    const lit = litParts(spans, filled)
    // 點對一個字主角跳一下：兩個一樣的 keyframes 輪流用，每點對一次動畫都從頭來（不重掛元素）
    const hop = used.length ? (used.length % 2 ? ' hop-a' : ' hop-b') : ''
    return (
      <div className={`names step-${step}`}>
        <SubBar title="🦸 拼出名字" onBack={leave} backLabel="← 主角館" />
        <div className="names-spell">
          <button className="names-ask" onClick={() => { stopSpeech(); say(askLine(name), RATE) }} aria-label="再聽一次名字">
            <span className={'names-ask-hop' + hop}><Emoji emoji={name.emoji} /></span>
            <span className="names-ask-ear" aria-hidden>🔊</span>
          </button>
          {/* 圖位與格子排在同一個格線裡：圖位跨它那幾格的欄（gridColumn），自然置中在那幾格上面 */}
          <div className={'names-slots' + (step === 'spelled' ? ' done' : '')} aria-label={step === 'spelled' ? name.text : `${slots.length} 個格子`}>
            {spans.map((s, p) => (
              <span key={`p${p}`} className={'names-part' + (lit[p] ? ' on' : '')} data-part={p} data-lit={lit[p] ? '1' : '0'}
                style={{ gridColumn: `${s.from + 1} / ${s.to + 1}`, ['--p' as any]: p }} aria-hidden>
                {lit[p] && <>
                  <span className="names-part-pic"><Emoji emoji={s.part.emoji} /></span>
                  <span className="names-part-burst">{SPARKS.map((a) => <i key={a} style={{ ['--a' as any]: `${a}deg` }} />)}</span>
                </>}
              </span>
            ))}
            {slots.map((s, k) => (
              <span key={k} ref={(el) => { slotEls.current[k] = el }} className={'names-slot' + (s.given ? ' given' : '') + (filled[k] ? ' full' : '') + (k === i ? ' now' : '') + (flies[k] ? ' landed' : '')} style={{ gridColumn: k + 1, ['--k' as any]: k }}>
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
          {/* 這段戲＝這幾個東西。演的時候先佔好位置（看不到），亮相才排出來，舞台才不會在亮相那一刻縮一下 */}
          <div className={'names-pose-parts' + (step === 'pose' ? ' on' : '')} aria-hidden>
            {name.parts.map((p, k) => <i key={k} className="names-pose-part" data-part={k} style={{ ['--p' as any]: k }}><Emoji emoji={p.emoji} /></i>)}
          </div>
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

/** 有 3D 圖或專門畫的圖（prop:）就用圖（emojiArt），沒有就用 emoji 字。牆、拼字、亮相所有的主角與圖位都走這裡，大小一樣是 1em */
function Emoji({ emoji, className = '' }: { emoji: string; className?: string }) {
  const art = emojiArt(emoji)
  return art ? <img className={`names-emoji ${className}`} src={art} alt="" draggable={false} /> : <span className={`names-emoji ${className}`}>{emoji}</span>
}

/** 牆上有幾個名字（首頁入口的小字用）：只算有動畫的 */
export const namesOnWall = () => NAMES.filter((n) => hasNameScene(n.id)).length
