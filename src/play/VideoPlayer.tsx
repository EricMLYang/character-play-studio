import { useEffect, useRef, useState } from 'react'
import type { Media } from '../types'
import { useVideoVoice } from '../lib/useVideoVoice'
import { mediaUrl } from './source'
import { TapPlay } from './ui'

/**
 * 播一支上架影片：照家長審核過的音量、需要的話照影片進度唸字、自動播放被擋就給大播放鍵。
 * 每次掛上去都從頭播；要重播就換 key。
 */
export default function VideoPlayer({ char, media, controls = false, onEnded, onFailed }: {
  char: string
  media: Media
  /** 觀看層給孩子拖曳、暫停；字火車一節一節自己播，不給 */
  controls?: boolean
  onEnded: () => void
  onFailed: () => void
}) {
  const [blocked, setBlocked] = useState(false)
  const [ready, setReady] = useState(false)       // 尺寸未知前先不顯示，避免先閃出小框
  const el = useRef<HTMLVideoElement>(null)
  const narration = media.audioMode === 'narration'
  const voice = useVideoVoice(char, narration, media.volume ?? 0.7)

  useEffect(() => {
    const v = el.current
    if (!v) return
    v.volume = media.volume ?? 0.7
    v.play().catch(() => setBlocked(true))
  }, [media])

  return (
    <>
      <video
        ref={el}
        className={'viewer-media' + (ready ? '' : ' loading')}
        src={mediaUrl(media)}
        controls={controls}
        controlsList={controls ? 'nodownload noplaybackrate' : undefined}
        disablePictureInPicture
        playsInline
        preload="auto"
        muted={narration}
        onLoadedMetadata={() => setReady(true)}
        onPlaying={(e) => { setBlocked(false); voice.update(e.currentTarget) }}
        onTimeUpdate={(e) => voice.update(e.currentTarget)}
        onPause={() => voice.stop()}
        onSeeking={() => voice.reset()}
        onError={onFailed}
        onEnded={onEnded}
      />
      {blocked && <TapPlay onPlay={() => { el.current?.play().catch(() => setBlocked(true)) }} />}
    </>
  )
}
