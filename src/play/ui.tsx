import type { ReactNode } from 'react'
import type { CharEntry } from '../types'

/**
 * 各個遊戲共用的小元件與顏色。新遊戲先從這裡拿，畫面長得才會一致。
 */

/** 卡片色盤的第幾號（0–7），寫進 style 的 --hue。 */
export const hueVar = (n: number) => `var(--c${n})`

/**
 * 一個字到哪裡都同一個顏色：有影片的字跟著它在首頁所在的詞（hueMap），其他字照優先序輪。
 * hues 是 words.ts 的 hueMap(groups)。
 */
export const hueOf = (entry: Pick<CharEntry, 'char' | 'priority'>, hues: Map<string, number>) =>
  hues.get(entry.char) ?? entry.priority % 8

/** 遊戲畫面上方那一列：回字卡、標題、右邊一個小統計。 */
export function SubBar({ title, stat, onBack, backLabel = '← 回字卡' }: {
  title: ReactNode
  stat?: ReactNode
  onBack: () => void
  backLabel?: string
}) {
  return (
    <header className="sub-bar">
      <button className="viewer-close" onClick={onBack}>{backLabel}</button>
      <h2 className="sub-title">{title}</h2>
      {stat !== undefined && <span className="sub-stat">{stat}</span>}
    </header>
  )
}

/** 看完、組好、變出來的彩帶。CSS 動畫，沒有圖檔。 */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => <span key={i} style={{ ['--i' as any]: i }} />)}
    </div>
  )
}

/** 自動播放被瀏覽器擋下來時蓋在影片上的大播放鍵。 */
export function TapPlay({ onPlay }: { onPlay: () => void }) {
  return (
    <button className="tap-play" aria-label="播放" onClick={onPlay}>
      <span>▶</span>
    </button>
  )
}
