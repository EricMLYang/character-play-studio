// 演的是字面意思：巧（手很巧、很靈巧）＋虎——一隻老虎想拿櫃子頂上的餅乾，三兩下把箱子疊成高塔，塔垮了他還是靈巧地翻身接住餅乾（不是穿衣服的小孩老虎，就是一隻真的老虎）。
import { scene } from '../../story/scene'

// 白天的房間：老虎走進來，看到高高的門櫃頂上有一塊餅乾。他用力一跳——差好遠，小雞在旁邊偷笑。
// 他想到辦法：角落的三個箱子咻咻咻飛過來，疊得整整齊齊。他爬到最上面，塔搖啊搖……停一拍……沒倒！他拿到餅乾——
// 這時塔才嘩啦垮掉。老虎在空中翻一圈，四腳穩穩落地，餅乾剛好掉在他頭上，箱子也落成一排樓梯：「巧虎」。他把餅乾分給小雞。
const G = 68.6 // 老虎（size 20）站在地上的 y
const BOX = 14 // 箱子 size
const B0 = 71.1 // 箱子（size 14）在地上的 y
const STEP = 11.5 // 疊一層多高
const TOWER = 100
const PILE = 14 // 角落的箱子堆
const TOP = { x: TOWER, y: B0 - STEP * 3 + 2 } // 老虎站在塔頂
const COOKIE = { x: 126, y: 20 } // 門櫃頂上
const ON_HEAD = -10 // 餅乾頂在老虎頭上（落地後）
const HEAD_X = 7 // 老虎朝右，頭在右邊

export default scene({
  duration: 9.3,
  bg: { top: '#FFE7A8', bottom: '#FFF6DC', floor: '#C98E5A', scenery: 'room' },
  actors: [
    { id: 'door', emoji: '🚪', x: 126, y: 53.5, size: 56 },
    { id: 'plant', emoji: '🪴', x: 150, y: 69.4, size: 18 },
    { id: 'cookie', emoji: '🍪', x: COOKIE.x, y: COOKIE.y, size: 9, pivot: 'center' },
    { id: 'b1', emoji: '📦', x: PILE, y: B0, size: BOX, pivot: 'center' },
    { id: 'b2', emoji: '📦', x: PILE, y: B0 - STEP, size: BOX, pivot: 'center' },
    { id: 'b3', emoji: '📦', x: PILE + 12, y: B0, size: BOX, pivot: 'center' },
    { id: 'chick', emoji: '🐥', x: 38, y: 73.6, size: 8 },
    { id: 'tiger', emoji: '🐅', x: 60, y: G, size: 20, flip: true, pivot: 'center' },
  ],
  moves: [
    // 走進來，看到餅乾
    { at: 0, actor: 'tiger', do: 'enter', from: { x: -20, y: G }, dur: 1.0, ease: 'out' },
    { at: 1.1, actor: 'tiger', do: 'hop', amount: 3, dur: 0.3 },
    // 跑到門櫃下，用力一跳：差好遠
    { at: 1.5, actor: 'tiger', do: 'moveTo', to: { x: 116, y: G }, dur: 0.45, ease: 'inOut' },
    { at: 2.0, actor: 'tiger', do: 'squash', amount: 0.3, dur: 0.2 },
    { at: 2.2, actor: 'tiger', do: 'hop', amount: 13, dur: 0.55 },
    { at: 2.75, actor: 'tiger', do: 'squash', amount: 0.2, dur: 0.2 },
    { at: 2.85, actor: 'chick', do: 'hop', amount: 2, dur: 0.25 },
    { at: 3.1, actor: 'chick', do: 'hop', amount: 2, dur: 0.25 },
    // 想到辦法：角落的箱子咻咻咻飛過來疊好
    { at: 3.2, actor: 'tiger', do: 'moveTo', to: { x: 84, y: G }, dur: 0.35 },
    { at: 3.6, actor: 'tiger', do: 'tilt', amount: -12, dur: 0.2 },
    { at: 3.6, actor: 'b3', do: 'moveTo', to: { x: TOWER, y: B0 }, arc: 14, dur: 0.35, ease: 'out' },
    { at: 3.6, actor: 'b3', do: 'spin', times: 1, dur: 0.35 },
    { at: 3.85, actor: 'tiger', do: 'tilt', amount: -12, dur: 0.2 },
    { at: 3.85, actor: 'b1', do: 'moveTo', to: { x: TOWER, y: B0 - STEP }, arc: 16, dur: 0.35, ease: 'out' },
    { at: 3.85, actor: 'b1', do: 'spin', times: 1, dur: 0.35 },
    { at: 4.1, actor: 'tiger', do: 'tilt', amount: -12, dur: 0.2 },
    { at: 4.1, actor: 'b2', do: 'moveTo', to: { x: TOWER, y: B0 - STEP * 2 }, arc: 16, dur: 0.35, ease: 'out' },
    { at: 4.1, actor: 'b2', do: 'spin', times: 1, dur: 0.35 },
    // 爬到塔頂，塔搖啊搖……沒倒
    { at: 4.6, actor: 'tiger', do: 'moveTo', to: TOP, arc: 10, dur: 0.45, ease: 'out' },
    { at: 5.1, actor: 'b2', do: 'tilt', amount: 8, dur: 0.6 },
    { at: 5.1, actor: 'b1', do: 'tilt', amount: -6, dur: 0.6 },
    { at: 5.1, actor: 'tiger', do: 'tilt', amount: 10, dur: 0.6 },
    // 拿到餅乾！
    { at: 5.9, actor: 'tiger', do: 'squash', amount: -0.25, dur: 0.25 },
    { at: 6.0, actor: 'cookie', do: 'moveTo', to: { x: TOWER + HEAD_X, y: TOP.y + ON_HEAD - 2 }, dur: 0.2, ease: 'out' },
    // 這時塔才垮掉：老虎空中翻一圈，穩穩落地；餅乾掉在他頭上，箱子落成一排樓梯
    { at: 6.3, actor: 'b1', do: 'moveTo', to: { x: 128, y: B0 }, arc: 8, dur: 0.45, ease: 'out' },
    { at: 6.3, actor: 'b1', do: 'spin', times: 1, dur: 0.45 },
    { at: 6.3, actor: 'b2', do: 'moveTo', to: { x: 142, y: B0 }, arc: 12, dur: 0.55, ease: 'out' },
    { at: 6.3, actor: 'b2', do: 'spin', times: 2, dur: 0.55 },
    { at: 6.3, actor: 'b3', do: 'moveTo', to: { x: 142, y: B0 - STEP }, arc: 14, dur: 0.7, ease: 'out' },
    { at: 6.3, actor: 'b3', do: 'spin', times: 2, dur: 0.7 },
    { at: 6.3, actor: 'tiger', do: 'moveTo', to: { x: 96, y: G }, arc: 8, dur: 0.5, ease: 'in' },
    { at: 6.3, actor: 'tiger', do: 'spin', times: 1, dur: 0.5 },
    { at: 6.3, actor: 'cookie', do: 'moveTo', to: { x: 100, y: 10 }, dur: 0.35, ease: 'out' },
    { at: 6.3, actor: 'cookie', do: 'spin', times: 2, dur: 0.7 },
    { at: 6.65, actor: 'cookie', do: 'moveTo', to: { x: 96 + HEAD_X, y: G + ON_HEAD }, dur: 0.45, ease: 'bounce' },
    // 挺胸變大
    { at: 7.2, actor: 'tiger', do: 'scaleTo', amount: 1.5, dur: 0.35, ease: 'back' },
    { at: 7.2, actor: 'cookie', do: 'moveTo', to: { x: 96 + HEAD_X * 1.5, y: G + ON_HEAD * 1.5 }, dur: 0.35, ease: 'back' },
    { at: 7.2, actor: 'cookie', do: 'scaleTo', amount: 1.3, dur: 0.35, ease: 'back' },
    { at: 7.5, actor: 'chick', do: 'moveTo', to: { x: 70, y: 73.6 }, dur: 0.4 },
    { at: 8.0, actor: 'chick', do: 'hop', amount: 3, dur: 0.3 },
    { at: 8.0, actor: 'tiger', do: 'hop', amount: 2, dur: 0.3 },
    { at: 8.0, actor: 'cookie', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 1.1, kind: 'pop', actor: 'tiger', emoji: '❗', dx: 8, dur: 0.4 },
    { at: 1.3, kind: 'bubble', actor: 'tiger', emoji: '🍪', dur: 0.6 },
    { at: 2.85, kind: 'sweat', actor: 'tiger' },
    { at: 2.9, kind: 'pop', actor: 'chick', emoji: '😆', dx: 4, dur: 0.6 },
    { at: 3.3, kind: 'pop', actor: 'tiger', emoji: '💡', dx: 6, dur: 0.45 },
    { at: 3.95, kind: 'puff', actor: 'b3', dur: 0.3 },
    { at: 4.45, kind: 'burst', actor: 'b2', emoji: '✨', n: 5, dur: 0.5 },
    { at: 5.15, kind: 'sweat', actor: 'tiger' },
    { at: 5.5, kind: 'pop', actor: 'chick', emoji: '😱', dx: 4, dur: 0.5 },
    { at: 6.05, kind: 'burst', actor: 'cookie', emoji: '⭐', n: 5, dur: 0.5 },
    { at: 6.8, kind: 'puff', actor: 'tiger', n: 8, dur: 0.5 },
    { at: 7.1, kind: 'burst', actor: 'cookie', emoji: '✨', n: 8, dur: 0.8 },
    { at: 7.4, kind: 'burst', actor: 'tiger', emoji: '🎉', n: 10, dur: 1.0 },
    { at: 8.0, kind: 'pop', actor: 'chick', emoji: '💕', dx: 4, dur: 0.6 },
  ],
  camera: [
    { at: 4.6, dur: 0.6, do: 'zoom', amount: 1.35, to: { x: 108, y: 38 } },
    { at: 6.3, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 6.8, dur: 0.35, do: 'shake', amount: 1.6 },
    { at: 7.3, dur: 0.5, do: 'zoom', amount: 1.4, to: { x: 96, y: 56 } },
  ],
  lights: [
    { at: 5.1, dur: 0.5, level: 0.2 },
    { at: 6.0, dur: 0.05, level: -0.3 },
    { at: 6.05, dur: 0.4, level: 0 },
    { at: 7.15, dur: 0.05, level: -0.35 },
    { at: 7.2, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'tap' },
    { at: 1.1, sfx: 'blip' },
    { at: 2.2, sfx: 'boing' },
    { at: 2.9, sfx: 'blip' },
    { at: 3.6, sfx: 'whoosh' },
    { at: 3.95, sfx: 'clink' },
    { at: 4.2, sfx: 'clink' },
    { at: 4.45, sfx: 'clink' },
    { at: 5.1, sfx: 'slide' },
    { at: 6.0, sfx: 'gulp' },
    { at: 6.3, sfx: 'crack' },
    { at: 6.8, sfx: 'bonk' },
    { at: 7.1, sfx: 'plop' },
    { at: 7.4, say: '巧虎' },
    { at: 8.0, sfx: 'cheer' },
  ],
})
