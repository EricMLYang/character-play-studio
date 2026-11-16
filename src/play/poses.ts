/**
 * 角色 rig：讓 public/hero/ 裡那些站著不動的 PNG「活」起來。
 *
 * 好的幼兒 App 裡，角色是陪你玩的人：一直在呼吸、會看你的手指、你答對他跳起來、
 * 你點錯他歪頭想一下（不是生氣）。這裡只放資料與純函式，畫面在 Buddy.tsx。
 *
 * 每位主角有幾張姿勢圖（idle、happy、surprised、dizzy…，`npm run hero` 或 `npm run hero:cut` 產生的），
 * 但不是每位都有同一組：反應要換姿勢時，先找這位有沒有那張，沒有就退回 idle，只靠動作演。
 */

import CUSTOM_HEROES from './custom-heroes.json' with { type: 'json' }

/** public/hero/<id>/ 底下有哪些姿勢（tests/stage.test.mjs 會跟資料夾對一次，不會寫錯）。
 *  Studio「角色九宮格 → 上傳圖片做新角色」做出來的明星由伺服器寫進 custom-heroes.json，不用手改這裡。 */
const BUILT_IN: Record<string, string[]> = {
  alien: ['beam', 'dizzy', 'happy', 'idle', 'saucer', 'surprised'],
  astronaut: ['dizzy', 'float', 'happy', 'idle', 'salute', 'surprised'],
  bot: ['angry', 'back', 'blow', 'bow', 'cold', 'cry', 'dash', 'dizzy', 'doze', 'drool', 'duck', 'eat', 'extend', 'fall', 'flat', 'flee', 'full', 'giggle', 'glitch', 'happy', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'lift', 'listen', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'yawn'],
  brick: ['dizzy', 'happy', 'idle', 'march', 'stack', 'surprised'],
  bunny: ['angry', 'back', 'blow', 'bow', 'cold', 'cry', 'dash', 'dizzy', 'doze', 'drool', 'duck', 'eat', 'fall', 'flat', 'flee', 'full', 'giggle', 'happy', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'leap', 'lift', 'listen', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'ready', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'yawn'],
  cape: ['dizzy', 'fly', 'happy', 'idle', 'pose', 'surprised'],
  car: ['broken', 'dizzy', 'fast', 'happy', 'idle', 'surprised'],
  dino: ['dizzy', 'happy', 'idle', 'reach', 'roar', 'surprised'],
  firefighter: ['dizzy', 'happy', 'hose', 'idle', 'ladder', 'surprised'],
  monster: ['dizzy', 'happy', 'idle', 'oops', 'roar', 'sleep', 'stuffed', 'surprised'],
  mouse: ['angry', 'back', 'blow', 'bow', 'cheese', 'cold', 'cry', 'dash', 'dizzy', 'doze', 'drool', 'duck', 'eat', 'fall', 'flat', 'flee', 'full', 'giggle', 'happy', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'lift', 'listen', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stance', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'yawn'],
  ninja: ['dizzy', 'happy', 'hide', 'idle', 'surprised', 'throw'],
  // 八個固定明星（豬探長、花生、小老鼠、楊捷睿、狗狗警長；2026-11 新加的小恐龍 rex、兔子女孩 bunny、小機器人 bot）：從綠幕姿勢表切（npm run hero:cut -- <主角>，assets/hero-sheets/）。
  // 都有同一套 52 個共用姿勢（A～F 六張表）＋各自兩個招牌姿勢；沒有放大鏡的 think 跟托下巴的 ponder 同一張，警長舊的 run 跟 dash 同一張。
  // 舊主角 dino、robot 是本機模型畫的另一隻恐龍、機器人，跟 rex、bot 無關
  pig: ['angry', 'back', 'blow', 'bow', 'cold', 'cry', 'dash', 'dizzy', 'doubt', 'doze', 'drool', 'duck', 'eat', 'fall', 'flat', 'flee', 'full', 'giggle', 'happy', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'lift', 'listen', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'yawn'],
  pirate: ['dizzy', 'happy', 'idle', 'surprised', 'telescope', 'treasure'],
  raccoon: ['angry', 'back', 'blow', 'bow', 'carry', 'cold', 'cry', 'dash', 'dizzy', 'doze', 'drool', 'duck', 'eat', 'fall', 'flat', 'flee', 'full', 'giggle', 'happy', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'lift', 'listen', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'salute', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'yawn'],
  rex: ['angry', 'back', 'bigStomp', 'blow', 'bow', 'cold', 'cry', 'dash', 'dizzy', 'doze', 'drool', 'duck', 'eat', 'fall', 'flat', 'flee', 'full', 'giggle', 'happy', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'lift', 'listen', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'roar', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'yawn'],
  robot: ['broken', 'dizzy', 'fly', 'happy', 'idle', 'surprised'],
  shark: ['chomp', 'dizzy', 'happy', 'idle', 'spin', 'surprised'],
  sheriff: ['angry', 'back', 'blow', 'bow', 'cold', 'cry', 'dash', 'dizzy', 'doze', 'drool', 'duck', 'eat', 'fall', 'flat', 'flee', 'full', 'giggle', 'happy', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'lift', 'listen', 'old1', 'old2', 'old3', 'oldHuh', 'oldLaugh', 'oldPoint', 'oldShock', 'oldSleep', 'oldWalk', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'run', 'salute', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'whistle', 'yawn'],
  warrior: ['dizzy', 'happy', 'idle', 'shield', 'surprised', 'swing'],
  yang: ['angry', 'back', 'blow', 'bow', 'cold', 'cry', 'dash', 'dizzy', 'doze', 'drive', 'drool', 'duck', 'eat', 'fall', 'flat', 'flee', 'full', 'giggle', 'happy', 'helmet', 'hold', 'hot', 'hug', 'hungry', 'idle', 'jump', 'kick', 'know', 'laugh', 'lift', 'listen', 'peek', 'point', 'ponder', 'pull', 'push', 'reach', 'scared', 'sleep', 'slip', 'smug', 'sneak', 'sneeze', 'sour', 'spicy', 'stinky', 'stomp', 'surprised', 'think', 'throw', 'tired', 'wait', 'walk', 'wave', 'yawn'],
}
export const POSES: Record<string, string[]> = { ...BUILT_IN, ...(CUSTOM_HEROES as Record<string, string[]>) }

/**
 * 角色的反應。遊戲在「對／錯／等他想」那一下叫一次，角色就演一次。
 * - cheer：跳起來、落地壓扁再彈回（答對）
 * - oops：歪頭搖一下（點錯；不是生氣，六歲點錯不該被罵）
 * - think：頭歪一邊、輕輕晃（等他想）
 * - wave：揮手打招呼（剛進來）
 * - sleep：慢慢沉下去（睡著）
 */
export type Reaction = 'cheer' | 'oops' | 'think' | 'wave' | 'sleep'

/** 每種反應想換哪張姿勢，依序找這位有的第一張；都沒有就用 idle。 */
const WANT: Record<Reaction, string[]> = {
  cheer: ['happy'],
  oops: ['surprised', 'oops', 'dizzy'],
  think: ['think', 'point', 'idle'],
  wave: ['happy', 'salute'],
  sleep: ['sleep', 'dizzy'],
}

/** 這位主角演這個反應要用哪張圖（沒有反應就是 base，平常站著的那張） */
export function poseFor(hero: string, reaction: Reaction | null, base = 'idle'): string {
  const has = POSES[hero] ?? ['idle']
  if (!reaction) return has.includes(base) ? base : 'idle'
  return WANT[reaction].find((p) => has.includes(p)) ?? (has.includes(base) ? base : 'idle')
}

/** 反應演多久（毫秒）。演完角色回到平常的樣子；sleep 不會自己醒。 */
export const REACT_MS: Record<Reaction, number> = { cheer: 900, oops: 800, think: 1600, wave: 1100, sleep: Infinity }

// 角色「看」手指寫在 buddy.css：頭往手指那邊轉 (--px − --bx) × 8 度，最多 8 度——
// 再多就不像在看、像在跌倒。--px 是 useStagePointer 寫在 <html> 上的，--bx 是角色自己在畫面上的位置。
