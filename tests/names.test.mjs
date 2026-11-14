import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
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

const ROOT = path.resolve(import.meta.dirname, '..')
const { NAMES, NAME_FIXED, nameById, nameChars, spellChars, askLine, nameLines, validName, isHan } = await import('../shared/names.mjs')
const { spellName } = await import('../shared/domain.mjs')
const { recordEvent } = await import('../shared/play-events.mjs')
const { wallOf, tilesFor, slotsOf, nextSlot, fits } = await import('../src/play/nameplay.ts')
const { ALIKE } = await import('../src/play/alike.ts')
const { nameSceneProblems, loadNameClip, sceneIds } = await import('../scripts/names-check.mjs')

const characters = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8')).characters
const library = characters.filter((c) => !c.hidden)
const known = new Set(library.map((c) => c.char))
const at = '2026-11-14T02:00:00Z'
const today = '2026-11-14'
/** 固定的亂數：測試每次都一樣 */
const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

test('名字裡每一個國字都在孩子端的字庫裡（開放的）：他點的每一塊字都唸得出來、都有字卡', () => {
  for (const name of NAMES) {
    const missing = nameChars(name).filter((c) => !known.has(c))
    assert.deepEqual(missing, [], `「${name.text}」用了字庫沒有（或還沒開放）的字：${missing.join('')}`)
  }
})

test('名字：id 不重複、44 個都建好、貼紙有 3D 圖', () => {
  assert.equal(NAMES.length, 44)
  assert.equal(new Set(NAMES.map((n) => n.id)).size, NAMES.length, 'id 重複')
  assert.equal(new Set(NAMES.map((n) => n.text)).size, NAMES.length, '名字重複')
  for (const name of NAMES) {
    assert.match(name.id, /^[a-z]+$/, name.id)
    assert.ok(name.emoji && name.text, name.id)
    const code = [...name.emoji.replace(/️/g, '')].map((c) => c.codePointAt(0).toString(16)).join('-')
    assert.ok(fs.existsSync(path.join(ROOT, 'public/emoji3d', `${code}.png`)), `${name.id} 的貼紙 ${name.emoji} 沒有 3D 圖`)
  }
  assert.equal(nameById('pika').text, '皮卡丘')
  assert.deepEqual(spellChars(nameById('dora')), ['哆', '啦', '夢'], '不是國字的 Ａ 不用拼')
  assert.equal(isHan('Ａ'), false)
})

test('有動畫的名字：剛好唸一句、一字不差就是名字，長度 7～10 秒、檔頭寫了字面意思（規則在 scripts/names-check.mjs）', async () => {
  const ids = sceneIds()
  assert.deepEqual(ids.filter((id) => !nameById(id)), [], '有動畫檔對不到名字')
  assert.ok(ids.length >= 6, '至少有 6 支範本')
  for (const id of ids) {
    const name = nameById(id)
    const clip = await loadNameClip(id)
    const { errors } = await nameSceneProblems(name, clip)
    assert.deepEqual(errors, [], id)
    assert.deepEqual(clip.cues.filter((c) => 'say' in c).map((c) => c.say), [name.text])
  }
})

test('要唸的句子都會先做成音檔：固定句、名字、「把他的名字拼出來」', () => {
  const lines = new Set(nameLines())
  for (const text of Object.values(NAME_FIXED)) assert.ok(lines.has(text))
  for (const name of NAMES) { assert.ok(lines.has(name.text)); assert.ok(lines.has(askLine(name))) }
  assert.equal(askLine(nameById('bread')), '麵包小偷！把他的名字拼出來！')
  assert.match(fs.readFileSync(path.join(ROOT, 'server/voice.mjs'), 'utf8'), /\.\.\.nameLines\(\)/)
})

test('字塊：名字裡的字打散（同一個字出現兩次就有兩塊），加兩個干擾字，干擾字不是名字裡的字', () => {
  for (const name of NAMES) {
    for (let seed = 1; seed < 30; seed++) {
      const tiles = tilesFor(name, library, 2, seeded(seed))
      const own = tiles.filter((t) => !t.decoy).map((t) => t.char)
      assert.deepEqual([...own].sort(), [...spellChars(name)].sort(), `${name.text} 的字塊要剛好是名字裡的字`)
      const decoys = tiles.filter((t) => t.decoy)
      assert.equal(decoys.length, 2)
      for (const d of decoys) {
        assert.ok(!name.text.includes(d.char), `${name.text} 的干擾字「${d.char}」是名字裡的字`)
        assert.ok(known.has(d.char), '干擾字要在字庫裡（點錯了才唸得出來）')
      }
      assert.equal(new Set(tiles.map((t) => t.key)).size, tiles.length, '每一塊 key 不一樣')
      assert.notEqual(own.join(''), spellChars(name).join(''), `${name.text} 的字塊不能剛好照順序排`)
    }
  }
  // 屁屁、汪汪、毛毛：兩塊一樣的字
  for (const id of ['butt', 'woof', 'caterpillar']) {
    const name = nameById(id)
    const tiles = tilesFor(name, library, 2, seeded(3))
    assert.equal(tiles.filter((t) => t.char === spellChars(name)[0]).length, 2, `${name.text} 要有兩塊「${spellChars(name)[0]}」`)
  }
})

test('干擾字優先挑長得像的字（alike.ts）', () => {
  const name = nameById('woof') // 汪汪隊：汪 跟 沒沙河海…長得像
  const alikeOf = (c) => [...ALIKE].filter((k) => k.includes('汪')).map((k) => k.replace('汪', '')).includes(c)
  for (let seed = 1; seed < 20; seed++) {
    const decoys = tilesFor(name, library, 2, seeded(seed)).filter((t) => t.decoy)
    assert.ok(decoys.every((d) => alikeOf(d.char)), `汪汪隊的干擾字應該都是長得像「汪」的字：${decoys.map((d) => d.char).join('')}`)
  }
})

test('格子：不是國字的（Ａ）一開始就填好；照順序點，同樣的字哪一塊都可以', () => {
  const dora = nameById('dora')
  const slots = slotsOf(dora)
  assert.deepEqual(slots.map((s) => s.given), [false, false, true, false])
  let filled = slots.map((s) => s.given)
  const tile = (char) => ({ key: char, char, decoy: false })
  assert.equal(fits(slots, filled, tile('啦')), false, '要先拼哆')
  assert.equal(fits(slots, filled, tile('哆')), true)
  filled[0] = true
  filled[1] = true
  assert.equal(nextSlot(slots, filled), 3, '跳過 Ａ')
  filled[3] = true
  assert.equal(nextSlot(slots, filled), -1, '都填好了')

  const butt = nameById('butt')
  const s2 = slotsOf(butt)
  const f2 = s2.map((s) => s.given)
  assert.equal(fits(s2, f2, { key: 'n1', char: '屁', decoy: false }), true, '第二塊屁也可以填第一格')
})

test('牆：只放有動畫、而且字都在字庫的名字；看過的字多的排前面；沒看過的字標出來', () => {
  const has = (id) => ['bread', 'pika', 'dino'].includes(id)
  const watched = Object.fromEntries([...'恐龍皮'].map((c) => [c, { count: 1, last: at }]))
  const wall = wallOf(library, { watched }, has)
  assert.deepEqual(wall.map((c) => c.name.id), ['dino', 'pika', 'bread'])
  assert.deepEqual(wall[0].fresh, [])
  assert.deepEqual(wall[1].fresh, ['卡', '丘'])
  assert.equal(wall[2].seen, 0)
  // 家長把名字裡的字收起來：那張先不出現
  assert.ok(!wallOf(library.filter((c) => c.char !== '龍'), { watched }, has).some((c) => c.name.id === 'dino'))
  // 拼過幾次
  assert.equal(wallOf(library, { watched, names: { pika: { first: at, last: at, count: 2 } } }, has).find((c) => c.name.id === 'pika').count, 2)
})

test('主角紀錄：拼完一次加一，第一次的時間留著；離線補送的舊紀錄不蓋掉最後一次', () => {
  let p = spellName({ watched: {} }, 'pika', at)
  p = spellName(p, 'pika', '2026-11-14T03:00:00Z')
  assert.deepEqual(p.names.pika, { first: at, last: '2026-11-14T03:00:00Z', count: 2 })
  p = spellName(p, 'pika', '2026-11-14T01:00:00Z')
  assert.deepEqual(p.names.pika, { first: '2026-11-14T01:00:00Z', last: '2026-11-14T03:00:00Z', count: 3 })
})

test('伺服器只收真的有的名字、而且是拼完的；名字的 id 不是字，不查字庫', () => {
  const now = Date.parse(at) + 1000
  const send = (event) => recordEvent({ watched: {} }, 'name', { id: 'name-event-1', at, ...event }, () => false, today, now)
  const ok = send({ char: 'pika', done: true })
  assert.equal(ok.added, true)
  assert.equal(ok.progress.names.pika.count, 1)
  assert.ok(send({ char: 'nope', done: true }).error, '沒有這個名字')
  assert.ok(send({ char: 'pika' }).error, '要是拼完的')
  assert.ok(send({ char: 'pika', done: false }).error)
  assert.equal(validName({ char: 'dora', done: true }), true)
})
