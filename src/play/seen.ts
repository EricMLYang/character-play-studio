/**
 * 「他進去過這個新遊戲了沒」——只為了首頁那顆 🆕 要不要亮，存在這台裝置就夠。
 *
 * 不走進度檔：這不是學習紀錄，是一個提示；而且跳石頭過河與小偵探記的是 recall，
 * 跟餵大怪獸同一種紀錄，本來就分不出他進去過哪一個。
 * localStorage 在無痕視窗或關掉網站資料時會丟例外，一律吞掉——badge 不見比整頁壞掉好。
 */
const KEY = 'cps.seen.games'

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export const hasSeen = (id: string) => load().includes(id)

export function markSeen(id: string) {
  try {
    const seen = load()
    if (seen.includes(id)) return
    localStorage.setItem(KEY, JSON.stringify([...seen, id].slice(-30)))
  } catch { /* 存不起來就每次都亮 🆕，不要讓它壞掉 */ }
}
