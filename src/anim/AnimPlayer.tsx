import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { loadChar, type CharData } from '../play/Strokes'
import { say } from '../lib/audio'
import * as sfx from '../lib/sfx'
import Scenery, { FloorDecor } from './Scenery'
import { EMOJI_3D } from './emoji3d'
import { actorsAt, cameraAt, fxAt, glyphAt, glyphDoneAt, lightAt, landings, strokesAt, toStage, FLOOR, GLYPH_TRANSFORM, type Clip, type Vec } from './clip'

/**
 * 播放一份劇本。畫面只看 t：播放時用 rAF 推進 t，拖曳或 frozenAt 時直接指定 t。
 * 唸字與音效只在「正常往前播」跨過時間點時觸發，拖曳不會出聲。
 */
export default function AnimPlayer({ clip, playing, t, onTime, onEnd, art = 'emoji' }: {
  clip: Clip
  playing: boolean
  t: number
  onTime: (t: number) => void
  onEnd?: () => void
  /** emoji：系統 emoji 字；3d：換成 public/emoji3d 的 3D 渲染圖（沒有圖的照樣用 emoji 字） */
  art?: Art
}) {
  const [data, setData] = useState<CharData | null>(null)
  const last = useRef(t)

  useEffect(() => {
    let alive = true
    setData(null)
    loadChar(clip.char).then((d) => alive && setData(d)).catch(() => {})
    return () => { alive = false }
  }, [clip.char])

  const centers = useMemo<Vec[]>(() => (data?.medians ?? []).map((m) => {
    const x = m.reduce((s, p) => s + p[0], 0) / m.length
    const y = m.reduce((s, p) => s + p[1], 0) / m.length
    return toStage(x, y)
  }), [data])

  const ticks = useMemo(() => landings(clip), [clip])

  // 時鐘：從目前的 t 接著播
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const origin = performance.now() - t * 1000
    const step = (now: number) => {
      const next = (now - origin) / 1000
      if (next >= clip.duration) { onTime(clip.duration); onEnd?.(); return }
      onTime(next)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // t 只在開始播的那一刻讀一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, clip])

  // 跨過的時間點才出聲
  useEffect(() => {
    const prev = last.current
    last.current = t
    if (!playing || t <= prev || t - prev > 0.5) return
    const crossed = (at: number) => at > prev && at <= t
    for (const c of clip.cues) {
      if (!crossed(c.at)) continue
      if ('say' in c) say(c.say, 0.8)
      else sfx[c.sfx]()
    }
    for (const k of ticks) if (crossed(k.at)) sfx.stroke(k.i, k.n)
  }, [t, playing, clip, ticks])

  const actors = actorsAt(clip, t)
  // 0.05 秒前的位置：算速度，快速移動時畫速度線
  const before = new Map(actorsAt(clip, Math.max(0, t - 0.05)).map((a) => [a.id, a]))
  const doneAt = useMemo(() => glyphDoneAt(clip), [clip])
  const strokes = data ? strokesAt(clip, t, centers) : []
  const g = glyphAt(clip, t)
  const fx = fxAt(clip, t)
  const cam = cameraAt(clip, t)
  const visible = actors.filter((a) => a.visible)
  const dark = lightAt(clip, t)
  // 同一頁可能有兩個播放器（Studio 預覽），漸層 id 不能撞
  const uid = useId().replace(/:/g, '')
  const sky = `sky${uid}`, gloss = `gloss${uid}`, vignette = `vig${uid}`, shine = `shine${uid}`, glyphClip = `gclip${uid}`

  const renderActor = (a: (typeof visible)[number]) => {
    // 以腳底為支點：壓扁、翻倒都從地板上發生
    const base = a.y + a.size * 0.42
    // 站在地上的角色會微微呼吸，畫面不會有完全靜止的死角；每個角色節奏錯開
    const breath = a.float ? 0 : Math.sin(t * 6.9 + phase(a.id)) * 0.022
    const sx = a.s * a.sx * (a.flip ? -1 : 1) * (1 - breath * 0.5)
    const sy = a.s * a.sy * (1 + breath)
    // 白色貼紙描邊＋軟陰影：emoji 看起來像一張張立體貼紙，不再平貼在背景上
    const filter = [a.tint, STICKER, a.glow && `drop-shadow(0 0 ${2 + a.glow * 4}px #FFD400) brightness(${1 + a.glow * 0.6})`].filter(Boolean).join(' ')
    return (
      <g key={a.id} opacity={a.o}
        transform={`translate(${a.x} ${base}) rotate(${a.r}) scale(${sx} ${sy}) translate(0 ${-a.size * 0.42})`}
        style={filter ? { filter } : undefined}>
        <Emoji char={a.emoji} size={a.size} art={art} />
      </g>
    )
  }

  return (
    <svg className="anim-stage" viewBox="0 0 160 90" role="img" aria-label={`${clip.char} 的動畫`}>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={clip.bg.top} />
          <stop offset="1" stopColor={clip.bg.bottom} />
        </linearGradient>
        {/* 國字那層上下翻過（hanzi-writer 的 y 朝上），所以亮面從 y=1 往下 */}
        <linearGradient id={gloss} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {data && <clipPath id={glyphClip}>
          {/* clipPath 裡不能放 <g>，轉換要寫在每個 path 上 */}
          {data.strokes.map((d, i) => <path key={i} d={d} transform={GLYPH_TRANSFORM} />)}
        </clipPath>}
        <radialGradient id={vignette} cx=".5" cy=".5" r=".75">
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".16" />
        </radialGradient>
      </defs>

      <g transform={`translate(${cam.cx + cam.dx} ${cam.cy + cam.dy}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
        {/* 背景畫大一點，鏡頭震動或推近時邊緣不會露白 */}
        <rect x="-20" y="-20" width="200" height="130" fill={`url(#${sky})`} />
        {/* 視差：背景只跟著鏡頭動一部分，推近、震動時才有景深 */}
        <g transform={`translate(${cam.cx} ${cam.cy}) scale(${(1 + (cam.z - 1) * 0.4) / cam.z}) translate(${-cam.cx - cam.dx * 0.6} ${-cam.cy - cam.dy * 0.6})`}>
          <Scenery kind={clip.bg.scenery} t={t} floor={clip.bg.floor} sky={clip.bg.top} />
        </g>
        <rect x="-20" y={FLOOR} width="200" height="40" fill={clip.bg.floor} />
        <rect x="-20" y={FLOOR} width="200" height="1.2" fill="#fff" opacity=".55" />
        <FloorDecor kind={clip.bg.scenery} t={t} />

        {/* 地上的影子：離地愈高愈小愈淡，跳起來才看得出高度 */}
        {visible.filter((a) => !a.float).map((a) => {
          const h = Math.max(0, FLOOR - (a.y + a.size * 0.42))
          const k = 1 - Math.min(1, h / 40)
          return <ellipse key={`sh-${a.id}`} cx={a.x} cy={FLOOR + 1.4} rx={a.size * 0.34 * a.s * a.sx * (0.4 + 0.6 * k)}
            ry={a.size * 0.06 * (0.4 + 0.6 * k)} fill="#000" opacity={0.16 * k * a.o} />
        })}

        <g transform={`translate(${80 + g.dx} 45) rotate(${g.r}) scale(${g.s}) translate(-80 -45)`}
          style={{ filter: 'drop-shadow(0 1.2px 0 rgba(0,0,0,.18))' }}>
          {strokes.map((s) => (
            <g key={s.index} opacity={s.o}
              transform={`translate(${s.dx + s.cx} ${s.dy + s.cy}) rotate(${s.r}) scale(${s.s}) translate(${-s.cx} ${-s.cy})`}>
              <g transform={GLYPH_TRANSFORM}>
                {/* 底下一層深色往下錯開：像一塊厚厚的玩具積木 */}
                <path d={data!.strokes[s.index]} fill={shade(s.color, 0.62)} transform="translate(0 -26)" />
                <path d={data!.strokes[s.index]} fill={s.color} stroke="rgba(0,0,0,.2)" strokeWidth="12" strokeLinejoin="round" />
                <path d={data!.strokes[s.index]} fill={`url(#${gloss})`} />
              </g>
            </g>
          ))}
          {/* 國字拼好、還有最後要結束時，各有一道光從左掃到右 */}
          {data && [doneAt + 0.05, clip.duration - 0.85].map((at, i) => {
            const p = (t - at) / 0.7
            if (p < 0 || p > 1) return null
            const x = 40 + p * 90
            return <g key={i} clipPath={`url(#${glyphClip})`}>
              <rect x={x - 10} y="8" width="20" height="76" fill={`url(#${shine})`} transform={`skewX(-18) translate(14 0)`} />
            </g>
          })}
        </g>

        {/* 每一筆落定時噴一圈小星光 */}
        {ticks.map((k) => {
          const p = (t - k.at) / 0.4
          const c = centers[k.stroke]
          if (p < 0 || p > 1 || !c) return null
          return <g key={`spark-${k.i}`} opacity={1 - p}>
            {[0, 1, 2, 3, 4].map((j) => {
              const ang = j * 1.2566 + k.i
              const d = 2 + p * 7
              return <circle key={j} cx={c.x + Math.cos(ang) * d} cy={c.y + Math.sin(ang) * d} r={0.9 * (1 - p) + 0.2} fill={j % 2 ? '#FFF6B0' : '#fff'} />
            })}
          </g>
        })}

        {/* 速度線：跑得快、飛得快的角色後面拖幾條白線 */}
        {visible.filter((a) => !a.top).map((a) => {
          const b = before.get(a.id)
          if (!b || !b.visible) return null
          const vx = (a.x - b.x) / 0.05, vy = (a.y - b.y) / 0.05
          const speed = Math.hypot(vx, vy)
          if (speed < 45) return null
          const ux = vx / speed, uy = vy / speed
          const len = Math.min(speed * 0.08, 14) * a.s
          const o = Math.min(1, (speed - 45) / 60) * 0.8 * a.o
          return <g key={`speed-${a.id}`} opacity={o} stroke="#fff" strokeWidth=".6" strokeLinecap="round">
            {[-0.28, 0, 0.28].map((k, j) => {
              const ox = a.x - uy * a.size * k - ux * a.size * 0.35
              const oy = a.y + ux * a.size * k - uy * a.size * 0.35
              const l = len * (j === 1 ? 1 : 0.7)
              return <line key={j} x1={ox} y1={oy} x2={ox - ux * l} y2={oy - uy * l} />
            })}
          </g>
        })}

        {visible.filter((a) => !a.top).map(renderActor)}
        {/* 關燈：黑幕蓋住整個舞台，只剩 top 的角色（發亮的眼睛）和漫畫效果 */}
        {dark > 0 && <rect x="-20" y="-20" width="200" height="130" fill="#120E24" opacity={dark * 0.94} />}
        {/* level 是負的：相機閃光燈，整個畫面一白 */}
        {dark < 0 && <rect x="-20" y="-20" width="200" height="130" fill="#fff" opacity={-dark} />}
        {visible.filter((a) => a.top).map(renderActor)}

        {fx.map((f) => (
          <g key={f.key} opacity={f.o} transform={`translate(${f.x} ${f.y}) rotate(${f.r}) scale(${f.s})`}>
            {f.bubble && <>
              <circle cx={-7} cy={7.5} r={0.9} fill="#fff" stroke="rgba(0,0,0,.15)" strokeWidth=".3" />
              <circle cx={-4.6} cy={5.2} r={1.5} fill="#fff" stroke="rgba(0,0,0,.15)" strokeWidth=".3" />
              <ellipse rx={6.8} ry={5.2} fill="#fff" stroke="rgba(0,0,0,.15)" strokeWidth=".4" />
            </>}
            {f.emoji && <Emoji char={f.emoji} size={f.size} art={art} />}
            {f.beam && <polygon points={f.beam.map((q) => `${q.x},${q.y}`).join(' ')} fill="#FFF27A" opacity=".45" />}
            {f.line && <>
              <line x1={f.line.from.x} y1={f.line.from.y} x2={f.line.to.x} y2={f.line.to.y} stroke={f.line.color}
                strokeWidth={f.line.width * 2.6} strokeLinecap="round" opacity=".3" />
              <line x1={f.line.from.x} y1={f.line.from.y} x2={f.line.to.x} y2={f.line.to.y} stroke={f.line.color}
                strokeWidth={f.line.width} strokeLinecap="round" />
            </>}
            {f.wave && <path d="M0,4 q-2,-2 0,-4 q2,-2 0,-4" fill="none" stroke="#7BC74D" strokeWidth="1" strokeLinecap="round" />}
            {f.bolt && <>
              <polyline points={f.bolt.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#FFE14D" strokeWidth="3.2"
                strokeLinejoin="round" strokeLinecap="round" opacity=".55" />
              <polyline points={f.bolt.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#fff" strokeWidth="1.1"
                strokeLinejoin="round" strokeLinecap="round" />
            </>}
          </g>
        ))}
      </g>
      <rect width="160" height="90" fill={`url(#${vignette})`} pointerEvents="none" />
    </svg>
  )
}

/** 把 #RRGGBB 調暗（k < 1）。 */
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = (v: number) => Math.round(v * k).toString(16).padStart(2, '0')
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`
}

/** 角色描邊：兩層白色細光暈疊成貼紙邊，再加一點往下的軟陰影。 */
const STICKER = 'drop-shadow(0 0 0.45px #fff) drop-shadow(0 0 0.45px #fff) drop-shadow(0 0 0.3px #fff) drop-shadow(0 0.8px 0.6px rgba(0,0,0,.3))'

/** 由 id 算一個固定的相位，讓每個角色呼吸的節奏不一樣。 */
function phase(id: string) {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 1000
  return h / 159
}

export type Art = 'emoji' | '3d'

const codeOf = (e: string) => [...e.replace(/\uFE0F/g, '')].map((c) => c.codePointAt(0)!.toString(16)).join('-')

/** 一個 emoji，置中在 (0,0)。3D 圖的四邊留白比 emoji 字多一點，放大一點才會一樣大。 */
function Emoji({ char, size, art }: { char: string; size: number; art: Art }) {
  const code = art === '3d' ? codeOf(char) : ''
  if (code && EMOJI_3D.has(code)) {
    const s = size * 1.08
    return <image href={`/emoji3d/${code}.png`} x={-s / 2} y={-s / 2} width={s} height={s} />
  }
  return <text fontSize={size} textAnchor="middle" dominantBaseline="central">{char}</text>
}
