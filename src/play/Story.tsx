import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import AnimPlayer from '../anim/AnimPlayer'
import { PROP_PREFIX, propSrc, type Clip } from '../anim/clip'
import { hasScenes, loadScenes, type Scenes } from '../story/scenes'
import { lineOf } from '../story/scene'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { blip, cheer, magic, tap, whoosh } from '../lib/sfx'
import { BLANK, STORY_FIXED, advances, askLead, beatOf, coverOf, filled, isChoice, type ChoicePage, type Story as Tale, type StoryOption } from '../../shared/stories.mjs'
import { litIndex, missing, nextBook, shelfOf, yourTurn, type Book } from './stories'
import { Confetti, SubBar, emojiArt } from './ui'
import { stopAfter, type Stop, type StopGo } from './today'
import { holdCelebrations } from './hold'

/**
 * 故事屋：他讀的字，決定故事怎麼演（為什麼做、故事怎麼寫在 shared/stories.mjs）。
 *
 * 一本故事一頁一頁走：
 *   讀的頁  演這一段、唸這一句，字跟著聲音一個一個亮；演完按「下一頁」
 *   選的頁  句子留一個空格，下面幾張卡片**只有字**（沒有圖、不唸）。他選了，字跳進空格、唸出整句，
 *           然後那個字的意思演出來。幫不上忙的那幾種是最好笑的，演完回來再選一次
 *   讀完    這本的貼紙簿：每一種結果一張，沒看過的是問號——想收齊就要回來把別的字也讀一遍
 *
 * 讀完過一遍的故事再讀，換他先讀（stories.ts 的 yourTurn）：字先出來、不唸，他讀好了按一下才演。
 * 任何時候點句子裡的字都會唸那個字。
 *
 * 舞台是識字動畫同一個播放器（AnimPlayer），每一段戲是一份沒有國字的劇本（src/story/scenes/）。
 * 紀錄：每看到一種結果記一筆 story（貼紙）、讀完記一筆 story done；自己選對字記一筆 book（算「在詞裡讀到」那顆星）。
 */
type Step = 'cover' | 'wait' | 'play' | 'held' | 'choose' | 'filled' | 'done'
type Reading = { book: Book; scenes: Scenes; turn: boolean; had: Set<string> }

const RATE = 0.85
const lasts = (text: string) => (voiceDuration(text) ?? 0.28 * [...text].length + 0.5) * 1000
const PUNCT = /[。！？，]/

export default function Story({ library, progress, path, onWalk, onPick, onBack, onSticker, onDone, onRead }: {
  library: CharEntry[]
  progress: Progress
  /** 今天的路：讀完一本就給「下一站」按鈕 */
  path: Stop[]
  onWalk: (go: StopGo) => void
  /** 打開一個字的字卡（還沒認識、擋住故事的那幾個字） */
  onPick: (char: string) => void
  onBack: () => void
  /** 看到一種結果（一張貼紙） */
  onSticker: (story: string, beat: string) => void
  /** 讀完一遍 */
  onDone: (story: string) => void
  /** 他自己選了讓故事往下走的字：text 是填好的整句，ok 是第一次就選到 */
  onRead: (text: string, char: string, ok: boolean) => void
}) {
  // 只放有戲可以演的故事（文字寫好、場景還沒寫的先不上架）
  const shelf = useMemo(() => shelfOf(library, progress).filter((b) => hasScenes(b.story.id)), [library, progress])
  const suggested = useMemo(() => nextBook(shelf), [shelf])
  const [reading, setReading] = useState<Reading | null>(null)
  const [at, setAt] = useState(0)
  const [step, setStep] = useState<Step>('cover')
  /** 舞台上現在是哪一段戲；run 每加一就從頭演一次 */
  const [beat, setBeat] = useState('')
  const [run, setRun] = useState(0)
  const [t, setT] = useState(0)
  const [picked, setPicked] = useState<StoryOption | null>(null)
  /** 這一遍每個選的頁選過哪幾個字 */
  const [tried, setTried] = useState<Record<string, string[]>>({})
  /** 剛剛點的那個字（跳一下） */
  const [poked, setPoked] = useState(-1)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const asked = useRef(false)

  const tale = reading?.book.story
  const page = tale?.pages[at]
  const clip: Clip | undefined = reading?.scenes[beat]
  /** 書架上的那一本會跟著紀錄更新（貼紙一拿到就亮） */
  const book = reading ? shelf.find((b) => b.story.id === reading.book.story.id) ?? reading.book : undefined

  useEffect(() => {
    preloadVoice([...Object.values(STORY_FIXED), ...shelf.map((b) => b.story.title)])
    say(STORY_FIXED.storyHello, RATE)
    return () => { clear(); stopSpeech(); holdCelebrations(false) }
  }, [])
  // 故事還在演的時候，加冕、寶箱先等（跟魔法筆一樣）；讀完或回書架就放行
  useEffect(() => { holdCelebrations(Boolean(reading) && step !== 'done') }, [reading, step])

  /** 走到第 i 頁 */
  const enter = (r: Reading, i: number) => {
    clear()
    stopSpeech()
    setAt(i)
    setPicked(null)
    setPoked(-1)
    const next = r.book.story.pages[i]
    if (!next) { finish(r); return }
    if (isChoice(next)) { ask(next, 300); return }
    setBeat(next.id)
    setRun((n) => n + 1)
    setT(0)
    setStep(r.turn ? 'wait' : 'play')
  }

  /** 選的頁：舞台停在上一段的最後一格，唸空格前面那一段，再請他選 */
  const ask = (p: ChoicePage, delay: number, line?: string) => {
    setStep('choose')
    let w = delay
    if (line) { later(() => say(line, RATE), w); w += lasts(line) + 250 }
    const lead = askLead(p)
    if (lead) { later(() => say(lead, RATE), w); w += lasts(lead) + 250 }
    if (!line) {
      const prompt = asked.current ? STORY_FIXED.storyChooseShort : STORY_FIXED.storyChoose
      asked.current = true
      later(() => say(prompt, RATE), w)
      w += lasts(prompt)
    }
    // 一直沒選：再提醒一次（只提醒一次，不催）
    later(() => say(STORY_FIXED.storyChooseShort, RATE), w + 9000)
  }

  const begin = (b: Book) => {
    tap()
    clear()
    stopSpeech()
    const turn = yourTurn(b)
    setStep('cover')
    setTried({})
    asked.current = false
    setBeat('')
    const tale = b.story
    preloadVoice(tale.pages.flatMap((p) => (isChoice(p) ? [askLead(p), ...p.options.flatMap((o) => [o.char, filled(p, o), o.text])] : [p.text, ...p.text])))
    say(tale.title, RATE)
    const opening = lasts(tale.title) + 350
    if (turn) later(() => say(STORY_FIXED.storyYourTurn, RATE), opening)
    const wait = opening + (turn ? lasts(STORY_FIXED.storyYourTurn) + 200 : 0)
    const started = performance.now()
    void loadScenes(tale.id).catch(() => undefined).then((scenes) => {
      // 戲載不進來（檔案壞了、離線時還沒快取到）：回書架，不要卡在封面
      if (!scenes) { clear(); stopSpeech(); setReading(null); return }
      const r: Reading = { book: b, scenes, turn, had: new Set(b.stickers.filter((s) => s.got).map((s) => s.beat)) }
      setReading(r)
      setAt(-1)
      later(() => { whoosh(); enter(r, 0) }, Math.max(0, wait - (performance.now() - started)))
    })
    // 封面先出來（scenes 還沒到之前也有東西看）
    setReading({ book: b, scenes: {}, turn, had: new Set() })
    setAt(-1)
  }

  /** 這一段演完了 */
  const live = useRef({ reading, at, picked, tried })
  live.current = { reading, at, picked, tried }
  const ended = () => {
    const { reading: r, at: i, picked: opt, tried: done } = live.current
    const p = r?.book.story.pages[i]
    if (!r || !p) return
    if (!isChoice(p) || !opt) { setStep('held'); return }
    const through = p.all ? p.options.every((o) => (done[p.id] ?? []).includes(o.char)) : Boolean(opt.ok)
    if (through) { setStep('held'); return }
    setPicked(null)
    ask(p, 350, p.all ? STORY_FIXED.storyMore : STORY_FIXED.storyAgain)
  }

  /** 他選了一個字：跳進空格、唸整句，然後演那個字 */
  const pick = (p: ChoicePage, opt: StoryOption) => {
    if (step !== 'choose' || !reading || !tale) return
    clear()
    stopSpeech()
    blip()
    const before = tried[p.id] ?? []
    setTried({ ...tried, [p.id]: [...before, opt.char] })
    setPicked(opt)
    setStep('filled')
    onSticker(tale.id, beatOf(p, opt))
    if (advances(p, opt)) onRead(filled(p, opt), opt.char, p.all ? true : before.length === 0)
    const text = filled(p, opt)
    later(() => say(text, RATE), 200)
    later(() => { magic(); setBeat(beatOf(p, opt)); setRun((n) => n + 1); setT(0); setStep('play') }, 200 + lasts(text) + 300)
  }

  const turnPage = () => { if (!reading) return; tap(); whoosh(); enter(reading, at + 1) }
  const replay = () => { tap(); clear(); stopSpeech(); setRun((n) => n + 1); setT(0); setStep('play') }
  const reveal = () => { tap(); setStep('play') }

  const finish = (r: Reading) => {
    setStep('done')
    cheer()
    onDone(r.book.story.id)
  }
  const { stopDone, nextStop } = stopAfter(path, 'read')
  const walk = useRef({ stopDone, nextStop })
  walk.current = { stopDone, nextStop }
  /** 這一遍新拿到的貼紙 */
  const fresh = reading && book ? book.stickers.filter((s) => s.got && !reading.had.has(s.beat)).map((s) => s.beat) : []
  useEffect(() => {
    if (step !== 'done' || !book) return
    let w = 500
    const line = (text: string) => { later(() => say(text, RATE), w); w += lasts(text) + 300 }
    line(STORY_FIXED.storyDone)
    if (fresh.length) line(STORY_FIXED.storyNewSticker)
    line(missing(book) ? STORY_FIXED.storyUnseen : STORY_FIXED.storyAll)
    const { stopDone: done, nextStop: next } = walk.current
    if (done && next) line(next.say)
  }, [step])

  const leave = () => { clear(); stopSpeech(); setReading(null); setStep('cover'); setBeat('') }
  /** 點句子裡的一個字：唸那個字（正在演的時候不搶話） */
  const poke = (c: string, i: number) => {
    if (step === 'play' || step === 'filled' || PUNCT.test(c) || c === BLANK) return
    stopSpeech()
    say(c, RATE)
    setPoked(i)
    later(() => setPoked(-1), 500)
  }
  const locked = (b: Book) => {
    clear()
    stopSpeech()
    let w = 0
    for (const text of [STORY_FIXED.storyLocked, ...b.need]) { later(() => say(text, RATE), w); w += lasts(text) + 250 }
  }

  // ---------- 書架 ----------
  if (!reading || !tale || !book) {
    return (
      <div className="story">
        <SubBar title="📚 故事屋" stat={shelf.length ? `${shelf.filter((b) => b.count > 0).length} / ${shelf.length} 本` : undefined} onBack={onBack} />
        {!shelf.length && <p className="story-empty">故事還在路上！</p>}
        <div className="story-shelf">
          {shelf.map((b) => (
            <article key={b.story.id} className={'story-book' + (b.open ? '' : ' locked') + (suggested === b ? ' next' : '')}>
              <button className="story-cover" onClick={() => (b.open ? begin(b) : locked(b))} aria-label={b.open ? `讀「${b.story.title}」` : `「${b.story.title}」還沒打開`}>
                <span className="story-cover-art" aria-hidden>
                  <img src={coverSrc(b.story, b.open)} alt="" draggable={false} />
                  <Emoji emoji={b.story.emoji} className="story-cover-emoji" />
                </span>
                <b className="story-cover-title">{b.story.title}</b>
                <span className="story-cover-tag">{!b.open ? '🔒' : b.count === 0 ? '🆕 新故事' : missing(b) ? `讀過 ${b.count} 次` : '👑 全部找到'}</span>
              </button>
              {b.open
                ? <div className="story-stickers" aria-label={`貼紙 ${b.stickers.filter((s) => s.got).length} / ${b.stickers.length}`}>
                    {b.stickers.map((s) => <span key={s.beat} className={'story-dot' + (s.got ? ' got' : '')} aria-hidden>{s.got ? <Emoji emoji={s.emoji} /> : '?'}</span>)}
                  </div>
                : <div className="story-need">
                    <span>先認識</span>
                    {b.need.map((c) => <button key={c} className="story-need-char" onClick={() => { tap(); onPick(c) }} aria-label={`看「${c}」的字卡`}>{c}</button>)}
                  </div>}
            </article>
          ))}
        </div>
      </div>
    )
  }

  // ---------- 讀完：貼紙簿 ----------
  if (step === 'done') {
    const left = missing(book)
    return (
      <div className="story">
        <SubBar title={`📚 ${tale.title}`} onBack={leave} backLabel="← 故事屋" />
        <div className="story-done">
          <Confetti />
          <b className="story-done-title"><img src={coverSrc(tale)} alt="" draggable={false} />讀完了！</b>
          <div className="story-album">
            {book.stickers.map((s, i) => (
              <button key={s.beat} className={'story-sticker' + (s.got ? ' got' : '') + (fresh.includes(s.beat) ? ' fresh' : '')} style={{ ['--i' as any]: i }}
                disabled={!s.got} onClick={() => { clear(); stopSpeech(); say(s.char, RATE) }} aria-label={s.got ? s.char : '還沒找到的貼紙'}>
                <span className="story-sticker-art" aria-hidden>{s.got ? <Emoji emoji={s.emoji} /> : '?'}</span>
                <b>{s.got ? s.char : ''}</b>
              </button>
            ))}
          </div>
          <p className="story-done-note">{left ? `還有 ${left} 張貼紙沒找到：再讀一次，選別的字！` : '這本的貼紙全部找到了！'}</p>
          <div className="story-actions">
            <button className={'story-btn' + (left ? ' go' : '')} onClick={() => begin(book)}>🔁 再讀一次</button>
            {stopDone && nextStop
              ? <button className="story-btn go" onClick={() => { tap(); clear(); stopSpeech(); onWalk(nextStop.go) }}>下一站：{nextStop.icon} {nextStop.title} →</button>
              : <button className="story-btn" onClick={() => { tap(); leave() }}>📚 選別本</button>}
          </div>
        </div>
      </div>
    )
  }

  // ---------- 一頁 ----------
  const choice = page && isChoice(page) ? page : undefined
  const text = !page ? '' : !isChoice(page) ? page.text : step === 'filled' && picked ? filled(page, picked) : picked ? picked.text : page.ask
  const line = clip ? lineOf(clip) : undefined
  const lit = step === 'play' && line ? litIndex(text, t - line.at, lasts(line.say) / 1000) : -1
  const done = choice ? tried[choice.id] ?? [] : []
  const last = at + 1 >= tale.pages.length

  return (
    <div className={`story step-${step}`}>
      <SubBar title={`📚 ${tale.title}`} stat={at >= 0 ? `${at + 1} / ${tale.pages.length}` : undefined} onBack={leave} backLabel="← 故事屋" />
      <div className="story-page">
        <div className="story-frame">
          <div className="story-stage" key={beat}>
            {clip
              ? <StoryStage clip={clip} run={run} playing={step === 'play'} onTime={setT} onEnd={ended} />
              : <div className="story-title-card">
                  <img src={coverSrc(tale)} alt="" draggable={false} />
                  <b>{tale.title}</b>
                </div>}
            {step === 'wait' && (
              <button className="story-reveal" onClick={reveal} aria-label="讀好了，演給我看">
                <span>▶</span>
                <b>讀好了！</b>
              </button>
            )}
          </div>
        </div>

        <div className="story-panel">
          {at >= 0 && (
            <p className={'story-line' + (choice && !picked ? ' asking' : '')} aria-label={text}>
              {[...text].map((c, i) => (
                c === BLANK
                  ? <span key={i} className="story-blank" aria-hidden />
                  : <button key={i} className={'story-char' + (PUNCT.test(c) ? ' punct' : '') + (lit === i ? ' lit' : '') + (poked === i ? ' poked' : '')
                      + (step === 'filled' && picked && c === picked.char ? ' landed' : '')}
                      disabled={PUNCT.test(c)} onClick={() => poke(c, i)} aria-label={c}>{c}</button>
              ))}
            </p>
          )}

          {(step === 'choose' || step === 'filled') && choice && (
            <div className="story-options">
              {choice.options.map((o, i) => {
                // 選過的卡片右上角貼著那個結果的貼紙（字跟意思連在一起）；剛選的那張先不算選過
                const mine = step === 'filled' && picked?.char === o.char
                const used = done.includes(o.char) && !mine
                return (
                  <button key={o.char} className={'story-option' + (used ? ' used' : '') + (mine ? ' mine' : step === 'filled' ? ' gone' : '')} style={{ ['--i' as any]: i }}
                    disabled={used || step === 'filled'} onClick={() => pick(choice, o)} aria-label={o.char}>
                    <b>{o.char}</b>
                    {used && <Emoji emoji={o.emoji} className="story-option-was" />}
                  </button>
                )
              })}
            </div>
          )}

          {step === 'held' && (
            <div className="story-actions">
              <button className="story-btn" onClick={replay} aria-label="再看一次">🔁 再看一次</button>
              <button className="story-btn go pulse" onClick={turnPage}>{last ? '讀完了 ✓' : '下一頁 →'}</button>
            </div>
          )}
          {step === 'wait' && <p className="story-hint">👀 你先讀讀看，不會的字點一下</p>}
        </div>
      </div>
    </div>
  )
}

/**
 * 舞台：把一段戲演完，然後時間繼續走（角色繼續呼吸、雪繼續下），停在最後的樣子等他按下一頁或選字。
 * playing 是 false 時停在第一格（換他先讀的時候）。
 */
function StoryStage({ clip, run, playing, onTime, onEnd }: { clip: Clip; run: number; playing: boolean; onTime: (t: number) => void; onEnd: () => void }) {
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
    <AnimPlayer key={run} clip={clip} playing={playing && !over} t={t}
      onTime={(v) => { setT(v); onTime(v) }} onEnd={() => { setOver(true); onEnd() }} />
  )
}

/** 封面那張圖的網址：一般是主角的 idle／happy；主演是公版人物（只有道具圖）的書用 cover 寫的那兩張 */
function coverSrc(story: Tale, open = true) {
  const art = coverOf(story, open)
  return art.startsWith(PROP_PREFIX) ? propSrc(art) : `/hero/${art.slice('hero:'.length)}.png`
}

/** 有 3D 圖就用圖（貼紙放大了才好看），沒有就用 emoji 字 */
function Emoji({ emoji, className = '' }: { emoji: string; className?: string }) {
  const art = emojiArt(emoji)
  return art ? <img className={`story-emoji ${className}`} src={art} alt="" draggable={false} /> : <span className={`story-emoji ${className}`}>{emoji}</span>
}
