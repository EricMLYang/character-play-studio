// 打包 iPad 單機版的內容到 dist-app/（docs/ipad-app-plan.md 第一階段）。
//
//   npm run app:build            # 帶現在的 data/progress.json 當第一次安裝的起點
//   npm run app:build -- --empty # 不帶紀錄（全新的孩子）
//
// 做的事：
// 1. vite build --mode app：只有孩子端，沒有 Studio，加上內容安全政策
// 2. 字庫快照 dist-app/library.json：只有開放給孩子的字、已上架的素材（server/app-bundle.mjs）
// 3. 只複製快照用到的影片／圖片到 dist-app/media/（不是整個 media/，那裡有草稿與停用版）
// 4. 檢查：每支影片是 iPad 播得動的編碼、打包出來的程式沒有對外網址
//
// 只讀 data/ 與 media/，不會寫進任何紀錄。
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { build } from 'vite'
import { ROOT, DATA, MEDIA, readJSON } from '../server/core.mjs'
import { loadParts } from '../server/char-assets.mjs'
import { loadProgress, PROGRESS_VERSION } from '../server/progress.mjs'
import { buildSnapshot, externalUrls, PLAYABLE_VIDEO } from '../server/app-bundle.mjs'

const OUT = path.join(ROOT, 'dist-app')
const empty = process.argv.includes('--empty')
const fail = (message) => { console.error(`\n✗ ${message}`); process.exit(1) }

const db = readJSON(path.join(DATA, 'characters.json'), { characters: [] })
const progress = empty ? { version: PROGRESS_VERSION, watched: {} } : loadProgress()
const { snapshot, mediaFiles } = buildSnapshot({ characters: db.characters, parts: loadParts(), progress })

// 先檢查素材，有問題就不必白跑 vite
const missing = mediaFiles.filter((file) => !fs.existsSync(path.join(MEDIA, file)))
if (missing.length) fail(`上架素材找不到檔案：${missing.join('、')}`)
const videoCodec = (file) => {
  try {
    return execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim()
  } catch (error) {
    if (error.code === 'ENOENT') fail('需要 ffprobe 檢查影片編碼：brew install ffmpeg')
    return '讀不出來'
  }
}
const badVideos = mediaFiles.filter((file) => /\.(mp4|mov|webm)$/i.test(file))
  .map((file) => [file, videoCodec(path.join(MEDIA, file))]).filter(([, codec]) => !PLAYABLE_VIDEO.includes(codec))
if (badVideos.length) fail(`這些影片 iPad 播不動（要 ${PLAYABLE_VIDEO.join('／')}）：\n${badVideos.map(([f, c]) => `  ${f}：${c}`).join('\n')}`)

await build({ root: ROOT, mode: 'app', logLevel: 'warn' })

fs.writeFileSync(path.join(OUT, 'library.json'), JSON.stringify(snapshot))
fs.mkdirSync(path.join(OUT, 'media'), { recursive: true })
for (const file of mediaFiles) fs.copyFileSync(path.join(MEDIA, file), path.join(OUT, 'media', file))

const assets = path.join(OUT, 'assets')
const leaks = fs.readdirSync(assets).filter((f) => f.endsWith('.js'))
  .flatMap((f) => externalUrls(fs.readFileSync(path.join(assets, f), 'utf8')).map((url) => `${f}：${url}`))
if (leaks.length) fail(`打包出來的程式裡有對外網址（App 不該連網）：\n  ${leaks.join('\n  ')}`)
if (!fs.readFileSync(path.join(OUT, 'index.html'), 'utf8').includes('Content-Security-Policy')) fail('index.html 少了內容安全政策')

const size = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .reduce((sum, d) => sum + (d.isDirectory() ? size(path.join(dir, d.name)) : fs.statSync(path.join(dir, d.name)).size), 0)
const mb = (n) => `${(n / 1e6).toFixed(0)} MB`
console.log(`✓ dist-app/ 打包完成，共 ${mb(size(OUT))}`)
console.log(`  字 ${snapshot.characters.length} 個、素材 ${mediaFiles.length} 個（${mb(size(path.join(OUT, 'media')))}）`)
console.log(`  第一次安裝的起點：${empty ? '沒有紀錄（全新的孩子）' : `data/progress.json（看過 ${Object.keys(progress.watched || {}).length} 個字）`}`)
