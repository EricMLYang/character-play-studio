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
const { NAMES, NAME_FIXED, nameById, nameChars, spellChars, askLine, nameLines, validName, isHan, partLine, partSpans, hasNewScene, NAME_SCENES_REDONE, collectedNames } = await import('../shared/names.mjs')
const { spellName } = await import('../shared/domain.mjs')
const { recordEvent } = await import('../shared/play-events.mjs')
const { wallOf, tilesFor, slotsOf, nextSlot, fits, litParts, DECOYS } = await import('../src/play/nameplay.ts')
const { ALIKE } = await import('../src/play/alike.ts')
const { nameSceneProblems, loadNameClip, sceneIds, nameArtOk } = await import('../scripts/names-check.mjs')
const { propSrc } = await import('../src/anim/clip.ts')

const characters = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8')).characters
const library = characters.filter((c) => !c.hidden)
const known = new Set(library.map((c) => c.char))
const at = '2026-11-14T02:00:00Z'
const today = '2026-11-14'
/**
 * 測試自己造的名字（不在 NAMES 裡）：名單會換（2026-11-24 拿掉 29 個有版權疑慮的），功能要照樣測，
 * 不靠哪一個名字剛好還在。用到的國字都在字庫裡。
 *   given   中間夾一個不是國字的全形字母（以前是哆啦Ａ夢）：Ａ 一開始就填好、不用拼
 *   twin    同一個字出現兩次：兩塊一樣的字，哪一塊填哪一格都可以
 */
const given = { id: 'given', text: '小紅Ａ帽', emoji: '👒', parts: [{ chars: '小紅Ａ', emoji: '🔴' }, { chars: '帽', word: '帽子', emoji: '👒' }] }
const twin = { id: 'twin', text: '汪汪', emoji: '🐶', parts: [{ chars: '汪汪', word: '汪汪叫', emoji: '📢' }] }
/** 固定的亂數：測試每次都一樣 */
const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

test('名字裡每一個國字都在孩子端的字庫裡（開放的）：他點的每一塊字都唸得出來、都有字卡', () => {
  for (const name of NAMES) {
    const missing = nameChars(name).filter((c) => !known.has(c))
    assert.deepEqual(missing, [], `「${name.text}」用了字庫沒有（或還沒開放）的字：${missing.join('')}`)
  }
})

test('名字：id 與名字都不重複、id 只有小寫字母、貼紙畫得出來（3D 圖或專門畫的 prop: 圖）', () => {
  assert.ok(NAMES.length > 0)
  assert.equal(new Set(NAMES.map((n) => n.id)).size, NAMES.length, 'id 重複')
  assert.equal(new Set(NAMES.map((n) => n.text)).size, NAMES.length, '名字重複')
  for (const name of NAMES) {
    assert.match(name.id, /^[a-z]+$/, name.id)
    assert.ok(name.emoji && name.text, name.id)
    assert.ok(nameArtOk(name.emoji), `${name.id} 的貼紙 ${name.emoji} 沒有圖（emoji 要有 3D 圖，prop: 要有 public/props/ 的圖）`)
    assert.equal(nameById(name.id), name)
  }
  assert.equal(nameById('nope'), undefined)
  assert.deepEqual(spellChars(given), ['小', '紅', '帽'], '不是國字的 Ａ 不用拼')
  assert.deepEqual(spellChars(twin), ['汪', '汪'], '重複的字照樣出現兩次')
  assert.deepEqual(nameChars(twin), ['汪'])
  assert.equal(isHan('Ａ'), false)
})

test('貼紙與 parts 的圖可以是專門畫的 prop:<名字>：要有 public/props/ 的圖；跟舞台用同一個網址', async () => {
  assert.equal(nameArtOk('🦖'), true)
  assert.equal(nameArtOk('prop:tiger'), true, 'public/props/tiger.png 在')
  assert.equal(nameArtOk('prop:no-such-picture'), false)
  assert.equal(nameArtOk('prop:'), false)
  assert.equal(nameArtOk(''), false)
  assert.equal(nameArtOk(undefined), false)
  assert.equal(propSrc('prop:tiger'), '/props/tiger.png', '孩子端（emojiArt）與舞台（AnimPlayer）都用 propSrc')
  assert.equal(propSrc('🐯'), '')
  assert.ok(fs.existsSync(path.join(ROOT, 'public', propSrc('prop:tiger'))))
  // 孩子端的小圖走 emojiArt：prop: 交給 propSrc（ui.tsx 有 JSX，Node 讀不進來，看原始碼）
  assert.match(fs.readFileSync(path.join(ROOT, 'src/play/ui.tsx'), 'utf8'), /startsWith\(PROP_PREFIX\)\) return propSrc\(emoji\)/)
  // 名字的檢查照樣過：拿一支現成的動畫，把貼紙與 parts 換成 prop: 圖
  const dino = nameById('dino')
  const clip = await loadNameClip('dino')
  const art = { ...dino, emoji: 'prop:tiger', parts: dino.parts.map((p) => ({ ...p, emoji: 'prop:tiger' })) }
  assert.deepEqual((await nameSceneProblems(art, clip)).errors, [])
  const missing = { ...dino, emoji: 'prop:no-such-picture', parts: dino.parts.map((p) => ({ ...p, emoji: 'prop:no-such-picture' })) }
  const { errors } = await nameSceneProblems(missing, clip)
  assert.ok(errors.some((e) => e.includes('貼紙')), '貼紙沒有圖要擋')
  assert.ok(errors.some((e) => e.includes('parts')), 'parts 的圖沒有要擋')
})

test('有動畫的名字：剛好唸一句、一字不差就是名字，長度 7～12 秒、檔頭寫了字面意思（規則在 scripts/names-check.mjs）', async () => {
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

test('要唸的句子都會先做成音檔：固定句、名字、「把他的名字拼出來」、每一段拼好時唸的話', () => {
  const lines = new Set(nameLines())
  for (const text of Object.values(NAME_FIXED)) assert.ok(lines.has(text))
  for (const name of NAMES) {
    assert.ok(lines.has(name.text))
    assert.ok(lines.has(askLine(name)))
    for (const part of name.parts) { const line = partLine(part); if (line) assert.ok(lines.has(line), `${name.text}：「${line}」沒有進 nameLines`) }
  }
  assert.equal(NAME_FIXED.nameNewScene, '有新的動畫喔！')
  assert.equal(askLine({ text: '孫悟空' }), '孫悟空！把他的名字拼出來！')
  assert.match(fs.readFileSync(path.join(ROOT, 'server/voice.mjs'), 'utf8'), /\.\.\.nameLines\(\)/)
})

test('字塊（預設）：只有名字裡的字打散，沒有干擾字（2026-11-18 爸爸說先不要這麼難），也不能剛好照順序排', () => {
  assert.equal(DECOYS, 0)
  for (const name of NAMES) {
    for (let seed = 1; seed < 30; seed++) {
      const tiles = tilesFor(name, library, undefined, seeded(seed))
      assert.equal(tiles.filter((t) => t.decoy).length, 0, `${name.text} 不該有干擾字`)
      assert.deepEqual(tiles.map((t) => t.char).sort(), [...spellChars(name)].sort(), `${name.text} 的字塊要剛好是名字裡的字`)
      assert.equal(new Set(tiles.map((t) => t.key)).size, tiles.length, '每一塊 key 不一樣')
      if (spellChars(name).length > 1) assert.notEqual(tiles.map((t) => t.char).join(''), spellChars(name).join(''), `${name.text} 的字塊不能剛好照順序排`)
    }
  }
  // 兩個字的名字只剩一種不照順序的排法：一定是反過來的（不管亂數怎麼抽）
  const pairs = NAMES.filter((n) => spellChars(n).length === 2 && new Set(spellChars(n)).size === 2)
  assert.ok(pairs.length > 0, '名單上要有兩個字的名字（恐龍、花生⋯）')
  for (const name of pairs) {
    for (const rand of [seeded(7), () => 0, () => 0.999999, () => 0.5]) {
      assert.equal(tilesFor(name, library, undefined, rand).map((t) => t.char).join(''), [...spellChars(name)].reverse().join(''), name.text)
    }
  }
})

test('字塊（decoys=2，之後想加回來時）：名字裡的字打散（同一個字出現兩次就有兩塊），加兩個干擾字，干擾字不是名字裡的字', () => {
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
  // 同一個字出現兩次（twin、毛毛蟲、拉布拉多）：兩塊一樣的字
  const twice = NAMES.filter((n) => spellChars(n).length > nameChars(n).length)
  assert.ok(twice.length > 0, '名單上要有同一個字出現兩次的名字（毛毛蟲⋯）')
  for (const name of [twin, ...twice]) {
    const tiles = tilesFor(name, library, 2, seeded(3))
    const dup = spellChars(name).find((c, k, all) => all.indexOf(c) !== k)
    assert.equal(tiles.filter((t) => t.char === dup).length, 2, `${name.text} 要有兩塊「${dup}」`)
  }
})

test('干擾字優先挑長得像的字（alike.ts）', () => {
  const name = twin // 汪：跟 沒沙河海…長得像
  const alikeOf = (c) => [...ALIKE].filter((k) => k.includes('汪')).map((k) => k.replace('汪', '')).includes(c)
  for (let seed = 1; seed < 20; seed++) {
    const decoys = tilesFor(name, library, 2, seeded(seed)).filter((t) => t.decoy)
    assert.ok(decoys.every((d) => alikeOf(d.char)), `汪汪的干擾字應該都是長得像「汪」的字：${decoys.map((d) => d.char).join('')}`)
  }
})

test('圖位亮起來：一段裡要拼的格子都填好了才亮（不是國字的 Ａ 不用等）', () => {
  const spans = partSpans(given) // 小紅Ａ｜帽
  assert.deepEqual(spans.map((s) => [s.from, s.to, s.last]), [[0, 3, 1], [3, 4, 3]])
  const slots = slotsOf(given)
  assert.deepEqual(litParts(spans, slots.map((s) => s.given)), [false, false])
  assert.deepEqual(litParts(spans, [true, false, true, false]), [false, false], '小紅還差紅')
  assert.deepEqual(litParts(spans, [true, true, true, false]), [true, false], '紅放進去，第一段的圖就跳出來')
  assert.deepEqual(litParts(spans, [true, true, true, true]), [true, true])
  const each = partSpans({ text: '大野狼', parts: [{ chars: '大' }, { chars: '野' }, { chars: '狼' }] }) // 一個字一段
  assert.deepEqual(each.map((s) => s.last), [0, 1, 2])
  const labrador = partSpans(nameById('labrador')) // 拉｜布｜拉｜多｜警長
  assert.deepEqual(labrador.map((s) => [s.from, s.to, s.last]), [[0, 1, 0], [1, 2, 1], [2, 3, 2], [3, 4, 3], [4, 6, 5]])
  assert.deepEqual(litParts(labrador, [true, true, true, true, true, false]), [true, true, true, true, false], '警長要兩個字都放進去')
})

test('格子：不是國字的（Ａ）一開始就填好；照順序點，同樣的字哪一塊都可以', () => {
  const slots = slotsOf(given) // 小紅Ａ帽
  assert.deepEqual(slots.map((s) => s.given), [false, false, true, false])
  let filled = slots.map((s) => s.given)
  const tile = (char) => ({ key: char, char, decoy: false })
  assert.equal(fits(slots, filled, tile('紅')), false, '要先拼小')
  assert.equal(fits(slots, filled, tile('小')), true)
  filled[0] = true
  filled[1] = true
  assert.equal(nextSlot(slots, filled), 3, '跳過 Ａ')
  filled[3] = true
  assert.equal(nextSlot(slots, filled), -1, '都填好了')

  const s2 = slotsOf(twin)
  const f2 = s2.map((s) => s.given)
  assert.equal(fits(s2, f2, { key: 'n1', char: '汪', decoy: false }), true, '第二塊汪也可以填第一格')
})

test('牆：只放有動畫、而且字都在字庫的名字；看過的字多的排前面；沒看過的字標出來', () => {
  // 用名單上留下來的三個：恐龍（看過兩個字）、花生（看過花）、大野狼（都沒看過），名單上的順序是 花生、大野狼、恐龍
  const has = (id) => ['peanut', 'wolf', 'dino'].includes(id)
  const watched = Object.fromEntries([...'恐龍花'].map((c) => [c, { count: 1, last: at }]))
  const wall = wallOf(library, { watched }, has)
  assert.deepEqual(wall.map((c) => c.name.id), ['dino', 'peanut', 'wolf'])
  assert.deepEqual(wall[0].fresh, [])
  assert.deepEqual(wall[1].fresh, ['生'])
  assert.equal(wall[2].seen, 0)
  // 家長把名字裡的字收起來：那張先不出現
  assert.ok(!wallOf(library.filter((c) => c.char !== '龍'), { watched }, has).some((c) => c.name.id === 'dino'))
  // 拼過幾次
  assert.equal(wallOf(library, { watched, names: { peanut: { first: at, last: at, count: 2 } } }, has).find((c) => c.name.id === 'peanut').count, 2)
  // 紀錄裡有名單上拿掉的名字（他拼過皮卡丘）：牆照名單排，不出現、不當掉
  const old = wallOf(library, { watched, names: { pika: { first: at, last: at, count: 3 }, dino: { first: at, last: at, count: 1 } } }, () => true)
  assert.ok(!old.some((c) => c.name.id === 'pika'))
  assert.equal(old.find((c) => c.name.id === 'dino').count, 1)
})

test('收了幾張主角貼紙：只算名單上還有的（紀錄裡有 2026-11-24 拿掉的名字），首頁入口與「我的東西」都用它', () => {
  assert.deepEqual(collectedNames(undefined), [])
  assert.deepEqual(collectedNames({}), [])
  assert.deepEqual(collectedNames({ names: {} }), [])
  const progress = { names: {
    anpan: { first: at, last: at, count: 4 }, totoro: { first: at, last: at, count: 1 }, // 拿掉的
    dino: { first: at, last: at, count: 2 }, wolf: { first: at, last: at, count: 1 },
    robot: { count: 0 }, // 沒拼完過的不算
  } }
  assert.deepEqual(collectedNames(progress), NAMES.map((n) => n.id).filter((id) => ['dino', 'wolf'].includes(id)), '照名單的順序')
  // 拼一次名單上的名字就多一張（拿掉的名字伺服器不收，下面「伺服器只收真的有的名字」那一條）
  assert.equal(collectedNames(spellName(progress, 'monster', at)).length, 3)
  // 兩個顯示張數的地方不能直接數 progress.names（會把拿掉的也算進去）
  for (const file of ['src/play/Mine.tsx', 'src/play/games.tsx']) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8')
    assert.doesNotMatch(src, /Object\.(keys|values|entries)\(\s*\w+\.names\b/, `${file} 直接數 progress.names`)
    assert.match(src, /collectedNames\(/, `${file} 要用 collectedNames`)
  }
})

test('主角紀錄：拼完一次加一，第一次的時間留著；離線補送的舊紀錄不蓋掉最後一次', () => {
  let p = spellName({ watched: {} }, 'dino', at)
  p = spellName(p, 'dino', '2026-11-14T03:00:00Z')
  assert.deepEqual(p.names.dino, { first: at, last: '2026-11-14T03:00:00Z', count: 2 })
  p = spellName(p, 'dino', '2026-11-14T01:00:00Z')
  assert.deepEqual(p.names.dino, { first: '2026-11-14T01:00:00Z', last: '2026-11-14T03:00:00Z', count: 3 })
})

test('伺服器只收真的有的名字、而且是拼完的；名字的 id 不是字，不查字庫', () => {
  const now = Date.parse(at) + 1000
  const send = (event) => recordEvent({ watched: {} }, 'name', { id: 'name-event-1', at, ...event }, () => false, today, now)
  const ok = send({ char: 'dino', done: true })
  assert.equal(ok.added, true)
  assert.equal(ok.progress.names.dino.count, 1)
  assert.ok(send({ char: 'nope', done: true }).error, '沒有這個名字')
  assert.ok(send({ char: 'pika', done: true }).error, '名單上拿掉的名字（離線補送的舊紀錄）不收')
  assert.ok(send({ char: 'dino' }).error, '要是拼完的')
  assert.ok(send({ char: 'dino', done: false }).error)
  assert.equal(validName({ char: 'wolf', done: true }), true)
  assert.equal(validName({ char: 'pika', done: true }), false)
})

test('每個名字都有 parts：接起來剛好是名字、每段一個畫得出來的圖（3D 圖或 prop:）、word 包含那幾個國字', () => {
  for (const name of NAMES) {
    assert.ok(Array.isArray(name.parts) && name.parts.length > 0, `${name.text} 沒有 parts`)
    assert.equal(name.parts.map((p) => p.chars).join(''), name.text, `${name.text} 的 parts 接起來不是名字`)
    for (const part of name.parts) {
      assert.ok(part.chars && [...part.chars].some(isHan), `${name.text}：每一段至少要有一個要拼的國字（「${part.chars}」）`)
      assert.ok(part.emoji, `${name.text}「${part.chars}」沒有 emoji`)
      assert.ok(nameArtOk(part.emoji), `${name.text}「${part.chars}」的 ${part.emoji} 沒有圖`)
      const han = [...part.chars].filter(isHan).join('')
      if (part.word !== undefined) {
        assert.ok(part.word.includes(han), `${name.text}：word「${part.word}」要包含「${han}」`)
        assert.notEqual(part.word, han, `${name.text}：word 跟 chars 一樣就不用寫（「${han}」）`)
      }
    }
  }
})

test('一段拼好時唸的話：有 word 唸「花朵的花」、沒有 word 兩個字以上唸那個詞、一個字不再唸；Ａ 不唸', () => {
  assert.equal(partLine({ chars: '皮', word: '皮球', emoji: '🏀' }), '皮球的皮')
  assert.equal(partLine({ chars: '蘋果', emoji: '🍎' }), '蘋果')
  assert.equal(partLine({ chars: '龍', emoji: '🐉' }), null)
  assert.equal(partLine({ chars: '小紅Ａ', emoji: '🔴' }), '小紅')
  assert.deepEqual(given.parts.map(partLine), ['小紅', '帽子的帽'])
  assert.deepEqual(twin.parts.map(partLine), ['汪汪叫的汪汪'])
})

test('🆕 新動畫：拼過、最後一次看在 2026-11-23 重做之前的才算；看完 last 更新就不算', () => {
  assert.equal(NAME_SCENES_REDONE, '2026-11-23')
  assert.equal(hasNewScene(undefined), false, '沒拼過')
  assert.equal(hasNewScene({ count: 0 }), false)
  assert.equal(hasNewScene({ first: '2026-11-14T12:55:28.791Z', last: '2026-11-14T12:55:28.791Z', count: 1 }), true)
  assert.equal(hasNewScene({ first: '2026-11-22T23:59:59.000Z', last: '2026-11-22T23:59:59.000Z', count: 2 }), true)
  assert.equal(hasNewScene({ first: '2026-11-14T00:00:00.000Z', last: '2026-11-23T12:43:45.646Z', count: 2 }), false, '重做之後看過了')
  assert.equal(hasNewScene({ count: 1 }), false, '沒有時間的不亂標')
  // 看完記一筆（spellName 更新 last），🆕 就消失
  const old = { watched: {}, names: { robot: { first: '2026-11-14T12:55:28.791Z', last: '2026-11-14T12:55:28.791Z', count: 1 } } }
  const has = (id) => ['robot', 'dino'].includes(id)
  assert.equal(wallOf(library, old, has).find((c) => c.name.id === 'robot').redo, true)
  assert.equal(wallOf(library, old, has).find((c) => c.name.id === 'dino').redo, false, '沒拼過的不標')
  const after = spellName(old, 'robot', '2026-11-24T10:00:00.000Z')
  assert.equal(wallOf(library, after, has).find((c) => c.name.id === 'robot').redo, false)
})
