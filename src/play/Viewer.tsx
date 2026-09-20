import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { say, sayRepeat } from '../lib/audio'
import { publishedMedia } from '../../shared/domain.mjs'
import { useVideoVoice } from '../lib/useVideoVoice'
import { cheer, swipe } from '../lib/sfx'
import { sceneFor, SCENE_PIECES } from './scenes'
import { partsOf, hidesIn } from './parts'
import Strokes from './Strokes'

type Phase = 'object' | 'morph' | 'hold' | 'write' | 'finished'

export default function Viewer({
  entry, count, library, prev, next, onGo, onJump, onClose, onBrowseVideos, onComplete,
}: {
  entry: CharEntry
  count: number
  /** 孩子端看得到的字，用來決定部件字卡能不能點過去。 */
  library: CharEntry[]
  prev?: CharEntry
  next?: CharEntry
  onGo: (e: CharEntry) => void
  onJump: (char: string) => void
  onClose: () => void
  onBrowseVideos: () => void
  onComplete: (e: CharEntry, id: string) => void
}) {
  const media = publishedMedia(entry)
  const [failed, setFailed] = useState(false)       // 影片檔壞了 → 退回字卡
  const [imageFailed, setImageFailed] = useState(false)
  const [blocked, setBlocked] = useState(false)     // 自動播放被擋 → 給大播放鍵
  const [ready, setReady] = useState(false)         // 尺寸未知前先不顯示，避免先閃出小框
  const video = failed ? undefined : media.find((m) => m.kind === 'video')
  const image = imageFailed ? undefined : media.find((m) => m.kind === 'image')
  const [phase, setPhase] = useState<Phase>('object')
  const [round, setRound] = useState(0)
  const [done, setDone] = useState(false)
  const [noStrokes, setNoStrokes] = useState(false) // 這個字沒有筆順資料 → 退回純字卡動畫
  const [trace, setTrace] = useState(false)         // 有影片的字，看完之後自己描一次
  const [traced, setTraced] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const videoEl = useRef<HTMLVideoElement>(null)
  const toTrace = useRef<number | undefined>(undefined)
  const completed = useRef(false)
  const eventId = useRef(crypto.randomUUID())
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete
  const narration = video?.audioMode === 'narration'
  const voice = useVideoVoice(entry.char, narration, video?.volume ?? 0.7)
  const bare = !video && !image

  const finish = () => {
    if (completed.current) return
    completed.current = true
    setDone(true)
    // 'write' 要留著：描字面板就掛在這個階段，換成 finished 會在示範播完的瞬間把它收掉
    setPhase((p) => (p === 'write' ? p : 'finished'))
    voice.stop()
    // 沒素材的字在筆順示範播完就算看過，慶祝留到孩子自己描完再放
    if (!bare) cheer()
    completeRef.current(entry, eventId.current)
  }

  /** 素材看完自動接筆順。留一拍給彩帶與音效落在最後一格上，不要硬切。 */
  const endMedia = () => {
    finish()
    clearTimeout(toTrace.current)
    toTrace.current = window.setTimeout(() => setTrace(true), 900)
  }
  const toggleTrace = () => {
    clearTimeout(toTrace.current)   // 手動切回影片時，別讓排程把他又推回筆順
    setTrace((t) => !t)
  }

  // 把焦點從搜尋框拿過來，方向鍵才會是上一個／下一個
  useEffect(() => { root.current?.focus() }, [])
  useEffect(() => () => clearTimeout(toTrace.current), [])

  useEffect(() => {
    if (!video || trace) return
    setBlocked(false)
    const el = videoEl.current
    if (!el) return
    el.currentTime = 0
    el.volume = video.volume ?? 0.7
    el.play().catch(() => setBlocked(true))
  }, [video, trace, round])

  // 圖片：載入好才開始算停留（慢圖片不能還沒看到就記一次），並照家長審核過的音量唸這個字
  useEffect(() => {
    if (video || !image || !ready || trace) return
    const stop = image.audioMode === 'original' ? () => {} : sayRepeat(entry.char, 2, 1500, image.volume ?? 0.7)
    const t = setTimeout(endMedia, 3000)
    return () => { clearTimeout(t); stop() }
  }, [entry.char, video, image, ready, trace, round])

  // 沒有素材：emoji 登場 → 變成國字 → 定格看笑點 → 一筆一畫寫出來，最後換孩子描
  useEffect(() => {
    if (!bare) return
    setPhase('object')
    setNoStrokes(false)
    const t1 = setTimeout(() => setPhase('morph'), 1200)
    const t2 = setTimeout(() => setPhase('hold'), 2300)
    const t3 = setTimeout(() => setPhase('write'), 3800)
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
    setDone(false)
    setTrace(false)
    setTraced(false)
    voice.reset()
    setRound((r) => r + 1)
  }

  const hook = entry.concept?.hook
  const known = useMemo(() => new Set(library.map((c) => c.char)), [library])
  // 只推薦他在孩子端看得到的字，點下去才不會撲空
  const parts = useMemo(() => partsOf(entry.char).filter((p) => known.has(p.char)), [entry.char, known])
  const hides = useMemo(() => hidesIn(entry.char).filter((c) => known.has(c)), [entry.char, known])
  const words = entry.words || []
  const volume = video?.volume ?? image?.volume ?? 0.7

  return (
    <div ref={root} tabIndex={-1} className="viewer" role="dialog" aria-modal="true" aria-label={`看「${entry.char}」`}
      style={{ ['--hue' as any]: `var(--c${entry.priority % 8})` }}>
      <header className="viewer-bar">
        <div className="viewer-exits">
          <button className="viewer-close viewer-browse" onClick={onBrowseVideos}>← 🎬 回影片字卡</button>
          <button className="viewer-close" onClick={onClose}>回剛才的字卡</button>
        </div>
        <button className="viewer-title" aria-label={`再聽一次「${entry.char}」`}
          onClick={() => say(entry.char, 0.7, volume)}>
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
          {words.map((word) => (
            <button key={word} className="word" onClick={() => say(word, 0.8, volume)} aria-label={`唸「${word}」`}>
              {[...word].map((c, i) => <span key={i} className={c === entry.char ? 'word-hit' : ''}>{c}</span>)}
              <span className="word-say" aria-hidden>🔊</span>
            </button>
          ))}
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
              {hides.slice(0, 5).map((c) => (
                <button key={c} className="part" onClick={() => onJump(c)} aria-label={`去看「${c}」`}>{c}</button>
              ))}
              {hides.length > 5 && <span className="band-label">等 {hides.length} 個字裡</span>}
            </span>
          )}
        </div>
      )}

      <div className="viewer-frame">
        {trace ? (
          <div className="stage stage-write">
            <Scene char={entry.char} />
            <Strokes char={entry.char} highlight={parts[0]?.strokes} onTraced={() => setTraced(true)} onUnavailable={() => setTrace(false)} />
          </div>
        ) : video ? (
          <>
            <video
              ref={videoEl}
              className={'viewer-media' + (ready ? '' : ' loading')}
              src={`/media/${encodeURIComponent(video.file)}`}
              controls
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              playsInline
              preload="auto"
              muted={narration}
              onLoadedMetadata={() => setReady(true)}
              onPlaying={(e) => { setBlocked(false); voice.update(e.currentTarget) }}
              onTimeUpdate={(e) => voice.update(e.currentTarget)}
              onPause={() => voice.stop()}
              onSeeking={() => voice.reset()}
              onError={() => setFailed(true)}
              onEnded={endMedia}
            />
            {blocked && (
              <button className="tap-play" aria-label="播放"
                onClick={() => { videoEl.current?.play().catch(() => setBlocked(true)) }}>
                <span>▶</span>
              </button>
            )}
          </>
        ) : image ? (
          <img className={'viewer-media' + (ready ? '' : ' loading')} src={`/media/${encodeURIComponent(image.file)}`} alt={entry.char}
            onLoad={() => setReady(true)} onError={() => setImageFailed(true)} />
        ) : (
          <div className={`stage stage-${phase}`}>
            <Scene char={entry.char} />
            <div className="stage-emoji">{entry.emoji}</div>
            <div className="stage-char">{entry.char}</div>
            {phase === 'write' && !noStrokes
              ? <Strokes char={entry.char} highlight={parts[0]?.strokes} onWritten={finish} onTraced={() => setTraced(true)} onUnavailable={() => setNoStrokes(true)} />
              : <div className="stage-zhuyin">{entry.zhuyin}</div>}
          </div>
        )}
        {hook && (trace || (bare && phase !== 'object')) && (
          <button className="hook" onClick={() => say(hook, 0.85, 0.85)} aria-label={`聽這個字的小故事：${hook}`}>
            <span aria-hidden>💡</span>{hook}<span className="hook-say" aria-hidden>🔊</span>
          </button>
        )}
        {((done && !bare) || traced) && <Confetti key={`${round}-${traced}`} />}
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
function Scene({ char }: { char: string }) {
  const kind = sceneFor(char)
  return (
    <div className={`scene scene-${kind}`} aria-hidden>
      {Array.from({ length: SCENE_PIECES[kind] }, (_, i) => <span key={i} style={{ ['--i' as any]: i }} />)}
    </div>
  )
}

/** 看完的彩帶。CSS 動畫，沒有圖檔。 */
function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => <span key={i} style={{ ['--i' as any]: i }} />)}
    </div>
  )
}
