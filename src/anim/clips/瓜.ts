import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 瓜（v2）：一顆大西瓜擋在路中間，楊捷睿想把它推走——每次後退、蹲低、用力一推，西瓜就咕嚕咕嚕滾出去，撞到右邊的大石頭停一下，
// 又咕嚕咕嚕滾回來，「咚」地把正在得意的他壓扁，再彈回原位；他扁扁地貼在地上傻眼，「啵」地彈回原形，一次比一次彈得高：
// 小跳一下（左邊一撇和一豎提從瓜皮上震出來）→ 彈起來轉一圈（中間那一勾一點，像藤上吊著的瓜）→ 先停一拍：他擦汗、深呼吸、退到最遠衝過來推——
// 西瓜回來得最快，他被彈出畫面（右邊一捺）。語詞那一刻西瓜慢慢滾回正中間，他抱著它：西瓜！
// 回馬槍：他不推了，氣得輕輕踢一腳——西瓜滾出去一點點又滾回來，他抱頭等著被壓扁，結果西瓜「啪」地自己裂成兩半，紅通通的，他開心地大口吃。
// 最後畫面暗下來只剩「瓜」，楊捷睿轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再跳起來指著字說「瓜！」，然後退場只留字。
// 瓜、瓜、西瓜、這是什麼字？、瓜
const YS = 34
/** 楊捷睿站在地上的 y */
const P = 77 - 0.42 * YS
/** 大西瓜（prop:watermelon）：畫面上最大的東西，平常停在畫面正中間 */
const M = 42
const MY = 77 - 0.42 * M
const HOME = 84
/** 他每次推的地方：flip 以後 push 姿勢的手剛好碰到西瓜的左緣 */
const X = 54
/** 右邊的大石頭（prop:rock）：西瓜撞到它就滾回來 */
const ROCK = 26
const RX = 154
const RY = 77 - 0.42 * ROCK
/** 西瓜碰到石頭時的中心 */
const HIT = 124
/** 第 3 次彈得最遠：滾回去靠在石頭前面（國字放大到正中央時整個字都露出來） */
const FAR = 138
/** 西瓜滾一單位轉幾度（直徑約 35） */
const DEG = 3.27

/**
 * 「咚」：他蹲低一推（at 是手碰到西瓜那一刻）→ 西瓜轉著滾出去、撞到石頭停一下（他閉眼得意）→ 轉著滾回來，壓在他身上那一刻
 * 💥＋鏡頭推近＋震＋同一個音效 → 西瓜彈回正中間，露出扁扁的他（flat）傻眼 → 「啵」地彈回原形。k 是第幾次（越後面越快、越扁、彈越高）。
 * 回傳 hit（壓扁那一刻）、pop（彈回原形那一刻）。
 */
function roll(at: number, k: number, home = HOME) {
  const out = [0.38, 0.33, 0.28][k]
  const stay = 0.18
  const back = [0.36, 0.3, 0.22][k]
  const hit = at + out + stay + back
  const pop = hit + 0.6
  const moves: Move[] = [
    // 推：西瓜轉著滾出去
    { at: at - 0.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/push' },
    { at: at - 0.3, actor: 'yang', do: 'squash', amount: 0.15, dur: 0.15 },
    { at: at - 0.15, actor: 'yang', do: 'moveTo', to: { x: X, y: P }, dur: 0.15, ease: 'in' },
    { at, actor: 'melon', do: 'moveTo', to: { x: HIT, y: MY }, dur: out, ease: 'out' },
    { at, actor: 'melon', do: 'rotateTo', amount: (HIT - HOME) * DEG, dur: out, ease: 'out' },
    // 撞到石頭停一下；他以為推走了，閉眼得意
    { at: at + out, actor: 'melon', do: 'squash', amount: 0.12, dur: 0.15 },
    { at: at + out, actor: 'rock', do: 'shake', amount: 0.6 + 0.4 * k, dur: 0.2 },
    { at: at + out - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/smug' },
    // 滾回來，越滾越快
    { at: at + out + stay, actor: 'melon', do: 'moveTo', to: { x: X, y: MY - 2 }, dur: back, ease: 'in' },
    { at: at + out + stay, actor: 'melon', do: 'rotateTo', amount: -(HIT - X) * DEG, dur: back, ease: 'in' },
    // 咚！壓在他身上
    { at: hit, actor: 'melon', do: 'squash', amount: 0.15 + 0.05 * k, dur: 0.15 },
    { at: hit, actor: 'yang', do: 'swap', emoji: 'hero:yang/flat' },
    { at: hit, actor: 'yang', do: 'flip' },
    { at: hit, actor: 'yang', do: 'squash', amount: 0.25 + 0.12 * k, dur: pop - hit },
    // 西瓜從他身上彈回去，露出扁扁的他
    { at: hit + 0.1, actor: 'melon', do: 'moveTo', to: { x: home, y: MY }, arc: 4 + 2 * k, dur: home === HOME ? 0.3 : 0.5, ease: 'out' },
    { at: hit + 0.1, actor: 'melon', do: 'rotateTo', amount: (home - X) * DEG, dur: home === HOME ? 0.3 : 0.5, ease: 'out' },
    // 啵！彈回原形
    { at: pop, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: pop, actor: 'yang', do: 'flip' },
  ]
  const fx: Fx[] = [
    { at: at + out, kind: 'burst', x: HIT + 17, y: 62, n: 1, dur: 0.25, scale: 0.8 + 0.2 * k },
    // 💥 在他身上（壓下去的地方），一次比一次大
    { at: hit, kind: 'burst', x: X + 4, y: 50, n: 1, dur: 0.4, scale: 1.6 + 0.45 * k },
    { at: hit, kind: 'puff', x: X - 14, y: 72, dur: 0.4 },
    { at: hit + 0.3, kind: 'burst', x: X, y: 64, emoji: '⭐', n: 4 + 2 * k, dur: 0.35 },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.06 + 0.03 * k, to: { x: X + 6, y: 56 } },
    { at: hit, dur: 0.35, do: 'shake', amount: 1 + 0.5 * k },
  ]
  // 同一個音效，一次比一次多疊一個
  const cues: Cue[] = [{ at, sfx: 'whoosh' }, { at: at + out, sfx: 'tap' }, { at: hit, sfx: 'bonk' }, { at: pop, sfx: 'boing' }]
  if (k >= 1) cues.push({ at: hit + 0.04, sfx: 'plop' })
  if (k >= 2) cues.push({ at: hit + 0.08, sfx: 'rumble' })
  return { moves, fx, camera, cues, hit, pop }
}

/** 每一次手碰到西瓜的時刻 */
const G1 = 1.35, G2 = 3.6, G3 = 6.6
const r1 = roll(G1, 0)
const r2 = roll(G2, 1)
// 第 3 次：西瓜彈得最遠，滾回石頭旁邊（國字放大到正中央時不擋字）
const r3 = roll(G3, 2, FAR)
/** 字框填滿、國字放大到正中央 */
const FULL = 8.0
/** 語詞那一刻 */
const WORD = 9.15
/** 回馬槍：氣得踢一腳 → 西瓜滾回來 → 啪！裂開 */
const KICK = 9.65, BACK = 10.15, CRACK = 10.45
/** 問他 */
const ASK = 11.05

const clip: Clip = {
  format: 2,
  char: '瓜',
  meta: { theme: '推不走的大西瓜', cast: '楊捷睿＋大西瓜＋大石頭', gags: ['楊捷睿每次用力把大西瓜推走，西瓜就咕嚕咕嚕滾出去撞到石頭、又滾回來咚地把他壓扁，一次比一次快、他彈得一次比一次高；回馬槍是他不推了、氣得輕輕踢一腳，西瓜滾回來他抱頭等著被壓，結果西瓜啪地裂成兩半，他開心地吃'] },
  duration: 15,
  bg: { top: '#DDF3E4', bottom: '#FFF9E8', floor: '#D9C48E', scenery: 'hills' },
  actors: [
    { id: 'rock', emoji: 'prop:rock', x: RX, y: RY, size: ROCK },
    // 姿勢圖朝左，翻過來面向右邊的西瓜；他畫在西瓜下面：西瓜滾回來壓在他身上時蓋住他
    { id: 'yang', emoji: 'hero:yang/walk', x: 30, y: P, size: YS, hidden: true, flip: true },
    { id: 'melon', emoji: 'prop:watermelon', x: HOME, y: MY, size: M, pivot: 'center' },
    // 回馬槍裂開的另一半
    { id: 'half', emoji: 'prop:watermelon-half', x: HOME, y: MY, size: M * 0.8, hidden: true },
  ],
  moves: [
    // 楊捷睿走進來，被大西瓜擋住：抬頭看
    { at: 0, actor: 'yang', do: 'enter', from: { x: -22, y: P }, dur: 0.5, ease: 'out' },
    { at: 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    // 第 1 次：往後退一步、蹲低——用力一推
    { at: 0.95, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: 0.95, actor: 'yang', do: 'moveTo', to: { x: X - 7, y: P }, dur: 0.1 },
    ...r1.moves,
    { at: r1.pop, actor: 'yang', do: 'hop', amount: 4, dur: 0.3 },
    // 第 2 次：再退一步——推！彈起來轉一圈
    { at: G2 - 0.5, actor: 'yang', do: 'swap', emoji: 'hero:yang/angry' },
    { at: G2 - 0.45, actor: 'yang', do: 'moveTo', to: { x: X - 7, y: P }, dur: 0.2 },
    ...r2.moves,
    { at: r2.pop, actor: 'yang', do: 'hop', amount: 10, dur: 0.4 },
    { at: r2.pop, actor: 'yang', do: 'spin', times: -1, dur: 0.4, pivot: 'center' },
    // 第 3 次前停一拍：他看著西瓜、擦汗、深呼吸，往後退到最遠——衝過來推
    { at: 5.45, actor: 'yang', do: 'swap', emoji: 'hero:yang/tired' },
    { at: 5.85, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: 5.85, actor: 'yang', do: 'squash', amount: -0.15, dur: 0.3 },
    { at: 6.0, actor: 'yang', do: 'moveTo', to: { x: 16, y: P }, dur: 0.3 },
    { at: 6.3, actor: 'yang', do: 'swap', emoji: 'hero:yang/dash' },
    { at: 6.3, actor: 'yang', do: 'moveTo', to: { x: X - 7, y: P }, dur: 0.15, ease: 'in', anticipate: 3 },
    ...r3.moves,
    // 彈得最高，飛出畫面
    { at: r3.pop, actor: 'yang', do: 'moveTo', to: { x: -30, y: 8 }, dur: 0.5, ease: 'out' },
    { at: r3.pop, actor: 'yang', do: 'spin', times: -2, dur: 0.5, pivot: 'center' },
    // 語詞那一刻：西瓜從石頭旁邊慢慢滾回正中間，他跑回來抱住它
    { at: 8.75, actor: 'melon', do: 'moveTo', to: { x: HOME, y: MY }, dur: 0.4 },
    { at: 8.75, actor: 'melon', do: 'rotateTo', amount: -(FAR - HOME) * DEG, dur: 0.4 },
    { at: 8.75, actor: 'yang', do: 'swap', emoji: 'hero:yang/walk' },
    { at: 8.75, actor: 'yang', do: 'moveTo', to: { x: -22, y: P }, dur: 0.01 },
    { at: 8.77, actor: 'yang', do: 'moveTo', to: { x: X + 2, y: P }, dur: 0.33, ease: 'out' },
    { at: 9.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/hug' },
    { at: WORD, actor: 'melon', do: 'hop', amount: 2, dur: 0.25 },
    // 回馬槍（第 4 次）：他不推了，氣得跺腳、輕輕踢一腳——西瓜只滾出去一點點，停一下，又滾回來
    { at: KICK - 0.25, actor: 'yang', do: 'swap', emoji: 'hero:yang/stomp' },
    { at: KICK - 0.25, actor: 'yang', do: 'moveTo', to: { x: X, y: P }, dur: 0.15 },
    { at: KICK - 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/kick' },
    { at: KICK, actor: 'melon', do: 'moveTo', to: { x: 102, y: MY }, dur: 0.35, ease: 'out' },
    { at: KICK, actor: 'melon', do: 'rotateTo', amount: 18 * DEG, dur: 0.35, ease: 'out' },
    { at: KICK + 0.35, actor: 'melon', do: 'tilt', amount: 6, dur: 0.15 },
    { at: BACK - 0.1, actor: 'yang', do: 'swap', emoji: 'hero:yang/duck' },
    { at: BACK - 0.1, actor: 'yang', do: 'shake', amount: 1, dur: 0.4 },
    { at: BACK, actor: 'melon', do: 'moveTo', to: { x: 82, y: MY }, dur: 0.3, ease: 'in' },
    { at: BACK, actor: 'melon', do: 'rotateTo', amount: -20 * DEG, dur: 0.3, ease: 'in' },
    // 啪！輕輕碰到他，西瓜自己裂成兩半，紅通通的
    { at: CRACK, actor: 'melon', do: 'swap', emoji: 'prop:watermelon-half' },
    { at: CRACK, actor: 'melon', do: 'rotateTo', amount: 2 * DEG, dur: 0.01 },
    { at: CRACK, actor: 'melon', do: 'scaleTo', amount: 0.8, dur: 0.01 },
    { at: CRACK, actor: 'melon', do: 'moveTo', to: { x: 76, y: MY }, dur: 0.2, ease: 'out' },
    { at: CRACK, actor: 'half', do: 'pop', dur: 0.1 },
    { at: CRACK, actor: 'half', do: 'moveTo', to: { x: 112, y: MY }, dur: 0.25, ease: 'out' },
    { at: CRACK, actor: 'half', do: 'tilt', amount: 10, dur: 0.3 },
    { at: CRACK + 0.2, actor: 'yang', do: 'swap', emoji: 'hero:yang/surprised' },
    { at: CRACK + 0.4, actor: 'yang', do: 'swap', emoji: 'hero:yang/eat' },
    { at: CRACK + 0.4, actor: 'yang', do: 'hop', amount: 3, dur: 0.2 },
    // 問他：西瓜、石頭退場，他走到左前方、變大，轉向觀眾
    { at: ASK, actor: 'melon', do: 'vanish', dur: 0.15 },
    { at: ASK, actor: 'half', do: 'vanish', dur: 0.15 },
    { at: ASK, actor: 'rock', do: 'vanish', dur: 0.15 },
    { at: ASK + 0.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/idle' },
    { at: ASK + 0.05, actor: 'yang', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    { at: ASK + 0.05, actor: 'yang', do: 'moveTo', to: { x: 34, y: P + 2 }, dur: 0.3 },
    // 安靜等他回答：手放耳邊、身體往字那邊傾、點兩下頭
    { at: 12.05, actor: 'yang', do: 'swap', emoji: 'hero:yang/listen' },
    { at: 12.05, actor: 'yang', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.6, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 13.1, actor: 'yang', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.65, actor: 'yang', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.65, actor: 'yang', do: 'swap', emoji: 'hero:yang/point' },
    { at: 13.65, actor: 'yang', do: 'hop', amount: 6, dur: 0.25 },
    // 退場：揮手跑掉，畫面只留下字
    { at: 13.9, actor: 'yang', do: 'swap', emoji: 'hero:yang/happy' },
    { at: 13.92, actor: 'yang', do: 'moveTo', to: { x: -45, y: P + 2 }, dur: 0.08, ease: 'in' },
  ],
  builds: [
    // 每壓扁一次，就從瓜皮上震出一組筆畫：左邊一撇和豎提 → 中間那一勾一點（藤上吊著的瓜）→ 右邊一捺
    { at: r1.hit + 0.05, dur: 0.6, strokes: [0, 1], from: 'melon', color: partColor('瓜') },
    { at: r2.hit + 0.05, dur: 0.6, strokes: [2, 3], from: 'melon', color: partColor('瓜') },
    { at: r3.hit + 0.05, dur: 0.6, strokes: [4], from: 'melon', color: partColor('瓜') },
  ],
  glyph: [
    { at: FULL, dur: 0.45, do: 'home', ease: 'back' },
    { at: 8.75, dur: 0.45, do: 'park' },
    { at: CRACK, dur: 0.3, do: 'wobble' },
    // 問他：國字稍微偏右、縮一點，左前方讓給楊捷睿
    { at: ASK, dur: 2.95, do: 'ask', keep: ['yang'], to: { x: 98, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: 13.65, dur: 0.35, do: 'pulse' },
    { at: 14.15, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    { at: 0.5, kind: 'pop', actor: 'yang', emoji: '❗', dur: 0.4, scale: 1.3 },
    ...r1.fx,
    { at: r1.pop + 0.3, kind: 'sweat', actor: 'yang' },
    ...r2.fx,
    { at: r2.pop + 0.4, kind: 'dizzy', actor: 'yang', dur: 0.4 },
    // 第 3 次前停一拍：擦汗、深呼吸
    { at: 5.5, kind: 'sweat', actor: 'yang', dur: 0.5 },
    { at: 5.85, kind: 'blow', actor: 'yang', to: { x: 36, y: 40 }, dur: 0.35 },
    ...r3.fx,
    // 西瓜
    { at: WORD, kind: 'burst', x: HOME, y: 50, emoji: '✨', n: 6, dur: 0.4 },
    { at: KICK + 0.4, kind: 'pop', actor: 'melon', emoji: '❓', dy: -2, dur: 0.4 },
    // 啪！裂開
    { at: CRACK, kind: 'burst', x: 92, y: 58, emoji: '💦', n: 6, dur: 0.4 },
    { at: CRACK + 0.45, kind: 'pop', actor: 'yang', emoji: '😋', dx: -8, dur: 0.5, scale: 1.6 },
    { at: 13.65, kind: 'burst', x: 98, y: 38, emoji: '🌟', n: 10, dur: 0.34 },
  ],
  camera: [
    // 自動取景會推近到他、切掉右邊的石頭：劇本自己「推近」一點點（幾乎是全景），石頭和整條滾的路線都在
    { at: 0.2, dur: 0.3, do: 'zoom', amount: 1.01, to: { x: 80, y: 46 } },
    ...r1.camera,
    ...r2.camera,
    ...r3.camera,
    { at: CRACK, dur: 0.3, do: 'shake', amount: 0.8 },
    { at: ASK - 0.2, dur: 0.2, do: 'zoom', amount: 1 },
  ],
  cues: [
    { at: 0.6, say: '瓜' },
    ...r1.cues,
    ...r2.cues,
    ...r3.cues,
    { at: FULL + 0.1, say: '瓜' },
    { at: WORD, say: '西瓜' },
    { at: KICK, sfx: 'tap' },
    { at: BACK + 0.3, sfx: 'tap' },
    { at: CRACK, sfx: 'crack' },
    { at: CRACK + 0.05, sfx: 'splash' },
    { at: CRACK + 0.5, sfx: 'gulp' },
    { at: ASK + 0.1, say: FIXED_LINES.clipAsk },
    { at: 13.65, say: '瓜' },
    { at: 13.7, sfx: 'cheer' },
  ],
}

export default clip
