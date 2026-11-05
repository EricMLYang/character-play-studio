import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerHooks } from 'node:module'

// 前端模組用不帶副檔名的相對路徑（給 Vite 用），Node 找不到時補上 .ts 再試
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const { SPELLS, ACTS, SPELL_FIXED, spellFor, spellLines } = await import('../shared/spells.mjs')
const { inkPath, inkCenter, ACT_SOUND, conjureTotal } = await import('../src/play/conjuring.ts')
const library = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8'))
const entries = new Map((library.characters || library).map((c) => [c.char, c]))
const has3d = new Set(fs.readdirSync(path.join(ROOT, 'public/emoji3d')).map((f) => f.replace(/\.png$/, '')))
const code = (e) => [...e.replace(/️/g, '')].map((c) => c.codePointAt(0).toString(16)).join('-')

test('會變身的字都在字庫裡、有筆順、有 3D 圖（變出來的是真的東西，不是一個字）', () => {
  for (const s of SPELLS) {
    const e = entries.get(s.char)
    assert.ok(e, `${s.char} 不在字庫`)
    assert.ok(fs.existsSync(path.join(ROOT, 'public/strokes', `${s.char}.json`)), `${s.char} 沒有筆順`)
    assert.ok(e.emoji && has3d.has(code(e.emoji)), `${s.char}（${e.emoji}）沒有 3D 圖`)
  }
})

test('筆畫數跟筆順檔一樣（挑字靠它）', () => {
  for (const s of SPELLS) {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/strokes', `${s.char}.json`), 'utf8'))
    assert.equal(s.n, data.strokes.length, s.char)
  }
})

test('每個字只出現一次、動作都有動畫、願望和謝謝都有話', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src/play/styles/conjure.css'), 'utf8')
  assert.equal(new Set(SPELLS.map((s) => s.char)).size, SPELLS.length)
  for (const s of SPELLS) {
    assert.ok(ACTS.includes(s.act), `${s.char} 的動作 ${s.act}`)
    assert.ok(s.wish.length >= 4 && s.thanks.length >= 3, s.char)
  }
  for (const a of ACTS) {
    assert.ok(css.includes(`.cj-act-${a}`), `${a} 沒有動畫`)
    assert.ok(ACT_SOUND[a], `${a} 沒有聲音`)
  }
  assert.equal(spellFor('魚').act, 'swim')
  assert.equal(spellFor('好'), undefined)
})

test('魔法筆說的每一句都會預先做音檔（伺服器那邊有接上）', () => {
  const lines = spellLines()
  for (const t of Object.values(SPELL_FIXED)) assert.ok(lines.includes(t))
  for (const s of SPELLS) assert.ok(lines.includes(s.wish) && lines.includes(s.thanks))
  assert.match(fs.readFileSync(path.join(ROOT, 'server/voice.mjs'), 'utf8'), /\.\.\.spellLines\(\)/)
})

test('他的筆跡畫成 SVG：點一下就過的那一筆也看得到；重心是所有點的平均', () => {
  assert.equal(inkPath([10, 20, 30, 40]), 'M10 20L30 40')
  assert.equal(inkPath([5, 6]), 'M5 6L5 6')
  assert.equal(inkPath([]), '')
  assert.deepEqual(inkCenter([[0, 0, 100, 100], [200, 200]]), { x: 100, y: 100 })
  assert.deepEqual(inkCenter([]), { x: 512, y: 388 })
  assert.ok(conjureTotal() > 3000 && conjureTotal() < 5000, '整段變身 3～5 秒')
})

const { writeLevel, pickWishes, WISHES_PER_ROUND } = await import('../src/play/wishes.ts')
const lib = [...entries.values()]
const fixed = () => 0.5

test('鷹架：沒寫過＝示範＋描；描過一次＝看一眼；描過兩次或遮起來寫過＝先看兩秒再自己寫', () => {
  assert.equal(writeLevel(undefined), 'trace')
  assert.equal(writeLevel({ traces: 0, first: '', last: '', strokes: [] }), 'trace')
  assert.equal(writeLevel({ traces: 1, first: '', last: '', strokes: [] }), 'look')
  assert.equal(writeLevel({ traces: 2, first: '', last: '', strokes: [] }), 'blind', '描兩次就升級，魔法筆裡才走得到遮起來寫')
  assert.equal(writeLevel({ traces: 3, blind: 1, first: '', last: '', strokes: [] }), 'blind')
})

test('挑願望：看過的字先、該複習的更先；一輪三個、動作不重複；他為了哪個字來就先出那個字', () => {
  const progress = { watched: { 魚: { count: 2 }, 火: { count: 1 }, 球: { count: 1 }, 蛇: { count: 1 } }, recall: { 蛇: { box: 1, due: '2026-11-01' } }, town: {} }
  const picked = pickWishes(lib, progress, { today: '2026-11-06', rand: fixed })
  assert.equal(picked.length, WISHES_PER_ROUND)
  assert.equal(picked[0].char, '蛇', '該複習的排第一')
  assert.ok(picked.every((w) => ['魚', '火', '球', '蛇'].includes(w.char)), '看過的字優先')
  assert.equal(new Set(picked.map((w) => w.act)).size, picked.length)
  assert.ok(picked.every((w) => w.emoji && w.level === 'trace'))
  assert.equal(pickWishes(lib, progress, { today: '2026-11-06', rand: fixed, want: '雨' })[0].char, '雨')
})

test('挑願望：全新的孩子（什麼都沒看過）也挑得出三個，不會空著', () => {
  const picked = pickWishes(lib, {}, { today: '2026-11-06' })
  assert.equal(picked.length, WISHES_PER_ROUND)
  assert.equal(new Set(picked.map((w) => w.char)).size, WISHES_PER_ROUND)
})

test('挑願望：第一次寫的字，筆畫少的先（都看過的話，火 4 筆比麵 20 筆先）', () => {
  const progress = { watched: { 火: { count: 1 }, 麵: { count: 1 } }, recall: {}, town: {} }
  const picked = pickWishes(lib, progress, { today: '2026-11-06', rand: fixed, n: 2 })
  assert.equal(picked[0].char, '火')
  // 很熟的字（遮起來寫過）筆畫多一點也還好
  const known = { watched: { 麵: { count: 3 }, 羊: { count: 1 } }, recall: {}, town: { 麵: { traces: 4, blind: 2, first: '', last: '', strokes: [] } } }
  assert.equal(pickWishes(lib, known, { today: '2026-11-06', rand: fixed, n: 1 })[0].char, '羊', '20 筆還是重，沒寫過的羊先')
})
