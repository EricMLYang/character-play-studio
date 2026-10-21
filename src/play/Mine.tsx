import { Fragment, useEffect, useRef } from 'react'
import type { Progress } from '../types'
import { tap } from '../lib/sfx'
import { PARTNERS, STARS_PER, nextPartner, trailStops } from './partners'
import { crossNextWith } from './crossing'

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
  const rows = [
    { id: 'town', icon: '🏡', label: '小鎮住了', n: Object.keys(progress.town || {}).length, unit: '個字' },
    { id: 'puzzle', icon: '📖', label: '詞語圖鑑收了', n: Object.keys(progress.puzzles || {}).length, unit: '個詞' },
    { id: 'lab', icon: '🧪', label: '魔法鍋變出', n: Object.keys(progress.lab || {}).length, unit: '個字' },
    { id: 'train', icon: '🚂', label: '自己接過的詞', n: Object.keys(progress.words || {}).length, unit: '個' },
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

        <Trail stars={stars} onGo={onGo} />

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

/**
 * 我走到哪了：一條由下往上的路，每 STARS_PER 顆星星一站，站上站著那一站開出來的夥伴。
 * 走過的路段是金色的，還沒到的是灰的；「你在這裡」那一格插在下一站的下面，
 * 一打開就捲到那裡——他第一眼看到的是「我站在這裡，下一個寶箱就在上面」。
 *
 * 夥伴頭像點下去就去跳石頭過河：那幾位真的會在河邊等他，這條路不是只有圖。
 */
function Trail({ stars, onGo }: { stars: number; onGo: (where: string) => void }) {
  const stops = trailStops(stars)
  const next = nextPartner(stars)
  const road = useRef<HTMLDivElement>(null)
  const here = useRef<HTMLLIElement>(null)
  // 捲到「你在這裡」。scrollIntoView 會連整頁一起捲，所以自己算
  useEffect(() => {
    const box = road.current, mark = here.current
    if (!box || !mark) return
    // 捲到「下一個寶箱」停在最上面：他看到的是自己、上面要走到的地方，還有下面收集到的夥伴
    const goal = mark.previousElementSibling as HTMLElement | null
    box.scrollTop = (goal?.offsetTop ?? mark.offsetTop) - 6
  }, [])

  return (
    <div className="trail-box" ref={road}>
      <ol className="trail" aria-label={`我的路：${PARTNERS.length} 位夥伴，收集到 ${stops.filter((s) => s.got).length} 位`}>
        {[...stops].reverse().map((s) => (
          <Fragment key={s.partner.id}>
            <li className={'trail-stop' + (s.got ? ' got' : '')}>
              <span className="trail-road" aria-hidden />
              {s.got ? (
                <button className="trail-node" onClick={() => { tap(); crossNextWith(s.partner.id); onGo('river') }}
                  aria-label={`跟「${s.partner.name}」去跳石頭過河`}>
                  <img src={`/hero/${s.partner.id}/idle.png`} alt="" />
                </button>
              ) : next && next.at === s.at ? (
                // 下一站的那一位只給影子：看得出是一隻有形狀的東西在等他，但還不知道是誰。
                // 再往上的幾站維持 🎁，不然整條路一眼看完就沒得期待了
                <span className="trail-node next" aria-hidden><img src={`/hero/${s.partner.id}/idle.png`} alt="" /></span>
              ) : <span className="trail-node locked" aria-hidden>🎁</span>}
              <span className="trail-what">
                <b>{s.got ? s.partner.name : '？'}</b>
                <small>{s.at === 0 ? '出發！' : `⭐ ${s.at} 顆`}</small>
              </span>
            </li>
            {next && next.at === s.at && (
              <li className="trail-here" ref={here}>
                <span className="trail-road" aria-hidden />
                <span className="trail-pin" aria-hidden>⭐</span>
                <span className="trail-what">
                  <b>你在這裡：{stars} 顆</b>
                  <span className="trail-bar" aria-hidden><i style={{ width: `${((STARS_PER - next.need) / STARS_PER) * 100}%` }} /></span>
                  <small>再 {next.need} 顆就開寶箱 🎁</small>
                </span>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
      {!next && <p className="trail-all">夥伴全部收齊了！🎉</p>}
    </div>
  )
}
