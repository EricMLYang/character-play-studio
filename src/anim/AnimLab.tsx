import { useEffect, useState } from 'react'
import { loadAllClips } from './clips'
import type { Clip } from './clip'
import AnimPlayer, { type Art } from './AnimPlayer'
import '../play/play.css'

/**
 * /anim：動畫取代影片的原型試播頁。
 * 網址可帶 ?char=果&t=3.2 直接定格在某一秒（截圖驗證用）。
 */
export default function AnimLab() {
  // 劇本是按需載入的，試播頁要全部列出來，先全部載入
  const [clips, setClips] = useState<Clip[] | null>(null)
  useEffect(() => { loadAllClips().then(setClips) }, [])
  return clips ? <Lab clips={clips} /> : <div className="boot">載入動畫中…</div>
}

function Lab({ clips: CLIPS }: { clips: Clip[] }) {
  const qs = new URLSearchParams(location.search)
  const [char, setChar] = useState(() => CLIPS.find((c) => c.char === qs.get('char'))?.char ?? CLIPS[0].char)
  const [t, setT] = useState(() => Number(qs.get('t')) || 0)
  const [playing, setPlaying] = useState(false)
  const [run, setRun] = useState(0)
  const [art, setArt] = useState<Art>(() => (qs.get('art') === 'emoji' ? 'emoji' : '3d'))
  const clip = CLIPS.find((c) => c.char === char)!

  const pick = (c: string) => { setChar(c); setPlaying(false); setT(0) }
  const play = () => {
    if (t >= clip.duration - 0.05) setT(0)
    setRun((r) => r + 1)
    setPlaying(true)
  }

  return (
    <div className="anim-lab">
      <header className="anim-head">
        <h1>動畫試播</h1>
        <nav>
          {CLIPS.map((c) => (
            <button key={c.char} className={c.char === char ? 'on' : ''} onClick={() => pick(c.char)}>{c.char}</button>
          ))}
        </nav>
      </header>

      <div className="anim-frame">
        <AnimPlayer key={`${char}-${run}`} clip={clip} playing={playing} t={t} onTime={setT} onEnd={() => setPlaying(false)} art={art} />
        {!playing && t === 0 && <button className="anim-big-play" onClick={play} aria-label="播放">▶</button>}
      </div>

      <div className="anim-controls">
        <button onClick={playing ? () => setPlaying(false) : play}>{playing ? '⏸ 暫停' : t >= clip.duration - 0.05 ? '🔁 重播' : '▶ 播放'}</button>
        <input type="range" min={0} max={clip.duration} step={0.01} value={t}
          onChange={(e) => { setPlaying(false); setT(Number(e.target.value)) }} aria-label="時間" />
        <span className="anim-time">{t.toFixed(2)}s</span>
        <button className="anim-art" onClick={() => setArt((a) => (a === '3d' ? 'emoji' : '3d'))}
          aria-pressed={art === '3d'}>{art === '3d' ? '3D 角色' : 'Emoji 角色'}</button>
      </div>
    </div>
  )
}
