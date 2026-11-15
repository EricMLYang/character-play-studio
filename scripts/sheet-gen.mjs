// 請 Codex 的生圖工具畫一張九宮格（主角姿勢表或道具表），直接存進 assets/。
//
// 為什麼要這支：生圖的 prompt 原本只放在暫存資料夾，被清檔時一起清掉過一次（2026-11-15）。
// 版面規則是切圖腳本的前提（純色底、3×3、格與格留白），所以前言固定寫在這裡，每次只給九格的清單。
//
//   npm run sheet:gen -- hero sheriff G scripts/sheets/sheriff-G.txt   主角：<id> <表的代號> <九格清單檔>
//   npm run sheet:gen -- prop 9 scripts/sheets/props-9.txt             道具：<第幾張> <九格清單檔>
//
// 九格清單檔：一行一格、共 9 行（「1. 」開頭的編號可有可無）。主角表若有某幾格需要道具，加 --props。
// 主角的角色描述寫在 src/anim/heroes/<id>.cut.json 的 look（沒有就用 --look "……" 帶）；
// 參考圖用 assets/hero-sheets/<id>-A.png（道具表用 pig-A.png 對齊畫風）。
// 生好只是原圖：要自己打開看過（九格都對、沒有互相碰到、底色乾淨），再照兩份 README 加進 .cut.json 去切。
//
// 會連網（Codex）。送出去的只有 prompt 文字與 assets/ 裡那張參考圖；不要拿照片或真人的圖當參考。
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HERO_DIR = path.join(ROOT, 'assets/hero-sheets')
const PROP_DIR = path.join(ROOT, 'assets/prop-sheets')
const fail = (msg) => { console.error(msg); process.exit(1) }

const argv = process.argv.slice(2)
const flags = { props: false, look: '', force: false }
const pos = []
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--props') flags.props = true
  else if (argv[i] === '--force') flags.force = true
  else if (argv[i] === '--look') flags.look = argv[++i] ?? ''
  else pos.push(argv[i])
}
const kind = pos[0]
if (kind !== 'hero' && kind !== 'prop') fail('用法：sheet-gen.mjs hero <id> <代號> <清單檔> [--props] [--look "角色描述"]\n　　　sheet-gen.mjs prop <第幾張> <清單檔>')

const listFile = kind === 'hero' ? pos[3] : pos[2]
if (!listFile || !fs.existsSync(listFile)) fail(`找不到九格清單檔：${listFile ?? '（沒給）'}`)
const cells = fs.readFileSync(listFile, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^\d+[.、)]\s*/, ''))
if (cells.length !== 9) fail(`清單要剛好 9 行，現在是 ${cells.length} 行`)
const list = cells.map((c, i) => `${i + 1}. ${c}`).join('\n')

let name, outDir, ref, prompt
if (kind === 'hero') {
  const [, id, tag] = pos
  if (!id || !tag) fail('主角表要給 <id> 與 <表的代號>（A、B、C…）')
  name = `${id}-${tag}`
  outDir = HERO_DIR
  ref = path.join(HERO_DIR, `${id}-A.png`)
  if (!fs.existsSync(ref)) fail(`找不到參考圖 ${ref}（新角色的第一張表要另外準備參考圖）`)
  const cutFile = path.join(ROOT, 'src/anim/heroes', `${id}.cut.json`)
  const look = flags.look || (fs.existsSync(cutFile) ? JSON.parse(fs.readFileSync(cutFile, 'utf8')).look : '')
  if (!look) fail(`沒有角色描述：在 ${cutFile} 加 "look"，或用 --look "……" 帶`)
  prompt = `請用你的生圖工具（image generation）產生一張圖，存成目前資料夾的 ${name}.png，然後只回報檔案路徑與圖片尺寸。不要寫程式畫圖、不要用其他方式合成，一定要用生圖工具；解析度選最大的正方形。

圖的內容：依照我附上的參考圖（同一個角色的姿勢表），畫出同一個角色的另一張姿勢表。角色：${look}

版面：一張正方形圖，3×3 九宮格，共 9 個姿勢，每格一個。格與格之間留白，角色不可以超出自己的格子，也不可以互相碰到。

每一格都要：
- 全身入鏡，從頭頂到腳底都看得到，不能被裁切
- 同樣的身高、同樣的頭身比例、同樣的服裝與配色，跟參考圖是同一個角色
- 腳站在同一條水平線上（跳起來、坐著、趴著的那幾格例外）
- 身體朝向畫面左前方（四分之三側面），臉看得清楚
- 表情和動作誇張、一眼看得懂，像默劇演員

背景：整張圖是純綠色（#00FF00）平塗，沒有地板、沒有影子、沒有漸層、${flags.props ? '除了該格指定的道具以外沒有其他道具和場景' : '沒有任何道具和場景'}；角色身上不要有綠色反光。
不要任何文字、編號、框線、對話泡泡、表情符號。
風格：跟參考圖一樣的卡通動畫質感（乾淨的深色描邊、柔和的賽璐璐上色），均勻的正面打光，色彩飽和、乾淨。

九格的內容（由左到右、由上到下）：
${list}
`
} else {
  const n = pos[1]
  if (!/^\d+$/.test(n ?? '')) fail('道具表要給第幾張（數字）')
  name = `props-${n}`
  outDir = PROP_DIR
  ref = path.join(HERO_DIR, 'pig-A.png')
  prompt = `請用你的生圖工具（image generation）產生一張圖，存成目前資料夾的 ${name}.png，然後只回報檔案路徑與圖片尺寸。不要寫程式畫圖、不要用其他方式合成，一定要用生圖工具；解析度選最大的正方形。

圖的內容：兒童動畫用的道具圖表。我附上的參考圖只用來對齊畫風（同樣乾淨的深色描邊、柔和的賽璐璐上色、飽和乾淨的顏色），不要畫出參考圖裡的角色。

版面：一張正方形圖，3×3 九宮格，共 9 個動物或道具，每格一個，置中、盡量畫大。格與格之間留白，東西不可以超出自己的格子，也不可以互相碰到。每個都要完整入鏡、一眼認得出是什麼。

背景：整張圖是純洋紅色（#FF00FF）平塗，沒有地板、沒有影子、沒有漸層；東西身上不要有洋紅色反光，也不要用洋紅色或桃紅色。
不要任何文字、編號、框線、人物、手。動物是可愛的卡通造型、全身入鏡、身體朝向畫面左前方。均勻的正面打光。

九格的內容（由左到右、由上到下）：
${list}
`
}

const out = path.join(outDir, `${name}.png`)
if (fs.existsSync(out) && !flags.force) fail(`${out} 已經有了。要重生就加 --force（會蓋掉）`)

// Codex 在一個空的暫存資料夾裡生，生好才搬進 assets/，失敗不會留半張圖
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-sheet-'))
console.log(`請 Codex 生 ${name}.png（約 1～2 分鐘）⋯⋯`)
const r = spawnSync('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', work, '-i', ref, '-'], { input: prompt, encoding: 'utf8' })
const made = path.join(work, `${name}.png`)
if (r.status !== 0 || !fs.existsSync(made)) {
  fs.rmSync(work, { recursive: true, force: true })
  fail(`沒有生出來（codex 結束碼 ${r.status}）。最後的輸出：\n${(r.stdout || '').split('\n').slice(-8).join('\n')}\n${(r.stderr || '').split('\n').slice(-4).join('\n')}`)
}
fs.copyFileSync(made, out)
fs.rmSync(work, { recursive: true, force: true })
console.log(`生好了：${out}`)
console.log('下一步：打開看過九格都對，再把這張表加進 .cut.json 去切（見 assets/ 底下的 README）。')
