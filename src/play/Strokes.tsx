import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { cheer, stroke as strokeSfx } from '../lib/sfx'

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
 */
export default function Strokes({ char, highlight, onWritten, onTraced, onUnavailable }: {
  char: string
  /** 這個字裡面那個他已經學過的字佔掉的筆畫，會用另一個顏色寫出來。 */
  highlight?: number[]
  /** 筆順示範播完：這時就算「看完」，不要讓觀看紀錄卡在孩子描不描得出來。 */
  onWritten?: () => void
  /** 描完整個字，帶著他自己寫的每一筆（搬進小鎮用）。 */
  onTraced?: (strokes: number[][]) => void
  onUnavailable?: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState<Stage>('loading')
  const [total, setTotal] = useState(0)
  const [drawn, setDrawn] = useState(0)
  const [round, setRound] = useState(0)
  const written = useRef(onWritten)
  const traced = useRef(onTraced)
  const unavailable = useRef(onUnavailable)
  written.current = onWritten
  traced.current = onTraced
  unavailable.current = onUnavailable
  // 陣列每次 render 都是新的，用內容當 key 才不會一直重建 writer
  const marked = highlight?.length ? highlight.join(',') : ''

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
        showCharacter: false, showOutline: true,
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

      setStage('writing')
      writer.animateCharacter({
        onComplete: () => {
          if (!alive) return
          written.current?.()
          setStage('tracing')
          const hand: number[][] = []
          // 這兩個 callback 丟例外會中斷 hanzi-writer 的 _handleSuccess，
          // 讓它永遠清不掉手上那一筆，整個描字就此卡死；一律吞掉
          writer?.quiz({
            onCorrectStroke: (s) => {
              if (!alive) return
              try {
                hand[s.strokeNum] = keepStroke(s.drawnPath.points)
                setDrawn(data.strokes.length - s.strokesRemaining)
                strokeSfx(data.strokes.length - s.strokesRemaining, data.strokes.length)
              } catch { /* 少一聲音效沒關係，不能卡住描字 */ }
            },
            onComplete: () => {
              if (!alive) return
              try { cheer() } catch { /* 同上 */ }
              setStage('done')
              // 補齊漏掉的筆（理論上不會），避免存下有洞的陣列
              try { traced.current?.(Array.from(hand, (s) => s || [])) } catch { /* 存不了筆跡也要能慶祝 */ }
            },
          })
        },
      })
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
  }, [char, round, marked])

  if (stage === 'unavailable') return null

  return (
    <div className={`strokes strokes-${stage}`}>
      <div className="stroke-canvas" ref={box} />
      {total > 0 && (
        <div className="stroke-dots" aria-hidden>
          {Array.from({ length: total }, (_, i) => <span key={i} className={i < drawn ? 'on' : ''} />)}
        </div>
      )}
      <p className="stroke-tip" role="status">
        {stage === 'loading' ? '準備筆順…'
          : stage === 'writing' ? '✏️ 一筆一畫，寫給你看'
          : stage === 'tracing' ? `👆 換你用手指描！還有 ${Math.max(total - drawn, 0)} 筆`
          : '🎉 你自己把這個字寫出來了！'}
      </p>
      {stage !== 'loading' && (
        <button className="stroke-again" onClick={() => setRound((r) => r + 1)}>
          {stage === 'done' ? '✏️ 再寫一次' : '↺ 重新描'}
        </button>
      )}
    </div>
  )
}
