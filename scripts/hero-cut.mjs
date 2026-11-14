// 主角圖（從綠幕姿勢表切）：生圖模型畫好的 3×3 姿勢表（純綠底、每格一個姿勢），去背、切格、排成主角的姿勢圖。
// 一張表九個姿勢是同一次畫的，長相、比例、上色都一致；比 scripts/hero.mjs（本機模型一張一張畫）穩定得多。
// 輸出一樣是 public/hero/<主角>/<姿勢>.png，劇本照樣寫 'hero:<主角>/<姿勢>'。
//
//   npm run hero:cut -- pig                     # 照 src/anim/heroes/pig.cut.json 重切豬探長的所有姿勢（比例要整批算，一律整批重做）
//   npm run hero:cut -- pig --src <資料夾>        # 姿勢表放在別處（預設 assets/hero-sheets/）；也可以用 CPS_HERO_SRC
//   npm run hero:cut -- pig --out <資料夾>        # 輸出到別處（試新表、對照用，不進 public/）
//
// 設定 src/anim/heroes/<主角>.cut.json：
//   ref：比例的基準姿勢（站姿）。它的身高剛好佔滿畫布，其他姿勢（坐著、跳起來、趴著）都用同一個係數，不各自撐滿
//   flip：整套要不要左右翻（姿勢表本來就畫朝左，通常不用）
//   sheets.<名字>：file（姿勢表檔名）、grid [欄, 列]（預設 3×3）、poses（照「左到右、上到下」每格的姿勢名，null 跳過）、
//     scale（這張表裡角色相對 ref 那張的大小，預設 1）、optional（還沒生出來也沒關係：先跳過並列出缺哪幾個）、flip
//   fallback：{ 姿勢: 頂替的姿勢 }，optional 的表還沒到時先借別張頂著，劇本才不會指到不存在的圖
//   alias：{ 姿勢: 同一張的姿勢 }，同一張圖再多一個名字（花生、小老鼠沒有放大鏡，think 就用托下巴的 ponder），各主角的姿勢名才一致
// 姿勢表怎麼來、版面規則、生圖的 prompt：assets/hero-sheets/README.md。
// 中間不產生暫存檔；需要 uv tool install 'rembg[cpu,cli]'（只借它的 Python 環境：numpy、Pillow）。
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const args = process.argv.slice(2)
let srcRoot = process.env.CPS_HERO_SRC || join(root, 'assets/hero-sheets')
let outDir = ''
const rest = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src') srcRoot = args[++i] ?? ''
  else if (args[i] === '--out') outDir = args[++i] ?? ''
  else rest.push(args[i])
}
const [hero] = rest

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

if (!hero) fail('用法：npm run hero:cut -- <主角> [--src <姿勢表資料夾>] [--out <輸出資料夾>]')
const cfgPath = join(root, 'src/anim/heroes', `${hero}.cut.json`)
if (!existsSync(cfgPath)) fail(`找不到設定 src/anim/heroes/${hero}.cut.json`)
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
srcRoot = resolve(srcRoot)

// 非 optional 的表缺一張就不做，不產生半套的圖
const missing = Object.entries(cfg.sheets).filter(([, s]) => !s.optional && !existsSync(join(srcRoot, s.file)))
if (missing.length) fail(`${srcRoot} 裡缺這些姿勢表：\n${missing.map(([k, s]) => `  ${k}：${s.file}`).join('\n')}\n（不在預設的 assets/hero-sheets/ 就用 --src 指過去）`)
if (spawnSync('which', ['uv']).status !== 0) fail(`找不到 uv。先裝：uv tool install 'rembg[cpu,cli]'`)

const out = outDir ? resolve(outDir) : join(root, 'public/hero', hero)
execFileSync('uv', ['tool', 'run', '--from', 'rembg[cpu,cli]', 'python', join(root, 'scripts/hero-cut.py'), cfgPath, srcRoot, out], { stdio: 'inherit' })
// 清掉設定裡已經沒有的姿勢（例如舊畫風留下的圖）
const names = new Set([...Object.values(cfg.sheets).flatMap((s) => s.poses.filter(Boolean)), ...Object.keys(cfg.fallback ?? {}), ...Object.keys(cfg.alias ?? {})])
for (const f of readdirSync(out)) if (f.endsWith('.png') && !names.has(f.slice(0, -4))) rmSync(join(out, f))
const made = readdirSync(out).filter((f) => f.endsWith('.png')).length
const shown = relative(root, out).startsWith('..') ? out : relative(root, out)
console.log(`${cfg.name ?? hero}：${made} 個姿勢 → ${shown}/`)
