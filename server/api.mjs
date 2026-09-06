import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { addFeedback, publishMedia, completeWatch, isPublished } from '../shared/domain.mjs'
import { cliProviders } from './ai-cli.mjs'
import { generatePrompt } from './prompt-generation.mjs'
import {
  MEDIA, loadCharacters, saveCharacters, loadTemplate,
  loadProgress, saveProgress, currentPrompt, productionDay, recordSubmission,
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
        if (!file.startsWith(MEDIA + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
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
          if (req.method === 'POST' && req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) {
            return json(res, 403, { error: '請從本機 Studio 執行操作' })
          }
          // ---- 讀取 ----
          if (route === '/library' && req.method === 'GET') {
            const db = loadCharacters()
            const production = productionDay(db)
            saveCharacters(db)
            return json(res, 200, {
              characters: db.characters,
              template: loadTemplate(),
              progress: loadProgress(),
              queue: production.queue,
              production,
              pendingAttempts: Object.values(db.production.days).flatMap((d) => d.attempts).filter((a) => !a.mediaFile && !a.failedAt),
              cliProviders: cliProviders(),
            })
          }

          if (route === '/prompt/generate' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString())
            const controller = new AbortController()
            const abort = () => controller.abort()
            res.on('close', abort)
            try {
              const prompt = await generatePrompt({ ...body, signal: controller.signal })
              if (!res.destroyed) return json(res, 200, prompt)
              return
            } finally { res.off('close', abort) }
          }

          if (route === '/prompt/select' && req.method === 'POST') {
            const { char, id } = JSON.parse((await readBody(req)).toString())
            const db = loadCharacters(), entry = db.characters.find((c) => c.char === char)
            if (!entry?.promptVersions?.some((p) => p.id === id)) return json(res, 404, { error: '找不到這份 prompt' })
            entry.activePromptId = id
            saveCharacters(db)
            return json(res, 200, currentPrompt(entry))
          }

          if (route === '/submission' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString())
            const db = loadCharacters()
            const attempt = recordSubmission(db, body)
            saveCharacters(db)
            return json(res, 200, attempt)
          }

          if (route === '/submission-failed' && req.method === 'POST') {
            const { id } = JSON.parse((await readBody(req)).toString())
            const db = loadCharacters()
            const attempt = Object.values(db.production?.days || {}).flatMap((d) => d.attempts).find((a) => a.id === id)
            if (!attempt || attempt.mediaFile) return json(res, 400, { error: '找不到待匯入的製作紀錄' })
            attempt.failedAt ||= new Date().toISOString()
            const entry = db.characters.find((c) => c.char === attempt.char)
            if (entry) entry.needsRedo = true
            saveCharacters(db)
            return json(res, 200, { ok: true })
          }

          // ---- prompt 生成 ----
          if (route === '/prompt' && req.method === 'GET') {
            const db = loadCharacters()
            const entry = db.characters.find((c) => c.char === url.searchParams.get('char'))
            if (!entry) return json(res, 404, { error: 'not found' })
            const built = currentPrompt(entry)
            return json(res, 200, built)
          }

          // ---- 匯入：拖曳進來的影片/圖片 ----
          if (route === '/import' && req.method === 'POST') {
            const char = url.searchParams.get('char')
            const ext = (url.searchParams.get('ext') || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '')
            if (!['mp4', 'webm', 'mov', 'png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
              return json(res, 400, { error: '請匯入 MP4、WebM、MOV、PNG、JPG 或 WebP' })
            }
            const buf = await readBody(req)
            if (!buf.length) return json(res, 400, { error: '檔案是空的' })
            const db = loadCharacters()
            const entry = db.characters.find((c) => c.char === char)
            if (!entry) return json(res, 404, { error: 'unknown char' })
            const attemptId = url.searchParams.get('attemptId')
            const attempt = Object.values(db.production?.days || {}).flatMap((d) => d.attempts)
              .find((a) => a.id === attemptId && a.char === char)
            if (attemptId && (!attempt || attempt.mediaFile || attempt.failedAt)) return json(res, 400, { error: '製作紀錄不存在、已結束或已匯入' })
            const kind = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'image'
            if (attemptId && kind !== 'video') return json(res, 400, { error: '影片製作紀錄只能連結影片' })
            fs.mkdirSync(MEDIA, { recursive: true })
            const name = `${char}-${randomUUID()}.${ext}`
            fs.writeFileSync(path.join(MEDIA, name), buf)
            entry.media = [{ file: name, kind, addedAt: new Date().toISOString(), review: 'draft',
              audioMode: kind === 'video' ? 'original' : 'narration', volume: 0.7,
              feedbackCount: attempt?.prompt.feedbackCount ?? (entry.feedback || []).length,
              ...(attempt ? { attemptId, prompt: attempt.prompt } : {}),
            }, ...(entry.media || [])]
            if (attempt) attempt.mediaFile = name
            saveCharacters(db)
            return json(res, 200, { ok: true, file: name, entry })
          }

          if (route === '/media-review' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString())
            const db = loadCharacters()
            const entry = db.characters.find((c) => c.char === body.char)
            if (!entry) return json(res, 404, { error: '找不到這個字' })
            if (body.action === 'publish') {
              publishMedia(entry, body.file, body.audioMode, body.volume, body.checks)
            } else if (body.action === 'pause') {
              const media = entry.media.find((m) => m.file === body.file)
              if (!media) return json(res, 404, { error: '找不到這個版本' })
              media.review = 'paused'
              if (!entry.media.some(isPublished)) entry.status = entry.promptedAt ? 'prompted' : 'seed'
            } else return json(res, 400, { error: '不支援的操作' })
            saveCharacters(db)
            return json(res, 200, entry)
          }

          // ---- 回饋：一鍵標籤，之後會長成規則庫 ----
          if (route === '/feedback' && req.method === 'POST') {
            const { char, tags, mediaFile } = JSON.parse((await readBody(req)).toString() || '{}')
            const db = loadCharacters()
            const entry = db.characters.find((c) => c.char === char)
            if (!entry) return json(res, 404, { error: 'unknown char' })
            if (mediaFile && !entry.media.some((m) => m.file === mediaFile)) return json(res, 400, { error: '找不到回饋版本' })
            addFeedback(entry, tags, new Date().toISOString(), mediaFile)
            saveCharacters(db)
            return json(res, 200, { ok: true, entry })
          }

          // ---- 小孩的觀看紀錄 ----
          if (route === '/progress' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString() || '{}')
            const current = loadProgress()
            // Persist only daily selections here; a stale tab cannot erase completed watches.
            current.days = { ...body.days, ...current.days }
            saveProgress(current)
            return json(res, 200, { ok: true })
          }

          if (route === '/watch' && req.method === 'POST') {
            const { char, id, at } = JSON.parse((await readBody(req)).toString())
            if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{8,80}$/.test(id) ||
              typeof at !== 'string' || !Number.isFinite(Date.parse(at)) || Date.parse(at) > Date.now() + 60000 ||
              !loadCharacters().characters.some((c) => c.char === char)) return json(res, 400, { error: '觀看紀錄不正確' })
            const current = loadProgress()
            if (current.completedEvents?.[id]) {
              if (current.completedEvents[id] !== char) return json(res, 400, { error: '觀看紀錄編號已使用' })
              return json(res, 200, current)
            }
            const nextProgress = completeWatch(current, char, at)
            nextProgress.completedEvents = { ...current.completedEvents, [id]: char }
            saveProgress(nextProgress)
            return json(res, 200, nextProgress)
          }

          // ---- 新增字 ----
          if (route === '/character' && req.method === 'POST') {
            const body = JSON.parse((await readBody(req)).toString() || '{}')
            body.char = body.char?.trim()
            if (!body.char || !/^\p{Script=Han}$/u.test(body.char)) return json(res, 400, { error: '請輸入一個國字' })
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
          return json(res, 400, { error: err.message || String(err) })
        }
      })
    },
  }
}
