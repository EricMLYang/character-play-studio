import fs from 'node:fs'
import path from 'node:path'
import {
  MEDIA, loadCharacters, saveCharacters, loadTemplate,
  loadProgress, saveProgress, buildPrompt, todaysQueue,
} from './core.mjs'

const json = (res, code, body) => {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}
const readBody = (req) => new Promise((resolve) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => resolve(Buffer.concat(chunks)))
})

/** Vite 中介層：一個 `npm run dev` 就同時有前端 + 檔案操作 API。 */
export function apiPlugin() {
  return {
    name: 'cps-api',
    configureServer(server) {
      // 影片/圖片直接從 media/ 串流（不進 public/，才不會被打包）
      server.middlewares.use('/media', (req, res, next) => {
        const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '')
        const file = path.join(MEDIA, rel)
        if (!file.startsWith(MEDIA) || !fs.existsSync(file)) return next()
        const ext = path.extname(file).toLowerCase()
        const type = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
          '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext]
        if (type) res.setHeader('Content-Type', type)
        const stat = fs.statSync(file)
        const range = req.headers.range
        if (range && type?.startsWith('video')) {
          const [s, e] = range.replace('bytes=', '').split('-')
          const start = parseInt(s, 10)
          const end = e ? parseInt(e, 10) : stat.size - 1
          res.statusCode = 206
          res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`)
          res.setHeader('Accept-Ranges', 'bytes')
          res.setHeader('Content-Length', end - start + 1)
          return fs.createReadStream(file, { start, end }).pipe(res)
        }
        res.setHeader('Content-Length', stat.size)
        fs.createReadStream(file).pipe(res)
      })

      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://x')
        const route = url.pathname.replace(/\/+$/, '') || '/'
        try {
          // ---- 讀取 ----
          if (route === '/library' && req.method === 'GET') {
            const db = loadCharacters()
            return json(res, 200, {
              characters: db.characters,
              template: loadTemplate(),
              progress: loadProgress(),
              queue: todaysQueue(3).map((c) => c.char),
            })
          }

          // ---- prompt 生成 ----
          if (route === '/prompt' && req.method === 'GET') {
            const db = loadCharacters()
            const entry = db.characters.find((c) => c.char === url.searchParams.get('char'))
            if (!entry) return json(res, 404, { error: 'not found' })
            const built = buildPrompt(entry)
            if (entry.status === 'seed') {
              entry.status = 'prompted'
              entry.promptedAt = new Date().toISOString()
              saveCharacters(db)
            }
            return json(res, 200, built)
          }

          // ---- 匯入：拖曳進來的影片/圖片 ----
          if (route === '/import' && req.method === 'POST') {
            const char = url.searchParams.get('char')
            const ext = (url.searchParams.get('ext') || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '')
            const db = loadCharacters()
            const entry = db.characters.find((c) => c.char === char)
            if (!entry) return json(res, 404, { error: 'unknown char' })
            const buf = await readBody(req)
            fs.mkdirSync(MEDIA, { recursive: true })
            const name = `${char}-${Date.now()}.${ext}`
            fs.writeFileSync(path.join(MEDIA, name), buf)
            const kind = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'image'
            entry.media = [{ file: name, kind, addedAt: new Date().toISOString() }, ...(entry.media || [])]
            entry.status = 'live'
            entry.needsRedo = false
            saveCharacters(db)
            return json(res, 200, { ok: true, file: name, entry })
          }

          // ---- 回饋：一鍵標籤，之後會長成規則庫 ----
          if (route === '/feedback' && req.method === 'POST') {
            const { char, tags } = JSON.parse((await readBody(req)).toString() || '{}')
            const db = loadCharacters()
            const entry = db.characters.find((c) => c.char === char)
            if (!entry) return json(res, 404, { error: 'unknown char' })
            entry.feedback = [...(entry.feedback || []), { tags, at: new Date().toISOString() }]
            entry.needsRedo = tags.some((t) => ['unclear', 'noisy', 'confusing'].includes(t))
            saveCharacters(db)
            return json(res, 200, { ok: true, entry })
          }

          // ---- 小孩的觀看紀錄 ----
          if (route === '/progress' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString() || '{}')
            saveProgress(body)
            return json(res, 200, { ok: true })
          }

          // ---- 新增字 ----
          if (route === '/character' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString() || '{}')
            const db = loadCharacters()
            if (db.characters.some((c) => c.char === body.char)) return json(res, 409, { error: 'exists' })
            db.characters.push({
              char: body.char, zhuyin: body.zhuyin || '', meaning: body.meaning || '',
              emoji: body.emoji || '✨',
              concept: { object: body.object || '', morph: body.morph || '', hook: body.hook || '' },
              status: 'seed', priority: db.characters.length + 1, media: [], feedback: [],
            })
            saveCharacters(db)
            return json(res, 200, { ok: true })
          }

          return next()
        } catch (err) {
          return json(res, 500, { error: String(err) })
        }
      })
    },
  }
}
