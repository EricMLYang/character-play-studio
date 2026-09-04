import type { CharEntry } from '../types'
import { blip, say } from '../lib/audio'

export default function Stickers({
  all, owned, onBack,
}: { all: CharEntry[]; owned: string[]; onBack: () => void }) {
  const set = new Set(owned)
  return (
    <div className="stickers">
      <header className="stickers-bar">
        <button className="back-btn" onClick={() => { blip(600); onBack() }}>↩︎</button>
        <div className="stickers-title">我的字 <span>{owned.length} / {all.length}</span></div>
      </header>
      <div className="sticker-grid">
        {all.map((c) => {
          const has = set.has(c.char)
          return (
            <button
              key={c.char}
              className={'sticker' + (has ? '' : ' locked')}
              onClick={() => { if (has) { blip(820); say(c.char) } }}
            >
              {has ? <>
                <span className="sticker-emoji">{c.emoji}</span>
                <span className="sticker-char">{c.char}</span>
              </> : <span className="sticker-lock">?</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
