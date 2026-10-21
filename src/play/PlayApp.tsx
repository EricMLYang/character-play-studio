import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Library, Progress } from '../types'
import { getLibrary } from '../lib/api'
import { taiwanDay, starIndex } from '../../shared/domain.mjs'
import { browseCharacters } from '../../shared/selection.mjs'
import { hasMovie } from '../anim/clips'
import { applyEvent, pendingEvents, queueEvent, flushEvents, type PlayEvent } from '../lib/playQueue'
import { magic } from '../lib/sfx'
import { Confetti } from './ui'
import Home from './Home'
import Viewer from './Viewer'
import { Ride } from './Train'
import { setParts } from './parts'
import { groupMovies, hueMap, type WordGroup } from './words'
import { starCaps } from './stars'
import { GAMES, gameById, type GameContext, type NewEvent } from './games'
import { useRoute, type Route } from './route'
import './play.css'

export type Filter = 'all' | 'video' | 'unwatched'
const EMPTY: Progress = { watched: {} }

/**
 * 孩子端的外框：載入字庫與進度、決定現在在哪個畫面（首頁或 games.tsx 裡的某個遊戲）、
 * 字卡與字火車蓋在上面播。記紀錄都走 record，離線時畫面先動、之後再補送。
 */
export default function PlayApp() {
  const [lib, setLib] = useState<Library | null>(null)
  const [progress, setProgress] = useState<Progress>(EMPTY)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [error, setError] = useState('')
  const [syncError, setSyncError] = useState(false)
  const { route, go, back } = useRoute()
  const game = gameById(route.screen)
  const screen = game ? route.screen : 'home'
  const active = route.char ?? null
  const ride = route.ride ?? null
  const home = useRef<HTMLDivElement>(null)
  const lastActive = useRef<string | null>(null)

  // 觀看層開著時，背後的字庫要完全退出（不能被 Tab 進去、讀屏也不該唸）；關閉後回到剛才那張字卡
  useEffect(() => {
    const el = home.current as (HTMLDivElement & { inert?: boolean }) | null
    if (el) el.inert = Boolean(active || ride)
    if (active) { lastActive.current = active; return }
    const char = lastActive.current
    lastActive.current = null
    if (!char || !el) return
    const card = el.querySelector<HTMLButtonElement>(`.card[data-char="${CSS.escape(char)}"]`)
    if (card) {
      card.scrollIntoView({ block: 'nearest' })
      card.focus({ preventScroll: true })
    } else {
      el.querySelector<HTMLButtonElement>('.chip[aria-pressed="true"]')?.focus()
    }
  }, [active, ride])

  const sync = useCallback(() => {
    flushEvents().then(() => setSyncError(false)).catch(() => setSyncError(true))
  }, [])

  useEffect(() => {
    getLibrary().then((l) => {
      setParts(l.parts)
      setLib(l)
      const completed = l.progress.completedEvents || {}
      setProgress(pendingEvents().filter((e) => !completed[e.id]).reduce(applyEvent, { ...EMPTY, ...l.progress }))
      sync()
    }).catch(() => setError('暫時開不起來，請確認服務已啟動後重新整理。'))
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [sync])

  /** 他在詞語拼圖拼過的詞（字卡頁的語詞旁邊標拼圖） */
  const puzzled = useMemo(() => new Set(Object.keys(progress.puzzles || {})), [progress.puzzles])
  // 有影片（含動畫）的字排在前面，而且照 words.ts 排成一個個詞；上一個／下一個也照這個順序走
  const { all, groups, hues } = useMemo(() => {
    const visible = browseCharacters(lib?.characters || [])
    const groups = groupMovies(visible.filter(hasMovie))
    return { groups, hues: hueMap(groups), all: [...groups.flatMap((g) => g.items), ...visible.filter((c) => !hasMovie(c))] }
  }, [lib])
  // 他在字火車組的詞，新的在前；詞裡有字被藏起來或拿掉影片就先不放
  const mine = useMemo<WordGroup[]>(() => {
    const byChar = new Map(groups.flatMap((g) => g.items).map((c) => [c.char, c]))
    return Object.entries(progress.words || {}).sort((a, b) => Date.parse(b[1]) - Date.parse(a[1]))
      .map(([text]) => ({ key: text, label: '🚂 我接的', mine: true, items: [...text].map((ch) => byChar.get(ch)!) }))
      .filter((g) => g.items.every(Boolean))
  }, [groups, progress.words])
  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((c) =>
      (filter === 'all' || (filter === 'video' ? hasMovie(c) : !progress.watched[c.char])) &&
      (!q || q.includes(c.char) || c.zhuyin.includes(q) || c.meaning.toLowerCase().includes(q)))
  }, [all, query, filter, progress])

  // 每個字幾顆星：整份紀錄只掃一遍，字卡與總數共用（shared/domain.mjs 的 STAR_DEEDS）
  const stars = useMemo(() => starIndex(progress), [progress])
  const starTotal = useMemo(() => [...stars.values()].reduce((sum, n) => sum + n, 0), [stars])
  // 每個字最多幾顆：字庫變了才要重算（拆字表與語詞都跟著字庫走）
  const caps = useMemo(() => starCaps(all), [all])

  // 星星可能在任何一個遊戲裡拿到（看完影片、描完字、餵怪獸認出來、拼好詞、魔法鍋變出來），
  // 所以「拿到了！」這一下放在最外框，一個地方管全部，遊戲本身不用各做一次。
  const [pop, setPop] = useState<{ key: number; char: string; full: boolean } | null>(null)
  const before = useRef<Map<string, number> | null>(null)
  useEffect(() => {
    // 字庫還沒載到的時候 progress 是空的，整份進度一進來會看起來像「剛剛拿到兩百顆星」
    if (!lib) return
    const was = before.current
    before.current = stars
    // 第一次拿到真的進度：這些星星是以前拿的，不是現在拿到的，不慶祝
    if (!was) return
    const got = [...stars].find(([char, n]) => n > (was.get(char) || 0))
    if (!got) return
    const full = got[1] >= (caps.get(got[0]) ?? 5)
    if (full) magic()
    setPop({ key: Date.now(), char: got[0], full })
  }, [stars, caps, lib])
  useEffect(() => {
    if (!pop) return
    const t = setTimeout(() => setPop(null), pop.full ? 3200 : 2200)
    return () => clearTimeout(t)
  }, [pop])

  // 今天看過幾個「不同的字」：重播同一個字不會多一顆星，鼓勵他往下一個字走
  const todayCount = useMemo(() => {
    const today = taiwanDay()
    return Object.values(progress.watched).filter((w) => taiwanDay(w.last) === today).length
  }, [progress])

  // ---------- 去哪裡 ----------
  const here: Route = { screen }
  /** 開一個字：已經開著別的字（上一個／下一個）就換掉，不要讓返回鍵一個一個退 */
  const open = useCallback((char: string) => go({ screen, char }, { replace: Boolean(active) }), [go, screen, active])
  const close = () => back(here)
  const startRide = useCallback((text: string) => go({ screen, ride: text }), [go, screen])
  const toScreen = (id: string) => go({ screen: id })

  // 選擇困難時的出口：優先給還沒看過的字，都看過了就在目前清單裡隨機
  const surprise = useCallback(() => {
    const pool = items.filter((c) => !progress.watched[c.char])
    const from = pool.length ? pool : items
    if (from.length) open(from[Math.floor(Math.random() * from.length)].char)
  }, [items, progress, open])

  // ---------- 記紀錄 ----------
  const record = useCallback((event: NewEvent) => {
    const full = { id: crypto.randomUUID(), at: new Date().toISOString(), ...event } as PlayEvent
    queueEvent(full)
    setProgress((p) => applyEvent(p, full))
    sync()
  }, [sync])

  if (!lib) return <div className="boot">{error || '載入中…'}</div>

  const entry = all.find((c) => c.char === active)
  const index = items.findIndex((c) => c.char === active)
  const ctx: GameContext = {
    library: all, groups, hues, savedWords: mine.map((g) => g.key), progress, record, open, ride: startRide,
    back: () => back({ screen: 'home' }),
  }

  return (
    <div className="play">
      <Blobs />
      <div className="screen" ref={home}>
        {game ? game.render(ctx) : (
          <Home
            items={items}
            groups={!query.trim() && filter !== 'unwatched' ? [...groups.filter((g) => g.pin), ...mine, ...groups.filter((g) => !g.pin)] : null}
            total={all.length}
            watched={progress.watched}
            stars={stars}
            starCaps={caps}
            starTotal={starTotal}
            todayCount={todayCount}
            query={query}
            onQuery={setQuery}
            filter={filter}
            onFilter={setFilter}
            onPick={open}
            onSurprise={surprise}
            onReset={() => { setQuery(''); setFilter('all') }}
            places={GAMES.map((g) => ({ id: g.id, icon: g.icon, title: g.title, subtitle: g.subtitle(progress) }))}
            onScreen={toScreen}
            onRide={startRide}
          />
        )}
      </div>
      {entry && (
        <Viewer
          key={entry.char}
          entry={entry}
          count={progress.watched[entry.char]?.count || 0}
          traces={progress.town?.[entry.char]?.traces || 0}
          library={all}
          hues={hues}
          puzzled={puzzled}
          progress={progress}
          prev={index > 0 ? items[index - 1] : undefined}
          next={index >= 0 && index < items.length - 1 ? items[index + 1] : undefined}
          onGo={(c) => open(c.char)}
          onJump={open}
          onClose={close}
          onBrowseVideos={() => { setQuery(''); setFilter('video'); go({ screen: 'home' }, { replace: true }) }}
          onComplete={(e, id) => record({ char: e.char, id })}
          onTraced={(e, strokes) => record({ kind: 'trace', char: e.char, strokes })}
          onTown={() => go({ screen: 'town' }, { replace: true })}
          onGame={(id) => go({ screen: id }, { replace: true })}
        />
      )}
      {ride && (
        <Ride key={ride} text={ride} library={all} hues={hues}
          onWatched={(c) => record({ char: c.char })}
          onClose={close}
          onBuild={() => go({ screen: 'train' }, { replace: true })} />
      )}
      {pop && (
        <>
          {/* 彩帶要從整個畫面的頂端灑下來，所以不能包在那顆小藥丸裡 */}
          {pop.full && <div className="star-rain" aria-hidden><Confetti /></div>}
          <div className={'star-pop' + (pop.full ? ' full' : '')} key={pop.key} role="status">
            <span className="pop-star" aria-hidden>{pop.full ? '👑' : '⭐'}</span>
            {pop.full ? <b>「{pop.char}」的星星集滿了！</b> : <b>「{pop.char}」拿到一顆星星！</b>}
          </div>
        </>
      )}
      {syncError && <button className="sync-note" onClick={sync}>玩的紀錄先存在這台裝置，點這裡再存一次</button>}
    </div>
  )
}

function Blobs() {
  return (
    <div className="blobs" aria-hidden>
      <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
    </div>
  )
}
