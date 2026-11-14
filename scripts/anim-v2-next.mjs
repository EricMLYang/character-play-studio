// 動畫 v2 重做：下一支該做哪個字？
//
// 規矩（docs/clip-v2-plan.md）：只重做「沒有上架影片」的字。爸爸隨時會在 Studio 上架新影片，
// 所以每開始一支之前都要現查一次，不能照舊名單做——有影片的字孩子端播的是影片，重做動畫等於白做。
//
//   node scripts/anim-v2-next.mjs        印出下一個字、還剩幾支、這次因為有影片而跳過的字
//   node scripts/anim-v2-next.mjs 蝦     只查這個字現在能不能做
//
// 排法：孩子端看得到的優先，再照看過的次數由多到少，最後照字卡的 priority。只讀，不寫任何檔。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { publishedMedia } from '../shared/domain.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'))

const data = read('data/characters.json')
const cards = Array.isArray(data) ? data : (data.characters || Object.values(data))
const progress = fs.existsSync(path.join(ROOT, 'data/progress.json')) ? read('data/progress.json') : {}
const watched = (c) => progress.watched?.[c.char]?.count || 0
const hasVideo = (c) => publishedMedia(c).some((m) => m.kind === 'video')

const CLIPS = path.join(ROOT, 'src/anim/clips')
const clips = fs.readdirSync(CLIPS).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => f.replace(/\.ts$/, ''))
const isV2 = (char) => /format:\s*2\b/.test(fs.readFileSync(path.join(CLIPS, `${char}.ts`), 'utf8'))

const byChar = new Map(cards.map((c) => [c.char, c]))
const rows = clips.map((char) => byChar.get(char)).filter(Boolean)
const done = rows.filter((c) => isV2(c.char))
const skipped = rows.filter((c) => !isV2(c.char) && hasVideo(c))
const todo = rows.filter((c) => !isV2(c.char) && !hasVideo(c))
  .sort((a, b) => (!!a.hidden - !!b.hidden) || (watched(b) - watched(a)) || (a.priority - b.priority))

const ask = process.argv[2]
if (ask) {
  const c = byChar.get(ask)
  if (!c) console.log(`${ask}：字庫裡沒有這個字`)
  else if (!clips.includes(ask)) console.log(`${ask}：沒有動畫劇本${hasVideo(c) ? '，而且已經有上架影片' : ''}`)
  else if (isV2(ask)) console.log(`${ask}：已經是 v2`)
  else if (hasVideo(c)) console.log(`${ask}：有上架影片，不要做`)
  else console.log(`${ask}：可以做（沒有上架影片、還不是 v2）`)
  process.exit(0)
}

console.log(`已經是 v2：${done.length} 支　${done.map((c) => c.char).join('')}`)
console.log(`有上架影片、不做：${skipped.length} 支　${skipped.map((c) => c.char).join('')}`)
console.log(`還沒做：${todo.length} 支`)
if (todo.length) {
  console.log(`下一個：${todo[0].char}（看過 ${watched(todo[0])} 次${todo[0].hidden ? '，孩子端隱藏中' : ''}）`)
  console.log(`接下來：${todo.slice(1, 13).map((c) => c.char).join(' ')}`)
}
