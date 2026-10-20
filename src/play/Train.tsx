import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { say, stopSpeech } from '../lib/audio'
import { cheer, plop, stash, tap, whoosh } from '../lib/sfx'
import AnimMedia from '../anim/AnimMedia'
import { hueMap, nextChars, realWords, type WordGroup } from './words'
import { pickSource } from './source'
import VideoPlayer from './VideoPlayer'
import { Confetti, SubBar, hueVar } from './ui'

const CARS = 4

/**
 * 字火車：孩子自己把字接成一個詞（豬＋飛＋走），開火車就一節一節播每個字的影片，
 * 最後整個詞排在一起唸一次。只放有影片的字，開出去一定有東西看；沒有對錯，豬飛走也很好笑。
 * 接出字卡語詞裡真的有的詞（火車、機器人）會跳出那個詞的圖；接到一半，能接成真詞的字在貨架上發亮——
 * 是提示不是規定，他照樣可以接豬飛走。
 */
export default function Train({ groups, saved, onRide, onRemove, onBack }: {
  /** 首頁的詞組（不含他自己組的），貨架照這個順序與顏色排，跟首頁一樣好找 */
  groups: WordGroup[]
  /** 他組過的詞，新的在前 */
  saved: string[]
  onRide: (text: string) => void
  onRemove: (text: string) => void
  onBack: () => void
}) {
  const [cars, setCars] = useState<string[]>([])
  const hues = useMemo(() => hueMap(groups), [groups])
  const shelf = useMemo(() => {
    const seen = new Map<string, { entry: CharEntry; hue: number }>()
    groups.forEach((g) => g.items.forEach((entry) => { if (!seen.has(entry.char)) seen.set(entry.char, { entry, hue: hues.get(entry.char) ?? 0 }) }))
    return seen
  }, [groups, hues])
  const hue = (char: string) => hueVar(hues.get(char) ?? 0)
  const full = cars.length >= CARS
  /** 字卡語詞裡、每個字都在貨架上的詞 → 圖 */
  const real = useMemo(() => realWords([...shelf.values()].map((s) => s.entry), new Set(shelf.keys()), CARS), [shelf])
  const text = cars.join('')
  const picture = real.get(text)
  const glow = useMemo(() => nextChars(text, real), [text, real])

  // 連點兩下時畫面還沒更新，用 ref 接著排，第二個字才不會蓋掉第一個
  const latest = useRef(cars)
  latest.current = cars
  const add = (char: string) => {
    if (latest.current.length >= CARS) return
    plop()
    const next = [...latest.current, char]
    latest.current = next
    say(next.join(''), 0.8)
    // 接出真的詞：亮晶晶一聲
    if (real.has(next.join(''))) stash()
    setCars(next)
  }
  const remove = (i: number) => {
    tap()
    latest.current = latest.current.filter((_, j) => j !== i)
    setCars(latest.current)
  }
  const go = () => {
    if (cars.length < 2) return
    onRide(cars.join(''))
    setCars([])
  }

  const hint = cars.length === 0 ? '點下面的字，當火車頭！'
    : cars.length === 1 && glow.size ? '再接一個字！亮亮的字可以接成真的詞'
    : cars.length === 1 ? '再接一個字！'
    : full ? '火車滿了，開火車！'
    : '還可以再接，或是開火車！'

  return (
    <div className="train">
      <SubBar title="🚂 字火車" stat="自己接一個詞" onBack={onBack} />

      <div className="train-main">
        <section className="train-yard" aria-label="火車">
          <div className="train-cars">
            <span className="train-engine" aria-hidden>🚂</span>
            {Array.from({ length: CARS }, (_, i) => {
              const char = cars[i]
              const entry = char ? shelf.get(char)?.entry : undefined
              return char ? (
                <button key={i} className="train-car full" style={{ ['--hue' as any]: hue(char) }}
                  onClick={() => remove(i)} aria-label={`把「${char}」拿下來`}>
                  <span className="train-car-emoji" aria-hidden>{entry?.emoji}</span>{char}
                  <span className="game-x" aria-hidden>✕</span>
                </button>
              ) : <span key={i} className={'train-car' + (i === cars.length ? ' next' : '')} aria-hidden>{i === cars.length ? '＋' : ''}</span>
            })}
          </div>
          {cars.length > 0 && (
            <button className="train-say" onClick={() => say(cars.join(''), 0.8)} aria-label={`唸「${cars.join('')}」`}>🔊 {cars.join('')}</button>
          )}
          {picture && <span key={text} className="train-real" role="status"><span aria-hidden>{picture}</span> 真的有這個詞！</span>}
          <button className="nav-btn primary train-go" disabled={cars.length < 2} onClick={go}>🚂 開火車！</button>
          <p className="game-hint" role="status">{hint}</p>
        </section>

        <section className="game-shelf" aria-label="可以接上火車的字">
          {[...shelf.values()].map(({ entry, hue }) => (
            <button key={entry.char} className={'shelf-item' + (glow.has(entry.char) && !full ? ' glow' : '')} style={{ ['--hue' as any]: hueVar(hue) }}
              disabled={full} onClick={() => add(entry.char)} aria-label={`接上「${entry.char}」`}>
              <span aria-hidden>{entry.emoji}</span>{entry.char}
            </button>
          ))}
        </section>
      </div>

      <section className="game-tray" aria-label="我的火車">
        <span className="game-tray-title">🚃 我的火車</span>
        <div className="game-tray-row">
          {saved.length ? saved.map((text) => (
            <span key={text} className="train-saved">
              <button className="train-saved-go" onClick={() => onRide(text)} aria-label={`再坐一次「${text}」`}>▶ {text}</button>
              <button className="train-saved-x" onClick={() => { tap(); onRemove(text) }} aria-label={`把「${text}」拿掉`}>✕</button>
            </span>
          )) : <span className="train-saved-empty">開過的火車會停在這裡，首頁也看得到</span>}
        </div>
      </section>
    </div>
  )
}

/**
 * 坐火車：一節一節播每個字的影片（或動畫），上面的車廂跟著亮，看得出現在播到哪個字；
 * 播完整個詞排在一起唸一次。點車廂可以直接跳到那個字。
 */
export function Ride({ text, library, hues, onWatched, onClose, onBuild }: {
  text: string
  library: CharEntry[]
  /** 每個字的顏色，跟首頁和火車貨架一樣（hueMap） */
  hues: Map<string, number>
  onWatched: (entry: CharEntry) => void
  onClose: () => void
  onBuild: () => void
}) {
  const legs = useMemo(() => {
    const byChar = new Map(library.map((c) => [c.char, c]))
    return [...text].map((ch) => byChar.get(ch)).filter((c): c is CharEntry => Boolean(c))
  }, [text, library])
  /** 接出來的是字卡語詞裡真的有的詞：最後把那個詞的圖放出來 */
  const picture = useMemo(() => library.flatMap((c) => c.words || []).find((w) => w.text === text && w.emoji)?.emoji, [text, library])
  const [at, setAt] = useState(0)
  const [round, setRound] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const finale = at >= legs.length
  const entry = legs[at]

  useEffect(() => { root.current?.focus() }, [])
  useEffect(() => () => { clearTimeout(timer.current); stopSpeech() }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // 最後一節播完：整個詞排好、唸出來
  useEffect(() => {
    if (!finale) return
    cheer()
    const t = window.setTimeout(() => say(text, 0.75), 500)
    return () => clearTimeout(t)
  }, [finale, text, round])

  const jump = (i: number) => {
    clearTimeout(timer.current)
    stopSpeech()
    whoosh()
    setAt(i)
  }
  // 播完停一拍再換下一節，最後一格不要硬切
  const legDone = (watched: boolean) => {
    if (watched && entry) onWatched(entry)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => jump(at + 1), 700)
  }
  const color = (c?: CharEntry) => hueVar((c && hues.get(c.char)) ?? 0)
  const again = () => { setRound((r) => r + 1); jump(0) }

  return (
    <div ref={root} tabIndex={-1} className="viewer ride" role="dialog" aria-modal="true" aria-label={`坐字火車「${text}」`}
      style={{ ['--hue' as any]: color(entry || legs[0]) }}>
      <header className="viewer-bar ride-bar">
        <button className="viewer-close" onClick={onClose}>← 下車</button>
        <div className="ride-cars">
          <span className="train-engine" aria-hidden>🚂</span>
          {legs.map((c, i) => (
            <button key={i} className={'ride-car' + (i === at ? ' on' : i < at ? ' done' : '')}
              style={{ ['--hue' as any]: color(c) }} onClick={() => jump(i)} aria-label={`看「${c.char}」`}>
              {c.char}
            </button>
          ))}
        </div>
      </header>

      <div className="viewer-frame">
        {finale ? (
          <div className="ride-finale" key={round}>
            {picture && <div className="ride-real" aria-hidden>{picture}<span>真的有這個詞！</span></div>}
            <button className="ride-word" onClick={() => say(text, 0.75)} aria-label={`再聽一次「${text}」`}>
              {legs.map((c, i) => (
                <span key={i} className="ride-word-char" style={{ ['--hue' as any]: color(c), ['--i' as any]: i }}>
                  <span className="ride-word-emoji" aria-hidden>{c.emoji}</span>{c.char}
                </span>
              ))}
              <span className="viewer-say" aria-hidden>🔊</span>
            </button>
            <div className="game-actions">
              <button className="nav-btn primary" onClick={again}>🔁 再坐一次</button>
              <button className="nav-btn write" onClick={onBuild}>🚂 再接一個</button>
            </div>
            <Confetti />
          </div>
        ) : entry && (
          <Leg key={`${round}-${at}`} entry={entry} onEnd={legDone} />
        )}
      </div>

      {!finale && (
        <footer className="viewer-nav">
          <button className="nav-btn" onClick={() => jump(at + 1)}>下一節 →</button>
        </footer>
      )}
    </div>
  )
}

/** 一節車廂：上架影片優先，沒有就播動畫（不放圖片）。影片壞了直接跳下一節，不要卡住整列火車。 */
function Leg({ entry, onEnd }: { entry: CharEntry; onEnd: (watched: boolean) => void }) {
  const [failed, setFailed] = useState(false)
  const source = pickSource(entry, { video: failed }, { images: false })
  useEffect(() => { if (source.kind === 'card') onEnd(false) }, [source.kind])

  if (source.kind === 'video') return <VideoPlayer char={entry.char} media={source.media} onEnded={() => onEnd(true)} onFailed={() => setFailed(true)} />
  if (source.kind === 'clip') return <AnimMedia clip={source.clip} onEnd={() => onEnd(true)} />
  return null
}
