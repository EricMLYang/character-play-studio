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
const { SPELLS, ACTS, SPELL_FIXED, COMBOS, comboOf, spellFor, spellLines } = await import('../shared/spells.mjs')
const { inkPath, inkCenter, ACT_SOUND, conjureTotal, flipFor } = await import('../src/play/conjuring.ts')
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
  const sfx = fs.readFileSync(path.join(ROOT, 'src/lib/sfx.ts'), 'utf8')
  const hasSound = (name) => new RegExp(`export (const|function) ${name}\\b`).test(sfx)
  for (const a of ACTS) {
    assert.ok(css.includes(`.cj-act-${a}`), `${a} 沒有動畫`)
    assert.ok(ACT_SOUND[a] && hasSound(ACT_SOUND[a]), `${a} 沒有聲音（${ACT_SOUND[a]}）`)
  }
  for (const s of SPELLS) if (s.sound) assert.ok(hasSound(s.sound), `${s.char} 的聲音 ${s.sound} 不在 sfx.ts`)
  assert.equal(spellFor('魚').act, 'swim')
  assert.equal(spellFor('好'), undefined)
})

test('魔法筆說的每一句都會預先做音檔（伺服器那邊有接上）', () => {
  const lines = spellLines()
  for (const t of Object.values(SPELL_FIXED)) assert.ok(lines.includes(t))
  for (const s of SPELLS) assert.ok(lines.includes(s.wish) && lines.includes(s.thanks) && (!s.alt || lines.includes(s.alt)))
  // 第二種說法也要叫得出那個字（不然他聽不出要寫什麼）
  for (const s of SPELLS) {
    assert.ok(s.wish.includes(s.char), `${s.char} 的願望沒提到這個字`)
    // 每一句都是「…，幫我寫／變／種○！」：他聽熟這個句型，聽到「幫我寫」就知道後面那個字是要寫的
    for (const w of [s.wish, s.alt].filter(Boolean)) assert.match(w, /幫我(寫|變|種)/, `「${w}」少了「幫我寫」`)
    if (s.alt) assert.ok(s.alt.includes(s.char), `${s.char} 的第二種說法沒提到這個字`)
  }
  assert.match(fs.readFileSync(path.join(ROOT, 'server/voice.mjs'), 'utf8'), /\.\.\.spellLines\(\)/)
})

test('他的筆跡畫成 SVG：點一下就過的那一筆也看得到；重心是所有點的平均', () => {
  assert.equal(inkPath([10, 20, 30, 40]), 'M10 20L30 40')
  assert.equal(inkPath([5, 6]), 'M5 6L5 6')
  assert.equal(inkPath([]), '')
  assert.deepEqual(inkCenter([[0, 0, 100, 100], [200, 200]]), { x: 100, y: 100 })
  assert.deepEqual(inkCenter([]), { x: 512, y: 388 })
  assert.ok(conjureTotal() > 3000 && conjureTotal() < 5000, '整段變身 3～5 秒')
  assert.ok(conjureTotal(true) < 6000, '象形字多畫一段古字也不超過 6 秒')
})

const { writeLevel, pickWishes, pickRound, levelAfter, nextStep, powerOf, LEVEL_BADGE, WISHES_PER_ROUND } = await import('../src/play/wishes.ts')
const lib = [...entries.values()]
const fixed = () => 0.5

test('鷹架：沒寫過＝示範＋描；描過一次＝看一眼；描過兩次或遮起來寫過＝先看兩秒再自己寫', () => {
  assert.equal(writeLevel(undefined), 'trace')
  assert.equal(writeLevel({ traces: 0, first: '', last: '', strokes: [] }), 'trace')
  assert.equal(writeLevel({ traces: 1, first: '', last: '', strokes: [] }), 'look')
  assert.equal(writeLevel({ traces: 2, first: '', last: '', strokes: [] }), 'blind', '描兩次就升級，魔法筆裡才走得到遮起來寫')
  assert.equal(writeLevel({ traces: 3, blind: 1, first: '', last: '', strokes: [] }), 'blind')
  assert.equal(writeLevel({ traces: 4, blind: 2, first: '', last: '', strokes: [] }), 'memory', '憑記憶寫過兩次就聽寫')
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

const { dwellers, recentMade, ZONE_OF, ZONES, spot } = await import('../src/play/magicWorld.ts')
const emojiOf = (c) => entries.get(c)?.emoji
const r = (traces, blind = 0) => ({ traces, blind, first: '', last: '', strokes: [] })

test('魔法世界：只住他寫過的字；每種動作都有地方住；魚在池塘、鳥在天上', () => {
  for (const a of ACTS) assert.ok(ZONES[ZONE_OF[a]], a)
  const world = dwellers({ 魚: r(1), 鳥: r(2), 好: r(3) }, emojiOf)
  assert.deepEqual(world.map((d) => d.char).sort(), ['魚', '鳥'])
  const fish = world.find((d) => d.char === '魚'), bird = world.find((d) => d.char === '鳥')
  assert.equal(fish.zone, 'pond')
  assert.equal(bird.zone, 'sky')
  for (const d of world) {
    const [l, rr, t, b] = ZONES[d.zone]
    assert.ok(d.x >= l && d.x <= rr && d.y >= t && d.y <= b, `${d.char} 跑出 ${d.zone}`)
  }
})

test('魔法世界：同一個字每次都站在同一個地方；憑記憶寫越多越大', () => {
  assert.equal(spot('魚'), spot('魚'))
  assert.notEqual(spot('魚'), spot('鳥'))
  const a = dwellers({ 魚: r(1) }, emojiOf)[0], b = dwellers({ 魚: r(5, 3) }, emojiOf)[0]
  assert.equal(a.x, b.x)
  assert.ok(b.size > a.size)
})

test('魔法世界：會變身的字全部都寫過也住得下（同一區不疊在一起太多）', () => {
  const all = Object.fromEntries(SPELLS.map((s) => [s.char, r(1)]))
  const world = dwellers(all, emojiOf)
  assert.equal(world.length, SPELLS.length)
  let close = 0
  for (const d of world) for (const e of world) if (d !== e && Math.hypot(d.x - e.x, (d.y - e.y) * 1.6) < 4) close++
  assert.ok(close / 2 <= 6, `疊在一起的有 ${close / 2} 對`)
})

test('合體魔法：每個詞的兩個字都會變身、詞有 3D 圖、合起來是另一個東西；台詞都會預先做', () => {
  const lines = spellLines()
  for (const c of COMBOS) {
    const [a, b] = [...c.word]
    assert.ok(spellFor(a) && spellFor(b), c.word)
    assert.notEqual(a, b, `${c.word} 是疊字`)
    assert.ok(has3d.has(code(c.emoji)), `${c.word}（${c.emoji}）沒有 3D 圖`)
    assert.ok(ACTS.includes(c.act))
    assert.ok(lines.includes(c.word) && lines.includes(c.thanks))
    assert.equal(comboOf(a, b), c)
  }
  assert.equal(comboOf('餅', '月'), undefined, '順序反了不算')
})

test('挑一輪：兩個字都看過、排得夠前面就安排合體，排在第二、三個；他為了哪個字來的還是第一個', () => {
  const progress = { watched: { 月: { count: 2 }, 餅: { count: 2 }, 火: { count: 1 } }, recall: {}, town: {} }
  const round = pickRound(lib, progress, { today: '2026-11-06', rand: fixed })
  assert.equal(round.combo?.word, '月餅')
  assert.deepEqual(round.wishes.slice(1).map((w) => w.char), ['月', '餅'])
  assert.equal(round.wishes.length, 3)
  const wanted = pickRound(lib, progress, { today: '2026-11-06', rand: fixed, want: '雨' })
  assert.equal(wanted.wishes[0].char, '雨')
  assert.equal(wanted.combo?.word, '月餅')
  // 他沒看過的字湊不成合體（不能為了合體硬塞）
  const none = pickRound(lib, { watched: { 火: { count: 1 }, 水: { count: 1 }, 木: { count: 1 }, 羊: { count: 1 }, 犬: { count: 1 }, 日: { count: 1 }, 瓜: { count: 1 }, 石: { count: 1 }, 米: { count: 1 }, 肉: { count: 1 }, 花: { count: 1 } } }, { today: '2026-11-06', rand: fixed })
  assert.equal(none.combo, undefined)
  assert.equal(none.wishes.length, 3)
})

test('願望和謝謝不提夥伴的名字（誰都可能來許願，小老鼠說「大怪獸想吃肉」會搞混）', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/play/partners.ts'), 'utf8')
  const names = [...src.matchAll(/name: '([^']+)'/g)].map((m) => m[1])
  assert.ok(names.length > 10)
  for (const line of [...SPELLS.flatMap((s) => [s.wish, s.thanks, ...(s.alt ? [s.alt] : [])]), ...COMBOS.map((c) => c.thanks)]) {
    for (const n of names) assert.ok(!line.includes(n), `「${line}」提到 ${n}`)
  }
})

test('往右走的東西要翻過來（3D 圖側面朝左，不然車在倒車、魚倒退游）；飛機本來就朝右；不移動的不翻', () => {
  assert.equal(flipFor('🚗', 'drive'), true)
  assert.equal(flipFor('🐟', 'swim'), true)
  assert.equal(flipFor('✈️', 'fly'), false)
  assert.equal(flipFor('🔥', 'burn'), false)
  assert.equal(flipFor('🍎', 'yum'), false)
})

test('升級：第一次描完升到看一眼；描兩次升到遮起來；遮起來寫（沒偷看）兩次升到聽寫；沒升級是 null', () => {
  assert.equal(levelAfter(undefined, false), 'look')
  assert.equal(levelAfter(r(1), false), 'blind')
  assert.equal(levelAfter(r(2), false), null, '描第三次還是遮起來')
  assert.equal(levelAfter(r(3, 1), false), null, '偷看過的不算')
  assert.equal(levelAfter(r(3, 1), true), 'memory')
  assert.equal(levelAfter(r(5, 2), true), null, '已經最高級')
  for (const l of ['trace', 'look', 'blind', 'memory']) assert.ok(LEVEL_BADGE[l])
})

test('合體紀錄：記第一次合出來的時間；伺服器只收 COMBOS 裡的詞、兩個字都要在字庫；合過的詞住進魔法世界', async () => {
  const { fuseWord } = await import('../shared/domain.mjs')
  const { acceptEvent, applyEvent } = await import('../shared/play-events.mjs')
  const p1 = fuseWord({ watched: {} }, '火山', '2026-11-06T01:00:00Z')
  assert.equal(p1.fused.火山, '2026-11-06T01:00:00Z')
  assert.equal(fuseWord(p1, '火山', '2026-11-07T01:00:00Z'), p1, '再合一次不改（記的是發現）')
  assert.equal(fuseWord(p1, '火山', '2026-11-05T01:00:00Z').fused.火山, '2026-11-05T01:00:00Z', '更早的離線紀錄後到，用早的')
  const known = (c) => entries.has(c)
  const ev = (char) => ({ id: 'abcdef12-fuse', char, at: '2026-11-06T01:00:00Z' })
  assert.equal(acceptEvent('fuse', ev('火山'), known, Date.parse('2026-11-06T02:00:00Z')), true)
  assert.equal(acceptEvent('fuse', ev('山火'), known, Date.parse('2026-11-06T02:00:00Z')), false, '不是合體詞')
  assert.deepEqual(applyEvent({ watched: {} }, { kind: 'fuse', ...ev('火山') }).fused, { 火山: '2026-11-06T01:00:00Z' })
  const world = dwellers({ 火: r(1) }, emojiOf, { 火山: '2026-11-06T01:00:00Z' })
  const v = world.find((d) => d.char === '火山')
  assert.ok(v && v.emoji === '🌋', '火山住進來了')
  assert.ok(v.size > world.find((d) => d.char === '火').size, '合體的比單字大一號')
})

test('挑願望：魔法世界還空著的那一區先補（天上已經有東西、池塘還空著 → 魚比鳥先）', () => {
  const progress = { watched: { 魚: { count: 1 }, 鳥: { count: 1 } }, recall: {}, town: { 星: r(1), 月: r(1) } }
  // 魚、鳥都是 11 筆、都看過、都沒寫過，只差在池塘空著
  assert.equal(pickWishes(lib, progress, { today: '2026-11-06', rand: fixed, n: 1 })[0].char, '魚')
})

test('變身、合體的「階段」class（.cj-<階段>、.fuse-<階段>）只拿來當外層狀態，不能是某個元素自己的 class（撞過兩次：spell-write、cj-origin）', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src/play/styles/conjure.css'), 'utf8')
  const conjure = fs.readFileSync(path.join(ROOT, 'src/play/Conjure.tsx'), 'utf8')
  const fuse = fs.readFileSync(path.join(ROOT, 'src/play/Fuse.tsx'), 'utf8')
  const steps = (src) => [...src.match(/type Step = ([^\n]+)/)[1].matchAll(/'(\w+)'/g)].map((m) => m[1])
  for (const [prefix, list] of [['cj', steps(conjure)], ['fuse', steps(fuse)]]) {
    assert.ok(list.length >= 4)
    for (const s of list) {
      // 單獨一個 .cj-origin { … } 這種規則＝把階段名當成元素樣式
      assert.ok(!new RegExp(`(^|[},])\\s*\\.${prefix}-${s}\\s*[{,]`, 'm').test(css), `.${prefix}-${s} 被當成元素樣式`)
    }
  }
})

test('寫字的間隔複習：今天寫過的先讓別的字；隔夠久的（看一眼級隔 1 天、遮起來隔 2 天、聽寫隔 4 天）優先', () => {
  const at = (day) => ({ traces: 1, blind: 0, first: '', last: `${day}T04:00:00Z`, strokes: [] })
  // 火、水 都是 4 筆、都看過、都描過一次（看一眼級）；火 今天寫過，水 昨天寫的
  const progress = { watched: { 火: { count: 1 }, 水: { count: 1 } }, recall: {}, town: { 火: at('2026-11-06'), 水: at('2026-11-05') } }
  assert.equal(pickWishes(lib, progress, { today: '2026-11-06', rand: fixed, n: 1 })[0].char, '水')
  // 聽寫級的字昨天才寫過，還不到 4 天：沒寫過的、隔夠久的先
  const memory = { traces: 5, blind: 3, first: '', last: '2026-11-05T04:00:00Z', strokes: [] }
  const p2 = { watched: { 火: { count: 1 }, 水: { count: 1 } }, recall: {}, town: { 火: memory, 水: { ...memory, last: '2026-11-01T04:00:00Z' } } }
  assert.equal(pickWishes(lib, p2, { today: '2026-11-06', rand: fixed, n: 1 })[0].char, '水')
})

test('首頁陪他的：最近寫的兩個會變身的字（新的在前），不會變身的字不算', () => {
  const at = (last) => ({ traces: 1, first: '', last, strokes: [] })
  const town = { 魚: at('2026-11-01T01:00:00Z'), 火: at('2026-11-05T01:00:00Z'), 好: at('2026-11-06T01:00:00Z'), 球: at('2026-11-03T01:00:00Z') }
  assert.deepEqual(recentMade(town, emojiOf), [{ char: '火', emoji: emojiOf('火') }, { char: '球', emoji: emojiOf('球') }])
  assert.deepEqual(recentMade({}, emojiOf), [])
})

test('一輪怎麼走（nextStep）：兩個以上讓他挑、剩一個直接寫、為了某個字來的先寫它；寫完兩個合體字才合體，不然結算', () => {
  const w = (char) => ({ char })
  const round = { wishes: [w('日'), w('水'), w('果')], combo: { word: '水果' } }
  assert.deepEqual(nextStep(round, [], []), { kind: 'choose' })
  assert.deepEqual(nextStep(round, [], [], '日'), { kind: 'start', index: 0 }, 'want 第一個直接寫')
  assert.deepEqual(nextStep(round, ['水'], ['水']), { kind: 'choose' })
  assert.deepEqual(nextStep(round, ['水', '日'], ['水', '日']), { kind: 'start', index: 2 }, '剩一個不用選')
  assert.deepEqual(nextStep(round, ['水', '日', '果'], ['水', '日', '果']), { kind: 'fuse' })
  assert.deepEqual(nextStep(round, ['水', '日', '果'], ['水', '日']), { kind: 'finish' }, '果 是跳過的（筆順抓不到），不能合體')
  assert.deepEqual(nextStep({ wishes: round.wishes }, ['水', '日', '果'], ['水', '日', '果']), { kind: 'finish' }, '沒有合體就結算')
})

test('慶祝等一下（hold.ts）：魔法筆一輪在演就擋著，放開才通知；重複設同一個值不重複通知', async () => {
  const hold = await import('../src/play/hold.ts')
  // useSyncExternalStore 的訂閱是內部的；這裡只驗開關本身不會丟例外、重複設定是安靜的
  hold.holdCelebrations(true)
  hold.holdCelebrations(true)
  hold.holdCelebrations(false)
  hold.holdCelebrations(false)
  const src = fs.readFileSync(path.join(ROOT, 'src/play/PlayApp.tsx'), 'utf8')
  for (const what of ['chest && !held', 'crown && !chest && !held', '!held && !entry']) assert.ok(src.includes(what), `PlayApp 的 ${what} 不見了：加冕、寶箱、戰報會蓋到變身上`)
  const spell = fs.readFileSync(path.join(ROOT, 'src/play/Spell.tsx'), 'utf8')
  assert.match(spell, /holdCelebrations\(false\)/, '魔法筆要記得放開，不然離開之後加冕永遠出不來')
})

test('越會寫變出來的越厲害：照著描是普通的、憑記憶寫出來大一號、聽寫級寫出來金光閃閃；偷看過的不變強', () => {
  assert.equal(powerOf('trace', false), 0)
  assert.equal(powerOf('look', false), 0)
  assert.equal(powerOf('blind', true), 1)
  assert.equal(powerOf('memory', true), 2)
  assert.equal(powerOf('memory', false), 0, '偷看過、靠提示寫完的')
})

test('新字跟複習混著：一輪三個裡至少一個沒寫過的字；合過的詞往後排', () => {
  const at = (char, blind = 0) => [char, { traces: 2, blind, first: '', last: '2026-11-01T04:00:00Z', strokes: [] }]
  // 看過的字都寫過了：這一輪還是要放一個沒寫過的字進來（新字從沒看過的裡面挑）
  const watched = Object.fromEntries(['火', '水', '木', '日', '月', '石'].map((c) => [c, { count: 2 }]))
  const town = Object.fromEntries(['火', '水', '木', '日', '月', '石'].map((c) => at(c)))
  for (const want of [undefined, '火']) {
    const round = pickRound(lib, { watched, recall: {}, town }, { today: '2026-11-06', rand: fixed, want })
    assert.ok(round.wishes.some((w) => !town[w.char]), `${round.wishes.map((w) => w.char).join('')} 沒有新字`)
    if (want) assert.equal(round.wishes[0].char, want, 'want 的那個不換')
  }
  // 雪花比月餅好寫（餅 14 筆），平常先合雪花；雪花合過之後，換去發現月餅
  const p2 = { watched: { 月: { count: 2 }, 餅: { count: 2 }, 雪: { count: 2 }, 花: { count: 2 } }, recall: {}, town: {} }
  assert.equal(pickRound(lib, p2, { today: '2026-11-06', rand: fixed }).combo?.word, '雪花')
  assert.equal(pickRound(lib, { ...p2, fused: { 雪花: '2026-11-05T00:00:00Z' } }, { today: '2026-11-06', rand: fixed }).combo?.word, '月餅')
  // 兩組都在三天內合過：這一輪不合體（不然寫得辛苦的時候同一組隔天又來）
  const both = { ...p2, fused: { 雪花: '2026-11-05T00:00:00Z', 月餅: '2026-11-04T00:00:00Z' } }
  assert.equal(pickRound(lib, both, { today: '2026-11-06', rand: fixed }).combo, undefined)
  // 一週前合過的可以再合
  assert.equal(pickRound(lib, { ...p2, fused: { 雪花: '2026-10-28T00:00:00Z', 月餅: '2026-10-28T00:00:00Z' } }, { today: '2026-11-06', rand: fixed }).combo?.word, '雪花')
})
