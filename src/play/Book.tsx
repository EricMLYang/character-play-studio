import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { blip, boing, cheer, tap, whoosh } from '../lib/sfx'
import { LINES } from '../../shared/voice-lines.mjs'
import { BOOK_FIXED, sentenceText } from '../../shared/books.mjs'
import { askable, pickBook, segmentsOf, type Page, type ReadPage, type Word } from './books'
import { Confetti, SubBar, emojiArt } from './ui'

/**
 * 指讀小書：3～5 句用他看過的字組成的小故事，一句一句唸、唸到哪一段哪一段亮，
 * 唸完問「哪一個是『火』？」讓他把那個字指出來。最後一頁換他自己接一句（字火車的新家）。
 *
 * 研究上「共讀時指著字讀」是證據最強的一種，但大人不會自然這樣做：所以每一頁下面給爸媽一行提示。
 * 規則在 books.ts，句型與固定台詞在 shared/books.mjs。
 */
type Phase = 'cover' | 'reading' | 'ask' | 'right' | 'done'

const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000
const BEAT = 320
const RATE = 0.8

export default function Book({ library, progress, focus, onRead, onPick, onBack }: {
  library: CharEntry[]
  progress: Progress
  /** 今天的字（今天的路上的），優先進書 */
  focus: string[]
  onRead: (text: string, char: string, ok: boolean, mine?: boolean) => void
  onPick: (char: string) => void
  onBack: () => void
}) {
  const [pages] = useState<Page[]>(() => pickBook(library, progress, focus))
  const [at, setAt] = useState(-1)
  const [phase, setPhase] = useState<Phase>('cover')
  /** 正在唸第幾段 */
  const [lit, setLit] = useState(-1)
  const [missed, setMissed] = useState<number[]>([])
  const [results, setResults] = useState<{ text: string; ok: boolean }[]>([])
  /** 最後一頁他接的那一句 */
  const [mine, setMine] = useState<Word | null>(null)
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const page = at >= 0 ? pages[at] : undefined
  const title = useMemo(() => pages.filter((p): p is ReadPage => p.kind === 'read').map((p) => p.char).join(''), [pages])

  useEffect(() => {
    preloadVoice([...Object.values(BOOK_FIXED), ...pages.flatMap((p) => p.kind === 'read'
      ? [...p.segments.map((s) => s.say), p.char, ...[...p.text].map((c) => LINES.feedNotThis(c))]
      : [...p.shelf.map((w) => w.text), p.pattern.before, p.pattern.after])])
    say(BOOK_FIXED.bookHello, RATE)
    return () => { clear(); stopSpeech() }
  }, [])

  /** 唸這一頁：一段一段，唸到哪段亮哪段；唸完問他那個字在哪裡 */
  const read = (p: ReadPage) => {
    clear()
    stopSpeech()
    setPhase('reading')
    setMissed([])
    let t = 400
    p.segments.forEach((s, i) => {
      later(() => { setLit(i); if (s.say) say(s.say, RATE) }, t)
      t += (s.say ? lasts(s.say) : 300) + BEAT
    })
    later(() => setLit(-1), t)
    if (askable(p)) {
      t += 300
      later(() => { setPhase('ask'); say(BOOK_FIXED.bookAsk, RATE) }, t)
      t += lasts(BOOK_FIXED.bookAsk) + 150
      later(() => say(p.char, RATE), t)
    } else {
      later(() => setPhase('right'), t)
    }
  }

  const open = (index: number) => {
    const next = pages[index]
    setAt(index)
    setMine(null)
    if (!next) { setPhase('done'); return }
    if (next.kind === 'read') read(next)
    else { clear(); stopSpeech(); setPhase('ask'); setLit(-1); later(() => say(BOOK_FIXED.bookMine, RATE), 300) }
  }

  const start = () => { tap(); whoosh(); open(0) }
  const turn = () => {
    tap()
    if (at + 1 >= pages.length) { clear(); stopSpeech(); setPhase('done'); cheer(); return }
    whoosh()
    open(at + 1)
  }

  /** 他指了句子裡的第 i 個字 */
  const point = (p: ReadPage, i: number) => {
    if (phase !== 'ask' || missed.includes(i)) return
    const c = [...p.text][i]
    clear()
    stopSpeech()
    if (c !== p.char) {
      boing()
      setMissed((m) => [...m, i])
      if (/[。！？，]/.test(c)) return
      say(LINES.feedNotThis(c), RATE)
      return
    }
    const ok = missed.length === 0
    cheer()
    setPhase('right')
    setResults((r) => [...r, { text: p.text, ok }])
    onRead(p.text, p.char, ok)
    say(p.char, RATE)
  }

  /** 最後一頁：他挑了一個詞接進句型 */
  const fill = (word: Word) => {
    if (page?.kind !== 'mine' || mine) return
    clear()
    stopSpeech()
    blip()
    setMine(word)
    const text = sentenceText(page.pattern, word.text)
    onRead(text, word.char, true, true)
    let t = 300
    for (const s of segmentsOf(page.pattern, word.text)) {
      if (!s.say) continue
      later(() => say(s.say!, RATE), t)
      t += lasts(s.say) + BEAT
    }
    later(() => setPhase('right'), t)
  }

  // 結尾：把他讀過的句子唸一遍不必（太長），只誇一句
  useEffect(() => {
    if (phase !== 'done') return
    const all = results.length > 0 && results.every((r) => r.ok)
    say(BOOK_FIXED.bookDone, RATE)
    if (all) later(() => say(BOOK_FIXED.bookPerfect, RATE), lasts(BOOK_FIXED.bookDone) + BEAT)
  }, [phase])

  if (!pages.length) {
    return (
      <div className="book">
        <SubBar title="📖 指讀小書" onBack={onBack} />
        <p className="book-empty">多看幾個有語詞的字，就能組出你的第一本小書！</p>
      </div>
    )
  }

  return (
    <div className={`book phase-${phase}`}>
      <SubBar title="📖 指讀小書" stat={page ? `${at + 1} / ${pages.length}` : undefined} onBack={onBack} />
      {phase === 'cover' && (
        <button className="book-cover" onClick={start} aria-label={`打開「${title}」的小書`}>
          <span className="book-cover-emoji" aria-hidden>{pages.filter((p): p is ReadPage => p.kind === 'read').slice(0, 3).map((p) => p.word.emoji).join(' ')}</span>
          <b className="book-cover-title">{title}的小書</b>
          <span className="book-cover-open">翻開 →</span>
        </button>
      )}

      {page?.kind === 'read' && phase !== 'done' && (
        <div className="book-page">
          <div className="book-picture" aria-hidden>
            {emojiArt(page.word.emoji) ? <img src={emojiArt(page.word.emoji)!} alt="" /> : page.word.emoji}
          </div>
          <p className="book-sentence" aria-label={page.text}>
            {(() => {
              let index = 0
              return page.segments.map((s, si) => (
                <span key={si} className={'book-seg' + (lit === si ? ' lit' : '') + (s.slot ? ' slot' : '')}>
                  {[...s.text].map((c) => {
                    const i = index++
                    const punct = /[。！？，]/.test(c)
                    const hit = phase === 'right' && c === page.char
                    return (
                      <button key={i} className={'book-char' + (punct ? ' punct' : '') + (missed.includes(i) ? ' wrong' : '') + (hit ? ' hit' : '')}
                        disabled={phase !== 'ask' || punct} onClick={() => point(page, i)} aria-label={c}>{c}</button>
                    )
                  })}
                </span>
              ))
            })()}
          </p>
          <p className="book-prompt" role="status">
            {phase === 'reading' ? '👉 跟著亮起來的字一起看' : phase === 'ask' ? `哪一個是「${page.char}」？點那個字！` : '🎉 指對了！'}
          </p>
          <div className="book-actions">
            <button className="book-btn" onClick={() => read(page)} aria-label="再唸一次">🔊 再唸一次</button>
            {phase === 'right' && <button className="book-btn go" onClick={turn}>{at + 1 >= pages.length ? '讀完了 ✓' : '下一頁 →'}</button>}
            {phase === 'right' && <button className="book-btn ghost" onClick={() => onPick(page.char)}>看「{page.char}」的字卡</button>}
          </div>
          <small className="book-parent">爸媽一起讀：唸之前先指著字問「這是什麼？」，唸完再問「哪一個是『{page.char}』？」</small>
        </div>
      )}

      {page?.kind === 'mine' && phase !== 'done' && (
        <div className="book-page book-mine">
          <div className="book-picture" aria-hidden>
            {mine ? (emojiArt(mine.emoji) ? <img src={emojiArt(mine.emoji)!} alt="" /> : mine.emoji) : '✏️'}
          </div>
          <p className="book-sentence">
            {page.pattern.before && <span className="book-seg">{page.pattern.before}</span>}
            <span className={'book-seg slot' + (mine ? ' lit' : ' empty')}>{mine ? mine.text : '＿＿'}</span>
            {page.pattern.after && <span className="book-seg">{page.pattern.after}</span>}
          </p>
          <p className="book-prompt" role="status">{mine ? '🎉 這是你自己接的句子！' : '換你接一句：點一個詞放進去'}</p>
          <div className="book-shelf">
            {page.shelf.map((w) => (
              <button key={w.text} className={'book-word' + (mine?.text === w.text ? ' on' : '')} disabled={Boolean(mine)}
                onClick={() => fill(w)} aria-label={w.text}>
                <span aria-hidden>{w.emoji}</span><b>{w.text}</b>
              </button>
            ))}
          </div>
          <div className="book-actions">
            {mine && <button className="book-btn" onClick={() => { tap(); setMine(null); setPhase('ask') }}>🔁 再接一句</button>}
            {mine && <button className="book-btn go" onClick={turn}>讀完了 ✓</button>}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="book-done">
          <Confetti />
          <b>📖 你自己讀完一本小書了！</b>
          <ul className="book-list">
            {results.map((r) => <li key={r.text} className={r.ok ? 'ok' : ''}>{r.ok ? '⭐' : '📖'} {r.text}</li>)}
          </ul>
          <div className="book-actions">
            <button className="book-btn go" onClick={onBack}>回今天的路 →</button>
          </div>
        </div>
      )}
    </div>
  )
}
