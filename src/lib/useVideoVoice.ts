import { useEffect, useRef } from 'react'
import { say, stopSpeech } from './audio'

/** Voice cues follow the video clock, so paused playback never keeps speaking. */
export function useVideoVoice(char: string, narration: boolean, volume = 0.7) {
  const nextCue = useRef(0)
  useEffect(() => { nextCue.current = 0; stopSpeech(); return stopSpeech }, [char, narration, volume])
  const update = (video: HTMLVideoElement) => {
    if (!narration || video.paused || !Number.isFinite(video.duration)) return
    const cues = [0, 0.32, 0.65, 0.85].map((ratio) => ratio * video.duration)
    if (nextCue.current < cues.length && video.currentTime >= cues[nextCue.current]) {
      while (nextCue.current < cues.length && video.currentTime >= cues[nextCue.current]) nextCue.current++
      say(char, 0.75, volume)
    }
  }
  return {
    update,
    reset: () => { nextCue.current = 0; stopSpeech() },
    stop: stopSpeech,
  }
}
