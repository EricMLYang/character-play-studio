import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry } from '../types'
import { say } from '../lib/audio'
import { bubble, plop, poof, tap } from '../lib/sfx'
import { hidesIn } from './parts'
import { brew, recipes, type Brew } from './brew'
import { CharArt } from './Glyphs'
import { sceneFor } from './scenes'

/**
 * 魔法鍋：丟一兩個字進去攪一攪，看會變出什麼。
 * 一個字會變成「藏著它的字」，重複丟同一個字會一直發現新的；兩個字有配方或好笑的反應。
 */
export default function Lab({ library, found, onDiscover, onPick, onBack }: {
  library: CharEntry[]
  found: Record<string, string>
  onDiscover: (char: string) => void
  onPick: (char: string) => void
  onBack: () => void
}) {
  const [picked, setPicked] = useState<string[]>([])
  const [stirring, setStirring] = useState(false)
  const [result, setResult] = useState<{ brew: Brew; picked: string[]; fresh: boolean } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const byChar = useMemo(() => new Map(library.map((c) => [c.char, c])), [library])
  const known = useMemo(() => new Set(byChar.keys()), [byChar])
  const book = useMemo(() => recipes(known), [known])
  // 變得出東西的字排前面，他第一次玩就會成功
  const shelf = useMemo(() => [
    ...library.filter((c) => hidesIn(c.char).some((w) => known.has(w))),
    ...library.filter((c) => !hidesIn(c.char).some((w) => known.has(w))),
  ], [library, known])
  const discovered = book.filter((r) => found[r.char]).length

  const add = (char: string) => {
    if (stirring || picked.length >= 2) return
    plop()
    say(char, 0.8)
    setResult(null)
    setPicked((p) => [...p, char])
  }
  const remove = (i: number) => {
    if (stirring) return
    tap()
    setPicked((p) => p.filter((_, j) => j !== i))
  }

  const stir = () => {
    if (!picked.length || stirring) return
    const made = brew(picked, known, found, (c) => sceneFor(byChar.get(c)))
    const fresh = made.kind === 'make' && !found[made.char]
    setStirring(true)
    bubble()
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setStirring(false)
      poof()
      setResult({ brew: made, picked, fresh })
      setPicked([])
      if (made.kind === 'make') onDiscover(made.char)
      window.setTimeout(() => say(speech(made, picked), 0.8), 350)
    }, 1300)
  }

  const r = result?.brew
  const hint = picked.length === 0 ? '點下面的字，丟進鍋子裡！'
    : picked.length === 1 ? '可以直接攪一攪，或再丟一個字'
    : '鍋子滿了，攪一攪！'

  return (
    <div className="lab">
      <header className="sub-bar">
        <button className="viewer-close" onClick={onBack}>← 回字卡</button>
        <h2 className="sub-title">🧪 魔法鍋</h2>
        <span className="sub-stat">變出 {discovered} / {book.length} 個字</span>
      </header>

      <div className="lab-main">
        <section className="lab-pot-area" aria-label="魔法鍋">
          <div className="lab-slots">
            {[0, 1].map((i) => {
              const char = picked[i]
              return char ? (
                <button key={i} className="lab-slot full" style={{ ['--hue' as any]: `var(--c${byChar.get(char)!.priority % 8})` }}
                  onClick={() => remove(i)} aria-label={`把「${char}」拿出來`}>
                  <span className="lab-slot-emoji" aria-hidden>{byChar.get(char)?.emoji}</span>{char}
                  <span className="lab-slot-x" aria-hidden>✕</span>
                </button>
              ) : <span key={i} className="lab-slot" aria-hidden>{i === 0 ? '？' : '＋'}</span>
            })}
          </div>

          <div className={'pot' + (stirring ? ' stirring' : '') + (picked.length ? ' filled' : '')} aria-hidden>
            <div className="pot-bubbles">{Array.from({ length: 7 }, (_, i) => <span key={i} style={{ ['--i' as any]: i }} />)}</div>
            <div className="pot-rim" />
            <div className="pot-body"><span className="pot-spoon">🥄</span></div>
            <div className="pot-fire">🔥🔥🔥</div>
          </div>

          <button className="nav-btn primary lab-stir" disabled={!picked.length || stirring} onClick={stir}>
            {stirring ? '咕嚕咕嚕…' : '🪄 攪一攪！'}
          </button>
          <p className="lab-hint" role="status">{stirring ? '' : hint}</p>

          {result && r && !stirring && (
            <div className={`lab-result lab-result-${r.kind}`} role="status">
              {r.kind === 'make' && <>
                {result.fresh && <span className="lab-new">🎉 新發現！</span>}
                <CharArt char={r.char} highlight={r.strokes} />
                <p className="lab-line"><b className="blue">{r.from.join(' ＋ ')}</b> 變成了 <b>{r.char}</b>！</p>
              </>}
              {r.kind === 'inside' && <>
                <span className="lab-new">🔍 找到了！</span>
                <CharArt char={r.char} highlight={r.strokes} />
                <p className="lab-line"><b className="blue">{r.part}</b> 躲在 <b>{r.char}</b> 裡面！</p>
              </>}
              {r.kind === 'react' && <>
                <span className="lab-react-emoji" aria-hidden>{r.emoji}</span>
                <p className="lab-line">{result.picked.join(' ＋ ')}：{r.line}</p>
              </>}
              {r.kind === 'alone' && <>
                <span className="lab-react-emoji" aria-hidden>🫧</span>
                <p className="lab-line">噗～「{r.char}」一個人變不出來，<br />再丟一個字陪它！</p>
              </>}
              <div className="lab-result-actions">
                {(r.kind === 'make' || r.kind === 'inside') && (
                  <button className="nav-btn write" onClick={() => onPick(r.char)}>▶ 去看「{r.char}」</button>
                )}
                <button className="nav-btn" onClick={() => { tap(); setResult(null) }}>🔁 再煮一次</button>
              </div>
            </div>
          )}
        </section>

        <section className="lab-shelf" aria-label="可以丟進鍋子的字">
          {shelf.map((c) => (
            <button key={c.char} className="shelf-item" style={{ ['--hue' as any]: `var(--c${c.priority % 8})` }}
              disabled={stirring || picked.length >= 2} onClick={() => add(c.char)} aria-label={`把「${c.char}」丟進鍋子`}>
              <span aria-hidden>{c.emoji}</span>{c.char}
            </button>
          ))}
        </section>
      </div>

      <section className="lab-book" aria-label="魔法圖鑑">
        <span className="lab-book-title">📖 魔法圖鑑</span>
        <div className="lab-book-row">
          {book.map((rcp) => found[rcp.char] ? (
            <button key={rcp.char} className="book-slot got" onClick={() => onPick(rcp.char)} aria-label={`去看「${rcp.char}」`}>{rcp.char}</button>
          ) : (
            // 還沒發現的格子給一個線索：從哪個字開始丟
            <span key={rcp.char} className="book-slot" aria-label={`還沒發現，試試「${rcp.from[0]}」`}>
              <span className="book-q" aria-hidden>？</span><span className="book-hint" aria-hidden>{rcp.from[0]}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

function speech(made: Brew, picked: string[]) {
  if (made.kind === 'make') return `${made.from.join('，加，')}，變成了，${made.char}！`
  if (made.kind === 'inside') return `找到了！${made.part}，躲在，${made.char}，裡面！`
  if (made.kind === 'react') return `${picked.join('，加，')}。${made.line}`
  return `${made.char}，一個人變不出來，再丟一個字陪它！`
}
