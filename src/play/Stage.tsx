import { useEffect, useMemo, useState } from 'react'
import { emojiCode, isNightSky, parallax, sceneFor, skyAt, type Sky } from './stageScenes'
import { EMOJI_3D } from '../anim/emoji3d'
import { critter } from '../lib/sfx'
import { isSpeaking } from '../lib/audio'

/**
 * 舞台（stageScenes.ts 有為什麼）：天空 → 太陽或月亮 → 雲 → 遠山與遠處的道具 → 近處的草地與道具 → 偶爾飛過去的東西。
 * 整片景放在畫面最底下（z-index 0），不吃點擊；手指一動各層照深度微微移動。
 *
 * sky 不給就照裝置時間（早上、白天、傍晚、晚上）；餵大怪獸有自己的天色（夥伴決定），由它傳進來。
 */
export default function Stage({ screen, sky }: { screen: string; sky?: Sky }) {
  const scene = sceneFor(screen)
  const now = useHourSky()
  const tone = sky ?? now
  const night = isNightSky(tone)
  // 飛過去的東西：每 9～16 秒一隻，從左飛到右或從右飛到左，高度隨機
  const [flyer, setFlyer] = useState<{ key: number; emoji: string; top: number; rtl: boolean } | null>(null)
  useEffect(() => {
    let alive = true
    let t: ReturnType<typeof setTimeout>
    const next = (first = false) => {
      t = setTimeout(() => {
        if (!alive) return
        const emoji = scene.flyers[Math.floor(Math.random() * scene.flyers.length)]
        if (emoji) {
          setFlyer({ key: Date.now(), emoji, top: 10 + Math.random() * 30, rtl: Math.random() < 0.5 })
          // 飛過去叫一聲；正在唸字就不叫（唸字是主角）
          if (!isSpeaking()) critter(emoji)
        }
        next()
      }, first ? 2500 : 9000 + Math.random() * 7000)
    }
    next(true)
    return () => { alive = false; clearTimeout(t) }
  }, [scene])
  const stars = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    left: (i * 53) % 100, top: (i * 37) % 42, delay: (i % 6) * 0.7, size: 2 + (i % 3),
  })), [])

  return (
    <div className={`scenery sky-${tone} scene-${scene.id}`} aria-hidden>
      <div className="stage-sky" />
      {night && <div className="stage-stars">{stars.map((s, i) => (
        <i key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }} />
      ))}</div>}
      <div className="stage-layer depth-1">
        <Art emoji={night ? '🌙' : tone === 'snow' ? '☁️' : '🌞'} className="stage-sun" />
      </div>
      <div className="stage-layer depth-2 stage-clouds">
        <span className="stage-cloud k1" /><span className="stage-cloud k2" /><span className="stage-cloud k3" />
      </div>
      <div className="stage-layer depth-3">
        <svg className="stage-hill far" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0 120 C 150 40, 300 60, 420 100 S 700 30, 860 80 S 1100 50, 1200 90 L1200 200 L0 200 Z" fill={scene.hills[0]} />
        </svg>
        {scene.props.filter((p) => p.layer === 'far').map((p, i) => <PropArt key={i} {...p} />)}
      </div>
      <div className="stage-layer depth-4">
        <svg className="stage-hill near" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0 110 C 200 70, 380 130, 600 100 S 1000 60, 1200 105 L1200 200 L0 200 Z" fill={scene.hills[1]} />
        </svg>
        {scene.props.filter((p) => p.layer === 'near').map((p, i) => <PropArt key={i} {...p} />)}
      </div>
      {tone === 'snow' && <div className="stage-snow">{stars.slice(0, 14).map((s, i) => (
        <i key={i} style={{ left: `${s.left}%`, animationDelay: `${s.delay * 1.7}s`, animationDuration: `${7 + (i % 4)}s` }} />
      ))}</div>}
      {flyer && (
        <div key={flyer.key} className={'stage-flyer' + (flyer.rtl ? ' rtl' : '')} style={{ top: `${flyer.top}%` }}
          onAnimationEnd={() => setFlyer(null)}>
          <Art emoji={flyer.emoji} />
        </div>
      )}
    </div>
  )
}

function PropArt({ emoji, x, size, sway }: { emoji: string; x: number; size: number; sway?: boolean }) {
  return (
    <span className={'stage-prop' + (sway ? ' sway' : '')}
      style={{ left: `${x}%`, ['--size' as any]: `${size}vh`, animationDelay: `${(x % 7) * -0.6}s` }}>
      <Art emoji={emoji} />
    </span>
  )
}

/** 3D 圖（沒有的話退回系統 emoji，景不會缺一塊） */
function Art({ emoji, className }: { emoji: string; className?: string }) {
  const code = emojiCode(emoji)
  return EMOJI_3D.has(code)
    ? <img className={'stage-art ' + (className || '')} src={`/emoji3d/${code}.png`} alt="" draggable={false} />
    : <span className={'stage-art ' + (className || '')}>{emoji}</span>
}

/** 整點換天色（玩到一半從傍晚變晚上，天會慢慢暗下來——transition 在 stage.css） */
function useHourSky(): Sky {
  const [sky, setSky] = useState(() => skyAt(new Date().getHours()))
  useEffect(() => {
    const t = setInterval(() => setSky(skyAt(new Date().getHours())), 60_000)
    return () => clearInterval(t)
  }, [])
  return sky
}

/**
 * 手指在哪裡：寫成 <html> 上的 --px／--py（-1..1），景的各層與角色的頭用 CSS 自己算位移，
 * 不經過 React（一秒六十次重畫整個畫面在 iPad 上會卡）。整個 App 只要掛一次（PlayApp）。
 */
export function useStagePointer() {
  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    let last = { x: 0, y: 0 }
    let shown = { px: 0, py: 0 }
    const apply = () => {
      frame = 0
      const { px, py } = parallax(last.x, last.y, window.innerWidth, window.innerHeight)
      // 改 <html> 上的變數會讓整頁重算樣式：差不到一點點就不改（拖卡片時手指一直在動，iPad 上省很多）
      if (Math.abs(px - shown.px) < 0.02 && Math.abs(py - shown.py) < 0.02) return
      shown = { px, py }
      root.style.setProperty('--px', px.toFixed(2))
      root.style.setProperty('--py', py.toFixed(2))
    }
    const move = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY }
      if (!frame) frame = requestAnimationFrame(apply)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', move, { passive: true })
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', move)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
}
