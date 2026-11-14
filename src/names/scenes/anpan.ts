// 演的是字面意思：麵包＋超人——營火上一條快烤焦的長麵包，一個披披風的超人（自家主角）飛來搶救（沒有圓臉紅鼻子紅臉頰、不把臉掰給人吃、沒有細菌人）。
import { scene } from '../../story/scene'

// 傍晚的樹林營地：熊睡著了，營火上的長麵包冒黑煙。超人從天邊咻地飛來救麵包——太快了，一頭撞進帳篷。
// 他頭昏昏爬起來衝過去一把抓起麵包：好燙！左手丟右手、右手丟左手，一個沒抓好把麵包拋上天，卡在大樹上。
// 他伸手在下面等……等……沒掉下來。他飛上去一頭撞樹，麵包掉下來「咚」砸在熊頭上，熊醒來張大嘴要咬——
// 超人咻一聲在半空把麵包搶回來，高高舉起：麵包金黃亮晶晶，「麵包超人」！熊聞到香味，也開心地拍手。
const H = 15 // 超人的 size
const G = 77 - 0.42 * H
const FIRE = { x: 84, y: 77 - 0.42 * 12 }
const SPIT = { x: 84, y: 62 } // 麵包架在火上
const BEAR = { x: 106, y: 77 - 0.42 * 18 }
const TENT = { x: 32, y: 77 - 0.42 * 30 }
const TREE = { x: 140, y: 77 - 0.42 * 50 }
const STUCK = { x: 140, y: 42 } // 卡在樹上
const HANDS = 9 // 舉高的麵包比超人的腳底高多少（happy 兩手舉高）
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
const BURNT = 'sepia(0.6) brightness(0.55)'

export default scene({
  duration: 9.5,
  bg: { top: '#E98A5C', bottom: '#FFD9A8', floor: '#6F9A52', scenery: 'forest' },
  actors: [
    { id: 'tent', emoji: '⛺', x: TENT.x, y: TENT.y, size: 30 },
    { id: 'tree', emoji: '🌲', x: TREE.x, y: TREE.y, size: 50 },
    { id: 'logs', emoji: '🪵', x: FIRE.x, y: 77 - 0.42 * 10, size: 10 },
    { id: 'fire', emoji: '🔥', x: FIRE.x, y: FIRE.y - 3, size: 12, float: true },
    { id: 'bread', emoji: '🥖', x: SPIT.x, y: SPIT.y, size: 14, pivot: 'center', float: true, tint: 'sepia(0.3) brightness(0.8)' },
    { id: 'bear', emoji: '🐻', x: BEAR.x, y: BEAR.y, size: 18 },
    { id: 'hero', emoji: 'hero:cape/fly', x: 190, y: 26, size: H, float: true },
  ],
  moves: [
    // ① 麵包越烤越黑
    { at: 0.2, actor: 'bread', do: 'shake', amount: 0.6, dur: 0.4 },
    { at: 0.6, actor: 'bread', do: 'tint', filter: BURNT },
    // 超人從天邊咻地飛來——太快了，一頭撞進帳篷
    { at: 0.5, actor: 'hero', do: 'moveTo', to: { x: 36, y: 60 }, dur: 0.6, ease: 'in' },
    { at: 1.1, actor: 'tent', do: 'squash', amount: 0.4, dur: 0.4 },
    { at: 1.1, actor: 'tent', do: 'shake', amount: 1.2, dur: 0.4 },
    { at: 1.1, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
    { at: 1.1, actor: 'hero', do: 'moveTo', to: { x: 50, y: G }, arc: 6, dur: 0.35, ease: 'out' },
    // 爬起來衝過去抓麵包
    { at: 1.95, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    { at: 2.05, actor: 'hero', do: 'moveTo', to: { x: 74, y: G }, dur: 0.35, anticipate: 3, ease: 'in' },
    { at: 2.45, actor: 'bread', do: 'moveTo', to: { x: 74, y: G - HANDS }, dur: 0.15 },
    // 好燙！丟來丟去
    { at: 2.6, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
    { at: 2.6, actor: 'hero', do: 'hop', amount: 3, dur: 0.3 },
    { at: 2.6, actor: 'bread', do: 'moveTo', to: { x: 80, y: G - HANDS - 2 }, arc: 8, dur: 0.25 },
    { at: 2.85, actor: 'bread', do: 'moveTo', to: { x: 68, y: G - HANDS - 2 }, arc: 8, dur: 0.25 },
    { at: 3.1, actor: 'bread', do: 'moveTo', to: { x: 80, y: G - HANDS - 2 }, arc: 8, dur: 0.25 },
    { at: 2.85, actor: 'hero', do: 'shake', amount: 1, dur: 0.5 },
    { at: 2.6, actor: 'bread', do: 'spin', times: 2, dur: 0.75 },
    // 一個沒抓好，拋上天，卡在大樹上
    { at: 3.35, actor: 'bread', do: 'moveTo', to: STUCK, arc: 10, dur: 0.45, ease: 'out' },
    { at: 3.35, actor: 'bread', do: 'spin', times: 2, dur: 0.45 },
    { at: 3.8, actor: 'tree', do: 'shake', amount: 0.6, dur: 0.3 },
    // 伸手在下面等……等……沒掉下來
    { at: 3.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 3.75, actor: 'hero', do: 'moveTo', to: { x: 128, y: G }, dur: 0.4, ease: 'out' },
    { at: 4.3, actor: 'hero', do: 'tilt', amount: -6, dur: 0.6 },
    { at: 4.9, actor: 'hero', do: 'swap', emoji: 'hero:cape/idle' },
    // 飛上去一頭撞樹，麵包掉下來砸在熊頭上
    { at: 5.15, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
    { at: 5.15, actor: 'hero', do: 'flip' },
    { at: 5.15, actor: 'hero', do: 'moveTo', to: { x: 136, y: 50 }, dur: 0.25, anticipate: 3, ease: 'in' },
    { at: 5.4, actor: 'tree', do: 'shake', amount: 1.6, dur: 0.4 },
    { at: 5.4, actor: 'hero', do: 'moveTo', to: { x: 126, y: 52 }, dur: 0.25, ease: 'out' },
    { at: 5.45, actor: 'bread', do: 'moveTo', to: { x: BEAR.x, y: BEAR.y - 12 }, dur: 0.3, ease: 'in' },
    { at: 5.75, actor: 'bear', do: 'squash', amount: 0.35, dur: 0.3 },
    { at: 5.75, actor: 'bread', do: 'hop', amount: 4, dur: 0.3 },
    // 熊醒來張嘴要咬——超人在半空搶回來
    { at: 6.05, actor: 'bear', do: 'hop', amount: 4, dur: 0.3 },
    { at: 6.05, actor: 'bear', do: 'scaleTo', amount: 1.2, dur: 0.2, ease: 'back' },
    { at: 6.1, actor: 'hero', do: 'moveTo', to: { x: BEAR.x, y: BEAR.y - 14 }, dur: 0.2, ease: 'in' },
    { at: 6.3, actor: 'bread', do: 'moveTo', to: { x: 82, y: G - HANDS * 1.3 }, dur: 0.45, ease: 'out' },
    { at: 6.3, actor: 'hero', do: 'moveTo', to: { x: 82, y: G }, dur: 0.45, ease: 'out' },
    { at: 6.35, actor: 'bear', do: 'scaleTo', amount: 1 / 1.2, dur: 0.25 },
    // ⑤ 高高舉起：麵包金黃亮晶晶
    { at: 6.05, actor: 'hero', do: 'flip' },
    { at: 6.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
    { at: 6.75, actor: 'bread', do: 'tint', filter: 'brightness(1.15) saturate(1.3)' },
    { at: 6.8, actor: 'hero', do: 'scaleTo', amount: 1.6, dur: 0.35, ease: 'back' },
    { at: 6.8, actor: 'bread', do: 'scaleTo', amount: 1.35, dur: 0.35, ease: 'back' },
    { at: 6.8, actor: 'bread', do: 'moveTo', to: { x: 82, y: G - HANDS * 2.7 }, dur: 0.35, ease: 'back' },
    { at: 7.9, actor: 'bear', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.2, actor: 'hero', do: 'hop', amount: 2, dur: 0.3 },
    { at: 8.2, actor: 'bread', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0, kind: 'zzz', actor: 'bear', dur: 5.6 },
    { at: 0.1, kind: 'stink', actor: 'bread', dur: 2.3 },
    { at: 0.6, kind: 'puff', actor: 'bread', n: 4, dur: 0.6 },
    { at: 1.1, kind: 'burst', actor: 'tent', n: 1, dur: 0.4 },
    { at: 1.4, kind: 'dizzy', actor: 'hero', dur: 0.6 },
    { at: 2.6, kind: 'pop', actor: 'hero', emoji: '🥵', dx: -10, dur: 0.6 },
    { at: 2.65, kind: 'sweat', actor: 'hero' },
    { at: 4.2, kind: 'pop', actor: 'hero', emoji: '❓', dx: -10, dur: 0.6 },
    { at: 4.85, kind: 'pop', actor: 'hero', emoji: '😅', dx: -10, dur: 0.5 },
    { at: 5.4, kind: 'burst', actor: 'tree', emoji: '🍃', n: 6, dur: 0.6 },
    { at: 5.75, kind: 'burst', actor: 'bear', n: 1, dur: 0.35 },
    { at: 6.05, kind: 'pop', actor: 'bear', emoji: '😋', dx: 10, dur: 0.5 },
    { at: 6.4, kind: 'pop', actor: 'bear', emoji: '😑', dx: 10, dur: 0.6 },
    { at: 6.8, kind: 'burst', actor: 'bread', emoji: '✨', n: 10, dur: 0.9 },
    { at: 7.9, kind: 'pop', actor: 'bear', emoji: '💕', dx: 10, dur: 0.7 },
    { at: 8.2, kind: 'burst', actor: 'hero', emoji: '🎉', n: 8, dur: 0.9 },
  ],
  camera: [
    { at: 1.1, dur: 0.35, do: 'shake', amount: 1.4 },
    { at: 5.4, dur: 0.3, do: 'shake', amount: 1 },
    { at: 6.8, dur: 0.4, do: 'punch', amount: 0.12, to: { x: 82, y: 50 } },
    { at: 7.3, dur: 0.5, do: 'zoom', amount: 1.4, to: look(90, 50, 1.4) },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.25 },
    { at: 1.1, dur: 0.4, level: 0.35 },
    { at: 6.75, dur: 0.05, level: -0.4 },
    { at: 6.8, dur: 0.5, level: 0.05 },
  ],
  cues: [
    { at: 0.2, sfx: 'crack' },
    { at: 0.5, sfx: 'whoosh' },
    { at: 1.1, sfx: 'bonk' },
    { at: 2.6, sfx: 'boing' },
    { at: 2.85, sfx: 'tap' },
    { at: 3.1, sfx: 'tap' },
    { at: 3.35, sfx: 'whoosh' },
    { at: 4.2, sfx: 'blip' },
    { at: 5.4, sfx: 'bonk' },
    { at: 5.75, sfx: 'plop' },
    { at: 6.1, sfx: 'whoosh' },
    { at: 7.0, say: '麵包超人' },
    { at: 8.2, sfx: 'cheer' },
  ],
})
