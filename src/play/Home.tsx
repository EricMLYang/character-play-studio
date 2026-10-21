import { useEffect, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { hasMovie } from '../anim/clips'

import { tap } from '../lib/sfx'
import { preloadVoice, say, sayAll } from '../lib/audio'
import type { Filter } from './PlayApp'
import { hueMap, type WordGroup } from './words'
import type { Nudge, NudgeGo } from './nudge'
import type { Quest } from './today'
import { nextPartner, STARS_PER } from './partners'
import Mine from './Mine'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: '🌈 全部字卡' },
  { id: 'video', label: '🎬 有影片' },
  { id: 'unwatched', label: '✨ 還沒看過' },
  // 集滿星星的字：一個都還沒有的時候不出現，不然是一個永遠按了只會空的按鈕
  { id: 'full', label: '👑 集滿星星' },
]

export default function Home({
  items, groups, total, watched, progress, stars, starCaps, allHaveMovies, starTotal, fullCount, todayCount, query, onQuery, filter, onFilter, onPick, onSurprise, onReset, places, onScreen, onRide, quests, questsDone, nudge, onNudge,
}: {
  items: CharEntry[]
  /** 有給就把字卡一個詞一個詞排；搜尋或「還沒看過」時是 null，照清單平鋪 */
  groups: WordGroup[] | null
  total: number
  watched: Progress['watched']
  /** 每個字收集到幾顆星（shared/domain.mjs 的 starIndex），字卡左下角那一排 */
  stars: Map<string, number>
  /** 每個字最多幾顆（stars.ts 的 starCaps）：拿不到的那顆不算，不然永遠差一顆 */
  starCaps: Map<string, number>
  /** 每個字都有影片或動畫：這樣「🎬 有影片」篩出來跟全部一樣，那一格就收起來 */
  allHaveMovies: boolean
  /** 整個樂園總共幾顆星 */
  starTotal: number
  /** 已經集滿星星的字有幾個（0 就不顯示那個篩選） */
  fullCount: number
  todayCount: number
  query: string
  onQuery: (q: string) => void
  filter: Filter
  onFilter: (f: Filter) => void
  onPick: (char: string) => void
  onSurprise: () => void
  onReset: () => void
  /** 看完字卡之後可以去的地方（games.tsx 的 GAMES） */
  places: { id: string; icon: string; title: string; subtitle: string; fresh: boolean }[]
  onScreen: (id: string) => void
  /** 坐一次他自己接的字火車；名字那組也用它把三集連著播 */
  onRide: (text: string) => void
  /** 他的進度，給「我的東西」用 */
  progress: Progress
  /** 今天的三件事（today.ts） */
  quests: Quest[]
  questsDone: boolean
  /** 首頁那隻角色現在要跟他說的話（nudge.ts） */
  nudge: Nudge
  onNudge: (go: NudgeGo) => void
}) {
  const [mine, setMine] = useState(false)
  /** 骰子正在轉（轉完才開那個字） */
  const [rolling, setRolling] = useState(false)
  // 角色那句話先抓下來，點喇叭就出聲（帶數字的句子沒有音檔，會退回瀏覽器朗讀）
  useEffect(() => { preloadVoice(nudge.say) }, [nudge.say])
  /** 那隻角色正在唸的那串句子。離開首頁要停掉，不然他已經進遊戲了還在背後講話 */
  const voice = useRef<(() => void) | null>(null)
  useEffect(() => () => voice.current?.(), [])

  // 同一個詞的字卡用同一個顏色，孩子一眼看得出哪幾張是一起的
  /**
   * 這個篩選現在有沒有用：篩出來跟「全部字卡」一樣就等於沒作用，不要白佔一格
   * （手機上那一排本來就擠）。兩個會變的：集滿星星的字還是 0 個、以及每個字都有影片或動畫
   * （現在 249 個字都有，「有影片」就沒意義了；之後加了還沒有素材的字它會自己回來）。
   * 正在用的那個一定留著，不然按下去它就消失了。
   */
  const useful = (f: { id: Filter }) =>
    f.id === filter ? true
    : f.id === 'full' ? fullCount > 0
    : f.id === 'video' ? !allHaveMovies
    : true

  const card = (c: CharEntry, hue: number, i: number) => {
    const count = watched[c.char]?.count || 0
    const video = hasMovie(c)
    const got = stars.get(c.char) || 0
    const cap = starCaps.get(c.char) ?? 5
    const full = got > 0 && got >= cap
    // 只差一顆就集滿：字卡上留一顆亮的空星，從一整片字卡裡看得出「這幾張快好了」
    const nearly = !full && got > 0 && got + 1 === cap
    return (
      <button
        key={c.char}
        data-char={c.char}
        className={'card' + (video ? ' card-video' : '') + (full ? ' card-full' : '') + (nearly ? ' card-nearly' : '')}
        style={{ ['--hue' as any]: `var(--c${hue})`, ['--i' as any]: i }}
        aria-label={`看「${c.char}」${video ? '，有影片' : ''}${count ? `，看過 ${count} 次` : ''}${got ? `，${got} 顆星星${nearly ? '，只差一顆就集滿' : ''}` : ''}`}
        onClick={() => { tap(); onPick(c.char) }}
      >
        <span className="card-emoji" aria-hidden="true">{c.emoji || '✨'}</span>
        <span className="card-char">{c.char}</span>
        <span className="card-zhuyin">{c.zhuyin}</span>
        {video && <span className="card-badge" aria-hidden="true">▶ 影片</span>}
        {count > 0 && <span className="card-count">看過 {count} 次</span>}
        {/* 集滿了就只戴皇冠：五顆星加皇冠會跟「看過 N 次」擠在一起 */}
        {got > 0 && (
          <span className={'card-stars' + (full ? ' crowned' : '')} aria-hidden="true">
            {full ? <span className="card-crown">👑</span>
              : Array.from({ length: got }, (_, n) => <span key={n} style={{ ['--i' as any]: n }}>⭐</span>)}
            {nearly && <span className="card-star-left" style={{ ['--i' as any]: got }}>⭐</span>}
          </span>
        )}
      </button>
    )
  }

  // 他自己接的詞：每節車廂保留那個字在原本的詞裡的顏色（跟字火車貨架一樣），原本的詞照舊依序配色
  // 釘在最前面的詞（名字）排在他接的詞前面，配色要扣掉中間那幾組
  const mineCount = groups?.filter((g) => g.mine).length || 0
  const pinCount = groups?.filter((g) => g.pin).length || 0
  const hueOf = hueMap(groups || [])
  const hueIn = (g: WordGroup, gi: number, c: CharEntry) =>
    g.key === 'more' ? c.priority % 8 : g.mine ? hueOf.get(c.char) ?? 0 : (gi < pinCount ? gi : gi - mineCount) % 8

  return (
    <div className="home">
      {mine && (
        <Mine progress={progress} stars={starTotal} fullCount={fullCount}
          onClose={() => { tap(); setMine(false) }}
          onGo={(where) => { setMine(false); if (where === 'full') onFilter('full'); else onScreen(where) }} />
      )}
      <header className="home-bar">
        <h1 className="home-title">字字樂園</h1>
        <input
          className="search"
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && items[0]) onPick(items[0].char) }}
          placeholder="找字：輸入國字、注音或英文"
          aria-label="找字"
        />
        <div className="home-filters" aria-label="篩選">
          {FILTERS.filter(useful).map((f) => (
            <button key={f.id} data-filter={f.id} className={'chip' + (filter === f.id ? ' on' : '')} aria-pressed={filter === f.id} onClick={() => onFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        {/* 還不會打字的孩子也要有一個「我不知道要看什麼」的出口。骰子先轉一下再開，那一下的期待就是它好玩的地方 */}
        <button className={'chip surprise' + (rolling ? ' rolling' : '')} disabled={!items.length || rolling}
          onClick={() => { tap(); setRolling(true); window.setTimeout(() => { setRolling(false); onSurprise() }, 420) }}>
          <span className="dice" aria-hidden>🎲</span> 隨便給我一個
        </button>
        <span className="home-stat">{items.length === total ? `${total} 個字` : `${items.length} / ${total} 個字`}</span>
        <ParentGate />
      </header>

      <div className="home-invite">
        {/* 今天可以做什麼：角色看他的紀錄挑一件事說，按一下直接過去（規則在 nudge.ts） */}
        <div className="buddy">
          <button className="buddy-go" onClick={() => { tap(); onNudge(nudge.go) }} aria-label={`${nudge.text} ${nudge.cta}`}>
            <img className="buddy-img" src={`/hero/${nudge.hero}/${nudge.pose}.png`} alt="" />
            <span className="buddy-text">
              <b>{nudge.text}</b>
              <small>{nudge.cta}</small>
            </span>
          </button>
          {/* 他還不會讀字：這句話要唸得出來才有用 */}
          <button className="buddy-listen" onClick={() => { voice.current?.(); voice.current = sayAll(nudge.say, 0.85) }} aria-label="再聽一次">🔊</button>
        </div>
        {/* 看完字卡之後還有地方可以去：小鎮、魔法鍋、字火車……清單在 games.tsx */}
        <div className="home-places">
          {places.map((p, i) => (
            <button key={p.id} className={`place place-${p.id}` + (p.fresh ? ' fresh' : '')} style={{ ['--i' as any]: i }} onClick={() => { tap(); onScreen(p.id) }}
              aria-label={p.fresh ? `${p.title}（新的）：${p.subtitle}` : undefined}>
              <span className="place-icon" aria-hidden>{p.icon}</span>
              <span><b>{p.title}</b><small>{p.subtitle}</small></span>
              {p.fresh && <span className="place-new" aria-hidden>🆕</span>}
            </button>
          ))}
        </div>
        <TodayStars count={todayCount} />
      </div>

      {/* 今天的三件事：看得完、有進度、做完打勾。沒有失敗也沒有倒數（today.ts） */}
      {(quests.length > 1 || starTotal > 0) && (
        <div className={'quests' + (questsDone ? ' all' : '')} aria-label="今天的三件事">
          <StarBank total={starTotal} onOpen={() => { tap(); setMine(true) }} />
          {quests.length > 1 && <span className="quests-title">{questsDone ? '🎉 今天的三件事都做完了！' : '今天的三件事'}</span>}
          {quests.length > 1 && quests.map((q) => {
            const done = q.done >= q.need
            return (
              <button key={q.id} className={'quest' + (done ? ' done' : '')} onClick={() => { tap(); onNudge(q.go) }}
                aria-label={`${q.label}，已經做到 ${q.done} 個${done ? '，完成了' : ''}`}>
                <span className="quest-icon" aria-hidden>{done ? '✅' : q.icon}</span>
                <span className="quest-text">
                  <b className="quest-long">{q.label}</b>
                  <b className="quest-short" aria-hidden>{q.short}</b>
                  <span className="quest-bar" aria-hidden><i style={{ width: `${(q.done / q.need) * 100}%` }} /></span>
                </span>
                <span className="quest-n" aria-hidden>{q.done}/{q.need}</span>
              </button>
            )
          })}
        </div>
      )}

      {groups ? (
        <div className="grid grouped" aria-label="字卡瀏覽">
          {[...groups, ...(filter === 'all' ? [{ key: 'more', label: '📚 更多字卡', items: items.filter((c) => !hasMovie(c)) }] : [])]
            .filter((g) => g.items.length)
            .map((g, gi) => (
              <div key={(g.mine ? 'mine:' : '') + g.key} className={'word' + (g.label ? ' word-theme' : '') + (g.mine ? ' word-mine' : '')}
                role="group" aria-label={g.mine ? `我接的「${g.key}」` : g.label || g.key}>
                {/*
                  詞組的標題就是「連著看」的按鈕：一節一節播完每個字，最後把整個詞唸一遍。
                  主題組（🔢 數一數、🌟 新來的字）不給播——那不是一個詞，而且十幾個字連著播太長。
                */}
                {g.mine || g.pin || (!g.label && g.items.length >= 2 && g.items.length <= 4) ? (
                  <button className="word-label word-ride" onClick={() => { tap(); onRide(g.key) }}
                    aria-label={g.label ? `連著看「${g.label}」` : `連著看「${g.key}」`}>
                    {g.label ?? g.key}<span className="word-ride-go" aria-hidden>▶</span>
                  </button>
                ) : g.label && <span className="word-label">{g.label}</span>}
                <div className="word-cards">{g.items.map((c) => card(c, hueIn(g, gi, c), items.indexOf(c)))}</div>
              </div>
            ))}
          {!items.length && <Empty total={total} query={query} filter={filter} onReset={onReset} />}
        </div>
      ) : (
        <div className="grid" aria-label="字卡瀏覽">
          {items.map((c, i) => card(c, c.priority % 8, i))}
          {!items.length && <Empty total={total} query={query} filter={filter} onReset={onReset} />}
        </div>
      )}
    </div>
  )
}

/**
 * 他一共收集到幾顆星。數字對六歲還太抽象，所以主角是那顆大星星，數字只是跟在旁邊。
 * 星星怎麼算在 shared/domain.mjs 的 STAR_DEEDS：一個字五顆，看過、自己寫、認出來、拼成詞、魔法鍋變出來。
 */
function StarBank({ total, onOpen }: { total: number; onOpen: () => void }) {
  if (!total) return null
  const next = nextPartner(total)
  return (
    <button className="bank" onClick={onOpen}
      aria-label={`你收集了 ${total} 顆星星${next ? `，再 ${next.need} 顆就有新夥伴` : ''}，點開看我的東西`}>
      <span className="bank-star" aria-hidden>⭐</span>
      <span className="bank-n">{total}</span>
      {/* 下一個寶箱還差幾顆：星星要有地方可以花，不然只是一個一直變大的數字 */}
      <span className="bank-label">{next ? <>再 {next.need} 顆<br />開寶箱 🎁</> : <>顆星星<br />夥伴收齊了！</>}</span>
      {/* 手機上字會收起來，剩這條看得出離下一個寶箱多近 */}
      {next && <span className="bank-bar" aria-hidden><i style={{ width: `${((STARS_PER - next.need) / STARS_PER) * 100}%` }} /></span>}
    </button>
  )
}

/** 今天看了幾個字。六歲看不懂累計數字，星星看得懂；滿五顆就換一行重新集。 */
function TodayStars({ count }: { count: number }) {
  if (!count) return null
  const row = count % 5 || 5
  return (
    <div className="today" aria-label={`今天看了 ${count} 個字`}>
      <div className="today-stars" aria-hidden>
        {Array.from({ length: row }, (_, i) => <span key={i} style={{ ['--i' as any]: i }}>⭐</span>)}
      </div>
      <span className="today-label">今天看了 {count} 個字</span>
    </div>
  )
}

/** 每個空結果都要說清楚是哪一種空，並給一個回到全字庫的出口。 */
function Empty({ total, query, filter, onReset }: { total: number; query: string; filter: Filter; onReset: () => void }) {
  if (!total) return <p className="home-empty">字庫還沒有字，請大人到家長專區加入。</p>
  const reason = query.trim()
    ? `找不到「${query.trim()}」這個字。`
    : filter === 'video' ? '還沒有上架影片的字，先看其他字卡也可以。'
    : filter === 'unwatched' ? '每個字都看過了，好厲害！'
    : filter === 'full' ? '還沒有集滿星星的字。點一張字卡，右上角的星星會告訴你還差什麼。'
    : '這裡還沒有字。'
  return (
    <p className="home-empty">
      {reason}
      <br />
      <button onClick={onReset}>看全部 {total} 個字</button>
    </p>
  )
}

/** Studio 是家長的地方：要長按才進得去，孩子誤觸不會開到生成與回饋表單。 */
function ParentGate() {
  const [holding, setHolding] = useState(false)
  const [hint, setHint] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const hintTimer = useRef<number | undefined>(undefined)

  const start = () => {
    if (timer.current) return
    setHolding(true)
    timer.current = window.setTimeout(() => { timer.current = undefined; location.href = '/studio' }, 900)
  }
  const cancel = () => {
    setHolding(false)
    if (!timer.current) return
    clearTimeout(timer.current)
    timer.current = undefined
    setHint(true)
    clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHint(false), 2400)
  }
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(hintTimer.current) }, [])

  return (
    <>
      <button
        className={'home-parent' + (holding ? ' holding' : '')}
        aria-label="家長專區，長按一秒進入"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start() } }}
        onKeyUp={cancel}
        onBlur={cancel}
        onContextMenu={(e) => e.preventDefault()}
      >👪<span className="parent-label"> 家長（長按）</span></button>
      {hint && <div className="home-parent-hint" role="status">長按一秒才會進入家長專區</div>}
    </>
  )
}
