import { PLAY_EVENTS } from '../shared/play-events.mjs'

/**
 * 試玩伺服器（npm run play）只准孩子端寫紀錄，Studio 的寫入一律擋掉。
 *
 * 為什麼：play 把字庫複製到暫存資料夾、media/ 用 symlink 指回真的那一份。
 * 在試玩伺服器的 Studio 上架，影片檔進了真的 media/，上架紀錄卻寫進暫存字庫，
 * 關掉伺服器（暫存資料夾整個刪掉）就沒了。2026-11-14～16 有 agent 把 5199 開著沒關，
 * 爸爸在上面上架了 21 支影片，換回 5180 全部「消失」（#298）。
 *
 * 用環境變數而不是 apiPlugin 的參數：play.mjs 用的是同一份 vite.config.ts。
 */
export const SANDBOX_ENV = 'CPS_SANDBOX'
export const isSandbox = () => process.env[SANDBOX_ENV] === 'play'

/** 孩子端的紀錄路由（POST /watch、/trace…）：試玩本來就是要測這些，照常寫進暫存 */
const CHILD_WRITES = new Set(Object.keys(PLAY_EVENTS).map((kind) => `POST /${kind}`))

export const SANDBOX_MESSAGE = '這是試玩伺服器（npm run play），存不下來：上傳、上架、改字都要到正式的 http://localhost:5180/studio 做'

/** 這個請求在試玩伺服器上要不要擋 */
export function sandboxBlocks(method, route) {
  if (method === 'GET' || method === 'HEAD') return false
  return !CHILD_WRITES.has(`${method} ${route}`)
}
