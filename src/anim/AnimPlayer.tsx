import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { loadChar, type CharData } from '../play/Strokes'
import { say } from '../lib/audio'
import * as sfx from '../lib/sfx'
import { actorsAt, cameraAt, fxAt, glyphAt, lightAt, landings, strokesAt, toStage, FLOOR, GLYPH_TRANSFORM, type Clip, type Vec } from './clip'

/**
 * 播放一份劇本。畫面只看 t：播放時用 rAF 推進 t，拖曳或 frozenAt 時直接指定 t。
 * 唸字與音效只在「正常往前播」跨過時間點時觸發，拖曳不會出聲。
 */
export default function AnimPlayer({ clip, playing, t, onTime, onEnd }: {
  clip: Clip
  playing: boolean
  t: number
  onTime: (t: number) => void
  onEnd?: () => void
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
  const strokes = data ? strokesAt(clip, t, centers) : []
  const g = glyphAt(clip, t)
  const fx = fxAt(clip, t)
  const cam = cameraAt(clip, t)
  const visible = actors.filter((a) => a.visible)
  const dark = lightAt(clip, t)
  // 同一頁可能有兩個播放器（Studio 預覽），漸層 id 不能撞
  const uid = useId().replace(/:/g, '')
  const sky = `sky${uid}`, gloss = `gloss${uid}`

  const renderActor = (a: (typeof visible)[number]) => {
    // 以腳底為支點：壓扁、翻倒都從地板上發生
    const base = a.y + a.size * 0.42
    const sx = a.s * a.sx * (a.flip ? -1 : 1)
    const sy = a.s * a.sy
    const filter = [a.tint, a.glow && `drop-shadow(0 0 ${2 + a.glow * 4}px #FFD400) brightness(${1 + a.glow * 0.6})`].filter(Boolean).join(' ')
    return (
      <g key={a.id} opacity={a.o}
        transform={`translate(${a.x} ${base}) rotate(${a.r}) scale(${sx} ${sy}) translate(0 ${-a.size * 0.42})`}
        style={filter ? { filter } : undefined}>
        <text fontSize={a.size} textAnchor="middle" dominantBaseline="central" y={0}>{a.emoji}</text>
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
      </defs>

      <g transform={`translate(${cam.cx + cam.dx} ${cam.cy + cam.dy}) scale(${cam.z}) translate(${-cam.cx} ${-cam.cy})`}>
        {/* 背景畫大一點，鏡頭震動或推近時邊緣不會露白 */}
        <rect x="-20" y="-20" width="200" height="130" fill={`url(#${sky})`} />
        <Scenery t={t} floor={clip.bg.floor} />
        <rect x="-20" y={FLOOR} width="200" height="40" fill={clip.bg.floor} />
        <rect x="-20" y={FLOOR} width="200" height="1.2" fill="#fff" opacity=".55" />

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
                <path d={data!.strokes[s.index]} fill={s.color} stroke="rgba(0,0,0,.2)" strokeWidth="12" strokeLinejoin="round" />
                <path d={data!.strokes[s.index]} fill={`url(#${gloss})`} />
              </g>
            </g>
          ))}
        </g>

        {visible.filter((a) => !a.top).map(renderActor)}
        {/* 關燈：黑幕蓋住整個舞台，只剩 top 的角色（發亮的眼睛）和漫畫效果 */}
        {dark > 0 && <rect x="-20" y="-20" width="200" height="130" fill="#120E24" opacity={dark * 0.94} />}
        {visible.filter((a) => a.top).map(renderActor)}

        {fx.map((f) => (
          <g key={f.key} opacity={f.o} transform={`translate(${f.x} ${f.y}) rotate(${f.r}) scale(${f.s})`}>
            {f.bubble && <>
              <circle cx={-7} cy={7.5} r={0.9} fill="#fff" stroke="rgba(0,0,0,.15)" strokeWidth=".3" />
              <circle cx={-4.6} cy={5.2} r={1.5} fill="#fff" stroke="rgba(0,0,0,.15)" strokeWidth=".3" />
              <ellipse rx={6.8} ry={5.2} fill="#fff" stroke="rgba(0,0,0,.15)" strokeWidth=".4" />
            </>}
            {f.emoji && <text fontSize={f.size} textAnchor="middle" dominantBaseline="central">{f.emoji}</text>}
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
    </svg>
  )
}

/** 背景：兩座圓圓的小丘、幾朵慢慢飄的雲。顏色跟著地板，淡淡的不搶戲。 */
function Scenery({ t, floor }: { t: number; floor: string }) {
  const drift = (speed: number, start: number) => ((start + t * speed) % 200) - 20
  return (
    <g aria-hidden>
      <ellipse cx="22" cy={FLOOR + 6} rx="46" ry="18" fill={floor} opacity=".55" />
      <ellipse cx="142" cy={FLOOR + 8} rx="52" ry="20" fill={floor} opacity=".45" />
      {[[2.2, 30, 14, 1], [1.4, 120, 9, 0.75], [1.8, 80, 22, 0.6]].map(([speed, start, y, k], i) => (
        <g key={i} transform={`translate(${drift(speed, start)} ${y}) scale(${k})`} fill="#fff" opacity=".7">
          <ellipse rx="9" ry="3.6" />
          <circle cx="-3" cy="-2.4" r="3.6" />
          <circle cx="2.6" cy="-3" r="4.4" />
        </g>
      ))}
    </g>
  )
}
