// 列出「還沒有上架影片、也還沒有動畫劇本」的字，給 char-animation skill 挑字用。
//
//   npm run anim                 # 候選清單（孩子端看得到的排前面）＋ 已用過的卡司與笑點
//   npm run anim -- 果 雷        # 指定的字：筆畫分組資訊（寫 builds 用）
//
// 有影片的字一律跳過：影片上架後播放器本來就優先播影片，動畫只補還沒有影片的字。
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { publishedMedia } from '../shared/domain.mjs'

const root = new URL('..', import.meta.url).pathname
const { characters } = JSON.parse(readFileSync(join(root, 'data/characters.json'), 'utf8'))
const clipDir = join(root, 'src/anim/clips')
const clipFiles = readdirSync(clipDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')
const hasClip = new Set(clipFiles.map((f) => f.replace(/\.ts$/, '')))
const hasVideo = (c) => publishedMedia(c).some((m) => m.kind === 'video')

const asked = process.argv.slice(2).join('').replace(/\s/g, '')

if (asked) {
  for (const char of [...asked]) detail(char)
} else {
  list()
}

function list() {
  const todo = characters.filter((c) => !hasVideo(c) && !hasClip.has(c.char))
  const visible = todo.filter((c) => !c.hidden).sort((a, b) => a.priority - b.priority)
  const hidden = todo.filter((c) => c.hidden).sort((a, b) => a.priority - b.priority)
  const line = (c) => {
    const words = (c.words || []).map((w) => w.text + (w.emoji || '')).join('、')
    const strokes = existsSync(join(root, 'public/strokes', `${c.char}.json`)) ? '' : '  ⚠ 沒有筆順資料，不能做'
    return `  ${c.char} ${c.emoji || ''} ${c.zhuyin || '(無注音)'} ${c.meaning || ''} ｜ ${words}${strokes}`
  }
  console.log(`還沒有影片也沒有動畫：${todo.length} 個字（已有動畫 ${hasClip.size} 個）\n`)
  console.log(`孩子端看得到（優先做）：${visible.length}`)
  visible.forEach((c) => console.log(line(c)))
  console.log(`\n孩子端隱藏中：${hidden.length}`)
  hidden.forEach((c) => console.log(line(c)))

  console.log('\n已經用過的主題／卡司／笑點（新劇本要避開最近的組合）：')
  for (const f of clipFiles) {
    const src = readFileSync(join(clipDir, f), 'utf8')
    const meta = src.match(/meta:\s*(\{.*\}),?\n/)
    console.log(`  ${f.replace(/\.ts$/, '')}  ${meta ? meta[1] : '（沒有 meta）'}`)
  }
}

function detail(char) {
  const c = characters.find((x) => x.char === char)
  if (!c) return console.log(`\n${char}：字庫裡沒有這個字`)
  console.log(`\n${char} ${c.emoji || ''} ${c.zhuyin} ${c.meaning}${c.hidden ? '（孩子端隱藏中）' : ''}`)
  if (hasVideo(c)) console.log('  ⚠ 已經有上架影片，不需要動畫')
  if (hasClip.has(char)) console.log(`  ⚠ 已經有動畫：src/anim/clips/${char}.ts`)
  console.log(`  語詞：${(c.words || []).map((w) => w.text + (w.emoji || '')).join('、')}`)
  if (c.concept?.hook) console.log(`  字卡笑點：${c.concept.hook}`)
  const file = join(root, 'public/strokes', `${char}.json`)
  if (!existsSync(file)) return console.log('  ⚠ 沒有筆順資料，不能做動畫')
  const data = JSON.parse(readFileSync(file, 'utf8'))
  console.log(`  筆畫 ${data.strokes.length} 劃；部首筆畫 radStrokes = ${JSON.stringify(data.radStrokes ?? null)}`)
  console.log('  每一筆的範圍（hanzi-writer 座標：x 0–1024 往右、y 往上，900 是頂、-124 是底）：')
  data.medians.forEach((m, i) => {
    const xs = m.map((p) => p[0]), ys = m.map((p) => p[1])
    console.log(`    ${String(i).padStart(2)}  x ${Math.min(...xs)}–${Math.max(...xs)}  y ${Math.min(...ys)}–${Math.max(...ys)}`)
  })
}
