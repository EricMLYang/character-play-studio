import type { ReactNode } from 'react'
import type { CharEntry, Progress } from '../types'
import type { PlayEvent } from '../../shared/play-events.mjs'
import type { WordGroup } from './words'
import Town from './Town'
import Lab from './Lab'
import Train from './Train'
import Feed from './Feed'
import Puzzle from './Puzzle'
import { knownCount } from './dishes'

/**
 * 首頁上「看完字卡之後可以去的地方」：小鎮、魔法鍋、字火車、餵大怪獸、詞語拼圖。一個遊戲一筆：首頁的入口按鈕、網址（#/<id>）、
 * 返回鍵都從這張表來，PlayApp 不用知道有哪些遊戲。
 *
 * 加一個新遊戲：
 * 1. 寫畫面元件（src/play/<Game>.tsx），樣式放 src/play/styles/<game>.css 並在 play.css 接上
 * 2. 要記進度的話：規則寫在 shared/domain.mjs，在 shared/play-events.mjs 加一種紀錄，Progress 型別加欄位
 * 3. 有固定台詞的話：shared/voice-lines.mjs 加句型，音檔就會預先做好
 * 4. 在下面 GAMES 加一筆
 */
export type GameContext = {
  /** 孩子端看得到的字，照首頁的順序 */
  library: CharEntry[]
  /** 首頁的詞組（有影片的字），不含他自己在字火車接的 */
  groups: WordGroup[]
  /** 每個字的顏色（hueMap），跟 ui.tsx 的 hueOf 一起用，同一個字到哪裡都同色 */
  hues: Map<string, number>
  /** 他在字火車接過的詞，新的在前 */
  savedWords: string[]
  progress: Progress
  /** 記一筆紀錄；沒給編號與時間就自動補上 */
  record: (event: NewEvent) => void
  /** 開一個字（觀看層蓋在遊戲上面，關掉回到這裡） */
  open: (char: string) => void
  /** 坐一次字火車 */
  ride: (text: string) => void
  /** 回首頁 */
  back: () => void
}
type Distribute<T> = T extends { id: string; at: string } ? Omit<T, 'id' | 'at'> & { id?: string; at?: string } : never
export type NewEvent = Distribute<PlayEvent>

export type Game = {
  id: string
  icon: string
  title: string
  /** 入口按鈕上的小字 */
  subtitle: (progress: Progress) => string
  render: (ctx: GameContext) => ReactNode
}

export const GAMES: Game[] = [
  {
    id: 'town', icon: '🏡', title: '我的小鎮',
    subtitle: (p) => { const n = Object.keys(p.town || {}).length; return n ? `住了 ${n} 個字` : '寫一個字搬進來' },
    render: (ctx) => <Town residents={ctx.progress.town || {}} library={ctx.library} hues={ctx.hues} onPick={ctx.open} onBack={ctx.back} />,
  },
  {
    id: 'lab', icon: '🧪', title: '魔法鍋',
    subtitle: () => '字會變成別的字',
    render: (ctx) => (
      <Lab library={ctx.library} hues={ctx.hues} found={ctx.progress.lab || {}} onPick={ctx.open} onBack={ctx.back}
        onDiscover={(char) => { if (!ctx.progress.lab?.[char]) ctx.record({ kind: 'discover', char }) }} />
    ),
  },
  {
    id: 'train', icon: '🚂', title: '字火車',
    subtitle: () => '自己接一個詞',
    render: (ctx) => (
      <Train groups={ctx.groups} saved={ctx.savedWords} onBack={ctx.back}
        onRide={(text) => { ctx.record({ kind: 'word', char: text }); ctx.ride(text) }}
        onRemove={(text) => ctx.record({ kind: 'word', char: text, remove: true })} />
    ),
  },
  {
    id: 'feed', icon: '🍽️', title: '餵大怪獸',
    subtitle: (p) => { const n = knownCount(p); return n ? `認得 ${n} 個字` : '牠肚子好餓' },
    render: (ctx) => (
      <Feed library={ctx.library} progress={ctx.progress} onPick={ctx.open} onBack={ctx.back}
        onRecall={(char, ok) => ctx.record({ kind: 'recall', char, ok })} />
    ),
  },
  {
    id: 'puzzle', icon: '🧩', title: '詞語拼圖',
    subtitle: (p) => { const n = Object.keys(p.puzzles || {}).length; return n ? `收集了 ${n} 個詞` : '把詞拼起來' },
    render: (ctx) => (
      <Puzzle library={ctx.library} hues={ctx.hues} progress={ctx.progress} onPick={ctx.open} onBack={ctx.back}
        onSolve={(word, char, ok) => ctx.record({ kind: 'puzzle', char, word, ok })} />
    ),
  },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id)
