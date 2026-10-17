import { PLAY_EVENTS } from '../../shared/play-events.mjs'
import { recordPlayEvent } from '../progress.mjs'

/**
 * 孩子端的紀錄：每一種紀錄一條路由（POST /watch、/trace…），規則在 shared/play-events.mjs。
 * 都帶事件編號，離線重送不會重複算；新的紀錄種類加在那張表，這裡自動多一條路由。
 */
export const playRoutes = Object.fromEntries(Object.keys(PLAY_EVENTS).map((kind) =>
  [`POST /${kind}`, ({ body }) => recordPlayEvent(kind, body)]))
