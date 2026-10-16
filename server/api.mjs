import fs from 'node:fs'
import path from 'node:path'
import { json, dispatch } from './http.mjs'
import { MEDIA, STROKES, VOICE } from './core.mjs'
import { syncVoice } from './voice.mjs'
import { libraryRoutes } from './routes/library.mjs'
import { promptRoutes } from './routes/prompt.mjs'
import { mediaRoutes } from './routes/media.mjs'
import { characterRoutes } from './routes/character.mjs'
import { playRoutes } from './routes/play.mjs'

/** 全部 API，依領域分檔。新功能加一個 routes/*.mjs 再接到這裡。 */
const ROUTES = {}
for (const table of [libraryRoutes, promptRoutes, mediaRoutes, characterRoutes, playRoutes]) {
  for (const [key, handler] of Object.entries(table)) {
    // 兩個檔案宣告同一條路由時，後面那個會默默蓋掉前面的：開機就擋下來
    if (ROUTES[key]) throw new Error(`API 路由重複：${key}`)
    ROUTES[key] = handler
  }
}

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

      // 筆順從儲存根目錄給：平常就是 public/strokes/，測試時是暫存資料夾裡新抽的那一份
      server.middlewares.use('/strokes', (req, res, next) => {
        const name = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '')
        const file = path.join(STROKES, name)
        if (!file.startsWith(STROKES + path.sep) || !name.endsWith('.json')) return next()
        // 沒有筆順的字要明確回 404，不要落到網頁本身；孩子端據此退回字卡動畫
        if (!fs.existsSync(file)) return json(res, 404, { error: '沒有筆順資料' })
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        fs.createReadStream(file).pipe(res)
      })

      // 唸字音檔也從儲存根目錄給（平常就是 public/voice/）
      server.middlewares.use('/voice', (req, res, next) => {
        const name = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '')
        const file = path.join(VOICE, name)
        if (!file.startsWith(VOICE + path.sep) || !/\.(m4a|json)$/.test(name)) return next()
        if (!fs.existsSync(file)) return json(res, 404, { error: '沒有這句的音檔' })
        res.setHeader('Content-Type', name.endsWith('.json') ? 'application/json; charset=utf-8' : 'audio/mp4')
        res.setHeader('Cache-Control', 'no-cache')
        fs.createReadStream(file).pipe(res)
      })

      // 開機先在背景把缺的音檔補齊（字庫新字、新劇本的 cue）；劇本一存檔也補
      const report = (what) => (r) => {
        if (r?.skipped || !r) return
        if (r.written || r.failed.length) server.config.logger.info(`唸字音檔（${what}）：新做 ${r.written} 句${r.failed.length ? `，失敗 ${r.failed.length} 句` : ''}`)
      }
      // anim:check 這種只借 middleware 的短命伺服器不做
      if (!server.config.server.middlewareMode) syncVoice().then(report('開機'), (e) => server.config.logger.warn(`唸字音檔沒做成：${e.message}`))
      let pending = null
      server.watcher?.on('all', (_event, file) => {
        if (!/[\\/]src[\\/]anim[\\/]clips[\\/][^\\/]+\.ts$/.test(file)) return
        clearTimeout(pending)
        pending = setTimeout(() => syncVoice().then(report('劇本'), () => {}), 1500)
      })

      server.middlewares.use('/api', (req, res, next) => {
        if (req.method === 'POST' && req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) {
          return json(res, 403, { error: '請從本機 Studio 執行操作' })
        }
        return dispatch(ROUTES, req, res, next)
      })
    },
  }
}
