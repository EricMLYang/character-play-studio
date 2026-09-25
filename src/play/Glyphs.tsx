import { useEffect, useRef, useState } from 'react'
import HanziWriter from 'hanzi-writer'
import { loadChar } from './Strokes'

/**
 * 他自己寫的字。座標是 hanzi-writer 內部的（x 0–1024、y -124–900 且朝上），
 * 翻成 SVG 的方向就好，不用知道當時畫布多大。
 */
export function Handwriting({ strokes, char }: { strokes?: number[][]; char: string }) {
  if (!strokes?.some((s) => s.length >= 2)) return <span className="hand-fallback">{char}</span>
  return (
    <svg className="hand" viewBox="0 0 1024 1024" aria-hidden>
      <g transform="translate(0 900) scale(1 -1)">
        {strokes.map((s, i) => s.length >= 2 && (
          <polyline key={i} points={s.join(' ')} fill="none" stroke="currentColor" strokeWidth="64"
            strokeLinecap="round" strokeLinejoin="round" style={{ ['--i' as any]: i }} />
        ))}
      </g>
    </svg>
  )
}

/** 一個字自己寫出來給他看，指定的筆畫（他丟進鍋子的那個字）用藍色。沒有筆順資料就直接顯示字。 */
export function CharArt({ char, highlight }: { char: string; highlight: number[] }) {
  const box = useRef<HTMLDivElement>(null)
  const [missing, setMissing] = useState(false)
  const marked = highlight.join(',')

  useEffect(() => {
    const host = box.current
    if (!host) return
    let alive = true
    setMissing(false)
    loadChar(char).then((data) => {
      if (!alive) return
      const size = Math.max(120, Math.min(host.clientWidth, host.clientHeight))
      const writer = HanziWriter.create(host, char, {
        width: size, height: size, padding: Math.round(size * 0.05),
        showCharacter: false, showOutline: true,
        strokeColor: '#2E2A26', outlineColor: 'rgba(46,42,38,.12)',
        radicalColor: marked ? '#0F7FA8' : null,
        strokeAnimationSpeed: 1.8, delayBetweenStrokes: 120,
        charDataLoader: () => (marked ? { ...data, radStrokes: marked.split(',').map(Number) } : data),
      })
      writer.animateCharacter()
    }).catch(() => { if (alive) setMissing(true) })
    return () => { alive = false; host.replaceChildren() }
  }, [char, marked])

  return (
    <div className="char-art">
      <div className="char-art-canvas" ref={box} />
      {missing && <span className="char-art-text">{char}</span>}
    </div>
  )
}
