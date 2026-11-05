// 媒體查詢（手機直放、橫放）裡的規則，被檔案後面「同一個選擇器」的本體規則蓋掉——同樣權重、後寫的贏，
// 寫在 @media 裡的那條等於沒寫。第二夜（2026-11-06）踩到：直放時升級徽章往內挪，結果完全沒生效，量了才發現。
// 這裡把 src/play/styles 每個檔案粗略拆開：@media 裡的「選擇器＋屬性」，後面有一模一樣的選擇器又設同一個屬性，就算錯。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const DIR = path.join(import.meta.dirname, '..', 'src/play/styles')

/** 拆成 [{ selector, props, media, at }]；只認一層 @media（這個 repo 沒有更深的） */
function rules(css) {
  const out = []
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  let i = 0, media = null, depth = 0, order = 0
  while (i < text.length) {
    const open = text.indexOf('{', i), close = text.indexOf('}', i)
    if (close !== -1 && (open === -1 || close < open)) { if (media && depth === 1) { media = null; depth = 0 } i = close + 1; continue }
    if (open === -1) break
    const head = text.slice(i, open).trim()
    if (head.startsWith('@media')) { media = head; depth = 1; i = open + 1; continue }
    if (head.startsWith('@')) { // @keyframes 之類：整塊跳過
      let d = 0, j = open
      for (; j < text.length; j++) { if (text[j] === '{') d++; else if (text[j] === '}' && --d === 0) break }
      i = j + 1; continue
    }
    const end = text.indexOf('}', open)
    const props = text.slice(open + 1, end).split(';').map((p) => p.split(':')[0].trim()).filter(Boolean)
    for (const selector of head.split(',').map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean)) out.push({ selector, props, media, at: order++ })
    i = end + 1
  }
  return out
}

test('手機版（@media 裡）的規則沒有被後面同一個選擇器的本體規則蓋掉', () => {
  const bad = []
  for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.css'))) {
    const all = rules(fs.readFileSync(path.join(DIR, file), 'utf8'))
    for (const r of all.filter((x) => x.media)) {
      for (const later of all.filter((x) => !x.media && x.selector === r.selector && x.at > r.at)) {
        const both = r.props.filter((p) => later.props.includes(p))
        if (both.length) bad.push(`${file}：${r.media} 裡的「${r.selector}」的 ${both.join('、')} 被後面的本體規則蓋掉`)
      }
    }
  }
  assert.deepEqual(bad, [])
})
