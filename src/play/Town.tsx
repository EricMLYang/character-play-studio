import { useEffect, useMemo, useState } from 'react'
import type { CharEntry, Progress, Resident } from '../types'
import { say, sayAll, stopSpeech } from '../lib/audio'
import { boing, cheer, ladder, tap } from '../lib/sfx'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { residentLevel, taiwanDay } from '../../shared/domain.mjs'
import { napOf } from './naps'
import { pickDecoy } from './dishes'
import { Handwriting } from './Glyphs'
import { SubBar, hueOf, hueVar } from './ui'
import { nextPartner, partnersAt, serveNextWith } from './partners'

/** 長多大看憑記憶寫了幾次（shared/domain.mjs 的 residentLevel）：搬進來是小不點，第五級戴皇冠。 */


/** 同一個字每次打開都站在差不多的地方、用同樣的節奏走，小鎮才像一個地方而不是亂數。 */
const seed = (char: string) => [...char].reduce((h, c) => (h * 31 + c.codePointAt(0)!) >>> 0, 7)

/**
 * 我的小鎮：他描完的字會搬進來，用他自己的筆跡當身體。
 * 點居民會跳一下、唸出自己和一個語詞；遮起來憑記憶寫一次就長大。
 */
export default function Town({ residents, progress, library, hues, stars, onPick, onBack, onGame, onRecall }: {
  residents: Record<string, Resident>
  /** 記住程度（誰睡著了，naps.ts） */
  progress: Progress
  /** 叫醒一個居民＝自己認出一次那個字（跟餵大怪獸記同一份） */
  onRecall: (char: string, ok: boolean) => void
  library: CharEntry[]
  hues: Map<string, number>
  /** 總共幾顆星星：決定他收集到哪幾位夥伴（partners.ts） */
  stars: number
  onPick: (char: string) => void
  onBack: () => void
  onGame: (id: string) => void
}) {
  const [talking, setTalking] = useState<string | null>(null)
  const [hop, setHop] = useState(0)
  // 最新搬來的站最前面，他一進來就看得到剛剛寫的那個字
  const people = useMemo(() => library
    .filter((c) => residents[c.char])
    .map((c) => ({ entry: c, resident: residents[c.char] }))
    .sort((x, y) => Date.parse(y.resident.first) - Date.parse(x.resident.first)), [library, residents])
  const newest = people[0]?.entry.char
  const today = taiwanDay()
  /** 這次進來已經叫醒的（點錯過的字記住程度會留在今天，但人已經醒了，不能又睡回去） */
  const [woke, setWoke] = useState<string[]>([])
  const [waking, setWaking] = useState<CharEntry | null>(null)
  const napFor = (char: string) => woke.includes(char) ? 'awake' : napOf(progress, char, today)
  const asleep = people.filter((p) => napFor(p.entry.char) === 'asleep').length

  const talk = (entry: CharEntry) => {
    tap()
    if (napFor(entry.char) === 'asleep') { setWaking(entry); return }
    setTalking(entry.char)
    setHop((h) => h + 1)
    const word = entry.words?.[Math.floor(Math.random() * entry.words.length)]
    say(word ? LINES.townWord(entry.char, word.text) : LINES.townHello(entry.char), 0.8)
  }

  return (
    <div className="town">
      <SubBar title="🏡 我的小鎮" stat={people.length ? `住了 ${people.length} 個字` : '還是一片空地'} onBack={onBack} />

      <Crew stars={stars} onGame={onGame} />

      {/* 草地上的東西：小路、池塘、幾叢草。純 CSS，不用 emoji——居民身上已經有小圖示了，再加會打架 */}
      <div className="town-ground" aria-hidden>
        <span className="town-path" />
        <span className="town-pond" />
        <span className="town-bush b1" /><span className="town-bush b2" /><span className="town-bush b3" /><span className="town-bush b4" />
      </div>

      <div className="town-land">
        <div className="town-sky" aria-hidden><span className="town-sun">☀️</span><span className="town-cloud c1">☁️</span><span className="town-cloud c2">☁️</span></div>
        {people.length ? (
          <div className="town-grid">
            {people.map(({ entry, resident }, i) => {
              const s = seed(entry.char)
              const level = residentLevel(resident)
              const speaking = talking === entry.char
              const nap = napFor(entry.char)
              return (
                <div key={entry.char} className={'resident-cell nap-' + nap} style={{
                  ['--hue' as any]: hueVar(hueOf(entry, hues)), ['--lv' as any]: level, ['--i' as any]: i,
                  ['--walk' as any]: `${7 + (s % 6)}s`, ['--delay' as any]: `${-(s % 9)}s`, ['--dy' as any]: `${(s >> 3) % 22}px`,
                }}>
                  {speaking && (
                    <div className="bubble" role="status">
                      <span>我是「{entry.char}」！</span>
                      <button onClick={() => onPick(entry.char)}>▶ 看我</button>
                    </div>
                  )}
                  <button key={speaking ? hop : 0} className={'resident' + (speaking ? ' jump' : '')}
                    aria-label={nap === 'asleep' ? '睡著的居民，叫醒他' : `「${entry.char}」，你寫了 ${resident.traces} 次，其中 ${resident.blind || 0} 次是憑記憶寫的`} onClick={() => talk(entry)}>
                    {level >= 5 && <span className="resident-crown" aria-hidden>👑</span>}
                    <span className="resident-body">
                      <span className="resident-eyes" aria-hidden><i /><i /></span>
                      <Handwriting strokes={resident.strokes} char={entry.char} />
                      <span className="resident-prop" aria-hidden>{entry.emoji}</span>
                      {/* 睡著了：被子蓋住，看不到是哪個字——叫醒他就要自己想起來 */}
                      {nap === 'asleep' && <span className="resident-blanket" aria-hidden><i>z</i><i>z</i><i>Z</i></span>}
                    </span>
                    <span className="resident-feet" aria-hidden><i /><i /></span>
                  </button>
                  <span className="resident-tag">
                    {nap === 'asleep' ? '💤 叫醒我' : nap === 'sleepy' ? '🥱 想睡了' : entry.char === newest && Date.now() - Date.parse(resident.first) < 36e5 * 24 ? '✨ 新來的' : resident.blind ? `🙈 × ${resident.blind}` : `✏️ × ${resident.traces}`}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="town-empty">
            <p className="town-empty-big">🏗️</p>
            <p>這裡還沒有人住。</p>
            <p>點一個字卡，看完之後<b>用手指把字描出來</b>，<br />那個字就會搬進來，而且是<b>你寫的樣子</b>！</p>
            <button className="nav-btn primary" onClick={onBack}>去找一個字 →</button>
          </div>
        )}
      </div>
      {people.length > 0 && <p className="town-tip">{asleep ? `💤 有 ${asleep} 個字睡著了：點他，找出他的名字叫醒他！` : '遮起來、憑記憶再寫一次，它就會長大。長到第五級戴上皇冠 👑'}</p>}
      {waking && (
        <Wake key={waking.char} entry={waking} library={library} progress={progress}
          onRecall={onRecall}
          onAwake={() => { setWoke((w) => [...w, waking.char]); setWaking(null); setTalking(waking.char); setHop((h) => h + 1) }}
          onClose={() => { stopSpeech(); setWaking(null) }} />
      )}
    </div>
  )
}

/**
 * 住在小鎮裡的夥伴：星星集滿一段就會來一位（partners.ts）。
 * 他們不是只放在這裡好看——點一下就去餵大怪獸，那一位就來端菜。
 */
function Crew({ stars, onGame }: { stars: number; onGame: (id: string) => void }) {
  const crew = partnersAt(stars)
  const next = nextPartner(stars)
  return (
    <div className="crew">
      <span className="crew-title">🎁 你的夥伴</span>
      <div className="crew-row">
        {crew.map((p, i) => (
          <button key={p.id} className="crew-one" style={{ ['--i' as any]: i }}
            onClick={() => { tap(); serveNextWith(p.id); onGame('feed') }}
            aria-label={`讓「${p.name}」來餵大怪獸端菜`}>
            <img src={`/hero/${p.id}/idle.png`} alt="" />
            <small>{p.name}</small>
          </button>
        ))}
        {next && (
          <span className="crew-next" aria-label={`再 ${next.need} 顆星星就有下一位夥伴`}>
            <span className="crew-q" aria-hidden>?</span>
            <small>再 {next.need} 顆 ⭐</small>
          </span>
        )}
      </div>
      <span className="crew-tip">點一位，牠就來幫你端菜 🍽️</span>
    </div>
  )
}

/**
 * 叫醒一個睡著的居民：兩張字卡，聽到他的名字，找出來（跟餵大怪獸同一種「自己認出來」，記同一份紀錄）。
 * 第一下就對才算認得；點錯了翻開說「這是○耶」，再找一次，找到了他照樣醒來。
 */
function Wake({ entry, library, progress, onRecall, onAwake, onClose }: {
  entry: CharEntry
  library: CharEntry[]
  progress: Progress
  onRecall: (char: string, ok: boolean) => void
  onAwake: () => void
  onClose: () => void
}) {
  const [cards] = useState(() => {
    const known = Object.keys(progress.watched).filter((c) => library.some((e) => e.char === c))
    const decoy = pickDecoy(entry.char, known, library.map((c) => c.char))
    return [entry.char, decoy].filter(Boolean).sort(() => Math.random() - 0.5)
  })
  const [wrong, setWrong] = useState<string[]>([])
  const [up, setUp] = useState(false)
  const ask = () => sayAll([FIXED_LINES.wakeAsk, entry.char], 0.8, 160)
  useEffect(() => {
    const stop = ask()
    return () => { stop(); stopSpeech() }
  }, [])
  const pick = (c: string) => {
    if (up || wrong.includes(c)) return
    if (c !== entry.char) {
      boing()
      if (!wrong.length) onRecall(entry.char, false)
      setWrong((w) => [...w, c])
      say(LINES.feedNotThis(c), 0.8)
      return
    }
    if (!wrong.length) { onRecall(entry.char, true); ladder(1) }
    setUp(true)
    cheer()
    sayAll([FIXED_LINES.wakeUp, LINES.townHello(entry.char)], 0.8, 200)
    window.setTimeout(onAwake, 1900)
  }
  return (
    <div className="wake" role="dialog" aria-label="叫醒他">
      <div className={'wake-card' + (up ? ' up' : '')}>
        <button className="wake-x" onClick={onClose} aria-label="先不要">✕</button>
        <div className="wake-sleeper" aria-hidden>{up ? '🤸' : '😴'}<span className="wake-zzz">{up ? '✨' : '💤'}</span></div>
        <button className="wake-ask" onClick={() => { tap(); ask() }} aria-label="再聽一次">找出他的名字 🔊</button>
        <div className="wake-cards">
          {cards.map((c) => (
            <button key={c} className={'wake-pick' + (wrong.includes(c) ? ' wrong' : '') + (up && c === entry.char ? ' right' : '')}
              disabled={up || wrong.includes(c)} onClick={() => pick(c)} aria-label={c}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
