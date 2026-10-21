import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { boing, cheer, drum, snap, stash, tap } from '../lib/sfx'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { requeue } from './dishes'
import { collection, completesChar, pickPuzzles, shelves, type PuzzleItem } from './puzzles'
import { Confetti, SubBar, emojiArt, hueOf, hueVar } from './ui'

/**
 * 詞語拼圖：上面一張圖（還是灰灰的影子）跟一個缺了一個字的詞，例如「生 □」配 🎂。
 * 先唸「生日」，再說「生日的日」，他從下面幾張字卡裡把「日」找出來補上；補對了，影子變成彩色的圖跳起來，
 * 這個詞收進他的詞語圖鑑。同一個字一次次出現在不同的詞裡（生日、日出、日記），字才會跟生活連起來。
 * 找錯不是錯：翻開那張說「這是月耶！」，對的那張發亮；這個詞隔兩題再來一次，讓他自己再找一次。
 */
type Phase = 'hello' | 'ask' | 'oops' | 'snap' | 'alive' | 'recap' | 'done'

const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000
const BEAT = 380
const REMIND_AFTER = 5000
const REMINDERS = 2
/** 提醒完還是沒點：再等這麼久，就讓對的那張發亮（算有提示，這個詞等一下再考一次） */
const HINT_AFTER = 4000

/** crown：拼好這個詞，這個字的詞就全部收集到了 */
type Solved = { word: string; ok: boolean; fresh: boolean; crown?: boolean }
/** 一輪裡每一題都第一下就找對（至少三題才算） */
const perfect = (all: Solved[]) => all.length >= 3 && all.every((s) => s.ok)

export default function Puzzle({ library, hues, progress, onSolve, onPick, onBack }: {
  library: CharEntry[]
  /** 每個字的顏色，跟首頁一樣 */
  hues: Map<string, number>
  progress: Progress
  /** 拼好一個詞（ok：第一下就找對）；每個詞每輪只記一次 */
  onSolve: (word: string, char: string, ok: boolean) => void
  onPick: (char: string) => void
  onBack: () => void
}) {
  const newRound = () => pickPuzzles(library, progress)
  const [round, setRound] = useState(newRound)
  const items = useMemo(() => new Map(round.map((r) => [r.word, r])), [round])
  // 這一輪實際的題目：找錯的詞會再插進來一次
  const [queue, setQueue] = useState(() => round.map((r) => r.word))
  const [at, setAt] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('hello')
  const [missed, setMissed] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const [solved, setSolved] = useState<Solved[]>([])
  const [reading, setReading] = useState(-1)
  const [book, setBook] = useState(false)
  /** 這一輪開始前就拼過的詞：拼好時不是「新的詞」 */
  const before = useRef(new Set(Object.keys(progress.puzzles || {})))
  const recorded = useRef(new Set<string>())
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const item: PuzzleItem | undefined = items.get(queue[at])
  // 排好的提醒觸發時要看「現在」是第幾題、有沒有提示過（排的時候的值可能已經舊了）
  const now = useRef({ at, missed })
  now.current = { at, missed }
  const byChar = useMemo(() => new Map(library.map((c) => [c.char, c])), [library])
  /** 圖鑑裡的詞要找回它的圖 */
  const pictures = useMemo(() => new Map(library.flatMap((c) => (c.words || []).filter((w) => w.emoji).map((w) => [w.text, w.emoji!] as const))), [library])

  /**
   * 唸題目。補字：「生日」→「生日的日」。看詞找圖：先只問「哪一張圖是這個詞？」讓他自己讀；
   * 他還沒點、或剛剛找錯，就把詞唸出來當提示（hint）。還沒點就隔一下再唸一次，最多 REMINDERS 次。
   */
  const ask = (it: PuzzleItem, reminders = REMINDERS, lead = 0, hint = false) => {
    let t = lead
    later(drum, t)
    t += 300
    const lines = it.kind === 'picture' ? [...(hint ? [it.word] : []), FIXED_LINES.puzzlePicture] : [it.word, LINES.puzzleAsk(it.char, it.word)]
    for (const text of lines) {
      later(() => say(text, 0.8), t)
      t += lasts(text) + BEAT
    }
    if (reminders > 0) later(() => ask(it, reminders - 1, 0, true), t + REMIND_AFTER)
    else later(() => showHint(it), t + HINT_AFTER)
  }

  /** 唸了好幾次他還是沒點：對的那張發亮，不要讓他一直卡著 */
  const showHint = (it: PuzzleItem) => {
    if (now.current.missed) return
    const i = now.current.at
    setQueue((q) => requeue(q, i, it.word))
    setMissed(true)
    tap()
  }

  const serve = (list: string[], i: number) => {
    const it = items.get(list[i])!
    setAt(i)
    // 再來一次的題目：字卡重新洗過，不能照剛剛的位置點
    setOptions(shuffle(it.options))
    setMissed(false)
    setWrong(null)
    setPhase('ask')
    ask(it, REMINDERS, 350)
  }

  /** 拼完了：「你拼好了這些詞！」，再把每個詞唸一次 */
  const finish = (all: Solved[]) => {
    cheer()
    const words = [...new Set(all.map((s) => s.word))]
    setPhase('recap')
    let t = 500
    later(() => say(FIXED_LINES.puzzleRecap, 0.8), t)
    t += lasts(FIXED_LINES.puzzleRecap) + BEAT
    words.forEach((w, i) => {
      later(() => { setReading(i); say(w, 0.8) }, t)
      t += Math.max(lasts(w), 600) + BEAT
    })
    // 每一題都是第一下就找對：再誇一句
    if (perfect(all)) later(() => { setReading(-1); cheer(); say(FIXED_LINES.puzzlePerfect, 0.8) }, t)
    later(() => { setReading(-1); setPhase('done') }, t + 200)
  }

  // 一進來先說「來拼詞語囉！」，再出第一題
  useEffect(() => {
    // 不到兩題時畫面是「先去看幾個字」，不要在背後開場、出題
    if (round.length < 2) return
    preloadVoice([...round.map((r) => LINES.puzzleAll(r.char)), FIXED_LINES.puzzleHello, FIXED_LINES.puzzleRecap, FIXED_LINES.puzzlePicture, FIXED_LINES.puzzlePerfect, ...round.flatMap((r) => r.kind === 'picture'
      ? r.options
      : [r.word, LINES.puzzleAsk(r.char, r.word), ...r.options.map((o) => LINES.feedNotThis(o))])])
    const words = round.map((r) => r.word)
    recorded.current = new Set()
    before.current = new Set(Object.keys(progress.puzzles || {}))
    setQueue(words)
    setAt(0)
    setSolved([])
    setReading(-1)
    setPhase('hello')
    say(FIXED_LINES.puzzleHello, 0.8)
    later(() => serve(words, 0), lasts(FIXED_LINES.puzzleHello) + 300)
    return () => { clear(); stopSpeech() }
  }, [round])

  /** 點了一張卡：char 題是字，picture 題是詞 */
  const pick = (card: string) => {
    if (phase !== 'ask' || !item || card === wrong) return
    clear()
    if (card === (item.kind === 'picture' ? item.word : item.char)) {
      const ok = !missed
      if (!recorded.current.has(item.word)) {
        recorded.current.add(item.word)
        onSolve(item.word, item.char, ok)
      }
      const fresh = !before.current.has(item.word) && !solved.some((s) => s.word === item.word)
      // 這個字的詞是不是剛好收集完了（之前還沒收完、拼了這個就收完）
      const had = new Set([...before.current, ...solved.map((s) => s.word)])
      const entry = byChar.get(item.char)
      const crown = fresh && !completesChar(entry, had) && completesChar(entry, new Set([...had, item.word]))
      const all = [...solved, { word: item.word, ok, fresh, crown }]
      // 喀！卡片進到格子裡 → 圖變成彩色跳起來，再唸一次整個詞
      snap()
      setPhase('snap')
      later(() => { setSolved(all); setPhase('alive'); say(item.word, 0.8); if (fresh) stash() }, 450)
      let shown = 450 + Math.max(1700, lasts(item.word) + 900)
      if (crown) {
        const line = LINES.puzzleAll(item.char)
        later(() => { cheer(); say(line, 0.8) }, 450 + lasts(item.word) + BEAT)
        shown = Math.max(shown, 450 + lasts(item.word) + BEAT + lasts(line) + 700)
      }
      later(() => (at + 1 < queue.length ? serve(queue, at + 1) : finish(all)), shown)
      return
    }
    // 找錯：翻開那張說它是什麼（字：「這是月耶！」；圖：那張圖的詞「月亮」），對的那張發亮，再唸一次題目；這個詞等一下再來一次
    if (!missed) setQueue((q) => requeue(q, at, item.word))
    setMissed(true)
    setWrong(card)
    setPhase('oops')
    boing()
    const line = item.kind === 'picture' ? card : LINES.feedNotThis(card)
    say(line, 0.8)
    const pause = lasts(line) + BEAT
    later(() => setPhase('ask'), pause)
    ask(item, REMINDERS, pause, true)
  }

  const again = () => {
    tap()
    clear()
    setRound(newRound())
  }

  /** 卡片正在飛、圖正在跳的那一兩秒不能開圖鑑（排好的下一步會被取消，回來就卡住了） */
  const canOpenBook = phase === 'hello' || phase === 'ask' || phase === 'oops' || phase === 'recap' || phase === 'done'
  const openBook = () => { if (!canOpenBook) return; tap(); clear(); stopSpeech(); setBook(true) }
  const closeBook = () => {
    tap()
    setBook(false)
    // 題目做到一半（或還沒開始）去看圖鑑：回來從這一題重新唸；結算唸到一半就直接停在結算
    // 開場還沒出題時，題號還停在上一輪，要從第一題開始
    if (phase === 'hello') serve(queue, 0)
    else if (phase === 'ask' || phase === 'oops') serve(queue, at)
    else if (phase === 'recap') { setReading(-1); setPhase('done') }
  }

  const shelf = collection(progress)
  const bookButton = (
    <button className="puz-book-btn" onClick={openBook} disabled={!canOpenBook} aria-label={`打開詞語圖鑑，收集了 ${shelf.length} 個詞`}>
      📖 <b key={shelf.length}>{shelf.length}</b>
    </button>
  )

  if (book) {
    return (
      <div className="puz">
        <SubBar title="📖 我的詞語圖鑑" stat={`收集了 ${shelf.length} 個詞`} onBack={closeBook} backLabel="← 回拼圖" />
        {shelf.length ? (
          <div className="puz-shelf">
            {shelves(library, progress).map((row) => (
              <section key={row.char} className={'puz-row' + (row.complete ? ' complete' : '')} aria-label={row.complete ? `「${row.char}」的詞全部找到了` : `「${row.char}」的詞`}>
                <button className="puz-row-char" style={{ ['--hue' as any]: hueVar(byChar.get(row.char) ? hueOf(byChar.get(row.char)!, hues) : 1) }} onClick={() => { tap(); onPick(row.char) }} aria-label={`去看「${row.char}」`}>{row.char}{row.complete && <span className="puz-row-crown" aria-hidden>👑</span>}</button>
                <div className="puz-row-words">
                  {row.solved.map((w) => (
                    <button key={w} className="puz-sticker" onClick={() => { tap(); say(w, 0.8) }} aria-label={`聽「${w}」`}>
                      <span className="puz-sticker-pic" aria-hidden>{pictures.get(w) || '✨'}</span>
                      <span className="puz-sticker-word">
                        {[...w].map((c, i) => <span key={i} className={c === row.char ? 'mine' : ''}>{c}</span>)}
                      </span>
                    </button>
                  ))}
                  {/* 這個字還沒拼過的詞：只露出影子，等他去拼 */}
                  {row.rest.map((w) => (
                    <span key={w} className="puz-sticker locked" aria-label="還沒拼過的詞">
                      <span className="puz-sticker-pic" aria-hidden>{pictures.get(w) || '❔'}</span>
                      <span className="puz-sticker-word" aria-hidden>{[...w].map((c, i) => <span key={i}>{c === row.char ? c : '？'}</span>)}</span>
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="puz-empty"><p>圖鑑還是空的。<br />去拼幾個詞，它們就會住進來！</p></div>
        )}
      </div>
    )
  }

  if (round.length < 2) {
    return (
      <div className="puz">
        <SubBar title="🧩 詞語拼圖" onBack={onBack} />
        <div className="puz-empty">
          <span className="puz-empty-icon" aria-hidden>🧩</span>
          <p>拼圖要用你看過的字。<br />先去看幾個字，再回來拼詞！</p>
          <button className="nav-btn primary" onClick={onBack}>去看字 →</button>
        </div>
      </div>
    )
  }

  const done = phase === 'recap' || phase === 'done'
  const recapWords = [...new Set(solved.map((s) => s.word))]
  const filled = phase === 'snap' || phase === 'alive'
  const encore = item ? queue.indexOf(item.word) < at : false
  const current = solved[solved.length - 1]

  return (
    <div className="puz">
      <SubBar title="🧩 詞語拼圖" stat={bookButton} onBack={onBack} />
      <div className="puz-pieces" aria-label={`拼好了 ${solved.length} / ${queue.length} 個`}>
        {queue.map((w, i) => (
          <span key={i} className={'puz-piece' + (i < solved.length ? ' done' : '') + (solved[i]?.ok ? ' ok' : '') + (i === at && !done ? ' now' : '') + (queue.indexOf(w) < i ? ' encore' : '')}>
            {i < solved.length ? items.get(solved[i].word)?.emoji : ''}
          </span>
        ))}
      </div>

      {done ? (
        <div className="puz-done" role="status">
          <p className="puz-done-title">{perfect(solved) ? '🌟 全部自己拼出來了！' : '你拼好了這些詞！'}</p>
          <div className="puz-done-row">
            {recapWords.map((w, i) => (
              <button key={w} className={'puz-sticker' + (i === reading ? ' reading' : '')} style={{ animationDelay: `${i * 0.08}s` }}
                onClick={() => { tap(); say(w, 0.8) }} aria-label={`聽「${w}」`}>
                <span className="puz-sticker-pic" aria-hidden>{items.get(w)?.emoji}</span>
                <span className="puz-sticker-word">{w}</span>
                {solved.find((s) => s.word === w)?.fresh && <span className="puz-new" aria-label="新的詞">新</span>}
              </button>
            ))}
          </div>
          {phase === 'done' && (
            <div className="game-actions">
              <button className="nav-btn primary" onClick={again}>🧩 再拼一次</button>
              <button className="nav-btn" onClick={openBook}>📖 看圖鑑</button>
            </div>
          )}
          {phase === 'done' && <Confetti />}
        </div>
      ) : item && (
        <div className={`puz-main phase-${phase}`}>
          <section className="puz-board" aria-live="polite">
            {item.kind === 'picture' && !filled
              ? <div className="puz-pic-slot" aria-hidden><span>?</span></div>
              : <div className={'puz-pic' + (phase === 'alive' ? ' alive' : '') + (item.kind === 'picture' ? ' landed' : '')} aria-hidden>
                  {emojiArt(item.emoji) ? <img src={emojiArt(item.emoji)!} alt="" /> : item.emoji}
                </div>}
            {phase === 'alive' && current?.crown && <span className="puz-crown" role="status">👑「{item.char}」的詞全部找到了！</span>}
            {phase === 'alive' && current?.fresh && !current.crown && <span className="puz-new big" role="status">新的詞！</span>}
            <button className="puz-word" onClick={() => { if (phase === 'ask') { tap(); clear(); ask(item, 1) } }} disabled={phase !== 'ask'}
              aria-label={`再聽一次：${item.word}`}>
              {[...item.word].map((c, i) => i === item.slot && item.kind === 'char'
                ? <span key={i} className={'puz-slot' + (filled ? ' filled' : '')}>{filled ? c : <span aria-hidden>?</span>}</span>
                : <span key={i} className="puz-tile">{c}</span>)}
              {phase === 'ask' && <span className="puz-listen" aria-hidden>🔊</span>}
            </button>
          </section>

          <section className={'puz-cards' + (item.kind === 'picture' ? ' pictures' : '')} aria-label={item.kind === 'picture' ? '圖卡' : '字卡'}>
            {options.map((c) => {
              const answer = item.kind === 'picture' ? item.word : item.char
              const flipped = c === wrong
              const hint = missed && c === answer && phase === 'ask'
              const used = c === answer && filled
              const gone = c !== answer && filled
              return (
                <button key={`${at}-${c}`} className={'puz-card' + (flipped ? ' flipped' : '') + (hint ? ' hint' : '') + (used ? ' used' : '') + (gone ? ' gone' : '')}
                  disabled={phase !== 'ask' || flipped} onClick={() => pick(c)}
                  aria-label={item.kind === 'picture' ? (flipped ? `這是「${c}」` : `放這張圖`) : (flipped ? `這是「${c}」` : `放「${c}」`)}>
                  {item.kind === 'picture' ? <>
                    <span className="puz-card-pic" aria-hidden>{pictures.get(c)}</span>
                    {flipped && <span className="puz-card-word">{c}</span>}
                  </> : <>
                    {flipped && <span className="puz-card-emoji" aria-hidden>{byChar.get(c)?.emoji}</span>}
                    <span className="puz-card-char">{c}</span>
                  </>}
                </button>
              )
            })}
          </section>
        </div>
      )}
      {!done && phase === 'ask' && !missed && at === 0 && solved.length === 0 && <p className="game-hint puz-tip">聽聽看缺了哪個字，點那一張把詞拼起來！</p>}
      {!done && phase === 'ask' && !missed && !encore && item?.kind === 'picture' && !item.review && <p className="game-hint puz-tip">讀讀看這是什麼詞，把對的圖放上去！</p>}
      {!done && phase === 'ask' && !missed && !encore && item?.review && <p className="game-hint puz-tip">上次這個詞有一點難，這次自己找找看！</p>}
      {!done && phase === 'ask' && encore && !missed && <p className="game-hint puz-tip">剛剛那個詞又來了，這次自己找找看！</p>}
      {!done && phase === 'oops' && wrong && <p className="game-hint puz-tip">這是「{wrong}」，找找看發亮的那一張！</p>}
      {!done && phase === 'ask' && missed && !wrong && <p className="game-hint puz-tip">找找看發亮的那一張！</p>}
    </div>
  )
}

function shuffle<T>(list: T[]) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
