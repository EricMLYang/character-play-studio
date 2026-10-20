import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

process.env.CPS_VOICE = 'off'
const { textsForEntry, voiceTexts, clipSayTexts, syncVoice } = await import('../server/voice.mjs')

test('a character\'s spoken lines match what the player and the town actually say', () => {
  const entry = { char: '火', words: [{ text: '火車', emoji: '🚂' }, { text: '火山' }], concept: { hook: '小火苗跳舞。' } }
  assert.deepEqual(textsForEntry(entry), ['火', '我是火！', '我要吃火！', '這是火耶！', '火車', '我是火！火車的火', '火車的火', '火山', '我是火！火山的火', '火山的火', '小火苗跳舞。'])
  // 沒語詞、沒小故事的新字也要有自己的字音
  assert.deepEqual(textsForEntry({ char: '串' }), ['串', '我是串！', '我要吃串！', '這是串耶！'])
})

test('the library list is de-duplicated and includes hidden characters and clip cues', () => {
  const db = { characters: [{ char: '日', words: [{ text: '日出' }] }, { char: '出', hidden: true, words: [{ text: '日出' }], concept: { hook: '' } }] }
  const texts = voiceTexts(db, ['日', '出來'])
  assert.deepEqual(texts, ['日', '我是日！', '我要吃日！', '這是日耶！', '日出', '我是日！日出的日', '日出的日', '出', '我是出！', '我要吃出！', '這是出耶！', '我是出！日出的出', '日出的出', '出來'])
})

test('clip cues are read from the script files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-clips-'))
  fs.writeFileSync(path.join(dir, '果.ts'), "cues: [{ at: 1, say: '果' }, { at: 5, sfx: 'cheer' }, { at: 6, say: '蘋果' }]")
  fs.writeFileSync(path.join(dir, 'index.ts'), "say: '不算'")
  assert.deepEqual(clipSayTexts(dir), ['果', '蘋果'])
  fs.rmSync(dir, { recursive: true })
})

test('voice generation is skipped quietly when turned off', async () => {
  assert.deepEqual(await syncVoice(), { skipped: 'off' })
})
