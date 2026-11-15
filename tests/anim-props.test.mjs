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
  // together 的一組（同一隻動物的幾個狀態）共用一個比例：組裡最大的那張撐滿就好
  const groups = readdirSync(cfgDir).filter((f) => f.endsWith('.cut.json'))
    .flatMap((f) => JSON.parse(readFileSync(join(cfgDir, f), 'utf8')).together ?? [])
  const long = (name) => { const [l, t, r, b] = PROP_BOX[name]; return Math.max(r - l, b - t) }
  for (const [name, [, , , b]] of Object.entries(PROP_BOX)) {
    // 長邊撐滿（留 4%）、底部對齊
    const group = groups.find((g) => g.includes(name)) ?? [name]
    assert.ok(Math.max(...group.map(long)) > 0.9, `${name} 的長邊要撐滿`)
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

test('prop: 的動物（熊、熊貓、青蛙、螃蟹、烏龜、猴子、山羊、蝴蝶、蜜蜂、毛毛蟲）跟 🐻🐼🐸🦀🐢🐒🐐🦋🐝🐛 一樣算角色；趴著睡、跳在半空、夾東西、縮殼、吊樹枝、站起來、在地上爬的不踩步伐', () => {
  const walk = (emoji) => clipOf({
    actors: [{ id: 'x', emoji, x: 20, y: 66, size: 24 }],
    moves: [{ at: 1, dur: 1, actor: 'x', do: 'moveTo', to: { x: 80, y: 66 } }],
  })
  for (const [name, emoji] of [['bear', '🐻'], ['bear-roar', '🐻'], ['panda', '🐼'], ['frog', '🐸'],
    ['crab', '🦀'], ['crab-walk', '🦀'], ['turtle', '🐢'], ['monkey', '🐒'],
    ['goat', '🐐'], ['goat-butt', '🐐'], ['butterfly', '🦋'], ['bee', '🐝'], ['bee-sting', '🐝'],
    ['turtle-old', '🐢'], ['rooster', '🐓'],
    ['panda-daze', '🐼'], ['panda-wave', '🐼'], ['rooster-sleep', '🐓'], ['beetle', '🪲'], ['frog-wink', '🐸'],
    ['elephant', '🐘'], ['elephant-spray', '🐘'], ['lion', '🦁'], ['lion-roar', '🦁'], ['swallow', '🐦']]) {
    assert.deepEqual(lifeOf(walk(`prop:${name}`)).get('x'), lifeOf(walk(emoji)).get('x'), name)
    assert.ok(lifeOf(walk(`prop:${name}`)).get('x').steps.length > 0, `${name} 走過去要踩步伐`)
  }
  // 跟 🐌 一樣：會歪、會做小動作，但不踩步伐
  for (const name of ['bear-sleep', 'frog-jump', 'crab-pinch', 'turtle-shell', 'monkey-hang', 'goat-rear', 'elephant-suck', 'elephant-laugh', 'lion-scared']) {
    assert.deepEqual(lifeOf(walk(`prop:${name}`)).get('x'), lifeOf(walk('🐌')).get('x'), name)
    assert.equal(lifeOf(walk(`prop:${name}`)).get('x').steps.length, 0)
  }
  // 站著不動的熊會做小動作（跟 🐻 一樣），一般道具不會
  const still = (emoji) => lifeOf(clipOf({ actors: [{ id: 'x', emoji, x: 120, y: 62, size: 34 }] })).get('x')
  assert.ok(still('prop:bear').beats.length > 0)
  assert.deepEqual(still('prop:bear'), still('🐻'))
  assert.equal(still('prop:honey').beats.length, 0)
  // 毛毛蟲跟 🐛 一樣：在地上爬、不踩步伐
  assert.deepEqual(lifeOf(walk('prop:caterpillar')).get('x'), lifeOf(walk('🐛')).get('x'))
  assert.equal(lifeOf(walk('prop:caterpillar')).get('x').steps.length, 0)
  // 蛹、荷葉是道具：不做小動作
  assert.equal(still('prop:chrysalis').beats.length, 0)
  assert.equal(still('prop:lilypad').beats.length, 0)
  // 腫包、羽毛、書、銅鑼、荷葉是道具：不做小動作
  for (const name of ['bump', 'feather', 'book-ajar', 'gong', 'lotus-leaf']) assert.equal(still(`prop:${name}`).beats.length, 0, name)
  // 唇印、紙箱、灌木叢是道具：不做小動作
  for (const name of ['kiss-mark', 'box', 'bush']) assert.equal(still(`prop:${name}`).beats.length, 0, name)
  // 大山、高瘦的樹、鉛筆、鉛筆頭、白煙、臭襪子、一堆雜物、沒有指針的鬧鐘是道具：不做小動作
  for (const name of ['mountain', 'tall-tree', 'pencil', 'pencil-stub', 'smoke', 'sock', 'junk-pile', 'alarm-face']) assert.equal(still(`prop:${name}`).beats.length, 0, name)
  // 蛇頭三張是道具：要跟著劇本畫的蛇身扭，不踩步伐、不做小動作；籃子、籃蓋、食物也是道具
  for (const name of ['snake-head', 'snake-sing', 'snake-flute', 'charm-basket', 'basket-lid', 'rice', 'bokchoy', 'egg', 'pancake']) assert.equal(still(`prop:${name}`).beats.length, 0, name)
  for (const name of ['snake-head', 'snake-sing', 'snake-flute']) assert.equal(lifeOf(walk(`prop:${name}`)).get('x').steps.length, 0, name)
  // 屋簷下的燕子窩是道具：不做小動作
  assert.equal(still('prop:swallow-nest').beats.length, 0)
  // 香蕉、雪球是道具：不做小動作
  assert.equal(still('prop:banana').beats.length, 0)
  assert.equal(still('prop:snowball').beats.length, 0)
})

test('prop: 的人（姑姑六張）跟 🧍 一樣算角色：走過去踩步伐、閒著換重心；彎腰嘟嘴要親的那張不踩步伐', () => {
  const walk = (emoji) => clipOf({
    actors: [{ id: 'x', emoji, x: 20, y: 66, size: 24 }],
    moves: [{ at: 1, dur: 1, actor: 'x', do: 'moveTo', to: { x: 80, y: 66 } }],
  })
  for (const name of ['aunt', 'aunt-run', 'aunt-cake', 'aunt-laugh', 'aunt-shock']) {
    assert.deepEqual(lifeOf(walk(`prop:${name}`)).get('x'), lifeOf(walk('🧍')).get('x'), name)
    assert.ok(lifeOf(walk(`prop:${name}`)).get('x').steps.length > 0, `${name} 走過去要踩步伐`)
  }
  assert.deepEqual(lifeOf(walk('prop:aunt-kiss')).get('x'), lifeOf(walk('🐌')).get('x'))
  assert.equal(lifeOf(walk('prop:aunt-kiss')).get('x').steps.length, 0)
  const still = (emoji) => lifeOf(clipOf({ actors: [{ id: 'x', emoji, x: 120, y: 62, size: 34 }] })).get('x')
  assert.ok(still('prop:aunt').beats.length > 0, '站著的姑姑會換重心')
  assert.deepEqual(still('prop:aunt'), still('🧍'))
})

test('stretchTo：壓成寬扁（寬 ×amount、高 ÷amount）、留下結果；消失後重新出場就回到原本的樣子', () => {
  const clip = clipOf({
    actors: [{ id: 'x', emoji: 'prop:snowball', x: 120, y: 66, size: 24 }],
    moves: [
      { at: 1, dur: 0.2, actor: 'x', do: 'stretchTo', amount: 1.5 },
      { at: 2, dur: 0.2, actor: 'x', do: 'vanish' },
      { at: 3, dur: 0.2, actor: 'x', do: 'pop' },
    ],
  })
  const at = (t) => actorsAt(clip, t).find((a) => a.id === 'x')
  assert.equal(at(0.5).sx, 1)
  assert.ok(Math.abs(at(1.5).sx - 1.5) < 1e-9)
  assert.ok(Math.abs(at(1.5).sy - 1 / 1.5) < 1e-9)
  assert.equal(at(3.5).sx, 1)
})

test('prop: stretchTo 拉細的道具擋字範圍跟著變窄（「爬」的樹幹）；拉寬的照舊不算變寬的部分', () => {
  const tree = { id: 'tree', emoji: 'prop:tree', x: 120, y: 77 - 0.42 * 100, size: 100 }
  const boxAt = (amount) => {
    const clip = clipOf({ actors: [tree], moves: [{ at: 0, dur: 0, actor: 'tree', do: 'stretchTo', amount }] })
    return bodyBox(actorsAt(clip, 1).find((a) => a.id === 'tree'), 0.4)
  }
  const plain = bodyBox(actorsAt(clipOf({ actors: [tree] }), 1)[0], 0.4)
  const thin = boxAt(0.5), wide = boxAt(1.5)
  assert.ok(Math.abs((thin.x1 - thin.x0) - (plain.x1 - plain.x0) / 2) < 1e-9)
  // 以 x 為中心往內縮
  assert.ok(Math.abs((thin.x0 - 120) - (plain.x0 - 120) / 2) < 1e-9)
  assert.equal(wide.x0, plain.x0)
  assert.equal(wide.x1, plain.x1)
  // 沒有 stretchTo 的角色沒有 sw 欄位
  assert.equal(actorsAt(clipOf({ actors: [tree] }), 1)[0].sw, undefined)
})
