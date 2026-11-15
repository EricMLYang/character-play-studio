// 切圖、壓圖的 Python 共用同一個環境：借 rembg 的 uv 工具環境（numpy、Pillow），再加上壓 PNG 用的 imagequant（libimagequant，pngquant 的核心）。
// imagequant 釘版本：換版本減色結果可能差幾個像素，同一張原圖重跑才會逐 byte 相同。第一次跑 uv 會自己下載（之後用快取）。
// 只在開發機上用，不會進 App。
import { spawnSync } from 'node:child_process'

export const PY = ['tool', 'run', '--from', 'rembg[cpu,cli]', '--with', 'imagequant==1.1.6', 'python']
export const PY_ENV = { ...process.env, PYTHONDONTWRITEBYTECODE: '1' }

export function needUv() {
  if (spawnSync('which', ['uv']).status === 0) return
  console.error(`找不到 uv。先裝：uv tool install 'rembg[cpu,cli]'`)
  process.exit(1)
}
