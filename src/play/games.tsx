import type { ReactNode } from 'react'
import type { CharEntry, Progress } from '../types'
import type { PlayEvent } from '../../shared/play-events.mjs'
import type { WordGroup } from './words'
import Town from './Town'
import Lab from './Lab'
import Train from './Train'
import Feed from './Feed'
import Puzzle from './Puzzle'
import River from './River'
import Detective from './Detective'
import { knownCount } from './dishes'

/**
 * 首頁上「看完字卡之後可以去的地方」：小鎮、魔法鍋、字火車、餵大怪獸、跳石頭過河、小偵探、詞語拼圖。一個遊戲一筆：首頁的入口按鈕、網址（#/<id>）、
 * 返回鍵都從這張表來，PlayApp 不用知道有哪些遊戲。
 *
 * 加一個新遊戲：
 * 1. 寫畫面元件（src/play/<Game>.tsx），樣式放 src/play/styles/<game>.css 並在 play.css 接上
 * 2. 規則拆成純函式放另一個檔，檔名**不要只有大小寫不同**（River.tsx 配 river.ts 在 macOS 上會
 *    被 TypeScript 當成同一個檔；跳石頭過河用 crossing.ts、小偵探用 guessing.ts）
 * 3. 要記進度的話：規則寫在 shared/domain.mjs，在 shared/play-events.mjs 加一種紀錄，Progress 型別加欄位。
 *    考的能力跟既有遊戲一樣就共用那一種紀錄（跳石頭過河與小偵探都記 recall，跟餵大怪獸同一份記住程度）
 * 4. 有固定台詞的話：shared/voice-lines.mjs 加句型，音檔就會預先做好。他還不會讀字，畫面上的話要唸得出來
 * 5. 在下面 GAMES 加一筆；剛做好的加 fresh: true，首頁入口會亮一顆 🆕（他進去過一次就不亮）
 * 6. 如果這個遊戲是某一顆星星的來源（shared/domain.mjs 的 STAR_DEEDS.where）：接 ctx.want，
 *    讓進來的第一題就出那個字
 */
export type GameContext = {
  /** 孩子端看得到的字，照首頁的順序 */
  library: CharEntry[]
  /** 首頁的詞組（有影片的字），不含他自己在字火車接的 */
  groups: WordGroup[]
  /** 每個字的顏色（hueMap），跟 ui.tsx 的 hueOf 一起用，同一個字到哪裡都同色 */
  hues: Map<string, number>
  /** 總共收集到幾顆星星（shared/domain.mjs 的 starIndex 加總），決定有哪幾位夥伴 */
  stars: number
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
  /** 去另一個遊戲（小鎮的夥伴那一排會用） */
  go: (id: string) => void
  /**
   * 他為了哪個字來的：字卡上點「還差這顆星星 → 去」進來時是那個字（#/<id>?w=<字>）。
   * 有接的遊戲要讓**進來的第一題**出這個字——他要的是那一顆星星，進來卻考別的字就等於白跑一趟。
   * 「再玩一次」就不算了（那時他已經在玩這個遊戲，不是為了那個字來的）。
   */
  want?: string
}
type Distribute<T> = T extends { id: string; at: string } ? Omit<T, 'id' | 'at'> & { id?: string; at?: string } : never
export type NewEvent = Distribute<PlayEvent>

export type Game = {
  id: string
  icon: string
  title: string
  /** 剛做好的玩法：他還沒進去過的話，首頁入口會亮一顆 🆕（進去過就不亮了，記在這台裝置） */
  fresh?: boolean
  /** 入口按鈕上的小字 */
  subtitle: (progress: Progress) => string
  render: (ctx: GameContext) => ReactNode
}

export const GAMES: Game[] = [
  {
    id: 'town', icon: '🏡', title: '我的小鎮',
    subtitle: (p) => { const n = Object.keys(p.town || {}).length; return n ? `住了 ${n} 個字` : '寫一個字搬進來' },
    render: (ctx) => (
      <Town residents={ctx.progress.town || {}} library={ctx.library} hues={ctx.hues} stars={ctx.stars}
        onPick={ctx.open} onBack={ctx.back} onGame={ctx.go} />
    ),
  },
  {
    id: 'lab', icon: '🧪', title: '魔法鍋',
    subtitle: () => '字會變成別的字',
    render: (ctx) => (
      <Lab library={ctx.library} hues={ctx.hues} found={ctx.progress.lab || {}} onPick={ctx.open} onBack={ctx.back} want={ctx.want}
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
      <Feed library={ctx.library} progress={ctx.progress} onPick={ctx.open} onBack={ctx.back} want={ctx.want}
        onRecall={(char, ok) => ctx.record({ kind: 'recall', char, ok })} />
    ),
  },
  {
    id: 'river', icon: '🌊', title: '跳石頭過河', fresh: true,
    subtitle: () => '聽到字就跳過去',
    render: (ctx) => (
      <River library={ctx.library} progress={ctx.progress} stars={ctx.stars} onPick={ctx.open} onBack={ctx.back}
        onRecall={(char, ok) => ctx.record({ kind: 'recall', char, ok })} />
    ),
  },
  {
    id: 'spy', icon: '🔍', title: '小偵探', fresh: true,
    subtitle: () => '一筆一筆猜出來',
    render: (ctx) => (
      <Detective library={ctx.library} progress={ctx.progress} onPick={ctx.open} onBack={ctx.back}
        onRecall={(char, ok) => ctx.record({ kind: 'recall', char, ok })} />
    ),
  },
  {
    id: 'puzzle', icon: '🧩', title: '詞語拼圖',
    subtitle: (p) => { const n = Object.keys(p.puzzles || {}).length; return n ? `收集了 ${n} 個詞` : '把詞拼起來' },
    render: (ctx) => (
      <Puzzle library={ctx.library} hues={ctx.hues} progress={ctx.progress} onPick={ctx.open} onBack={ctx.back} want={ctx.want}
        onSolve={(word, char, ok) => ctx.record({ kind: 'puzzle', char, word, ok })} />
    ),
  },
]

export const gameById = (id: string) => GAMES.find((g) => g.id === id)
