import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Library, Progress } from '../types'
import { getLibrary } from '../lib/api'
import { taiwanDay } from '../../shared/domain.mjs'
import { browseCharacters } from '../../shared/selection.mjs'
import { hasMovie } from '../anim/clips'
import { applyEvent, pendingEvents, queueEvent, flushEvents, type PlayEvent } from '../lib/playQueue'
import Home from './Home'
import Viewer from './Viewer'
import { Ride } from './Train'
import { setParts } from './parts'
import { groupMovies, hueMap, type WordGroup } from './words'
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
          prev={index > 0 ? items[index - 1] : undefined}
          next={index >= 0 && index < items.length - 1 ? items[index + 1] : undefined}
          onGo={(c) => open(c.char)}
          onJump={open}
          onClose={close}
          onBrowseVideos={() => { setQuery(''); setFilter('video'); go({ screen: 'home' }, { replace: true }) }}
          onComplete={(e, id) => record({ char: e.char, id })}
          onTraced={(e, strokes) => record({ kind: 'trace', char: e.char, strokes })}
          onTown={() => go({ screen: 'town' }, { replace: true })}
        />
      )}
      {ride && (
        <Ride key={ride} text={ride} library={all} hues={hues}
          onWatched={(c) => record({ char: c.char })}
          onClose={close}
          onBuild={() => go({ screen: 'train' }, { replace: true })} />
      )}
      {syncError && <button className="sync-note" onClick={sync}>觀看紀錄已暫存，點此重試儲存</button>}
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
