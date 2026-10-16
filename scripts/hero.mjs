// 主角圖：用本機的開源模型生出「固定造型」的主角（每個姿勢一張 PNG），讓同一個角色能在很多集裡出現。
//
//   npm run hero                 # 補做所有主角缺的姿勢
//   npm run hero -- yang         # 只做這個主角
//   npm run hero -- yang dizzy   # 重做這個姿勢（想換結果就改 json 裡的 seed）
//
// 設定在 src/anim/heroes/<主角>.json：look（長相，所有姿勢共用，改了要全部重做）、style、seed、poses
// （每個姿勢一句英文，或 { text, seed } 只替這個姿勢換 seed）。
// 流程：Z-Image Turbo（Apache 2.0，mflux 在 Apple Silicon 本機跑）生 768×768 → rembg 去背 →
// scripts/hero-trim.py 裁到人物、所有姿勢同一個比例、底部對齊 → public/hero/<主角>/<姿勢>.png。
// 劇本裡用 emoji: 'hero:<主角>/<姿勢>'，換姿勢用 swap。
//
// 需要先裝：uv tool install mflux && uv tool install 'rembg[cpu,cli]'。
// 第一次跑會下載模型（約 33 GB）並存一份 4-bit 量化版到 ~/.cache/mflux/z-image-turbo-q4（約 8 GB）；
// 全精度模型 28 GB 在 32 GB 的 Mac 會狂 swap，之後每張圖都從量化版載入，幾十秒一張。
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const heroDir = join(root, 'src/anim/heroes')
const outRoot = join(root, 'public/hero')
const MODEL = process.env.CPS_HERO_MODEL || join(homedir(), '.cache/mflux/z-image-turbo-q4')
const [onlyHero, onlyPose] = process.argv.slice(2)

for (const tool of ['mflux-generate-z-image-turbo', 'mflux-save', 'rembg', 'uv']) {
  if (spawnSync('which', [tool]).status !== 0) {
    console.error(`找不到 ${tool}。先裝：uv tool install mflux && uv tool install 'rembg[cpu,cli]'`)
    process.exit(1)
  }
}

if (!existsSync(join(MODEL, 'transformer'))) {
  console.log(`第一次：下載 Z-Image Turbo 並存 4-bit 量化版到 ${MODEL}（要一陣子）…`)
  rmSync(MODEL, { recursive: true, force: true })
  execFileSync('mflux-save', ['--model', 'z-image-turbo', '--quantize', '4', '--path', MODEL], { stdio: ['ignore', 'ignore', 'inherit'] })
}

const heroes = readdirSync(heroDir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
for (const hero of heroes) {
  if (onlyHero && hero !== onlyHero) continue
  const cfg = JSON.parse(readFileSync(join(heroDir, `${hero}.json`), 'utf8'))
  const out = join(outRoot, hero)
  const work = join(out, '.work')
  mkdirSync(work, { recursive: true })
  let changed = false
  for (const [pose, spec] of Object.entries(cfg.poses)) {
    // 姿勢可以寫一句話，或 { text, seed }：某個姿勢畫壞了就只給它換 seed，其他不動
    const { text, seed } = typeof spec === 'string' ? { text: spec, seed: cfg.seed } : { seed: cfg.seed, ...spec }
    const cut = join(work, `${pose}.png`)
    const redo = onlyPose === pose
    // 去背失敗會留一個 0 byte 的檔，當作沒做
    if (existsSync(cut) && statSync(cut).size > 0 && !redo) continue
    console.log(`${cfg.name}（${hero}）：畫「${pose}」…`)
    const raw = join(work, `${pose}.raw.png`)
    const prompt = `${cfg.look}. ${text}. ${cfg.style}`
    execFileSync('mflux-generate-z-image-turbo', ['--model', MODEL, '--base-model', 'z-image-turbo', '--low-ram', '--prompt', prompt, '--seed', String(seed ?? 1),
      '--width', '768', '--height', '768', '--steps', String(cfg.steps ?? 8), '--no-exif', '--output', raw], { stdio: ['ignore', 'ignore', 'inherit'] })
    execFileSync('rembg', ['i', '-m', cfg.cutout ?? 'isnet-general-use', raw, cut], { stdio: ['ignore', 'ignore', 'inherit'] })
    if (!statSync(cut).size) throw new Error(`rembg 去背「${pose}」失敗（輸出是空的）`)
    rmSync(raw, { force: true })
    changed = true
  }
  // 裁切要整批做：所有姿勢用同一個比例，角色才不會換個姿勢就變大變小
  const stale = Object.keys(cfg.poses).some((p) => !existsSync(join(out, `${p}.png`)))
  if (changed || stale) {
    execFileSync('uv', ['tool', 'run', '--from', 'rembg[cpu,cli]', 'python', join(root, 'scripts/hero-trim.py'), work, out, ...Object.keys(cfg.poses)], { stdio: 'inherit' })
    console.log(`${cfg.name}：${Object.keys(cfg.poses).length} 個姿勢 → public/hero/${hero}/`)
  } else console.log(`${cfg.name}（${hero}）：都做好了`)
  // 清掉設定裡已經拿掉的姿勢
  for (const f of readdirSync(out)) if (f.endsWith('.png') && !(f.slice(0, -4) in cfg.poses)) rmSync(join(out, f))
}
