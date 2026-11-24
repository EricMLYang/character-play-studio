import { useEffect, useMemo, useState } from 'react'
import type { CharEntry } from '../types'
import { blip, letGo, swipe, tap } from '../lib/sfx'
import { preloadVoice, say } from '../lib/audio'
import { ZHUYIN_GROUPS, ZHUYIN_KEYS, ZHUYIN_LINES, availableKeys, groupOf, hasPick, zhuyinSegments, type ZhuyinPick } from '../../shared/zhuyin.mjs'

/**
 * 按鍵時要不要唸出那個符號（「ㄅ」）。音檔是這台 Mac 的 say 用單一個符號做的，
 * 唸得對不對要爸爸戴耳機聽過；唸錯的話改成 false，按鍵就只剩「叮」一聲（打開、清掉那兩句照唸）。
 */
export const SAY_KEYS = true

/** 噴出來的小圓點有幾顆（一圈平均分） */
const DOTS = 8

/**
 * 自己逛逛頂列那顆「ㄅㄆㄇ 找字」。他讀得懂ㄅㄆㄇ，所以按鈕上寫的就是這三個；
 * 打開時唸一句告訴他要做什麼（他讀不到「找字」兩個字）。
 */
export function ZhuyinOpen({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button className={'zy-open' + (open ? ' on' : '')} aria-pressed={open} aria-label="注音找字"
      onClick={() => {
        if (open) tap()
        else { say(ZHUYIN_LINES.open); preloadVoice(ZHUYIN_KEYS) }
        onToggle()
      }}>
      <span className="zy-open-sym" aria-hidden><i className="zy-initial">ㄅ</i><i className="zy-medial">ㄆ</i><i className="zy-final">ㄇ</i></span>
      <span className="zy-open-text">{open ? '收起來' : '找字'}</span>
    </button>
  )
}

/**
 * 注音鍵盤：37 個符號照課本分三組攤開（聲母／介音／韻母，三種顏色）。每組最多選一個，三組合起來就是拼音。
 * 按下去會變成 0 個字的鍵先暗掉，他怎麼按都至少有一個字——六歲按到「沒有」只會覺得壞掉了。
 * 選擇的狀態在 PlayApp（字卡清單要照它篩），這裡只畫鍵盤、算哪幾顆按得下去。
 */
export default function ZhuyinPad({ pick, pool, found, onPick, onClear }: {
  pick: ZhuyinPick
  /** 還沒照注音篩之前的字卡（鍵按不按得下去照這份算，跟下面字卡牆是同一份） */
  pool: CharEntry[]
  /** 照注音篩完剩幾個字 */
  found: number
  onPick: (sym: string) => void
  onClear: () => void
}) {
  const lit = useMemo(() => availableKeys(pool, pick), [pool, pick])
  /** 剛按的那顆：彈一下、噴一圈點點。n 每按一次加一，同一顆連按也會重新播 */
  const [burst, setBurst] = useState<{ sym: string; n: number } | null>(null)
  const any = hasPick(pick)
  useEffect(() => { preloadVoice([...ZHUYIN_KEYS, ZHUYIN_LINES.clear]) }, [])

  const press = (sym: string) => {
    const off = pick[groupOf(sym)!] === sym
    if (off) letGo()
    else if (SAY_KEYS) { blip(); say(sym) }
    else blip()
    setBurst((b) => ({ sym, n: (b?.n ?? 0) + 1 }))
    onPick(sym)
  }

  return (
    <section className="zy-pad" aria-label="注音找字">
      <div className="zy-show">
        {/* 選的符號照聲母→介音→韻母排成一串大字；什麼都沒選時是一個淡淡的問號 */}
        <div className="zy-picked">
          {any
            ? ZHUYIN_GROUPS.filter((g) => pick[g.id]).map((g) => <b key={g.id} className={`zy-${g.id}`}>{pick[g.id]}</b>)
            : <span className="zy-picked-empty" aria-hidden>？</span>}
        </div>
        <span className="zy-found" role="status">{any ? `找到 ${found} 個字` : '按一個注音'}</span>
        {/* 沒選東西時佔著位置但看不到：出現、消失的時候旁邊的東西不會跳 */}
        <button className="zy-clear" disabled={!any} aria-hidden={!any} tabIndex={any ? undefined : -1}
          onClick={() => { swipe(); say(ZHUYIN_LINES.clear); setBurst(null); onClear() }}>
          <span aria-hidden>🧹</span> 清掉
        </button>
      </div>
      <div className="zy-keys">
        {ZHUYIN_GROUPS.map((g) => (
          <div key={g.id} className={`zy-group zy-${g.id}`} role="group" aria-label={g.name}>
            {g.keys.map((sym) => {
              const on = pick[g.id] === sym
              const popping = burst?.sym === sym
              return (
                <button key={sym} data-zhuyin={sym} className={'zy-key' + (on ? ' on' : '')}
                  aria-pressed={on} aria-label={`注音 ${sym}`} disabled={!lit.has(sym)} onClick={() => press(sym)}>
                  {/* key 換掉就重新播：同一顆連按，每一下都會彈 */}
                  <span key={popping ? burst!.n : 0} className={'zy-glyph' + (popping ? ' pop' : '')}>{sym}</span>
                  {popping && (
                    <span key={`b${burst!.n}`} className="zy-burst" aria-hidden>
                      {Array.from({ length: DOTS }, (_, i) => <i key={i} style={{ ['--a' as any]: `${(360 / DOTS) * i}deg` }} />)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

/** 字卡上的注音：選中的符號用那一組的顏色標出來（包 ㄅㄠ，選了ㄠ，ㄠ就是粉紅底） */
export function ZhuyinMarked({ zhuyin, pick }: { zhuyin: string; pick: ZhuyinPick }) {
  return <>{zhuyinSegments(zhuyin, pick).map((s, i) => s.hit ? <b key={i} className={`zy-hit zy-${s.group}`}>{s.text}</b> : <span key={i}>{s.text}</span>)}</>
}
