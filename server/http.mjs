/** 路由丟出這個，分派器就用指定的狀態碼回應；其他例外一律當 400。 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
export const fail = (status, message) => { throw new HttpError(status, message) }

export const json = (res, code, body) => {
  res.statusCode = code
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

// 最大的合法上傳是影片素材（現有最大約 2.4MB），50MB 留了充分空間，
// 同時擋掉壞掉或惡意的超大請求把整個伺服器記憶體吃光。
const MAX_BODY_BYTES = 50 * 1024 * 1024

export const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = []
  let size = 0
  req.on('data', (c) => {
    size += c.length
    if (size > MAX_BODY_BYTES) {
      req.destroy()
      reject(new HttpError(413, '檔案太大了'))
      return
    }
    chunks.push(c)
  })
  req.on('end', () => resolve(Buffer.concat(chunks)))
  req.on('error', reject)
})

/**
 * 把 { 'POST /path': handler } 路由表接到請求上。
 * handler 拿到 { url, buffer, body, signal }：body 是讀到用時才解析的 JSON，
 * signal 在瀏覽器斷線時中止（AI 生成用得到）。回傳值就是 200 的內容。
 */
export async function dispatch(routes, req, res, next) {
  const url = new URL(req.url, 'http://x')
  const route = url.pathname.replace(/\/+$/, '') || '/'
  const handler = routes[`${req.method} ${route}`]
  if (!handler) return next()
  try {
    const buffer = req.method === 'GET' ? Buffer.alloc(0) : await readBody(req)
    const controller = new AbortController()
    const abort = () => controller.abort()
    res.on('close', abort)
    try {
      const result = await handler({
        url, buffer, signal: controller.signal,
        get body() { return JSON.parse(buffer.toString() || '{}') },
      })
      // 等 AI 的時候孩子／家長可能已經關掉頁面，連線沒了就不必回
      if (!res.destroyed) json(res, 200, result)
    } finally { res.off('close', abort) }
  } catch (err) {
    json(res, err instanceof HttpError ? err.status : 400, { error: err.message || String(err) })
  }
}
