import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { preloadVoice, say, sayRepeat, stopSpeech } from '../lib/audio'
import { cheer, swipe } from '../lib/sfx'
import { sceneFor, SCENE_PIECES } from './scenes'
import { partsOf, hidesIn } from './parts'
import Strokes from './Strokes'
import AnimMedia from '../anim/AnimMedia'
import { pickSource, mediaUrl, type Broken } from './source'
import VideoPlayer from './VideoPlayer'
import { flow, initialFlow } from './viewerFlow'
import { Confetti, hueOf, hueVar } from './ui'

/**
 * 看一個字：播素材（影片 → 動畫 → 圖片 → 字卡動畫，見 source.ts），看完接自己描字，描完搬進小鎮。
 * 流程狀態在 viewerFlow.ts；這裡只管畫面、計時器與音效。
 */
export default function Viewer({
  entry, count, traces, library, hues, puzzled, prev, next, onGo, onJump, onClose, onBrowseVideos, onComplete, onTraced, onTown,
}: {
  entry: CharEntry
  count: number
  /** 在小鎮裡已經寫過幾次，決定描完要說「搬進來了」還是「長大了」。 */
  traces: number
  /** 孩子端看得到的字，用來決定部件字卡能不能點過去。 */
  library: CharEntry[]
  /** 每個字的顏色（hueMap），跟首頁同色 */
  hues: Map<string, number>
  /** 他在詞語拼圖拼過的詞：語詞旁邊標一片拼圖 */
  puzzled?: Set<string>
  prev?: CharEntry
  next?: CharEntry
  onGo: (e: CharEntry) => void
  onJump: (char: string) => void
  onClose: () => void
  onBrowseVideos: () => void
  onComplete: (e: CharEntry, id: string) => void
  onTraced: (e: CharEntry, strokes: number[][]) => void
  onTown: () => void
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
  const eventId = useRef(crypto.randomUUID())
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  const traceDone = (strokes: number[][]) => {
    dispatch({ type: 'traced', before: traces })
    onTraced(entry, strokes)
  }

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
  useEffect(() => { preloadVoice([entry.char, ...(entry.words ?? []).map((w) => w.text), entry.concept?.hook]) }, [entry])
  useEffect(() => () => clearTimeout(toTrace.current), [])

  // 圖片：載入好才開始算停留（慢圖片不能還沒看到就記一次），並照家長審核過的音量唸這個字
  const image = source.kind === 'image' ? source.media : undefined
  useEffect(() => {
    if (!image || !imageReady || trace) return
    const stop = image.audioMode === 'original' ? () => {} : sayRepeat(entry.char, 2, 1500, image.volume ?? 0.7)
    const t = setTimeout(endMedia, 3000)
    return () => { clearTimeout(t); stop() }
  }, [entry.char, image, imageReady, trace, round])

  // 沒有素材：emoji 登場 → 變成國字 → 定格看笑點 → 一筆一畫寫出來，最後換孩子描
  useEffect(() => {
    if (!bare) return
    const t1 = setTimeout(() => dispatch({ type: 'phase', phase: 'morph' }), 1200)
    const t2 = setTimeout(() => dispatch({ type: 'phase', phase: 'hold' }), 2300)
    const t3 = setTimeout(() => dispatch({ type: 'phase', phase: 'write' }), 3800)
    const stop = sayRepeat(entry.char, 3, 1500, 0.7)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); stop() }
  }, [entry.char, bare, round])

  // 沒有筆順資料就回到舊行為：定格幾秒一樣記一次，不會因為缺資料就永遠不算看過
  useEffect(() => {
    if (!bare || !noStrokes) return
    const t = setTimeout(finish, 3000)
    return () => clearTimeout(t)
  }, [bare, noStrokes, round])

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
    dispatch({ type: 'replay' })
  }

  const hook = entry.concept?.hook
  const known = useMemo(() => new Set(library.map((c) => c.char)), [library])
  // 只推薦他在孩子端看得到的字，點下去才不會撲空
  const parts = useMemo(() => partsOf(entry.char).filter((p) => known.has(p.char)), [entry.char, known])
  const hides = useMemo(() => hidesIn(entry.char).filter((c) => known.has(c)), [entry.char, known])
  const words = entry.words || []
  // 唸字／唸語詞按鈕跟 media.volume 無關：media.volume 是家長審核過的「影片／圖片播放音量」，
  // 按鈕是隨時可點的系統朗讀，兩者混在一起會讓影片調小聲時語詞也跟著變小聲。
  const speechVolume = 0.7

  return (
    <div ref={root} tabIndex={-1} className="viewer" role="dialog" aria-modal="true" aria-label={`看「${entry.char}」`}
      style={{ ['--hue' as any]: hueVar(hueOf(entry, hues)) }}>
      <header className="viewer-bar">
        <div className="viewer-exits">
          <button className="viewer-close viewer-browse" onClick={onBrowseVideos}>← 🎬 回影片字卡</button>
          <button className="viewer-close" onClick={onClose}>回剛才的字卡</button>
        </div>
        <button className="viewer-title" aria-label={`再聽一次「${entry.char}」`}
          onClick={() => say(entry.char, 0.7, speechVolume)}>
          <span className="viewer-emoji">{entry.emoji}</span>
          <b className="viewer-char">{entry.char}</b>
          <span className="viewer-zhuyin">{entry.zhuyin}</span>
          <span className="viewer-meaning">{entry.meaning}</span>
          <span className="viewer-say" aria-hidden>🔊</span>
        </button>
        <span className={'viewer-count' + (done ? ' bump' : '')} key={count}>{count ? `看過 ${count} 次` : '第一次看'}</span>
      </header>

      {(words.length > 0 || parts.length > 0 || hides.length > 0) && (
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
        {trace ? (
          <div className="stage stage-write">
            <Scene entry={entry} />
            <Strokes char={entry.char} highlight={parts[0]?.strokes} onTraced={traceDone} onUnavailable={() => dispatch({ type: 'trace', on: false })} />
          </div>
        ) : source.kind === 'video' ? (
          <VideoPlayer key={round} char={entry.char} media={source.media} controls
            onEnded={endMedia} onFailed={() => setBroken((b) => ({ ...b, video: true }))} />
        ) : source.kind === 'clip' ? (
          <AnimMedia key={round} clip={source.clip} onEnd={endMedia} />
        ) : source.kind === 'image' ? (
          <img className={'viewer-media' + (imageReady ? '' : ' loading')} src={mediaUrl(source.media)} alt={entry.char}
            onLoad={() => setImageReady(true)} onError={() => setBroken((b) => ({ ...b, image: true }))} />
        ) : (
          <div className={`stage stage-${phase}`}>
            <Scene entry={entry} />
            <div className="stage-emoji">{entry.emoji}</div>
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
            {moved === 0 ? `「${entry.char}」搬進你的小鎮了！` : moved + 1 === 5 ? `「${entry.char}」戴上皇冠了！👑` : `「${entry.char}」在小鎮長大了！`}
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

/** 每個字專屬的背景小動畫：純 CSS，不佔素材產線。 */
function Scene({ entry }: { entry: CharEntry }) {
  const kind = sceneFor(entry)
  return (
    <div className={`scene scene-${kind}`} aria-hidden>
      {Array.from({ length: SCENE_PIECES[kind] }, (_, i) => <span key={i} style={{ ['--i' as any]: i }} />)}
    </div>
  )
}
