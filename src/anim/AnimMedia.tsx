import { useEffect, useState } from 'react'
import { stopSpeech } from '../lib/audio'
import AnimPlayer from './AnimPlayer'
import type { Clip } from './clip'

/**
 * 播放器裡的動畫短片：當成一支影片用。開啟就自動播，底下有暫停與拖曳，播完呼叫 onEnd。
 * 呼叫端換 key 就是從頭重播。
 */
export default function AnimMedia({ clip, onEnd, autoplay = true }: { clip: Clip; onEnd: () => void; autoplay?: boolean }) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(autoplay)
  const [run, setRun] = useState(0)
  const ended = t >= clip.duration

  useEffect(() => () => stopSpeech(), [])
  useEffect(() => { if (!playing) stopSpeech() }, [playing])

  const play = () => {
    if (ended) setT(0)
    setRun((r) => r + 1)
    setPlaying(true)
  }

  return (
    <div className="anim-media">
      <AnimPlayer key={run} clip={clip} playing={playing} t={t} onTime={setT}
        onEnd={() => { setPlaying(false); onEnd() }} />
      {!playing && t === 0 && <button className="tap-play" onClick={play} aria-label="播放"><span>▶</span></button>}
      <div className="anim-media-bar">
        <button onClick={playing ? () => setPlaying(false) : play} aria-label={playing ? '暫停' : '播放'}>
          {playing ? '⏸' : '▶'}
        </button>
        <input type="range" min={0} max={clip.duration} step={0.01} value={t} aria-label="時間"
          onChange={(e) => { setPlaying(false); setT(Number(e.target.value)) }} />
      </div>
    </div>
  )
}
