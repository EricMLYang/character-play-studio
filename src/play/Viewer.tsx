import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { CharEntry, Progress, Resident } from '../types'
import { preloadVoice, say, sayAll, sayRepeat, stopSpeech } from '../lib/audio'
import { cheer, swipe, tap } from '../lib/sfx'
import { charStars, tracedOnly, residentLevel, CROWN_LEVEL } from '../../shared/domain.mjs'
import { FIXED_LINES } from '../../shared/voice-lines.mjs'
import { deedsFor } from './stars'
import { sceneFor, SCENE_PIECES } from './scenes'
import { partsOf, hidesIn } from './parts'
import Strokes from './Strokes'
import { ClipMedia } from '../anim/AnimMedia'
import { pickSource, mediaUrl, type Broken } from './source'
import VideoPlayer from './VideoPlayer'
import { flow, initialFlow } from './viewerFlow'
import { familiesIn, homesFor } from './families'
import { Confetti, emojiArt, hueOf, hueVar } from './ui'

/**
 * 看一個字：播素材（影片 → 動畫 → 圖片 → 字卡動畫，見 source.ts），看完接自己描字，描完搬進小鎮。
 * 流程狀態在 viewerFlow.ts；這裡只管畫面、計時器與音效。
 */
export default function Viewer({
  entry, count, resident, library, hues, puzzled, progress, prev, next, onGo, onJump, onClose, onBrowseVideos, onComplete, onTraced, onTown, onGame,
}: {
  entry: CharEntry
  count: number
  /** 他在小鎮裡的這個字（沒搬進來就是 undefined），決定描完要說「搬進來了」還是「長大了」。 */
  resident?: Resident
  /** 孩子端看得到的字，用來決定部件字卡能不能點過去。 */
  library: CharEntry[]
  /** 每個字的顏色（hueMap），跟首頁同色 */
  hues: Map<string, number>
  /** 他在詞語拼圖拼過的詞：語詞旁邊標一片拼圖 */
  puzzled?: Set<string>
  /** 這個字的五顆星從進度算出來（shared/domain.mjs 的 charStars） */
  progress: Progress
  prev?: CharEntry
  next?: CharEntry
  onGo: (e: CharEntry) => void
  onJump: (char: string) => void
  onClose: () => void
  onBrowseVideos: () => void
  onComplete: (e: CharEntry, id: string) => void
  onTraced: (e: CharEntry, strokes: number[][], blind: boolean) => void
  onTown: () => void
  /** 缺的那顆星要去的遊戲（games.tsx 的 id），第二個參數是「為了哪個字去的」 */
  onGame: (id: string, want?: string) => void
}) {
  const [broken, setBroken] = useState<Broken>({})      // 檔案壞了 → 往下一種素材退
  const [imageReady, setImageReady] = useState(false)   // 尺寸未知前先不顯示，避免先閃出小框
  const [state, dispatch] = useReducer(flow, initialFlow)
  const { round, phase, done, trace, traced, moved, noStrokes } = state
  const source = pickSource(entry, broken)
  const bare = source.kind === 'card'
  const root = useRef<HTMLDivElement>(null)
  const toTrace = useRef<number | undefined>(undefined)
  const completed = useRef(false)
  /** 描完那句話唸到一半就換字或關掉的話要停掉 */
  const voice = useRef<(() => void) | null>(null)
  const eventId = useRef(crypto.randomUUID())
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  /**
   * 他自己把字描完的那一刻。畫面上寫著「『楊』搬進你的小鎮了！」，但他讀不到——唸出來。
   * 第一次描完搬進小鎮；之後要遮起來憑記憶寫才會長大（第 5 級戴皇冠）；照著再描一次就只邀他遮起來寫。
   */
  const traceDone = (strokes: number[][], blind: boolean) => {
    const level = residentLevel(resident)
    const moved = !resident ? 'in' : blind ? (level + 1 >= CROWN_LEVEL ? 'crown' : 'grow') : null
    dispatch({ type: 'traced', moved })
    onTraced(entry, strokes, blind)
    voice.current?.()
    const line = moved === 'in' ? FIXED_LINES.movedIn : moved === 'crown' ? FIXED_LINES.movedCrown
      : moved === 'grow' ? FIXED_LINES.movedGrow : null
    voice.current = sayAll([entry.char, ...(blind ? [FIXED_LINES.wroteBlind] : []), ...(line ? [line] : []),
      ...(!blind && moved !== 'in' ? [FIXED_LINES.blindInvite] : [])], 0.85)
  }

  /**
   * 看過的字再打開：先蓋著問「你還記得這是什麼字嗎？」，他想好了點一下才播。
   * 每次重看都變成一次回想（研究上自己想起來比一直重看記得牢）。第一次看、「再看一次」不蓋。
   */
  const [covered, setCovered] = useState(count > 0)
  const uncover = () => {
    tap()
    stopSpeech()
    setCovered(false)
    say(entry.char, 0.75, 0.9)
  }
  useEffect(() => {
    if (!covered) return
    const t = setTimeout(() => say(FIXED_LINES.recallAsk, 0.8), 350)
    return () => clearTimeout(t)
  }, [covered])

  const finish = () => {
    if (completed.current) return
    completed.current = true
    dispatch({ type: 'finish' })
    stopSpeech()
    // 沒素材的字在筆順示範播完就算看過，慶祝留到孩子自己描完再放
    if (!bare) cheer()
    completeRef.current(entry, eventId.current)
  }

  /** 素材看完自動接筆順。留一拍給彩帶與音效落在最後一格上，不要硬切。 */
  const endMedia = () => {
    finish()
    clearTimeout(toTrace.current)
    toTrace.current = window.setTimeout(() => dispatch({ type: 'trace', on: true }), 900)
  }
  const toggleTrace = () => {
    clearTimeout(toTrace.current)   // 手動切回影片時，別讓排程把他又推回筆順
    dispatch({ type: 'trace' })
  }

  // 把焦點從搜尋框拿過來，方向鍵才會是上一個／下一個
  useEffect(() => { root.current?.focus() }, [])
  // 這個字會唸到的句子先抓好
  useEffect(() => {
    preloadVoice([entry.char, ...(entry.words ?? []).map((w) => w.text), entry.concept?.hook, FIXED_LINES.recallAsk,
      FIXED_LINES.movedIn, FIXED_LINES.movedGrow, FIXED_LINES.movedCrown, FIXED_LINES.blindInvite, FIXED_LINES.wroteBlind])
  }, [entry])
  useEffect(() => () => { clearTimeout(toTrace.current); voice.current?.() }, [])

  // 圖片：載入好才開始算停留（慢圖片不能還沒看到就記一次），並照家長審核過的音量唸這個字
  const image = source.kind === 'image' ? source.media : undefined
  useEffect(() => {
    if (!image || !imageReady || trace || covered) return
    const stop = image.audioMode === 'original' ? () => {} : sayRepeat(entry.char, 2, 1500, image.volume ?? 0.7)
    const t = setTimeout(endMedia, 3000)
    return () => { clearTimeout(t); stop() }
  }, [entry.char, image, imageReady, trace, round, covered])

  // 沒有素材：emoji 登場 → 變成國字 → 定格看笑點 → 一筆一畫寫出來，最後換孩子描
  useEffect(() => {
    if (!bare || covered) return
    const t1 = setTimeout(() => dispatch({ type: 'phase', phase: 'morph' }), 1200)
    const t2 = setTimeout(() => dispatch({ type: 'phase', phase: 'hold' }), 2300)
    const t3 = setTimeout(() => dispatch({ type: 'phase', phase: 'write' }), 3800)
    const stop = sayRepeat(entry.char, 3, 1500, 0.7)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); stop() }
  }, [entry.char, bare, round, covered])

  // 沒有筆順資料就回到舊行為：定格幾秒一樣記一次，不會因為缺資料就永遠不算看過
  useEffect(() => {
    if (!bare || !noStrokes || covered) return
    const t = setTimeout(finish, 3000)
    return () => clearTimeout(t)
  }, [bare, noStrokes, round, covered])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && next) { swipe(); onGo(next) }
      else if (e.key === 'ArrowLeft' && prev) { swipe(); onGo(prev) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onGo, onClose])

  const replay = () => {
    completed.current = false
    eventId.current = crypto.randomUUID()
    clearTimeout(toTrace.current)
    stopSpeech()
    setCovered(false)
    dispatch({ type: 'replay' })
  }

  const hook = entry.concept?.hook
  const known = useMemo(() => new Set(library.map((c) => c.char)), [library])
  // 只推薦他在孩子端看得到的字，點下去才不會撲空
  const parts = useMemo(() => partsOf(entry.char).filter((p) => known.has(p.char)), [entry.char, known])
  const hides = useMemo(() => hidesIn(entry.char).filter((c) => known.has(c)), [entry.char, known])
  // 這個字住在哪幾家（部首家、聲音家、它自己的詞家族）：點了去看那一家的故事（families.ts）
  const homes = useMemo(() => homesFor(entry.char, familiesIn(library)), [entry.char, library])
  const words = entry.words || []
  /** 有 3D 圖就用 3D 圖：沒有影片的字，這張圖就是他看到的主角 */
  const art = emojiArt(entry.emoji)
  // 唸字／唸語詞按鈕跟 media.volume 無關：media.volume 是家長審核過的「影片／圖片播放音量」，
  // 按鈕是隨時可點的系統朗讀，兩者混在一起會讓影片調小聲時語詞也跟著變小聲。
  const speechVolume = 0.7

  return (
    <div ref={root} tabIndex={-1} className={'viewer' + (trace || (bare && phase === 'write') ? ' tracing' : '')} role="dialog" aria-modal="true" aria-label={`看「${entry.char}」`}
      style={{ ['--hue' as any]: hueVar(hueOf(entry, hues)) }}>
      <header className="viewer-bar">
        <div className="viewer-exits">
          <button className="viewer-close viewer-browse" onClick={onBrowseVideos}>← 🎬 回影片字卡</button>
          <button className="viewer-close" onClick={onClose}>回剛才的字卡</button>
        </div>
        <button className="viewer-title" aria-label={`再聽一次「${entry.char}」`}
          onClick={() => say(entry.char, 0.7, speechVolume)}>
          <span className="viewer-emoji">{entry.emoji}</span>
          <b className="viewer-char">{covered ? '？' : entry.char}</b>
          <span className="viewer-zhuyin">{covered ? '' : entry.zhuyin}</span>
          <span className="viewer-meaning">{covered ? '想一想' : entry.meaning}</span>
          <span className="viewer-say" aria-hidden>🔊</span>
        </button>
        <StarBadge entry={entry} count={count} bump={done || traced} progress={progress} known={known}
          onGame={onGame} onWrite={trace ? undefined : toggleTrace} />
      </header>

      {!covered && (words.length > 0 || parts.length > 0 || hides.length > 0 || homes.length > 0) && (
        <div className="band">
          <div className="band-words">{words.map((word) => (
            <button key={word.text} className="say-word" onClick={() => say(word.text, 0.8, speechVolume)} aria-label={`唸「${word.text}」`}>
              {word.emoji && <span className="word-emoji" aria-hidden>{word.emoji}</span>}
              <span className="word-text">
                {[...(word.text || '')].map((c, i) => <span key={i} className={c === entry.char ? 'word-hit' : ''}>{c}</span>)}
              </span>
              <span className="word-say" aria-hidden>🔊</span>
              {puzzled?.has(word.text) && <span className="word-got" title="拼過了" aria-label="這個詞拼過了">🧩</span>}
            </button>
          ))}</div>
          <div className="band-links">
          {parts.length > 0 && (
            <span className="band-group">
              <span className="band-label">裡面有</span>
              {parts.map((p, i) => (
                <button key={p.char} className={'part' + (i === 0 ? ' part-on' : '')} onClick={() => onJump(p.char)}
                  aria-label={`去看「${p.char}」`}>{p.char}</button>
              ))}
            </span>
          )}
          {homes.length > 0 && (
            <span className="band-group">
              <span className="band-label">住在</span>
              {homes.map((home) => (
                <button key={home.id} className="part root-home" onClick={() => onGame('roots', `${home.id}:${entry.char}`)}
                  aria-label={`去看${home.name}的家`}>{home.emoji} {home.name}的家</button>
              ))}
            </span>
          )}
          {hides.length > 0 && (
            <span className="band-group">
              <span className="band-label">躲在</span>
              {/* 這是發現的提示，不是清單：手機上列太多會把整條擠成三行，吃掉看影片的空間 */}
              {hides.slice(0, 3).map((c) => (
                <button key={c} className="part" onClick={() => onJump(c)} aria-label={`去看「${c}」`}>{c}</button>
              ))}
              {hides.length > 3 && <span className="band-label">等 {hides.length} 個字裡</span>}
            </span>
          )}
          </div>
        </div>
      )}

      <div className="viewer-frame">
        {covered ? (
          <button className="recall-cover" onClick={uncover} aria-label="你還記得這是什麼字嗎？想好了點一下看答案">
            <span className="recall-art" aria-hidden>{art ? <img src={art} alt="" /> : entry.emoji}</span>
            <span className="recall-mark" aria-hidden>？</span>
            <span className="recall-ask">你還記得這是什麼字嗎？</span>
            <span className="recall-go">想好了！看答案 →</span>
          </button>
        ) : trace ? (
          <div className="stage stage-write">
            <Scene entry={entry} />
            <Strokes char={entry.char} highlight={parts[0]?.strokes} onTraced={traceDone} onUnavailable={() => dispatch({ type: 'trace', on: false })} />
          </div>
        ) : source.kind === 'video' ? (
          <VideoPlayer key={round} char={entry.char} media={source.media} controls
            onEnded={endMedia} onFailed={() => setBroken((b) => ({ ...b, video: true }))} />
        ) : source.kind === 'clip' ? (
          <ClipMedia key={round} char={source.char} onEnd={endMedia} />
        ) : source.kind === 'image' ? (
          <img className={'viewer-media' + (imageReady ? '' : ' loading')} src={mediaUrl(source.media)} alt={entry.char}
            onLoad={() => setImageReady(true)} onError={() => setBroken((b) => ({ ...b, image: true }))} />
        ) : (
          <div className={`stage stage-${phase}`}>
            <Scene entry={entry} />
            <div className="stage-emoji">{art ? <img src={art} alt="" /> : entry.emoji}</div>
            <div className="stage-char">{entry.char}</div>
            {phase === 'write' && !noStrokes
              ? <Strokes char={entry.char} highlight={parts[0]?.strokes} onWritten={finish} onTraced={traceDone} onUnavailable={() => dispatch({ type: 'noStrokes' })} />
              : <div className="stage-zhuyin">{entry.zhuyin}</div>}
          </div>
        )}
        {hook && (trace || (bare && phase !== 'object')) && (
          <button className="hook" onClick={() => say(hook, 0.85, 0.85)} aria-label={`聽這個字的小故事：${hook}`}>
            <span aria-hidden>💡</span>{hook}<span className="hook-say" aria-hidden>🔊</span>
          </button>
        )}
        {((done && !bare) || traced) && <Confetti key={`${round}-${traced}`} />}
        {moved !== null && (
          <button className="moved-in" onClick={onTown}>
            <span aria-hidden>🏡</span>
            {moved === 'in' ? `「${entry.char}」搬進你的小鎮了！` : moved === 'crown' ? `「${entry.char}」戴上皇冠了！👑` : `「${entry.char}」在小鎮長大了！`}
            <b>去看看 →</b>
          </button>
        )}
      </div>

      <footer className="viewer-nav">
        <button className="nav-btn" disabled={!prev} onClick={() => { swipe(); prev && onGo(prev) }}>
          ← {prev ? <span className="nav-char">{prev.char}</span> : '上一個'}
        </button>
        <button className="nav-btn primary" onClick={replay}>🔁 再看一次</button>
        {!bare && (
          <button className="nav-btn write" onClick={toggleTrace}>
            {trace ? '🎬 回去看' : '✏️ 換你寫'}
          </button>
        )}
        <button className="nav-btn" disabled={!next} onClick={() => { swipe(); next && onGo(next) }}>
          {next ? <span className="nav-char">{next.char}</span> : '下一個'} →
        </button>
      </footer>
    </div>
  )
}

/**
 * 這個字的星星（shared/domain.mjs 的 STAR_DEEDS）：拿到的亮、還沒拿到的灰。
 * 點開來會說還差哪一顆、要去哪裡拿，按一下直接過去——魔法鍋、餵大怪獸、詞語拼圖
 * 他不會自己想到要去，但「『火』還差這一顆」他看得懂。
 *
 * 做不到的事不列出來：沒有畫得出來的語詞就拿不到拼圖那顆，拆不出部件的字魔法鍋也變不出來，
 * 列了只會變成永遠拿不到的空格。
 */
function StarBadge({ entry, count, bump, progress, known, onGame, onWrite }: {
  entry: CharEntry
  count: number
  bump: boolean
  progress: Progress
  /** 孩子端看得到的字：決定魔法鍋變不變得出這個字 */
  known: Set<string>
  onGame: (id: string, want?: string) => void
  /** 直接切到描字（已經在描字就不給，按了也沒事發生） */
  onWrite?: () => void
}) {
  const [open, setOpen] = useState(false)
  const got = charStars(progress, entry.char)
  // 描過但還沒遮起來寫：寫字那顆先亮一半，他看得出「差一步」
  const half = tracedOnly(progress, entry.char)
  const deeds = deedsFor(entry, known)
  const n = deeds.filter((d) => got[d.id]).length
  const full = n === deeds.length
  // 只差一顆：那排星星會呼吸，點開來就看得到缺的是哪一顆、按一下直接去拿。
  // 這是整個「集滿一個字」唯一的入口，不提醒的話它只是右上角一排很小的星星
  const nearly = !full && n > 0 && n + 1 === deeds.length
  return (
    <div className="viewer-stars">
      <button className={'star-strip' + (full ? ' full' : '') + (nearly ? ' nearly' : '')} aria-expanded={open}
        aria-label={`星星：${deeds.length} 顆裡面拿到 ${n} 顆${nearly ? '，只差一顆就集滿了' : ''}，點開來看還差什麼`}
        onClick={() => { tap(); setOpen((o) => !o) }}>
        <span className="strip-stars" key={n} aria-hidden>
          {deeds.map((d) => <span key={d.id} className={got[d.id] ? '' : d.id === 'write' && half ? 'half' : 'off'}>⭐</span>)}
          {full && <span className="strip-crown">👑</span>}
        </span>
        <span className={'strip-count' + (bump ? ' bump' : '')} key={`${count}-${n}`}>
          {nearly ? '只差一顆！' : count ? `看過 ${count} 次` : '第一次看'}
        </span>
      </button>
      {open && (
        <>
          <button className="sheet-back" aria-label="關起來" onClick={() => setOpen(false)} />
          <div className="star-sheet" role="dialog" aria-label={`「${entry.char}」的星星`}>
            <h3>{full ? `「${entry.char}」的星星集滿了！👑` : `「${entry.char}」還可以拿到星星`}</h3>
            <ul>
              {deeds.map((d) => (
                <li key={d.id} className={got[d.id] ? 'got' : ''}>
                  <span className="deed-icon" aria-hidden>{d.icon}</span>
                  <span className="deed-text"><b>{d.label}</b><small>{got[d.id] ? '拿到了！' : d.id === 'write' && half ? '描過了！再遮起來自己寫一次就拿到' : d.todo(entry.char)}</small></span>
                  {got[d.id] ? <span className="deed-star" aria-hidden>⭐</span>
                    : d.where ? <button className="deed-go" onClick={() => { tap(); onGame(d.where!, entry.char) }}>去 →</button>
                    : d.id === 'write' && onWrite ? <button className="deed-go" onClick={() => { tap(); setOpen(false); onWrite() }}>來寫 →</button>
                    : <span className="deed-star off" aria-hidden>⭐</span>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

/** 每個字專屬的背景小動畫：純 CSS，不佔素材產線。 */
function Scene({ entry }: { entry: CharEntry }) {
  const kind = sceneFor(entry)
  return (
    <div className={`scene scene-${kind}`} aria-hidden>
      {Array.from({ length: SCENE_PIECES[kind] }, (_, i) => <span key={i} style={{ ['--i' as any]: i }} />)}
    </div>
  )
}
