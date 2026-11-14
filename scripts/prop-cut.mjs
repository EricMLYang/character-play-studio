// 道具圖（從九宮格道具表切）：沒有合適 emoji 的東西（楊桃、打開的禮物、三節的捷運、冷氣機…）請生圖模型畫成 3×3 道具表，
// 去背、切格、每格各自撐滿，輸出 public/props/<名字>.png，劇本寫 emoji: 'prop:<名字>'。
//
//   npm run prop:cut                     # 照 src/anim/props/*.cut.json 重切全部道具表
//   npm run prop:cut -- props-1          # 只切這一張
//   npm run prop:cut -- props-1 --src <資料夾>   # 道具表放在別處（預設 assets/prop-sheets/）
//   npm run prop:cut -- props-1 --out <資料夾>   # 輸出到別處（試新表、對照用，不進 public/、不改 src/anim/props.ts）
//
// 設定 src/anim/props/<表>.cut.json：
//   file（道具表檔名）、key（背景色，預設 #FF00FF 洋紅）、grid [欄, 列]（預設 3×3）、
//   props（照「左到右、上到下」每格的名字，null 跳過）、flip（要左右翻的名字）、speck（比這小的零星色塊當雜點清掉，預設 40 像素）、
//   together（同一隻動物的幾個狀態，例如 [["bear", "bear-sleep", "bear-roar"]]：一組共用一個放大倍數，swap 時大小才一致）
// 切完會重新產生 src/anim/props.ts（每張道具圖的內容範圍，引擎算擋字、頭頂、影子用），
// public/props/ 裡設定已經沒有的圖會清掉。
// 道具表怎麼來、版面規則、生圖的 prompt：assets/prop-sheets/README.md。
// 去背、切格跟主角姿勢表（hero-cut）同一套：scripts/sheet_cut.py。需要 uv tool install 'rembg[cpu,cli]'（只借它的 numpy、Pillow）。
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const cfgDir = join(root, 'src/anim/props')
const args = process.argv.slice(2)
let srcRoot = join(root, 'assets/prop-sheets')
let outDir = ''
const rest = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src') srcRoot = args[++i] ?? ''
  else if (args[i] === '--out') outDir = args[++i] ?? ''
  else rest.push(args[i])
}

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

const all = readdirSync(cfgDir).filter((f) => f.endsWith('.cut.json')).map((f) => f.slice(0, -'.cut.json'.length)).sort()
const sheets = rest.length ? rest : all
for (const s of sheets) if (!all.includes(s)) fail(`找不到設定 src/anim/props/${s}.cut.json`)
if (spawnSync('which', ['uv']).status !== 0) fail(`找不到 uv。先裝：uv tool install 'rembg[cpu,cli]'`)
srcRoot = resolve(srcRoot)
const out = outDir ? resolve(outDir) : join(root, 'public/props')
const tmp = mkdtempSync(join(tmpdir(), 'prop-cut-'))
const boxesPath = join(tmp, 'boxes.json')

// 同一個名字不能出現在兩張表裡（後切的會蓋掉先切的）
const owner = new Map()
for (const s of all) {
  for (const name of JSON.parse(readFileSync(join(cfgDir, `${s}.cut.json`), 'utf8')).props.filter(Boolean)) {
    if (owner.has(name)) fail(`道具「${name}」同時在 ${owner.get(name)} 與 ${s} 裡，改一個名字`)
    owner.set(name, s)
  }
}

try {
  for (const s of sheets) {
    const cfgPath = join(cfgDir, `${s}.cut.json`)
    const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
    if (!existsSync(join(srcRoot, cfg.file))) fail(`${srcRoot} 裡沒有道具表 ${cfg.file}（不在預設的 assets/prop-sheets/ 就用 --src 指過去）`)
    console.log(`${s}（${cfg.file}）：`)
    execFileSync('uv', ['tool', 'run', '--from', 'rembg[cpu,cli]', 'python', join(root, 'scripts/prop-cut.py'), cfgPath, srcRoot, out, boxesPath], { stdio: 'inherit', env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } })
  }
  if (!outDir) {
    // 清掉設定裡已經沒有的道具，再產生範圍表（只留設定裡有的）
    for (const f of readdirSync(out)) if (f.endsWith('.png') && !owner.has(f.slice(0, -4))) rmSync(join(out, f))
    const boxes = JSON.parse(readFileSync(boxesPath, 'utf8'))
    const kept = Object.fromEntries(Object.entries(boxes).filter(([name]) => owner.has(name) && existsSync(join(out, `${name}.png`))))
    writeFileSync(join(root, 'src/anim/props.ts'),
      '// 由 scripts/prop-cut.mjs 產生，不要手改。每張道具圖（public/props/<名字>.png，512×512）的內容範圍：\n' +
      '// [左, 上, 右, 下]，是畫布的幾分之幾。引擎靠它算寬扁、細高的道具實際佔多大（擋字、頭頂、影子、自動取景）。\n' +
      `export const PROP_BOX: Record<string, readonly [number, number, number, number]> = {\n${Object.entries(kept).map(([k, v]) => `  '${k}': [${v.join(', ')}],`).join('\n')}\n}\n`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
const made = readdirSync(out).filter((f) => f.endsWith('.png')).length
const shown = relative(root, out).startsWith('..') ? out : relative(root, out)
console.log(`道具：${made} 張 → ${shown}/${outDir ? '' : '（範圍表 src/anim/props.ts）'}`)
