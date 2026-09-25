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

export const readBody = (req) => new Promise((resolve) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => resolve(Buffer.concat(chunks)))
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
