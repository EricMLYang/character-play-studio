import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { cheer, stroke as strokeSfx } from '../lib/sfx'

type Stage = 'loading' | 'writing' | 'tracing' | 'done' | 'unavailable'
type CharData = { strokes: string[]; medians: number[][][] }

// 同一個字在 StrictMode 下會掛載兩次，快取讓它只抓一次檔案
const cache = new Map<string, Promise<CharData>>()
function loadChar(char: string) {
  let pending = cache.get(char)
  if (!pending) {
    pending = fetch(`/strokes/${encodeURIComponent(char)}.json`)
      .then((r) => { if (!r.ok) throw new Error('no stroke data'); return r.json() })
    pending.catch(() => cache.delete(char))
    cache.set(char, pending)
  }
  return pending
}

/**
 * 筆順動畫 + 手指描字。資料在 public/strokes/，不必等影片產線，也不用連外網。
 * 沒有筆順資料的字會回報 onUnavailable，讓呼叫端退回原本的字卡動畫。
 */
export default function Strokes({ char, onWritten, onTraced, onUnavailable }: {
  char: string
  /** 筆順示範播完：這時就算「看完」，不要讓觀看紀錄卡在孩子描不描得出來。 */
  onWritten?: () => void
  onTraced?: () => void
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
        // 筆畫多的字（像「龍」16 筆）用預設速度會拖到二十幾秒，孩子等不住
        strokeAnimationSpeed: 1.4, delayBetweenStrokes: 250, drawingWidth: 26,
        // 六歲的手指不準：放寬判定，錯兩次給提示，錯四次就當寫對，不讓他卡在同一筆
        leniency: 1.6, showHintAfterMisses: 2, markStrokeCorrectAfterMisses: 4,
        charDataLoader: () => data,
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
          // 這兩個 callback 丟例外會中斷 hanzi-writer 的 _handleSuccess，
          // 讓它永遠清不掉手上那一筆，整個描字就此卡死；一律吞掉
          writer?.quiz({
            onCorrectStroke: (s) => {
              if (!alive) return
              try {
                setDrawn(data.strokes.length - s.strokesRemaining)
                strokeSfx(data.strokes.length - s.strokesRemaining, data.strokes.length)
              } catch { /* 少一聲音效沒關係，不能卡住描字 */ }
            },
            onComplete: () => {
              if (!alive) return
              try { cheer() } catch { /* 同上 */ }
              setStage('done')
              traced.current?.()
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
  }, [char, round])

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
