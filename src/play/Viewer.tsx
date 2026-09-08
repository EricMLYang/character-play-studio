import { useEffect, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { sayRepeat } from '../lib/audio'
import { publishedMedia } from '../../shared/domain.mjs'
import { useVideoVoice } from '../lib/useVideoVoice'

type Phase = 'object' | 'morph' | 'hold' | 'finished'

export default function Viewer({
  entry, count, prev, next, onGo, onClose, onComplete,
}: {
  entry: CharEntry
  count: number
  prev?: CharEntry
  next?: CharEntry
  onGo: (e: CharEntry) => void
  onClose: () => void
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
  const root = useRef<HTMLDivElement>(null)
  const videoEl = useRef<HTMLVideoElement>(null)
  const completed = useRef(false)
  const eventId = useRef(crypto.randomUUID())
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete
  const narration = video?.audioMode === 'narration'
  const voice = useVideoVoice(entry.char, narration, video?.volume ?? 0.7)

  const finish = () => {
    if (completed.current) return
    completed.current = true
    setDone(true)
    setPhase('finished')
    voice.stop()
    completeRef.current(entry, eventId.current)
  }

  // 把焦點從搜尋框拿過來，方向鍵才會是上一個／下一個
  useEffect(() => { root.current?.focus() }, [])

  useEffect(() => {
    if (!video) return
    setBlocked(false)
    const el = videoEl.current
    if (!el) return
    el.currentTime = 0
    el.volume = video.volume ?? 0.7
    el.play().catch(() => setBlocked(true))
  }, [video, round])

  // 圖片：停留 3 秒算看過一次
  useEffect(() => {
    if (video || !image) return
    const t = setTimeout(finish, 3000)
    return () => clearTimeout(t)
  }, [video, image, round])

  // 沒有素材：emoji → 國字的字卡動畫，唸 4 次
  useEffect(() => {
    if (video || image) return
    setPhase('object')
    const t1 = setTimeout(() => setPhase('morph'), 1200)
    const t2 = setTimeout(() => setPhase('hold'), 2300)
    const stop = sayRepeat(entry.char, 4, 1700, 0.7)
    const t3 = setTimeout(finish, 8000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); stop() }
  }, [entry.char, video, image, round])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && next) onGo(next)
      else if (e.key === 'ArrowLeft' && prev) onGo(prev)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onGo, onClose])

  const replay = () => {
    completed.current = false
    eventId.current = crypto.randomUUID()
    setDone(false)
    voice.reset()
    setRound((r) => r + 1)
  }

  return (
    <div ref={root} tabIndex={-1} className="viewer" role="dialog" aria-label={`看「${entry.char}」`}
      style={{ ['--hue' as any]: `var(--c${entry.priority % 8})` }}>
      <header className="viewer-bar">
        <button className="viewer-close" onClick={onClose}>← 回字庫</button>
        <div className="viewer-title">
          <span className="viewer-emoji">{entry.emoji}</span>
          <b className="viewer-char">{entry.char}</b>
          <span className="viewer-zhuyin">{entry.zhuyin}</span>
          <span className="viewer-meaning">{entry.meaning}</span>
        </div>
        <span className={'viewer-count' + (done ? ' bump' : '')} key={count}>{count ? `看過 ${count} 次` : '第一次看'}</span>
      </header>

      <div className="viewer-frame">
        {video ? (
          <>
            <video
              ref={videoEl}
              className={'viewer-media' + (ready ? '' : ' loading')}
              src={`/media/${encodeURIComponent(video.file)}`}
              controls
              playsInline
              preload="auto"
              muted={narration}
              onLoadedMetadata={() => setReady(true)}
              onPlaying={(e) => { setBlocked(false); voice.update(e.currentTarget) }}
              onTimeUpdate={(e) => voice.update(e.currentTarget)}
              onPause={() => voice.stop()}
              onSeeking={() => voice.reset()}
              onError={() => setFailed(true)}
              onEnded={finish}
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
            <div className="stage-emoji">{entry.emoji}</div>
            <div className="stage-char">{entry.char}</div>
            <div className="stage-zhuyin">{entry.zhuyin}</div>
          </div>
        )}
      </div>

      <footer className="viewer-nav">
        <button className="nav-btn" disabled={!prev} onClick={() => prev && onGo(prev)}>
          ← {prev ? <span className="nav-char">{prev.char}</span> : '上一個'}
        </button>
        <button className="nav-btn primary" onClick={replay}>🔁 再看一次</button>
        <button className="nav-btn" disabled={!next} onClick={() => next && onGo(next)}>
          {next ? <span className="nav-char">{next.char}</span> : '下一個'} →
        </button>
      </footer>
    </div>
  )
}
