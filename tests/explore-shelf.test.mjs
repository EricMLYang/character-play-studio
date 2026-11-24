// 自己逛逛的遊戲架（Home.tsx 的 .home-shelf）：順序照他最常玩的排、每一格都有自己的底色。
// games.tsx 會載入每個遊戲的畫面元件，Node 裡跑不起來，所以直接讀原始碼裡 GAMES 的 id。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8')

/** GAMES 陣列裡每一筆的 id，照寫的順序 */
function gameIds() {
  const src = read('src/play/games.tsx')
  const body = src.slice(src.indexOf('export const GAMES'), src.indexOf('export const gameById'))
  return [...body.matchAll(/^\s{4}id: '([\w-]+)'/gm)].map((m) => m[1])
}

test('遊戲架的順序：他最常玩的在前面（爸爸 2026-11-24 排的）', () => {
  assert.deepEqual(gameIds(), ['story', 'spell', 'names', 'feed', 'town', 'train', 'puzzle', 'book', 'roots'])
})

test('遊戲架每一格都有自己的底色（.place-<id>）：沒有的話那一格是白的，跟旁邊分不出是哪一種', () => {
  const css = fs.readdirSync(path.join(ROOT, 'src/play/styles')).map((f) => read(`src/play/styles/${f}`)).join('\n')
  const missing = gameIds().filter((id) => !new RegExp(`\\.place-${id}\\s*\\{[^}]*background`).test(css))
  assert.deepEqual(missing, [])
})

test('其他地方不靠 GAMES 的順序：今天的路自己寫每一站要去哪', () => {
  // 改遊戲架的順序只動 GAMES；要是哪天 today.ts 開始照 GAMES 的順序挑站，這裡會提醒要另外排
  assert.ok(!/\bGAMES\b/.test(read('src/play/today.ts')))
})
