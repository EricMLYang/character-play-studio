import { useEffect, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { blip, fanfare, sayRepeat } from '../lib/audio'
import { publishedMedia } from '../../shared/domain.mjs'
import { useVideoVoice } from '../lib/useVideoVoice'

type Phase = 'object' | 'morph' | 'hold' | 'finished'

export default function Viewer({
  entry, index, onDone, onNext, onBack, onComplete,
}: {
  entry: CharEntry
  index: number
  onDone: (e: CharEntry) => void
  onNext: (e: CharEntry) => void
  onBack: () => void
  onComplete: (e: CharEntry, id: string) => void
}) {
  const [failed, setFailed] = useState(false)   // 影片檔壞了 → 退回字卡動畫，不要留黑畫面
  const [blocked, setBlocked] = useState(false)  // 自動播放被擋 → 給一個大大的播放鍵
  const media = publishedMedia(entry)
  const video = failed ? undefined : media.find((m) => m.kind === 'video')
  const [imageFailed, setImageFailed] = useState(false)
  const image = imageFailed ? undefined : media.find((m) => m.kind === 'image')
  const [phase, setPhase] = useState<Phase>('object')
  const [round, setRound] = useState(0) // 重播用
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
    setPhase('finished')
    voice.stop()
    fanfare()
    completeRef.current(entry, eventId.current)
  }

  // 沒有影片時：emoji → 國字的字卡動畫（影片的迷你版）
  useEffect(() => {
    if (video) return
    setPhase('object')
    const t1 = setTimeout(() => { setPhase('morph'); blip(660, 0.18, 'triangle') }, 1200)
    const t2 = setTimeout(() => setPhase('hold'), 2300)
    const stop = sayRepeat(entry.char, 4, 1700, image?.volume ?? 0.7)
    const t3 = setTimeout(finish, 8000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); stop() }
  }, [entry.char, video, round])

  useEffect(() => {
    if (!video) return
    setPhase('hold')
    setBlocked(false)
    if (videoEl.current) { videoEl.current.currentTime = 0; videoEl.current.volume = video.volume ?? 0.7 }
    videoEl.current?.play().catch(() => setBlocked(true))
  }, [entry.char, video, round])

  // 換一個字時，把上一支的失敗狀態清掉
  useEffect(() => { setFailed(false) }, [entry.char])

  const startVideo = () => {
    setBlocked(false)
    videoEl.current?.play().catch(() => setBlocked(true))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
      // Focused buttons handle Enter/Space themselves (especially replay and return-to-picker).
      if ((e.key === ' ' || e.key === 'Enter') && phase === 'finished' &&
        !(e.target instanceof HTMLElement && e.target.closest('button'))) {
        e.preventDefault(); onNext(entry)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, entry, onNext, onBack])

  const replay = () => {
    completed.current = false
    eventId.current = crypto.randomUUID()
    voice.reset()
    blip(760); setPhase('object'); setRound((r) => r + 1)
  }

  return (
    <div className="viewer" style={{ ['--hue' as any]: `var(--c${index % 8})` }}>
      {video ? (
        <>
          <video
            ref={videoEl}
            className="viewer-video"
            src={`/media/${encodeURIComponent(video.file)}`}
            autoPlay
            playsInline
            muted={narration}
            onPlaying={(e) => { setBlocked(false); voice.update(e.currentTarget) }}
            onTimeUpdate={(e) => voice.update(e.currentTarget)}
            // 任何原因停住（被擋、被按到、系統中斷）都要給得回去的路
            onPause={(e) => { voice.stop(); if (!e.currentTarget.ended) setBlocked(true) }}
            onError={() => setFailed(true)}
            onEnded={finish}
          />
          {blocked && (
            <button className="tap-play" onClick={startVideo} aria-label="播放">
              <span>▶</span>
            </button>
          )}
        </>
      ) : image ? (
        <img className="viewer-video" src={`/media/${encodeURIComponent(image.file)}`} alt={entry.char} onError={() => setImageFailed(true)} />
      ) : (
        <div className={`stage stage-${phase}`}>
          <div className="stage-emoji">{entry.emoji}</div>
          <div className="stage-char">{entry.char}</div>
        </div>
      )}

      {phase !== 'finished' && !video && (
        <div className="zhuyin">{entry.zhuyin}</div>
      )}

      {phase === 'finished' && (
        <div className="finish">
          <div className="finish-sticker">⭐ 收集到了</div>
          <div className="finish-char">{entry.char}</div>
          <div className="finish-zhuyin">{entry.zhuyin}</div>
          <div className="finish-actions">
            <button className="big-btn ghost" onClick={replay}>🔁 再一次</button>
            <button className="big-btn" onClick={() => onNext(entry)}>下一個 ➡️</button>
          </div>
          <button className="finish-home" onClick={() => onDone(entry)}>回去選 ↩︎</button>
        </div>
      )}
    </div>
  )
}
