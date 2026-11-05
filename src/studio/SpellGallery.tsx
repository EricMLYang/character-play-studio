import { useEffect, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { LEVEL_BADGE, writeLevel } from '../play/wishes'
import { COMBOS, SPELLS, type Combo, type Spell } from '../../shared/spells.mjs'
import { sayAll, stopSpeech, voiceDuration } from '../lib/audio'
import { loadChar } from '../play/Strokes'
import Conjure from '../play/Conjure'
import Fuse, { type Written } from '../play/Fuse'
import { emojiArt } from '../play/ui'
import { conjureTotal } from '../play/conjuring'
import { hasOrigin } from '../play/origins'

/**
 * 給爸媽的魔法筆預覽：87 個字的變身、21 個合體，一個一個點來看、戴耳機聽（願望 → 第二種說法 → 謝謝）。
 * 孩子端要真的寫完一個字才看得到一次，驗收全部太慢；這裡用標準筆畫（不是孩子的筆跡）直接演。
 * 不記任何紀錄。格子底下的小字是動作名（×2＝有第二種說法）和他現在的等級（寫過的才有）。
 */
type Playing = { key: number; kind: 'spell'; spell: Spell; strokes: number[][] } | { key: number; kind: 'combo'; combo: Combo; parts: [Written, Written] }

const medians = async (char: string) => ((await loadChar(char)).medians as number[][][]).map((m) => m.flat())

export default function SpellGallery({ characters, progress, onClose }: { characters: CharEntry[]; progress?: Progress; onClose: () => void }) {
  const emojiOf = (c: string) => characters.find((e) => e.char === c)?.emoji
  const [playing, setPlaying] = useState<Playing | null>(null)
  const [power, setPower] = useState(0)
  const voice = useRef<(() => void) | null>(null)
  /** 全部連著播到第幾個（null＝沒在播）；按停止或關掉就停 */
  const [auto, setAuto] = useState<number | null>(null)
  const autoRun = useRef(0)
  useEffect(() => () => { autoRun.current++; voice.current?.(); stopSpeech() }, [])
  const lasts = (t: string) => (voiceDuration(t) ?? 0.28 * [...t].length + 0.5) * 1000
  /** 一個字要播多久：唸完那幾句、變身也演完，再多停一下 */
  const spellMs = (sp: Spell) => Math.max([sp.wish, sp.alt, sp.char, sp.thanks].filter(Boolean).reduce((n, t) => n + lasts(t!) + 300, 0), conjureTotal(hasOrigin(sp.char))) + 600
  const playAll = async () => {
    const run = ++autoRun.current
    for (let i = 0; i < SPELLS.length; i++) {
      if (autoRun.current !== run) return
      setAuto(i)
      await playSpell(SPELLS[i])
      document.querySelectorAll('.st-gallery-item')[i]?.scrollIntoView({ block: 'nearest' })
      await new Promise((r) => setTimeout(r, spellMs(SPELLS[i])))
    }
    if (autoRun.current === run) setAuto(null)
  }
  const stopAll = () => { autoRun.current++; setAuto(null); voice.current?.(); stopSpeech(); setPlaying(null) }

  const size = Math.min(320, window.innerWidth * 0.5)
  const from = { left: window.innerWidth / 2 - size / 2, top: window.innerHeight / 2 - size / 2, width: size, height: size }

  const playSpell = async (spell: Spell) => {
    voice.current?.()
    voice.current = sayAll([spell.wish, ...(spell.alt ? [spell.alt] : []), spell.char, spell.thanks], 0.85, 300)
    setPlaying({ key: Date.now(), kind: 'spell', spell, strokes: await medians(spell.char) })
  }
  const playCombo = async (combo: Combo) => {
    voice.current?.()
    const [a, b] = [...combo.word]
    setPlaying({ key: Date.now(), kind: 'combo', combo, parts: [{ char: a, strokes: await medians(a) }, { char: b, strokes: await medians(b) }] })
  }

  return (
    <div className="st-gallery" role="dialog" aria-label="魔法筆預覽">
      <div className="st-gallery-card">
        <header className="st-gallery-head">
          <h3>🎧 魔法筆預覽</h3>
          <p className="st-dim">點一個字：唸願望（有第二種說法也唸）、字、謝謝，同時演變身。用的是標準筆畫，不是他的筆跡；不記紀錄。</p>
          <label className="st-gallery-power">魔法強度：
            {['普通', '🙈 憑記憶', '🧙 聽寫級'].map((label, i) => (
              <button key={label} className={power === i ? 'on' : ''} onClick={() => setPower(i)}>{label}</button>
            ))}
          </label>
          {auto === null
            ? <button className="st-gallery-close" onClick={playAll}>▶ 全部連著播（{SPELLS.length} 個，約 {Math.round(SPELLS.reduce((n, sp) => n + spellMs(sp), 0) / 60000)} 分鐘）</button>
            : <button className="st-gallery-close" onClick={stopAll}>■ 停止（第 {auto + 1} 個）</button>}
          <button className="st-gallery-close" onClick={() => { stopAll(); onClose() }}>關閉</button>
        </header>
        <h4>會變身的字（{SPELLS.length}）</h4>
        <div className="st-gallery-grid">
          {SPELLS.map((s) => {
            const art = emojiArt(emojiOf(s.char))
            return (
              <button key={s.char} className={'st-gallery-item' + (auto !== null && SPELLS[auto]?.char === s.char ? ' on' : '')} onClick={() => playSpell(s)} title={`${s.wish}／${s.thanks}`}>
                {art ? <img src={art} alt="" /> : <span>{emojiOf(s.char)}</span>}
                <b>{s.char}</b>
                <small>{s.act}{s.alt ? ' ×2' : ''}{progress?.town?.[s.char]?.traces ? ` ${LEVEL_BADGE[writeLevel(progress.town[s.char])]}` : ''}</small>
              </button>
            )
          })}
        </div>
        <h4>合體（{COMBOS.length}）</h4>
        <div className="st-gallery-grid">
          {COMBOS.map((c) => {
            const art = emojiArt(c.emoji)
            return (
              <button key={c.word} className="st-gallery-item" onClick={() => playCombo(c)} title={c.thanks}>
                {art ? <img src={art} alt="" /> : <span>{c.emoji}</span>}
                <b>{c.word}</b>
              </button>
            )
          })}
        </div>
      </div>
      {playing?.kind === 'spell' && (
        <Conjure key={playing.key} strokes={playing.strokes} emoji={emojiOf(playing.spell.char) || ''} act={playing.spell.act} from={from}
          char={playing.spell.char} sound={playing.spell.sound} power={power} onDone={() => setPlaying(null)} />
      )}
      {playing?.kind === 'combo' && (
        <Fuse key={playing.key} parts={playing.parts} combo={playing.combo}
          onDone={() => { voice.current = sayAll([playing.combo.thanks], 0.85); setPlaying(null) }} />
      )}
    </div>
  )
}
