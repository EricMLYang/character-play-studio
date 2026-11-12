// 動畫短片「看得見成品」：用本機的 Google Chrome 在背景開真正的試播頁，逐格截圖。
//
// 為什麼要這個：寫劇本的人看不到整支成品——Chrome 分頁在背景時 rAF 不跑，只能一格一格手動定格截圖。
// 這支不另寫一套畫法，開的就是 /anim 試播頁（AnimPlayer 怎麼畫，截到的就是什麼），之後播放器換畫法照樣能用。
//
//   npm run anim:shot -- 哭                 整支每 0.25 秒一格，排成縮圖總覽（太多格就分成幾張）
//   npm run anim:shot -- 哭 丟 晚            一次好幾個字
//   npm run anim:shot -- 哭 --from 3 --to 5 --step 0.05   只細看一段
//   npm run anim:shot -- 哭 --mp4            另外輸出一支 30fps 的無聲 mp4
//   npm run anim:shot -- 哭 --tag before     檔名帶上 tag（改前／改後各輸出一份來比）
//   npm run anim:shot -- 晚 --old --tag old  拍重做前的舊版（src/anim/clips-old/晚.ts，試播頁的 ?v=old）
//   npm run anim:shot -- --story cold        故事屋的一本故事：每一段戲各出一張總覽（src/story/scenes/cold.ts）
//   npm run anim:shot -- --story cold/warm:火  只拍其中一段
//
// 其他參數：--out <資料夾>（預設 .anim-shots/，已 .gitignore）、--width <每格寬，預設 640>、
// --cols <每列幾格，預設 3>、--rows <每張幾列，預設 5>、--fps <mp4 的格數，預設 30>、--mp4-width <預設 960>
//
// 不碰孩子的紀錄：跟 npm run play 一樣把儲存根目錄換成暫存資料夾（試播頁本來也不寫紀錄，這是第二道防線）。
// 不連外：Chrome 的 DNS 全部擋掉，只准連 127.0.0.1；控制 Chrome 用 Node 內建的 WebSocket 直接講 DevTools 協定，不用裝套件。
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const FFMPEG = fs.existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : 'ffmpeg'
// 舞台在試播頁上的寬度（CSS px）；截圖時再縮放成要的大小
const STAGE_W = 960

// ── 參數 ──────────────────────────────────────────────
const argv = process.argv.slice(2)
const opts = { step: 0.25, from: 0, to: null, mp4: false, old: false, story: '', out: path.join(ROOT, '.anim-shots'), tag: '', width: 640, cols: 3, rows: 5, fps: 30, mp4Width: 960 }
const chars = []
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  const val = () => { const v = argv[++i]; if (v === undefined) fail(`${a} 後面要接值`); return v }
  const num = () => { const v = Number(val()); if (!Number.isFinite(v)) fail(`${a} 要接數字`); return v }
  if (a === '--mp4') opts.mp4 = true
  else if (a === '--old') opts.old = true
  else if (a === '--story') opts.story = val()
  else if (a === '--step') opts.step = num()
  else if (a === '--from') opts.from = num()
  else if (a === '--to') opts.to = num()
  else if (a === '--out') opts.out = path.resolve(val())
  else if (a === '--tag') opts.tag = val().replace(/[^\w.\-一-鿿]/g, '_')
  else if (a === '--width') opts.width = num()
  else if (a === '--cols') opts.cols = num()
  else if (a === '--rows') opts.rows = num()
  else if (a === '--fps') opts.fps = num()
  else if (a === '--mp4-width') opts.mp4Width = num()
  else if (a.startsWith('--')) fail(`不認得的參數 ${a}`)
  else chars.push(...[...a].filter((c) => c.trim()))
}
// 故事的戲：要拍的「字」換成那本故事每一段戲的編號（讀的頁是頁 id，選項是「頁 id:字」）
const [storyId, onlyBeat] = opts.story ? [opts.story.split('/')[0], opts.story.split('/').slice(1).join('/')] : ['', '']
if (storyId) {
  const { storyById, beatsOf } = await import('../shared/stories.mjs')
  const story = storyById(storyId)
  if (!story) fail(`沒有這本故事：${storyId}`)
  const beats = beatsOf(story)
  if (onlyBeat && !beats.includes(onlyBeat)) fail(`${storyId} 沒有這段戲：${onlyBeat}（有：${beats.join('、')}）`)
  chars.length = 0
  chars.push(...(onlyBeat ? [onlyBeat] : beats))
}
if (!chars.length) fail('要給字，例如：npm run anim:shot -- 哭')
if (!(opts.step > 0)) fail('--step 要大於 0')
if (!fs.existsSync(CHROME)) fail(`找不到 Chrome：${CHROME}`)

function fail(msg) { console.error(`anim:shot：${msg}`); process.exit(1) }

// ── 隔離的儲存根目錄（同 scripts/play.mjs）──────────────────
const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'cps-shot-'))
process.env.CPS_STORAGE_ROOT = storage
fs.mkdirSync(path.join(storage, 'data'), { recursive: true })
fs.mkdirSync(path.join(storage, 'public'), { recursive: true })
for (const name of ['characters.json', 'parts.json', 'prompt-template.json', 'progress.json']) {
  const from = path.join(ROOT, 'data', name)
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(storage, 'data', name))
}
if (fs.existsSync(path.join(ROOT, 'data/prompts'))) fs.cpSync(path.join(ROOT, 'data/prompts'), path.join(storage, 'data/prompts'), { recursive: true })
for (const rel of ['media', 'public/strokes', 'public/voice']) {
  const from = path.join(ROOT, rel)
  if (fs.existsSync(from)) fs.symlinkSync(from, path.join(storage, rel))
}
const profile = path.join(storage, 'chrome-profile')

/** 頁面裡的錯誤（例外、console.error、抓不到的檔案）先記著，每個字截完印出來 */
const pageErrors = []
let server = null
let chrome = null
const cleanup = async () => {
  try { chrome?.kill('SIGKILL') } catch { /* 已經關了 */ }
  try { await server?.close() } catch { /* 已經關了 */ }
  fs.rmSync(storage, { recursive: true, force: true })
}
process.on('SIGINT', async () => { await cleanup(); process.exit(130) })

try {
  await main()
  await cleanup()
} catch (e) {
  console.error(`anim:shot：${e.message}`)
  await cleanup()
  process.exit(1)
}

async function main() {
  const port = await freePort()
  // hmr 關掉：截到一半有人存檔，頁面也不會被重新載入
  server = await createServer({
    configFile: path.join(ROOT, 'vite.config.ts'),
    root: ROOT,
    logLevel: 'warn',
    server: { host: '127.0.0.1', port, strictPort: true, open: false, hmr: false },
  })
  await server.listen()
  const base = `http://127.0.0.1:${port}`

  chrome = spawn(CHROME, [
    '--headless=new', `--user-data-dir=${profile}`, '--remote-debugging-port=0',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-sync',
    '--disable-background-networking', '--disable-component-update', '--disable-domain-reliability',
    '--disable-features=Translate,OptimizationHints,MediaRouter,AutofillServerCommunication',
    // 只准連本機：其他網址一律解析不到
    '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
    '--mute-audio', '--hide-scrollbars', '--force-color-profile=srgb', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] })
  const wsUrl = await new Promise((resolve, reject) => {
    let buf = ''
    const timer = setTimeout(() => reject(new Error('Chrome 沒有啟動（10 秒）')), 10000)
    chrome.stderr.on('data', (d) => {
      buf += d
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/)
      if (m) { clearTimeout(timer); resolve(m[1]) }
    })
    chrome.on('exit', (code) => reject(new Error(`Chrome 結束了（${code}）`)))
  })
  const cdp = await connect(wsUrl)

  // 拼圖用一頁空白頁（canvas 拼縮圖、寫秒數）
  const sheetPage = await cdp.page('about:blank')
  const page = await cdp.page('about:blank')
  await page.send('Emulation.setDeviceMetricsOverride', { width: STAGE_W + 40, height: 1400, deviceScaleFactor: 1, mobile: false })

  fs.mkdirSync(opts.out, { recursive: true })
  const outputs = []
  for (const char of chars) {
    const started = Date.now()
    pageErrors.length = 0
    if (opts.old && !fs.existsSync(path.join(ROOT, 'src/anim/clips-old', `${char}.ts`))) throw new Error(`${char}：沒有舊版（src/anim/clips-old/${char}.ts）`)
    const duration = await openClip(page, base, char)
    const from = Math.max(0, opts.from)
    const to = Math.min(duration, opts.to ?? duration)
    if (!(to >= from)) throw new Error(`${char}：--from/--to 範圍不對（劇本長 ${duration} 秒）`)
    const custom = opts.from !== 0 || opts.to !== null || opts.step !== 0.25
    const name = `${storyId ? `${storyId}-` : ''}${char.replace(':', '-')}${opts.tag ? `-${opts.tag}` : ''}${custom ? `-${fmt(from)}-${fmt(to)}s@${opts.step}` : ''}`

    // 縮圖總覽
    const times = []
    for (let i = 0; ; i++) {
      const tt = Math.round((from + i * opts.step) * 1e6) / 1e6
      if (tt > to + 1e-6) break
      times.push(tt)
    }
    const shots = []
    for (const tt of times) shots.push({ t: tt, data: await shoot(page, tt, opts.width, 'png') })
    const per = opts.cols * opts.rows
    const nSheets = Math.ceil(shots.length / per)
    for (const old of fs.readdirSync(opts.out)) {
      if (old === `${name}.png` || (old.startsWith(`${name}-`) && /^-\d+of\d+\.png$/.test(old.slice(name.length)))) fs.rmSync(path.join(opts.out, old))
    }
    for (let k = 0; k < nSheets; k++) {
      const part = shots.slice(k * per, (k + 1) * per)
      const title = `${char}${opts.tag ? `（${opts.tag}）` : ''}　${fmt(part[0].t)}–${fmt(part.at(-1).t)} 秒　每 ${opts.step} 秒一格　共 ${duration} 秒${nSheets > 1 ? `　第 ${k + 1}/${nSheets} 張` : ''}`
      const png = await stitch(sheetPage, part, title)
      const file = path.join(opts.out, nSheets > 1 ? `${name}-${k + 1}of${nSheets}.png` : `${name}.png`)
      fs.writeFileSync(file, png)
      outputs.push(file)
    }
    const sheetSec = (Date.now() - started) / 1000

    // mp4
    let mp4Sec = 0
    if (opts.mp4) {
      const t0 = Date.now()
      const file = path.join(opts.out, `${name}.mp4`)
      await video(page, from, to, file)
      outputs.push(file)
      mp4Sec = (Date.now() - t0) / 1000
    }
    for (const e of [...new Set(pageErrors)]) console.log(`  注意：${char} 的頁面有錯誤：${e}`)
    console.log(`${char}：${shots.length} 格、${nSheets} 張總覽 ${sheetSec.toFixed(1)} 秒${opts.mp4 ? `；mp4 ${mp4Sec.toFixed(1)} 秒` : ''}`)
  }
  cdp.close()
  for (const f of outputs) console.log(f)
}

// ── 試播頁 ──────────────────────────────────────────────

/** 開某個字的試播頁，等到筆順資料、掛鉤都好了，回傳劇本長度。 */
async function openClip(page, base, char) {
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.send('Page.navigate', { url: `${base}/anim?char=${encodeURIComponent(char)}&t=0${opts.old ? '&v=old' : ''}${storyId ? `&story=${encodeURIComponent(storyId)}` : ''}` })
    // 剛導覽時舊頁面的環境可能還在、或正好被換掉，所以從 Node 這邊一次一次問
    let ok = null
    const until = Date.now() + 20000
    while (ok === null && Date.now() < until) {
      await new Promise((r) => setTimeout(r, 100))
      ok = await page.eval(`(() => {
        const svg = document.querySelector('svg.anim-stage')
        return window.__animSeek && svg && svg.hasAttribute('data-ready') ? svg.getAttribute('aria-label') : null
      })()`).catch(() => null)
    }
    if (ok === null) continue // 第一次開常碰到 vite 在整理套件，重來一次
    if (ok !== `${char} 的動畫`) throw new Error(`${char}：沒有這個字的劇本（src/anim/clips/${char}.ts）`)
    // 截圖只要舞台：藏掉中間的播放鍵、拿掉圓角陰影，把舞台捲到最上面
    await page.eval(`(() => {
      const s = document.createElement('style')
      s.textContent = '.anim-big-play{display:none!important}.anim-frame{border-radius:0!important;box-shadow:none!important}.anim-head,.anim-controls{display:none!important}.anim-lab{padding:0!important}'
      document.head.appendChild(s)
      window.__shotImgs = new Map()
      return true
    })()`)
    return await page.eval('window.__animSeek(0)')
  }
  throw new Error(`${char}：試播頁 20 秒內沒有載好（筆順資料抓不到？）`)
}

/** 定格在 t，等圖片都畫好，回傳舞台的截圖（Buffer）。 */
async function shoot(page, t, width, format) {
  const rect = await page.eval(`(async () => {
    window.__animSeek(${t})
    const svg = document.querySelector('svg.anim-stage')
    // 這一格用到的圖（主角、3D emoji）都要載完、解碼完；新出現的圖多等兩拍才畫得上去
    let fresh = false
    await Promise.all([...svg.querySelectorAll('image')].map((el) => {
      const href = el.href.baseVal
      if (!window.__shotImgs.has(href)) {
        fresh = true
        const img = new Image()
        img.src = href
        window.__shotImgs.set(href, img.decode().then(() => true, () => false))
      }
      return window.__shotImgs.get(href)
    }))
    await document.fonts.ready
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()))
    await frame(); await frame()
    if (fresh) { await frame(); await frame() }
    const b = svg.getBoundingClientRect()
    return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }
  })()`)
  const scale = width / rect.w
  const res = await page.send('Page.captureScreenshot', {
    format, ...(format === 'jpeg' ? { quality: 92 } : {}),
    clip: { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale },
  })
  return Buffer.from(res.data, 'base64')
}

/** 用 canvas 把一串截圖拼成格狀，左上角標秒數，最上面一行標題。 */
async function stitch(sheetPage, shots, title) {
  const imgs = JSON.stringify(shots.map((s) => ({ t: s.t, src: `data:image/png;base64,${s.data.toString('base64')}` })))
  const dataUrl = await sheetPage.eval(`(async () => {
    const shots = ${imgs}
    const cols = Math.min(${opts.cols}, shots.length), rows = Math.ceil(shots.length / cols)
    const imgs = await Promise.all(shots.map((s) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = s.src })))
    const w = imgs[0].naturalWidth, h = imgs[0].naturalHeight, gap = 6, head = 44
    const c = document.createElement('canvas')
    c.width = cols * w + (cols + 1) * gap
    c.height = head + rows * h + (rows + 1) * gap
    const g = c.getContext('2d')
    g.fillStyle = '#26232B'; g.fillRect(0, 0, c.width, c.height)
    g.fillStyle = '#fff'; g.font = 'bold 24px "PingFang TC", "Heiti TC", sans-serif'; g.textBaseline = 'middle'
    g.fillText(${JSON.stringify(title)}, gap + 6, head / 2 + 3)
    imgs.forEach((img, i) => {
      const x = gap + (i % cols) * (w + gap), y = head + gap + Math.floor(i / cols) * (h + gap)
      g.drawImage(img, x, y)
      const label = shots[i].t.toFixed(2) + 's'
      g.font = 'bold 22px Menlo, monospace'
      const tw = g.measureText(label).width
      g.fillStyle = 'rgba(0,0,0,.72)'
      g.beginPath(); g.roundRect(x + 6, y + 6, tw + 16, 30, 7); g.fill()
      g.fillStyle = '#FFE14D'; g.fillText(label, x + 14, y + 22)
    })
    return c.toDataURL('image/png')
  })()`)
  return Buffer.from(dataUrl.split(',')[1], 'base64')
}

/** 從 from 到 to 每 1/fps 秒截一張，餵給 ffmpeg 做成無聲 mp4。 */
async function video(page, from, to, file) {
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(opts.fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', file], { stdio: ['pipe', 'ignore', 'inherit'] })
  const done = new Promise((ok, no) => ff.on('exit', (code) => (code === 0 ? ok() : no(new Error(`ffmpeg 失敗（${code}）`)))))
  const n = Math.round((to - from) * opts.fps)
  for (let i = 0; i < n; i++) {
    const buf = await shoot(page, from + i / opts.fps, opts.mp4Width, 'jpeg')
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r))
  }
  ff.stdin.end()
  await done
}

// ── DevTools 協定（Node 內建 WebSocket）────────────────────────

function onEvent({ method, params }) {
  if (method === 'Runtime.exceptionThrown') pageErrors.push(params.exceptionDetails.exception?.description?.split('\n')[0] ?? params.exceptionDetails.text)
  else if (method === 'Runtime.consoleAPICalled' && params.type === 'error') pageErrors.push(params.args.map((a) => a.value ?? a.description ?? '').join(' '))
  // favicon.ico 是瀏覽器自己去抓的，不算
  else if (method === 'Log.entryAdded' && params.entry.level === 'error' && !params.entry.url?.endsWith('/favicon.ico')) pageErrors.push(`${params.entry.text}${params.entry.url ? ` ${params.entry.url}` : ''}`)
}

async function connect(url) {
  const ws = new WebSocket(url)
  await new Promise((ok, no) => { ws.onopen = ok; ws.onerror = () => no(new Error('連不上 Chrome DevTools')) })
  let id = 0
  const waiting = new Map()
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.method) return onEvent(msg)
    const w = msg.id && waiting.get(msg.id)
    if (!w) return
    waiting.delete(msg.id)
    if (msg.error) w.no(new Error(`${w.method}：${msg.error.message}`))
    else w.ok(msg.result)
  }
  const send = (method, params = {}, sessionId) => new Promise((ok, no) => {
    const msgId = ++id
    waiting.set(msgId, { ok, no, method })
    ws.send(JSON.stringify({ id: msgId, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
  return {
    close: () => ws.close(),
    async page(url) {
      const { targetId } = await send('Target.createTarget', { url })
      const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
      const p = {
        send: (method, params) => send(method, params, sessionId),
        async eval(expression) {
          const r = await p.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
          if (r.exceptionDetails) throw new Error(`頁面裡出錯：${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`)
          return r.result.value
        },
      }
      await p.send('Page.enable')
      await p.send('Runtime.enable')
      await p.send('Log.enable')
      return p
    },
  }
}

function freePort() {
  return new Promise((ok, no) => {
    const s = net.createServer()
    s.unref()
    s.on('error', no)
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => ok(port === 5180 ? freePort() : port)) })
  })
}

function fmt(n) { return String(Math.round(n * 1000) / 1000) }
