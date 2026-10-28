import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { blast, blossom, cheer, chime, flame, frost, pops, slash, stomp, twinkle, zap } from '../lib/sfx'
import StrokeFx, { type Burst, type Hit } from './StrokeFx'
import { nextTheme, STROKE_THEMES, themeFor, type Point, type Trail } from './strokeThemes'

type Stage = 'loading' | 'writing' | 'tracing' | 'done' | 'unavailable'
export type CharData = { strokes: string[]; medians: number[][][] }

// 同一個字在 StrictMode 下會掛載兩次，快取讓它只抓一次檔案
const cache = new Map<string, Promise<CharData>>()
export function loadChar(char: string) {
  let pending = cache.get(char)
  if (!pending) {
    pending = fetch(`/strokes/${encodeURIComponent(char)}.json`)
      .then((r) => { if (!r.ok) throw new Error('no stroke data'); return r.json() })
    pending.catch(() => cache.delete(char))
    cache.set(char, pending)
  }
  return pending
}

/** 每一種特效寫對一筆的聲音（pitch 跟著第幾筆往上爬） */
const SOUNDS: Record<Trail, (index: number, total: number) => void> = {
  blade: slash, fire: flame, bolt: zap, rainbow: chime, sparkle: twinkle, bubble: pops, bloom: blossom, steps: stomp, frost, rocket: blast,
}
/** 寫過幾次字（一次換一種特效）、他自己用特效鈕選過哪一種（選過就一直用，直到關掉 App） */
let writes = 0
let chosen: Trail | null = null
/** 一筆演多久就拿掉 */
const FX_MS = 1500
const STROKE_ICON = Object.fromEntries(STROKE_THEMES.map((t) => [t.id, t.icon])) as Record<Trail, string>

/** 他畫的一筆：隔太近的點丟掉、最多留 64 點，存得下又保留手抖的樣子。 */
function keepStroke(points: { x: number; y: number }[]): number[] {
  const kept: { x: number; y: number }[] = []
  for (const p of points) {
    const last = kept[kept.length - 1]
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= 14) kept.push(p)
  }
  const end = points[points.length - 1]
  if (end && kept[kept.length - 1] !== end) kept.push(end)
  const step = Math.max(1, Math.ceil(kept.length / 64))
  const sampled = kept.filter((_, i) => i % step === 0 || i === kept.length - 1).slice(-64)
  if (sampled.length === 1) sampled.push(sampled[0])
  return sampled.flatMap((p) => [Math.round(p.x), Math.round(p.y)])
}

/**
 * 筆順動畫 + 手指描字。資料在 public/strokes/，不必等影片產線，也不用連外網。
 * 沒有筆順資料的字會回報 onUnavailable，讓呼叫端退回原本的字卡動畫。
 *
 * 兩種模式：照著描（先示範、有外框）→ 描完邀他「遮起來，自己寫寫看」：沒有示範、沒有外框，
 * 憑記憶寫，錯兩次才閃一下提示。研究上寫字幫助認字是因為在分析字的結構，描線條只做到一半。
 *
 * 他自己寫（描或遮起來寫）的時候，每寫對一筆就順著他畫的線演一下特效（忍者砍一刀、噴火、閃電…十種，
 * strokeThemes.ts），寫完整個字在中間炸開一圈。一次寫字一種，下一次換下一種；特效鈕可以自己換。
 */
export default function Strokes({ char, highlight, startBlind = false, onWritten, onTraced, onUnavailable }: {
  char: string
  /** 這個字裡面那個他已經學過的字佔掉的筆畫，會用另一個顏色寫出來。 */
  highlight?: number[]
  /** 一進來就是遮起來寫（今天的路上複習時用） */
  startBlind?: boolean
  /** 筆順示範播完：這時就算「看完」，不要讓觀看紀錄卡在孩子描不描得出來。 */
  onWritten?: () => void
  /** 描完整個字，帶著他自己寫的每一筆（搬進小鎮用）；blind＝是遮起來憑記憶寫的 */
  onTraced?: (strokes: number[][], blind: boolean) => void
  onUnavailable?: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage>('loading')
  const [total, setTotal] = useState(0)
  const [drawn, setDrawn] = useState(0)
  const [round, setRound] = useState(0)
  const [blind, setBlind] = useState(startBlind)
  const again = (nextBlind: boolean) => { setBlind(nextBlind); setRound((r) => r + 1) }
  const written = useRef(onWritten)
  const traced = useRef(onTraced)
  const unavailable = useRef(onUnavailable)
  written.current = onWritten
  traced.current = onTraced
  unavailable.current = onUnavailable
  // 陣列每次 render 都是新的，用內容當 key 才不會一直重建 writer
  const marked = highlight?.length ? highlight.join(',') : ''
  const wrap = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<Trail>(() => themeFor(writes, chosen).id)
  const themeNow = useRef(theme)
  themeNow.current = theme
  const [hits, setHits] = useState<Hit[]>([])
  const [burst, setBurst] = useState<Burst | null>(null)
  const fxTimers = useRef<number[]>([])
  const fxId = useRef(0)
  useEffect(() => () => fxTimers.current.forEach(clearTimeout), [])

  /** 演一筆特效：points 是相對整個描字區的位置（px） */
  const play = (points: Point[], index: number, total: number) => {
    const id = ++fxId.current
    const t = themeNow.current
    try { SOUNDS[t](index, total) } catch { /* 少一聲沒關係 */ }
    setHits((h) => [...h.slice(-5), { id, theme: t, points }])
    fxTimers.current.push(window.setTimeout(() => setHits((h) => h.filter((x) => x.id !== id)), FX_MS))
    // 忍者刀：砍下去整格抖一下
    if (t === 'blade' && wrap.current) {
      const el = wrap.current
      el.classList.remove('fx-shake')
      void el.offsetWidth
      el.classList.add('fx-shake')
      fxTimers.current.push(window.setTimeout(() => el.classList.remove('fx-shake'), 320))
    }
  }

  /** 字的中心與大小（相對描字區），寫完炸開、換特效時試演都用它 */
  const canvasBox = () => {
    const host = box.current, w = wrap.current
    if (!host || !w) return null
    const r = host.getBoundingClientRect(), o = w.getBoundingClientRect()
    return { x: r.left - o.left, y: r.top - o.top, size: r.width }
  }

  /** 特效鈕：換下一種，並在格子中間橫著試演一筆給他看 */
  const switchTheme = () => {
    const t = nextTheme(themeNow.current)
    chosen = t.id
    themeNow.current = t.id
    setTheme(t.id)
    const c = canvasBox()
    if (c) play([{ x: c.x + c.size * 0.2, y: c.y + c.size * 0.5 }, { x: c.x + c.size * 0.8, y: c.y + c.size * 0.5 }], 0, 1)
  }

  useEffect(() => {
    const host = box.current
    if (!host) return
    let alive = true
    let writer: HanziWriter | null = null
    let observer: ResizeObserver | null = null
    setStage('loading')
    setDrawn(0)

    loadChar(char).then((data) => {
      if (!alive) return
      const size = () => Math.max(120, Math.min(host.clientWidth, host.clientHeight))
      setTotal(data.strokes.length)
      writer = HanziWriter.create(host, char, {
        width: size(), height: size(), padding: Math.round(size() * 0.05),
        showCharacter: false, showOutline: !blind,
        strokeColor: '#2E2A26', outlineColor: 'rgba(46,42,38,.16)',
        drawingColor: '#FF6B6B', highlightColor: '#FFC53D',
        // hanzi-writer 只會把 radStrokes 那幾筆畫成 radicalColor，所以直接餵它我們要標的筆
        radicalColor: marked ? '#0F7FA8' : null,
        // 筆畫多的字（像「龍」16 筆）用預設速度會拖到二十幾秒，孩子等不住
        strokeAnimationSpeed: 1.4, delayBetweenStrokes: 250, drawingWidth: 26,
        // 六歲的手指不準：放寬判定，錯兩次給提示，錯四次就當寫對，不讓他卡在同一筆
        leniency: 1.6, showHintAfterMisses: 2, markStrokeCorrectAfterMisses: 4,
        charDataLoader: () => (marked ? { ...data, radStrokes: marked.split(',').map(Number) } : data),
      })
      observer = new ResizeObserver(() => {
        writer?.updateDimensions({ width: size(), height: size(), padding: Math.round(size() * 0.05) })
      })
      observer.observe(host)

      const hand: number[][] = []
      /** hanzi-writer 的點（字的座標，1024 格、y 朝上）換成描字區裡的 px：直接用它畫字那一層的矩陣 */
      const toLocal = (points: { x: number; y: number }[]): Point[] => {
        const g = host.querySelector('svg g[transform]') as SVGGElement | null
        const m = g?.getScreenCTM()
        const w = wrap.current?.getBoundingClientRect()
        if (!m || !w) return []
        return points.map((p) => ({ x: m.a * p.x + m.c * p.y + m.e - w.left, y: m.b * p.x + m.d * p.y + m.f - w.top }))
      }
      const startQuiz = () => {
        if (!alive) return
        // 這次寫字用哪一種特效（他選過就用他選的）
        const t = themeFor(writes++, chosen).id
        themeNow.current = t
        setTheme(t)
        setBurst(null)
        setStage('tracing')
        // 這兩個 callback 丟例外會中斷 hanzi-writer 的 _handleSuccess，
        // 讓它永遠清不掉手上那一筆，整個描字就此卡死；一律吞掉
        writer?.quiz({
            onCorrectStroke: (s) => {
              if (!alive) return
              try {
                hand[s.strokeNum] = keepStroke(s.drawnPath.points)
                setDrawn(data.strokes.length - s.strokesRemaining)
                // 特效順著他手指畫的線走；點一下就過的（錯四次當寫對）用那一筆的標準路線
                const own = s.drawnPath.points.length > 1 ? s.drawnPath.points : data.medians[s.strokeNum].map(([x, y]) => ({ x, y }))
                play(toLocal(own), data.strokes.length - s.strokesRemaining, data.strokes.length)
              } catch { /* 少一聲音效沒關係，不能卡住描字 */ }
            },
            onComplete: () => {
              if (!alive) return
              try { cheer() } catch { /* 同上 */ }
              try {
                const c = canvasBox()
                if (c) setBurst({ id: ++fxId.current, theme: themeNow.current, at: { x: c.x + c.size / 2, y: c.y + c.size / 2 }, size: c.size })
              } catch { /* 沒有炸開也要能慶祝 */ }
              setStage('done')
              // 補齊漏掉的筆（理論上不會），避免存下有洞的陣列
              try { traced.current?.(Array.from(hand, (s) => s || []), blind) } catch { /* 存不了筆跡也要能慶祝 */ }
            },
          })
      }
      // 遮起來寫：沒有示範，直接換他寫（示範播完才算「看完」，這裡不算）
      if (blind) startQuiz()
      else {
        setStage('writing')
        writer.animateCharacter({ onComplete: () => { if (!alive) return; written.current?.(); startQuiz() } })
      }
    }).catch(() => {
      if (!alive) return
      setStage('unavailable')
      unavailable.current?.()
    })

    return () => {
      alive = false
      observer?.disconnect()
      try { writer?.cancelQuiz() } catch { /* 還沒建好就卸載，忽略 */ }
      host.replaceChildren()
    }
  }, [char, round, marked, blind])

  if (stage === 'unavailable') return null

  return (
    <div className={`strokes strokes-${stage}${blind ? ' strokes-blind' : ''}`} ref={wrap}>
      <div className="stroke-canvas" ref={box} />
      <StrokeFx hits={hits} burst={burst} />
      {total > 0 && (
        <div className="stroke-dots" aria-hidden>
          {Array.from({ length: total }, (_, i) => <span key={i} className={i < drawn ? 'on' : ''} />)}
        </div>
      )}
      <p className="stroke-tip" role="status">
        {stage === 'loading' ? '準備筆順…'
          : stage === 'writing' ? '✏️ 一筆一畫，寫給你看'
          : stage === 'tracing' ? (blind ? `🙈 沒有偷看，自己寫！還有 ${Math.max(total - drawn, 0)} 筆` : `👆 換你用手指描！還有 ${Math.max(total - drawn, 0)} 筆`)
          : blind ? '🌟 沒有偷看就寫出來了！' : '🎉 你自己把這個字寫出來了！'}
      </p>
      {stage !== 'loading' && (
        <div className="stroke-actions">
          {stage === 'done' && !blind && (
            <button className="stroke-again blind" onClick={() => again(true)}>🙈 遮起來，自己寫寫看</button>
          )}
          <button className="stroke-again" onClick={() => again(blind)}>
            {stage === 'done' ? (blind ? '🙈 再寫一次' : '✏️ 再描一次') : '↺ 重來'}
          </button>
          {stage === 'done' && blind && (
            <button className="stroke-again" onClick={() => again(false)}>✏️ 看著描</button>
          )}
          {(stage === 'tracing' || stage === 'done') && (
            <button key={theme} className="stroke-again fx-pick changed" onClick={switchTheme} aria-label="換一種寫字特效">
              {STROKE_ICON[theme]}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
