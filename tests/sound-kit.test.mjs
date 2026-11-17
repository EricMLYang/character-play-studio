import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (error) {
      if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw error
    }
  },
})

const { ladderNotes, rightNotes, ARRIVALS } = await import('../src/lib/sfx.ts')
const { streakOf } = await import('../src/play/streak.ts')
const { SCENES } = await import('../src/play/stageScenes.ts')

test('連對：從最後一題往回數，錯一次就斷', () => {
  assert.equal(streakOf([]), 0)
  assert.equal(streakOf([{ ok: true }, { ok: true }]), 2)
  assert.equal(streakOf([{ ok: true }, { ok: false }, { ok: true }]), 1)
  assert.equal(streakOf([{ ok: true }, { ok: false }]), 0)
})

test('答對的音一路往上爬，爬到頂就停在頂，三個音都往上', () => {
  let prev = 0
  for (let step = 1; step <= 8; step++) {
    const notes = ladderNotes(step)
    assert.equal(notes.length, 3)
    assert.ok(notes[0] > prev, `第 ${step} 題沒有比上一題高`)
    assert.ok(notes[0] < notes[1] && notes[1] < notes[2])
    prev = notes[0]
  }
  assert.deepEqual(ladderNotes(30), ladderNotes(9))
  assert.deepEqual(ladderNotes(0), ladderNotes(1))
})

test('主角館拼對的音：第 1 個字、第 2 個字⋯⋯一階一階往上，兩個音都往上跳', () => {
  let prev = 0
  for (let step = 1; step <= 6; step++) {
    const [a, b] = rightNotes(step)
    assert.ok(a > prev, `第 ${step} 個字沒有比上一個高`)
    assert.ok(b > a)
    prev = a
  }
  assert.deepEqual(rightNotes(0), rightNotes(1))
  assert.ok(rightNotes(99).every((f) => f > 0))
})

test('每一個景都有到站小旋律', () => {
  for (const id of Object.keys(SCENES)) assert.ok(ARRIVALS[id]?.length >= 2, `${id} 沒有小旋律`)
})

test('新加的音效都比唸字小聲（peak ≤ 0.07）', () => {
  const src = fs.readFileSync(new URL('../src/lib/sfx.ts', import.meta.url), 'utf8')
  const kit = src.slice(src.indexOf('// ---------- 聲音設計包'))
  for (const m of kit.matchAll(/tone\([^)]*,\s*'(?:sine|triangle|square|sawtooth)',\s*([\d.]+)/g)) assert.ok(Number(m[1]) <= 0.07, m[0])
  for (const m of kit.matchAll(/noise\([^,]+,[^,]+,\s*([\d.]+)\)/g)) assert.ok(Number(m[1]) <= 0.07, m[0])
})
