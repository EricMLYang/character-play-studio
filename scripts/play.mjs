// 試玩孩子端，但不碰孩子的紀錄。
//
// 為什麼要這個：直接開 npm run dev 玩，每看完一支影片、每答對一題都會寫進
// data/progress.json——那是孩子真的學習紀錄。（2026-10-19 就這樣被灌進 124 個字。）
// 擋 fetch 沒用：孩子端送不出去的紀錄會留在瀏覽器暫存，下次任何一次開頁都會補送。
//
// 這支把儲存根目錄換成暫存資料夾（CPS_STORAGE_ROOT），裡面放一份複製的字庫與進度：
// 影片、筆順、音檔用 symlink 指回真的那一份（讀得到真的內容），
// 但所有寫入都只進暫存資料夾，Ctrl+C 之後整個刪掉。
//
// 所以 Studio 在這裡什麼都存不下來：伺服器會擋掉 Studio 的寫入、頂上掛紅條（server/sandbox.mjs）。
// 2026-11-14 有 agent 把它開在背景沒關，爸爸在 5199 的 Studio 上架了 21 支影片，紀錄全進了暫存（#298）。
// 也因為這樣，沒人用就自己關：IDLE_MIN 分鐘（預設 60）沒有任何請求就收掉。
//
//   npm run play           → http://127.0.0.1:5199/
//   npm run play -- --empty  全新的孩子（一筆紀錄都沒有），測第一次打開的樣子
//
// 跟 npm run dev:test 的差別：那支是給 Studio 用的，字庫會被清成沒有影片、沒有 prompt；
// 這支要的是「跟孩子看到的一模一樣」，所以字庫與進度都照抄。
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const empty = process.argv.includes('--empty')
const port = Number(process.env.PORT || 5199)

const idleMinutes = Number(process.env.IDLE_MIN || 60)

const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-play-'))
process.env.CPS_STORAGE_ROOT = storage
process.env.CPS_SANDBOX = 'play'
fs.mkdirSync(path.join(storage, 'data'), { recursive: true })
fs.mkdirSync(path.join(storage, 'public'), { recursive: true })

for (const name of ['characters.json', 'parts.json', 'prompt-template.json']) {
  fs.copyFileSync(path.join(ROOT, 'data', name), path.join(storage, 'data', name))
}
fs.cpSync(path.join(ROOT, 'data/prompts'), path.join(storage, 'data/prompts'), { recursive: true })
if (empty) fs.writeFileSync(path.join(storage, 'data/progress.json'), JSON.stringify({ version: 2, watched: {} }, null, 2) + '\n')
else fs.copyFileSync(path.join(ROOT, 'data/progress.json'), path.join(storage, 'data/progress.json'))

// 影片、筆順、音檔都讀真的那一份（這些不會被孩子端寫壞；缺的音檔補進去本來就是我們要的）
for (const rel of ['media', 'public/strokes', 'public/voice']) {
  const from = path.join(ROOT, rel)
  if (fs.existsSync(from)) fs.symlinkSync(from, path.join(storage, rel))
}

const server = await createServer({
  configFile: path.join(ROOT, 'vite.config.ts'),
  root: ROOT,
  server: { host: '127.0.0.1', port, strictPort: true, open: false },
})
let lastRequest = Date.now()
server.httpServer?.on('request', () => { lastRequest = Date.now() })
await server.listen()
console.log(`試玩：http://127.0.0.1:${port}/${empty ? '（全新的孩子）' : '（複製了現在的紀錄）'}`)
console.log(`怎麼玩都不會碰到 data/progress.json。暫存：${storage}`)
console.log(`Studio 在這裡存不下來（上架請用 5180）；${idleMinutes} 分鐘沒人用會自己關。`)

const shutdown = async () => {
  await server.close()
  fs.rmSync(storage, { recursive: true, force: true })
  process.exit(0)
}
const idle = setInterval(() => {
  if (Date.now() - lastRequest < idleMinutes * 60_000) return
  clearInterval(idle)
  console.log(`${idleMinutes} 分鐘沒人用，試玩伺服器自己關掉了。`)
  shutdown()
}, 60_000)
idle.unref()
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
