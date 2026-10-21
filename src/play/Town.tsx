import { useMemo, useState } from 'react'
import type { CharEntry, Resident } from '../types'
import { say } from '../lib/audio'
import { tap } from '../lib/sfx'
import { LINES } from '../../shared/voice-lines.mjs'
import { Handwriting } from './Glyphs'
import { SubBar, hueOf, hueVar } from './ui'
import { nextPartner, partnersAt } from './partners'

/** 寫幾次長多大：一次是小不點，五次以上戴皇冠。 */
const levelOf = (traces: number) => Math.min(traces, 5)

/** 同一個字每次打開都站在差不多的地方、用同樣的節奏走，小鎮才像一個地方而不是亂數。 */
const seed = (char: string) => [...char].reduce((h, c) => (h * 31 + c.codePointAt(0)!) >>> 0, 7)

/**
 * 我的小鎮：他描完的字會搬進來，用他自己的筆跡當身體。
 * 點居民會跳一下、唸出自己和一個語詞；再寫一次就長大。
 */
export default function Town({ residents, library, hues, stars, onPick, onBack, onGame }: {
  residents: Record<string, Resident>
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

  const talk = (entry: CharEntry) => {
    tap()
    setTalking(entry.char)
    setHop((h) => h + 1)
    const word = entry.words?.[Math.floor(Math.random() * entry.words.length)]
    say(word ? LINES.townWord(entry.char, word.text) : LINES.townHello(entry.char), 0.8)
  }

  return (
    <div className="town">
      <SubBar title="🏡 我的小鎮" stat={people.length ? `住了 ${people.length} 個字` : '還是一片空地'} onBack={onBack} />

      <Crew stars={stars} onGame={onGame} />

      <div className="town-land">
        <div className="town-sky" aria-hidden><span className="town-sun">☀️</span><span className="town-cloud c1">☁️</span><span className="town-cloud c2">☁️</span></div>
        {people.length ? (
          <div className="town-grid">
            {people.map(({ entry, resident }, i) => {
              const s = seed(entry.char)
              const level = levelOf(resident.traces)
              const speaking = talking === entry.char
              return (
                <div key={entry.char} className="resident-cell" style={{
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
                    aria-label={`「${entry.char}」，你寫了 ${resident.traces} 次`} onClick={() => talk(entry)}>
                    {level >= 5 && <span className="resident-crown" aria-hidden>👑</span>}
                    <span className="resident-body">
                      <span className="resident-eyes" aria-hidden><i /><i /></span>
                      <Handwriting strokes={resident.strokes} char={entry.char} />
                      <span className="resident-prop" aria-hidden>{entry.emoji}</span>
                    </span>
                    <span className="resident-feet" aria-hidden><i /><i /></span>
                  </button>
                  <span className="resident-tag">
                    {entry.char === newest && Date.now() - Date.parse(resident.first) < 36e5 * 24 ? '✨ 新來的' : `✏️ × ${resident.traces}`}
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
      {people.length > 0 && <p className="town-tip">再寫一次，它就會長大。寫五次會戴上皇冠 👑</p>}
    </div>
  )
}

/**
 * 住在小鎮裡的夥伴：星星集滿一段就會來一位（partners.ts）。
 * 他們不是只放在這裡好看——點一下就去跳石頭過河，那幾位就是在河邊等他的主角。
 */
function Crew({ stars, onGame }: { stars: number; onGame: (id: string) => void }) {
  const crew = partnersAt(stars)
  const next = nextPartner(stars)
  return (
    <div className="crew">
      <span className="crew-title">🎁 你的夥伴</span>
      <div className="crew-row">
        {crew.map((p, i) => (
          <button key={p.id} className="crew-one" style={{ ['--i' as any]: i }} onClick={() => { tap(); onGame('river') }}
            aria-label={`跟「${p.name}」去跳石頭過河`}>
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
      <span className="crew-tip">點一位，牠就陪你去過河 🌊</span>
    </div>
  )
}
