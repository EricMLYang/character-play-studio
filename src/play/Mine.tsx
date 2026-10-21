import type { Progress } from '../types'
import { tap } from '../lib/sfx'
import { PARTNERS, STARS_PER, nextPartner, partnersAt } from './partners'

/**
 * 「我的東西」：點首頁的星星存摺打開。
 *
 * 他收集的東西散在六個地方（小鎮的居民、詞語圖鑑、魔法圖鑑、夥伴、星星），
 * 每一個都要進去那個遊戲才看得到。六歲最想要的是「這些全部都是我的」攤開在一起，
 * 所以這裡只做兩件事：把數字攤開，還有按一下就去那個地方。
 *
 * 全部從既有紀錄算，沒有新的進度欄位。
 */
export default function Mine({ progress, stars, fullCount, onGo, onClose }: {
  progress: Progress
  /** 總共幾顆星星 */
  stars: number
  /** 集滿星星的字有幾個 */
  fullCount: number
  /** 去某個地方：遊戲 id，或 'full' 代表切到「集滿星星」的字卡篩選 */
  onGo: (where: string) => void
  onClose: () => void
}) {
  const crew = partnersAt(stars)
  const next = nextPartner(stars)
  const rows = [
    { id: 'town', icon: '🏡', label: '小鎮住了', n: Object.keys(progress.town || {}).length, unit: '個字' },
    { id: 'puzzle', icon: '📖', label: '詞語圖鑑收了', n: Object.keys(progress.puzzles || {}).length, unit: '個詞' },
    { id: 'lab', icon: '🧪', label: '魔法鍋變出', n: Object.keys(progress.lab || {}).length, unit: '個字' },
    { id: 'full', icon: '👑', label: '星星集滿的字', n: fullCount, unit: '個' },
  ]
  return (
    <div className="mine" role="dialog" aria-modal="true" aria-label="我的東西">
      <button className="mine-back" aria-label="關起來" onClick={onClose} />
      <div className="mine-sheet">
        <h2>我的東西</h2>

        <div className="mine-stars">
          <span className="mine-star" aria-hidden>⭐</span>
          <b>{stars}</b>
          <span>顆星星</span>
        </div>
        {next ? (
          <div className="mine-next">
            <span className="mine-bar" aria-hidden><i style={{ width: `${((STARS_PER - next.need) / STARS_PER) * 100}%` }} /></span>
            <small>再 {next.need} 顆就開寶箱 🎁</small>
          </div>
        ) : <div className="mine-next"><small>夥伴全部收齊了！🎉</small></div>}

        <div className="mine-crew" aria-label={`夥伴 ${crew.length} 位，一共 ${PARTNERS.length} 位`}>
          {crew.map((p) => (
            <button key={p.id} className="mine-one" onClick={() => { tap(); onGo('river') }} aria-label={`跟「${p.name}」去跳石頭過河`}>
              <img src={`/hero/${p.id}/idle.png`} alt="" />
            </button>
          ))}
          {next && <span className="mine-one locked" aria-hidden>?</span>}
        </div>

        <ul className="mine-rows">
          {rows.map((r) => (
            <li key={r.id}>
              <button onClick={() => { tap(); onGo(r.id) }} disabled={r.n === 0}
                aria-label={`${r.label} ${r.n} ${r.unit}`}>
                <span className="mine-row-icon" aria-hidden>{r.icon}</span>
                <span className="mine-row-text">{r.label}</span>
                <b>{r.n}</b>
                <span className="mine-row-unit">{r.unit}</span>
              </button>
            </li>
          ))}
        </ul>

        <button className="nav-btn primary mine-close" onClick={onClose}>好</button>
      </div>
    </div>
  )
}
