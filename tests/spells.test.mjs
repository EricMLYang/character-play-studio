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
