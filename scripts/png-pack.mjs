// 把已經在的動畫圖資料夾重壓成 256 色的調色盤 PNG（npm run hero:cut、prop:cut 切出來的本來就是壓過的，這支給舊圖、手動放進來的圖用）。
//
//   npm run png:pack -- public/hero          # 整個資料夾（含子資料夾；.work/ 這種中間產物不碰）
//   npm run png:pack -- public/props public/hero/robot/idle.png
//
// 已經是調色盤 PNG（壓過的）就跳過，重跑不會越壓越糊。做法、參數、為什麼：scripts/png_pack.py。
// public/emoji3d/（3D emoji，大面積漸層）不要壓：減色放大看得到顆粒。
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { needUv, PY, PY_ENV } from './py-env.mjs'

const root = new URL('..', import.meta.url).pathname
const targets = process.argv.slice(2)
if (!targets.length) {
  console.error('用法：npm run png:pack -- <資料夾或檔案...>（例如 public/hero public/props）')
  process.exit(1)
}
for (const t of targets) {
  if (!existsSync(t)) { console.error(`找不到 ${t}`); process.exit(1) }
  if (resolve(t).includes('/emoji3d')) { console.error(`${t}：3D emoji 是漸層，減色會出顆粒，不壓（見 scripts/png_pack.py）`); process.exit(1) }
}
needUv()
execFileSync('uv', [...PY, join(root, 'scripts/png_pack.py'), ...targets.map((t) => relative(root, resolve(t))).map((t) => (t.startsWith('..') ? resolve(root, t) : t))], { stdio: 'inherit', env: PY_ENV, cwd: root })
