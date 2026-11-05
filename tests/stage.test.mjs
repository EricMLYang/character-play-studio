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
const { SCENES, sceneFor, skyAt, parallax, emojiCode } = await import('../src/play/stageScenes.ts')
const { POSES, poseFor, REACT_MS } = await import('../src/play/poses.ts')

test('天色照時間：早上、白天、傍晚、晚上，跨午夜也對', () => {
  assert.equal(skyAt(6), 'dawn')
  assert.equal(skyAt(9), 'day')
  assert.equal(skyAt(15), 'day')
  assert.equal(skyAt(17), 'dusk')
  assert.equal(skyAt(20), 'night')
  assert.equal(skyAt(0), 'night')
  assert.equal(skyAt(4), 'night')
  assert.equal(skyAt(24 + 9), 'day')
  assert.equal(skyAt(-1), 'night')
})

test('景的道具都有 3D 圖（沒有新圖檔要畫），而且不擋畫面中間', () => {
  const have = new Set(fs.readdirSync(path.join(ROOT, 'public/emoji3d')).map((f) => f.replace(/\.png$/, '')))
  for (const scene of Object.values(SCENES)) {
    for (const p of scene.props) {
      assert.ok(have.has(emojiCode(p.emoji)), `${scene.id} 的 ${p.emoji} 沒有 3D 圖`)
      assert.ok(p.x < 22 || p.x > 78, `${scene.id} 的 ${p.emoji} 站在畫面中間（x=${p.x}），會搶字的注意力`)
    }
    for (const f of scene.flyers) assert.ok(have.has(emojiCode(f)), `${scene.id} 飛過去的 ${f} 沒有 3D 圖`)
  }
})

test('每個遊戲畫面都有景，沒列到的退回草地', () => {
  for (const id of ['home', 'feed', 'roots', 'book', 'puzzle', 'town', 'train']) assert.equal(sceneFor(id).id, id)
  assert.equal(sceneFor('mine').id, 'meadow')
})

test('視差：手指在正中間不動，在邊上是 ±1，超出去也不會更多', () => {
  assert.deepEqual(parallax(500, 400, 1000, 800), { px: 0, py: 0 })
  assert.deepEqual(parallax(0, 0, 1000, 800), { px: -1, py: -1 })
  assert.deepEqual(parallax(1000, 800, 1000, 800), { px: 1, py: 1 })
  assert.deepEqual(parallax(5000, -10, 1000, 800), { px: 1, py: -1 })
  assert.deepEqual(parallax(10, 10, 0, 0), { px: 0, py: 0 })
})

test('角色的姿勢表跟 public/hero 的資料夾一模一樣', () => {
  const dir = path.join(ROOT, 'public/hero')
  const heroes = fs.readdirSync(dir).filter((h) => fs.statSync(path.join(dir, h)).isDirectory()).sort()
  assert.deepEqual(Object.keys(POSES).sort(), heroes)
  for (const h of heroes) {
    const files = fs.readdirSync(path.join(dir, h)).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')).sort()
    assert.deepEqual([...POSES[h]].sort(), files, `${h} 的姿勢不對`)
  }
})

test('反應換姿勢：有那張就用，沒有就退回 idle，不會指到不存在的圖', () => {
  assert.equal(poseFor('yang', 'cheer'), 'happy')
  assert.equal(poseFor('yang', 'think'), 'think')
  assert.equal(poseFor('pig', 'think'), 'think')
  assert.equal(poseFor('mouse', 'think'), 'idle')
  assert.equal(poseFor('monster', 'oops'), 'surprised')
  assert.equal(poseFor('monster', 'sleep'), 'sleep')
  assert.equal(poseFor('yang', null, 'happy'), 'happy')
  assert.equal(poseFor('yang', null, 'nope'), 'idle')
  assert.equal(poseFor('nobody', 'cheer'), 'idle')
  for (const [hero, poses] of Object.entries(POSES)) {
    for (const r of Object.keys(REACT_MS)) assert.ok(poses.includes(poseFor(hero, r)), `${hero} 的 ${r}`)
  }
})

test('舞台、角色、部首特效的 @keyframes 名字不能跟別的檔撞名（後面的檔會悄悄蓋掉前面的）', () => {
  const dir = path.join(ROOT, 'src/play/styles')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css'))
  const names = new Map()
  for (const f of files) {
    for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/@keyframes\s+([\w-]+)/g)) {
      names.set(m[1], [...(names.get(m[1]) || []), f])
    }
  }
  for (const own of ['stage.css', 'buddy.css', 'radicalfx.css', 'conjure.css', 'spell.css', 'world.css']) {
    for (const [name, where] of names) {
      if (where.includes(own)) assert.equal(where.length, 1, `@keyframes ${name} 同時在 ${where.join('、')}`)
    }
  }
})

test('舞台、角色、部首特效的 class 名字不能跟別的檔撞名（以前背景叫 .stage，跟描字格子同名、pointer-events: none 讓他寫不了字）', () => {
  const dir = path.join(ROOT, 'src/play/styles')
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css'))
  const classes = (f) => {
    const css = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    return new Set([...css.matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)].map((m) => m[1]))
  }
  const all = Object.fromEntries(files.map((f) => [f, classes(f)]))
  // 別的檔拿這幾個來排版（.play 是最外層；餵大怪獸、魔法筆把舞台壓到底；小書的夥伴站在舞台上）是故意的
  // 魔法筆把描字元件（strokes、stroke-*，viewer.css 的）放大、在寫完時收掉按鈕，也是故意的
  const ok = new Set(['play', 'scenery@feed.css', 'scenery@spell.css', 'scenery@stage.css', 'rig-body@book.css', 'world@spell.css', 'world@world.css',
    'strokes', 'stroke-canvas', 'stroke-actions', 'stroke-dots'])
  for (const own of ['stage.css', 'buddy.css', 'radicalfx.css', 'conjure.css', 'spell.css', 'world.css']) {
    for (const c of all[own]) {
      const clash = files.filter((f) => f !== own && all[f].has(c) && !ok.has(c) && !ok.has(`${c}@${f}`))
      assert.deepEqual(clash, [], `.${c}（${own}）也出現在 ${clash.join('、')}`)
    }
  }
})
