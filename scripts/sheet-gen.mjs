// 請 Codex 的生圖工具畫一張九宮格（主角姿勢表或道具表），直接存進 assets/。
//
// 為什麼要這支：生圖的 prompt 原本只放在暫存資料夾，被清檔時一起清掉過一次（2026-11-15）。
// 版面規則是切圖腳本的前提（純色底、3×3、格與格留白），所以前言固定寫在這裡，每次只給九格的清單。
//
//   npm run sheet:gen -- hero sheriff G scripts/sheets/sheriff-G.txt   主角：<id> <表的代號> <九格清單檔>
//   npm run sheet:gen -- hero dino A scripts/sheets/hero-A.txt --new --look "……"   全新角色的第一張表
//   npm run sheet:gen -- prop 9 scripts/sheets/props-9.txt             道具：<第幾張> <九格清單檔>
//   npm run sheet:gen -- hero cat A scripts/sheets/hero-A.txt --from 上傳.png --look-out look.txt
//     以一張圖裡的主角當新角色（Studio 的「角色九宮格 → 上傳圖片做新角色」走這條）：
//     附兩張圖給 Codex——上傳的圖決定長相、豬探長的 A 表只對齊畫風與版面；沒給 --look 就請 Codex 順便寫一句角色描述存到 --look-out
//
// 角色本身是綠色的（例如小恐龍）不能用綠幕——身體會被當成背景去掉一半：加 --magenta 改洋紅底，
// 並在 .cut.json 那張表寫 "key": "#FF00FF"。
// 九格清單檔：一行一格、共 9 行（「1. 」開頭的編號可有可無）。主角表若有某幾格需要道具，加 --props。
// 主角的角色描述寫在 src/anim/heroes/<id>.cut.json 的 look（沒有就用 --look "……" 帶）；
// 參考圖用 assets/hero-sheets/<id>-A.png（道具表用 pig-A.png 對齊畫風）。
// 生好只是原圖：要自己打開看過（九格都對、沒有互相碰到、底色乾淨），再照兩份 README 加進 .cut.json 去切。
//
// 會連網（Codex）。送出去的只有 prompt 文字與參考圖（assets/ 裡的表；--from 時再加上那張上傳的圖）。
// --from 的圖是家長在 Studio 自己選的、按了「同意送出」才會走到這裡；真人照片也會照樣送出，Studio 上有寫。
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
const flags = { props: false, look: '', force: false, isNew: false, magenta: false, from: '', lookOut: '' }
const pos = []
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--props') flags.props = true
  else if (argv[i] === '--force') flags.force = true
  else if (argv[i] === '--new') flags.isNew = true
  else if (argv[i] === '--magenta') flags.magenta = true
  else if (argv[i] === '--look') flags.look = argv[++i] ?? ''
  else if (argv[i] === '--from') flags.from = argv[++i] ?? ''
  else if (argv[i] === '--look-out') flags.lookOut = argv[++i] ?? ''
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
/** 除了 ref 以外還要附給 Codex 的圖（--from 那張放最前面，prompt 裡叫它「第一張圖」） */
let extraRefs = []
if (kind === 'hero') {
  const [, id, tag] = pos
  if (!id || !tag) fail('主角表要給 <id> 與 <表的代號>（A、B、C…）')
  name = `${id}-${tag}`
  outDir = HERO_DIR
  if (flags.from && !fs.existsSync(flags.from)) fail(`找不到 --from 的圖：${flags.from}`)
  if (flags.from && !flags.look && !flags.lookOut) fail('--from 沒給 --look 時要給 --look-out，Codex 寫的角色描述才有地方存')
  // 新角色的第一張表（--new 或 --from）：還沒有自己的參考圖，拿豬探長的 A 表只對齊畫風
  ref = path.join(HERO_DIR, flags.isNew || flags.from ? 'pig-A.png' : `${id}-A.png`)
  if (!fs.existsSync(ref)) fail(`找不到參考圖 ${ref}（新角色的第一張表加 --new --look "……"）`)
  if (flags.from) extraRefs = [path.resolve(flags.from)]
  const cutFile = path.join(ROOT, 'src/anim/heroes', `${id}.cut.json`)
  const look = flags.look || (fs.existsSync(cutFile) ? JSON.parse(fs.readFileSync(cutFile, 'utf8')).look : '')
  if (!look && !flags.from) fail(`沒有角色描述：在 ${cutFile} 加 "look"，或用 --look "……" 帶`)
  const fromLook = flags.look ? `角色：${look}` : `另外把這個角色的長相寫成一句繁體中文，存成目前資料夾的 look.txt：格式是「名字——長相」（名字取一個小朋友會叫的暱稱，例如「小黃狗」；長相寫顏色、服裝、配件與 Q 版比例，像「小狐狸——橘色的小狐狸男孩，白色的臉頰與肚子、脖子圍一條藍色圍巾，用兩隻腳站立，大頭小身體的 Q 版比例。」）。`
  prompt = `請用你的生圖工具（image generation）產生一張圖，存成目前資料夾的 ${name}.png，然後只回報檔案路徑與圖片尺寸。不要寫程式畫圖、不要用其他方式合成，一定要用生圖工具；解析度選最大的正方形。

${flags.from
    ? `圖的內容：把我附上的第一張圖裡的主角，畫成卡通角色的姿勢表。長相照第一張圖：保留牠的顏色、花紋、服裝、配件和一眼認得出的特徵；如果第一張是照片，就把主角畫成可愛的 Q 版卡通角色，不要寫實。第二張圖只用來對齊畫風與版面（同樣的描邊、上色、頭身比例、九宮格排法），不要畫出第二張圖裡的角色。${fromLook}`
    : flags.isNew
    ? `圖的內容：一個全新的原創卡通角色的姿勢表。我附上的參考圖只用來對齊畫風與版面（同樣的描邊、上色、頭身比例、九宮格排法），不要畫出參考圖裡的角色，也不要畫成任何現有動畫、遊戲、繪本裡的角色。新角色：${look}`
    : `圖的內容：依照我附上的參考圖（同一個角色的姿勢表），畫出同一個角色的另一張姿勢表。角色：${look}`}

版面：一張正方形圖，3×3 九宮格，共 9 個姿勢，每格一個。格與格之間留白，角色不可以超出自己的格子，也不可以互相碰到。

每一格都要：
- 全身入鏡，從頭頂到腳底都看得到，不能被裁切
- 同樣的身高、同樣的頭身比例、同樣的服裝與配色，${flags.isNew || flags.from ? '九格是同一個角色' : '跟參考圖是同一個角色'}
- 腳站在同一條水平線上（跳起來、坐著、趴著的那幾格例外）
- 身體朝向畫面左前方（四分之三側面），臉看得清楚
- 表情和動作誇張、一眼看得懂，像默劇演員

背景：整張圖是${flags.magenta ? '純洋紅色（#FF00FF）' : '純綠色（#00FF00）'}平塗，沒有地板、沒有影子、沒有漸層、${flags.props ? '除了該格指定的道具以外沒有其他道具和場景' : '沒有任何道具和場景'}；角色身上不要有${flags.magenta ? '洋紅色反光，也不要用洋紅色或桃紅色' : '綠色反光'}。
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
const images = [...extraRefs, ref].flatMap((f) => ['-i', f])
const r = spawnSync('codex', ['exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', work, ...images, '-'], { input: prompt, encoding: 'utf8' })
const made = path.join(work, `${name}.png`)
if (r.status !== 0 || !fs.existsSync(made)) {
  fs.rmSync(work, { recursive: true, force: true })
  fail(`沒有生出來（codex 結束碼 ${r.status}）。最後的輸出：\n${(r.stdout || '').split('\n').slice(-8).join('\n')}\n${(r.stderr || '').split('\n').slice(-4).join('\n')}`)
}
fs.copyFileSync(made, out)
if (flags.lookOut) {
  const lookFile = path.join(work, 'look.txt')
  const written = fs.existsSync(lookFile) ? fs.readFileSync(lookFile, 'utf8').trim().split('\n')[0].trim() : ''
  fs.writeFileSync(flags.lookOut, (flags.look || written) + '\n')
  if (!flags.look && !written) console.warn('Codex 沒寫 look.txt：角色描述要自己補')
}
fs.rmSync(work, { recursive: true, force: true })
console.log(`生好了：${out}`)
console.log('下一步：打開看過九格都對，再把這張表加進 .cut.json 去切（見 assets/ 底下的 README）。')
