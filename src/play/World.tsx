import type { Dweller } from './magicWorld'
import { emojiArt } from './ui'

/**
 * 魔法世界的畫面（magicWorld.ts 決定誰住哪裡）：天空、山、池塘、草地、野餐墊，上面住著他寫出來的東西。
 * fresh：這一輪剛變出來的字，從天上掉進來、閃一下；點一個東西會唸它的字（onPick）。
 */
export default function World({ dwellers, fresh = [], hide = [], backdrop = false, onPick }: {
  dwellers: Dweller[]
  fresh?: string[]
  /** 還沒演完變身的字先不放進來（紀錄一寫完就有了，但東西要等變身演完才掉進來） */
  hide?: string[]
  /** 鋪滿整個畫面當背景（魔法筆寫字的時候，他的世界就在後面） */
  backdrop?: boolean
  onPick?: (char: string) => void
}) {
  const shown = dwellers.filter((d) => !hide.includes(d.char))
  return (
    <div className={'world' + (backdrop ? ' world-backdrop' : '')} aria-label={`你的魔法世界，住了 ${shown.length} 個東西`} aria-hidden={backdrop || undefined}>
      <div className="world-sky" />
      <svg className="world-land" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path d="M0 50 C18 38 32 44 50 40 C70 36 82 44 100 40 V100 H0 Z" fill="#A8DB8F" />
        <path d="M0 62 C22 56 40 62 60 58 C78 55 90 60 100 58 V100 H0 Z" fill="#86C96F" />
        <ellipse cx="24" cy="78" rx="19" ry="11" fill="#7FC8F0" />
        <ellipse cx="24" cy="76" rx="15" ry="7" fill="#A9DDF7" opacity=".7" />
        <rect x="47" y="82" width="52" height="16" rx="2" fill="#FF8F8F" />
        <path d="M47 86 H99 M47 90 H99 M47 94 H99 M55 82 V98 M64 82 V98 M73 82 V98 M82 82 V98 M91 82 V98" stroke="#fff" strokeWidth=".7" opacity=".8" />
      </svg>
      {shown.map((d, i) => {
        const art = emojiArt(d.emoji)
        return (
          <button key={d.char} className={`world-dweller world-${d.zone} world-act-${d.act}${fresh.includes(d.char) ? ' world-fresh' : ''}`}
            style={{ left: `${d.x}%`, top: `${d.y}%`, ['--s' as string]: d.size, ['--d' as string]: `${(i % 7) * -0.7}s` }}
            onClick={() => onPick?.(d.char)} aria-label={d.char} tabIndex={backdrop ? -1 : undefined}>
            <span className="world-body">{art ? <img src={art} alt="" draggable={false} /> : d.emoji}</span>
            <b className="world-char">{d.char}</b>
          </button>
        )
      })}
      {shown.length === 0 && !backdrop && <p className="world-empty">寫一個字，它就會住進來！</p>}
    </div>
  )
}
