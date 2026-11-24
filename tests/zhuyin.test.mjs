// 注音找字（shared/zhuyin.mjs）：字庫每個字都拆得開、每顆鍵都找得到字、怎麼按都不會走進 0 個字的死路
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const {
  INITIALS, MEDIALS, FINALS, ZHUYIN_KEYS, ZHUYIN_GROUPS, ZHUYIN_LINES, groupOf, parseZhuyin, matchesPick, togglePick,
  availableKeys, zhuyinSegments, pickText, hasPick, zhuyinLines,
} = await import('../shared/zhuyin.mjs')

const characters = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/characters.json'), 'utf8')).characters
/** 孩子端看得到的字（鍵盤是照這些字算按不按得下去） */
const library = characters.filter((c) => !c.hidden)
const find = (pick, from = library) => from.filter((c) => matchesPick(c.zhuyin, pick)).map((c) => c.char)

test('37 個符號、三組、照課本順序，沒有重複', () => {
  assert.equal(INITIALS.length, 21)
  assert.equal(MEDIALS.length, 3)
  assert.equal(FINALS.length, 13)
  assert.equal(new Set(ZHUYIN_KEYS).size, 37)
  assert.deepEqual(ZHUYIN_GROUPS.map((g) => g.id), ['initial', 'medial', 'final'])
  assert.equal(INITIALS.join(''), 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ')
  assert.equal(FINALS.join(''), 'ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ')
  assert.equal(MEDIALS.join(''), 'ㄧㄨㄩ')
  assert.equal(groupOf('ㄧ'), 'medial')
  assert.equal(groupOf('ˇ'), undefined)
})

test('字庫每個字的注音都拆得開：沒有不認得的符號、每一組最多一個、順序對', () => {
  for (const c of characters) {
    assert.ok(c.zhuyin, `「${c.char}」沒有注音`)
    assert.deepEqual(parseZhuyin(c.zhuyin).bad, [], `「${c.char}」${c.zhuyin}`)
  }
  // 拆得開的反例：檢查器本身抓得到
  assert.ok(parseZhuyin('ㄅㄆㄠ').bad.length)
  assert.ok(parseZhuyin('ㄠㄅ').bad.length)
  assert.ok(parseZhuyin('ㄅa').bad.length)
})

test('拆法：聲調與輕聲不管', () => {
  assert.deepEqual(parseZhuyin('ㄏㄨㄛˇ'), { initial: 'ㄏ', medial: 'ㄨ', final: 'ㄛ', bad: [] })
  assert.deepEqual(parseZhuyin('˙ㄉㄜ'), { initial: 'ㄉ', medial: '', final: 'ㄜ', bad: [] })
  assert.deepEqual(parseZhuyin('ㄩㄝˋ'), { initial: '', medial: 'ㄩ', final: 'ㄝ', bad: [] })
  assert.deepEqual(parseZhuyin('ㄦˊ'), { initial: '', medial: '', final: 'ㄦ', bad: [] })
})

test('37 顆鍵每一顆單獨按都至少有一個字', () => {
  for (const k of ZHUYIN_KEYS) {
    const pick = togglePick({}, k)
    assert.ok(find(pick).length > 0, `${k} 找不到字`)
    assert.ok(availableKeys(library, {}).has(k), `${k} 一開始就是暗的`)
  }
})

test('具體的例子（以字庫實際內容為準）', () => {
  assert.ok(find({ initial: 'ㄅ', final: 'ㄠ' }).includes('包'))
  assert.ok(find({ medial: 'ㄧ' }).includes('一'))
  assert.ok(find({ initial: 'ㄉ', final: 'ㄜ' }).includes('的'))
  assert.ok(find({ final: 'ㄦ' }).includes('耳'))
  assert.ok(find({ initial: 'ㄏ', medial: 'ㄨ', final: 'ㄛ' }).includes('火'))
  // 只選ㄅ：每個字的聲母都是ㄅ
  for (const ch of find({ initial: 'ㄅ' })) assert.equal(parseZhuyin(library.find((c) => c.char === ch).zhuyin).initial, 'ㄅ')
  // 只選ㄠ：包（ㄅㄠ）有、「一」沒有
  assert.ok(!find({ final: 'ㄠ' }).includes('一'))
})

test('每一組最多選一個：同組換過去，按已經選的是取消', () => {
  let pick = togglePick({}, 'ㄅ')
  assert.equal(pick.initial, 'ㄅ')
  pick = togglePick(pick, 'ㄠ')
  assert.equal(pickText(pick), 'ㄅㄠ')
  pick = togglePick(pick, 'ㄆ')
  assert.equal(pickText(pick), 'ㄆㄠ')
  pick = togglePick(pick, 'ㄆ')
  assert.equal(pickText(pick), 'ㄠ')
  pick = togglePick(pick, 'ㄠ')
  assert.equal(hasPick(pick), false)
  assert.equal(pickText({ final: 'ㄠ', initial: 'ㄅ', medial: 'ㄧ' }), 'ㄅㄧㄠ')
})

test('不會走進死路：隨便選兩組，還亮著的鍵按下去結果都不是空的', () => {
  const picks = [{}]
  for (const a of ZHUYIN_GROUPS) for (const b of ZHUYIN_GROUPS) {
    if (a.id >= b.id) continue
    for (const x of a.keys) for (const y of b.keys) picks.push({ [a.id]: x, [b.id]: y })
  }
  for (const k of ZHUYIN_KEYS) picks.push({ [groupOf(k)]: k })
  // 先按出來的組合才算數（死路的組合本來就按不出來）；這些組合裡亮著的每一顆再按都要有字
  let checked = 0
  for (const pick of picks) {
    if (!find(pick).length) continue
    const lit = availableKeys(library, pick)
    for (const k of lit) {
      const next = togglePick(pick, k)
      assert.ok(find(next).length > 0, `${pickText(pick)} 再按 ${k} 變成 0 個字`)
      checked++
    }
    // 暗掉的鍵真的是 0 個字（不是白白不給按）
    for (const k of ZHUYIN_KEYS.filter((k) => !lit.has(k))) {
      assert.equal(find(togglePick(pick, k)).length, 0, `${pickText(pick)} 的 ${k} 明明有字卻暗掉`)
    }
  }
  assert.ok(checked > 500)
})

test('選中的符號標得出來（字卡上的注音上色）', () => {
  assert.deepEqual(zhuyinSegments('ㄅㄠ', { final: 'ㄠ' }), [
    { text: 'ㄅ', group: 'initial', hit: false }, { text: 'ㄠ', group: 'final', hit: true },
  ])
  assert.deepEqual(zhuyinSegments('˙ㄉㄜ', { initial: 'ㄉ' }).map((s) => [s.text, s.group, s.hit]), [['˙', null, false], ['ㄉ', 'initial', true], ['ㄜ', 'final', false]])
})

test('要唸的都會先做成音檔：37 個符號、打開與清掉的那句', () => {
  const lines = new Set(zhuyinLines())
  for (const k of ZHUYIN_KEYS) assert.ok(lines.has(k))
  for (const t of Object.values(ZHUYIN_LINES)) assert.ok(lines.has(t))
  assert.match(fs.readFileSync(path.join(ROOT, 'server/voice.mjs'), 'utf8'), /\.\.\.zhuyinLines\(\)/)
})
