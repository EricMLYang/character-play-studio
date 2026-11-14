import { test } from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// 自製道具圖（emoji: 'prop:<名字>'，public/props/<名字>.png）：圖、範圍表、設定要對得上；引擎照內容範圍算，一般 emoji 照舊

registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

const root = new URL('..', import.meta.url).pathname
const E = await import('../src/anim/clip.ts')
const { actorsAt, bodyBox, headY, fxAt, lifeOf, PROP_BOX } = E

function clipOf(extra = {}) {
  return {
    char: '測', duration: 10,
    bg: { top: '#fff', bottom: '#fff', floor: '#ccc' },
    actors: [],
    moves: [],
    builds: [{ at: 5, dur: 1, strokes: [0], from: { x: 80, y: 45 }, color: '#f00' }],
    cues: [],
    ...extra,
  }
}

test('道具圖、範圍表（src/anim/props.ts）、切圖設定三邊對得上', () => {
  const pngs = readdirSync(join(root, 'public/props')).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort()
  assert.deepEqual(Object.keys(PROP_BOX).sort(), pngs, '跑 npm run prop:cut 重新產生')
  const cfgDir = join(root, 'src/anim/props')
  const named = readdirSync(cfgDir).filter((f) => f.endsWith('.cut.json'))
    .flatMap((f) => JSON.parse(readFileSync(join(cfgDir, f), 'utf8')).props.filter(Boolean)).sort()
  assert.deepEqual(named, pngs)
  for (const f of readdirSync(cfgDir).filter((f) => f.endsWith('.cut.json'))) {
    const cfg = JSON.parse(readFileSync(join(cfgDir, f), 'utf8'))
    assert.ok(existsSync(join(root, 'assets/prop-sheets', cfg.file)), `道具表 ${cfg.file} 要放在 assets/prop-sheets/`)
  }
  for (const [name, [l, t, r, b]] of Object.entries(PROP_BOX)) {
    // 長邊撐滿（留 4%）、底部對齊
    assert.ok(Math.max(r - l, b - t) > 0.9, `${name} 的長邊要撐滿`)
    assert.ok(Math.abs(b - 0.96) < 0.01, `${name} 要底部對齊`)
  }
})

test('一般 emoji、主角的範圍照舊：中心 (x, y)、半邊 half × size × s 的正方形', () => {
  for (const emoji of ['🎁', 'hero:pig/idle', '🚈']) {
    const b = bodyBox({ emoji, x: 50, y: 60, size: 20, s: 1.5, sy: 0.7, flip: true }, 0.4)
    assert.deepEqual(b, { x0: 38, x1: 62, y0: 48, y1: 72 })
    assert.equal(headY({ emoji, y: 60, size: 20, s: 1.5, sy: 0.7 }), 60 - 20 * 0.45 * 1.5 * 0.7)
  }
})

test('prop: 照內容範圍：寬扁的捷運不是一個大正方形，底部踩在腳底線上', () => {
  const a = { emoji: 'prop:metro', x: 80, y: 77 - 0.42 * 100, size: 100, s: 1, sy: 1 }
  const b = bodyBox(a, 0.4)
  assert.ok(b.x1 - b.x0 > 3 * (b.y1 - b.y0), '寬是高的三倍以上')
  assert.ok(b.y0 > 45, '上緣在地板附近，不會擋到上方的國字')
  assert.ok(Math.abs(b.y1 - 77) < 3, '下緣在腳底線附近')
  // 頭上的效果從車頂冒出來，不是從正方形的頂端
  assert.ok(headY(a) > 50 && headY(a) < b.y0)
  const clip = clipOf({ actors: [{ id: 'train', ...a, size: 100 }], fx: [{ at: 1, kind: 'pop', actor: 'train', emoji: '❗', dur: 0.5 }] })
  const f = fxAt(clip, 1.2).find((x) => x.emoji === '❗')
  assert.ok(f && f.y > 40, `❗ 在車頂上（y=${f?.y}）`)
  // 翻面：左右範圍跟著翻
  const fl = bodyBox({ ...a, flip: true }, 0.4)
  assert.ok(Math.abs((fl.x0 - 80) + (b.x1 - 80)) < 1e-9)
})

test('prop: 是道具不是角色：走過去不踩步伐；捷運（metro）跟 🚈 一樣算車', () => {
  const walk = (emoji) => clipOf({
    actors: [{ id: 'x', emoji, x: 20, y: 66, size: 24 }],
    moves: [{ at: 1, dur: 1, actor: 'x', do: 'moveTo', to: { x: 80, y: 66 } }],
  })
  assert.equal(lifeOf(walk('prop:gift')).get('x').steps.length, 0)
  assert.ok(lifeOf(walk('hero:pig/idle')).get('x').steps.length > 0)
  // 捷運：跟 🚈 一樣的自動質感（不踩步伐、移動時歪、急停）
  const metro = lifeOf(walk('prop:metro')).get('x'), emoji = lifeOf(walk('🚈')).get('x')
  assert.deepEqual(metro, emoji)
  // 擺著不動的道具不會自己做小動作
  const still = clipOf({ actors: [{ id: 'x', emoji: 'prop:gift', x: 120, y: 62, size: 34 }] })
  assert.equal(lifeOf(still).get('x').beats.length, 0)
  assert.equal(actorsAt(still, 3).find((a) => a.id === 'x').x, 120)
})
