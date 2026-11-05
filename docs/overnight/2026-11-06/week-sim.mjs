// 模擬他每天玩一輪魔法筆、玩兩週：看鷹架和間隔複習實際怎麼走（第二夜第 55 輪用它抓到「新字進不來」）。
// 用法：node docs/overnight/2026-11-06/week-sim.mjs "$PWD" [遮起來寫成功率] [聽寫成功率]
// 只讀主 repo 的 data/progress.json（唯讀，不會寫回去）。
import { registerHooks } from 'node:module'
import fs from 'node:fs'
registerHooks({ resolve(s, c, n) { try { return n(s, c) } catch (e) { if (s.startsWith('.') && !/\.\w+$/.test(s)) return n(`${s}.ts`, c); throw e } } })
const root = process.argv[2]
const { pickRound, writeLevel } = await import(root + '/src/play/wishes.ts')
const { addTrace, fuseWord } = await import(root + '/shared/domain.mjs')
const lib = JSON.parse(fs.readFileSync(root + '/data/characters.json', 'utf8'))
let progress = JSON.parse(fs.readFileSync('/Users/ericmlyang/Coding/character-play-studio/data/progress.json', 'utf8'))
// 假設：遮起來寫（🙈）他 70% 寫得出來不偷看、聽寫（🧙）60%；一天玩一輪（三個字）
const okBlind = Number(process.argv[3] ?? 0.7), okMemory = Number(process.argv[4] ?? 0.6)
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
for (let d = 6; d <= 19; d++) {
  const day = `2026-11-${String(d).padStart(2, '0')}`
  const round = pickRound(lib.characters || lib, progress, { today: day, rand: rnd })
  const line = []
  for (const w of round.wishes) {
    const lvl = writeLevel(progress.town?.[w.char])
    const blind = lvl === 'blind' ? rnd() < okBlind : lvl === 'memory' ? rnd() < okMemory : false
    progress = addTrace(progress, w.char, [[0, 0, 1, 1]], `${day}T04:00:00Z`, blind)
    line.push(`${w.char}${{ trace: '✏️', look: '👀', blind: '🙈', memory: '🧙' }[lvl]}${blind ? '✓' : ''}`)
  }
  if (round.combo) progress = fuseWord(progress, round.combo.word, `${day}T04:10:00Z`)
  const levels = { look: 0, blind: 0, memory: 0 }
  for (const r of Object.values(progress.town)) { const l = writeLevel(r); if (l in levels) levels[l]++ }
  console.log(day, line.join(' '), round.combo ? `→ ${round.combo.word}` : '', `| 👀${levels.look} 🙈${levels.blind} 🧙${levels.memory}`)
}
