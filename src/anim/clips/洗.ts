import type { Camera, Clip, Cue, Fx, Move } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 洗（v2）：一本正經的狗狗警長最愛乾淨。小恐龍拿著大畫筆在旁邊畫畫，一看到乾乾淨淨的警長就忍不住——畫筆往後一甩，「啪！」顏料潑他一身。
// 警長只好再洗：泡泡搓一搓、蓮蓬頭的水「嘩」一沖，亮晶晶 ✨、得意敬禮——「啪！」又被潑，一次比一次髒、洗得一次比一次誇張：
// 泡泡到腰（氵從沖下來的水花飛出來）、泡泡到胸口（⺧從泡泡堆飛出來）、先停一拍（他伸手比「等一下！」）再被潑成彩虹、嚇得跳好高，
// 泡泡淹到脖子（儿從他跳起來的腳飛出來）。
// 回馬槍：語詞「洗手」他先乖乖洗手，接著乾脆把自己整個埋進泡泡山，只露出帽子——這下潑不到了吧？小恐龍一甩，顏料剛好打在唯一露出來的帽子上，
// 流下來又是全身彩色。最後畫面暗下來只剩「洗」，警長轉向觀眾問「這是什麼字？」，手放耳邊等他回答，再指著字說「洗！」，然後退場只留字。
// 洗、洗、洗手、這是什麼字？、洗
const SIZE = 34
const P = 77 - 0.42 * SIZE // 警長站在地上的 y
/** 警長站的地方（畫面中間偏左，蓮蓬頭在他左上方） */
const SX = 70
/** 小恐龍（畫家）在右邊，面向左邊的警長 */
const RX = 130
const RS = 24
const RP = 77 - 0.42 * RS
/** 畫筆：平常拿在胸前，甩之前舉到頭上 */
const BRUSH = { x: RX - 11, y: RP - 1 }
const BRUSH_UP = { x: RX - 8, y: RP - 14 }
/** 泡泡（🫧）：基本 size 與每一次長多大（倍率）——到腰、到胸口、到脖子、整座泡泡山 */
const FS = 30
const FOAM = [0.75, 1.0, 1.25, 1.1]
/** 每一次被潑的顏色：3D 的圓點顏料＋警長整隻染上那個顏色 */
const BLOB = ['🟣', '🟢', '🔵', '🔴', '🟠']
const PAINT = [
  'sepia(.55) saturate(3.2) hue-rotate(255deg) brightness(1.02)',
  'sepia(.6) saturate(3.4) hue-rotate(55deg) brightness(1.02)',
  'sepia(.6) saturate(3.6) hue-rotate(165deg) brightness(1.02)',
  'saturate(3) hue-rotate(120deg) contrast(1.1)',
  'sepia(.9) saturate(5.5) hue-rotate(-40deg) brightness(.95)',
]
const SWOOSH = ['#B14BE0', '#2FAE4E', '#2A6FE0', '#E03A3A', '#F08A1C']
/** 被潑到嚇得跳多高：一次比一次高 */
const HOP = [4, 7, 10, 18, 8]

/**
 * 「啪！」潑顏料：小恐龍換丟的姿勢、畫筆舉到頭上往後翹（預備）→ 一甩，弧線＋一串顏料圓點飛向警長 →
 * 打中那一刻警長染色、傻眼跳起來＋顏料點一圈＋鏡頭推近＋震＋同一個音效（一次比一次多疊一個音）。
 * k 是第幾次（越後面越多、越大）；第 3 次（k = 3）的預備另外拉長。
 */
function splat(at: number, k: number) {
  const moves: Move[] = [
    { at: at - 0.45, actor: 'rex', do: 'swap', emoji: 'hero:rex/throw' },
    { at: at - 0.45, actor: 'brush', do: 'moveTo', to: BRUSH_UP, dur: 0.12 },
    { at: at - 0.45, actor: 'brush', do: 'rotateTo', amount: 45, dur: 0.15 },
    // 一甩
    { at: at - 0.2, actor: 'brush', do: 'rotateTo', amount: -110, dur: 0.1, ease: 'in' },
    { at: at - 0.2, actor: 'rex', do: 'tilt', amount: -8, dur: 0.3 },
    { at: at + 0.15, actor: 'brush', do: 'rotateTo', amount: 65, dur: 0.2 },
    { at: at + 0.15, actor: 'brush', do: 'moveTo', to: BRUSH, dur: 0.2 },
    { at: at + 0.15, actor: 'rex', do: 'swap', emoji: 'hero:rex/giggle' },
    // 打中：染色、傻眼跳起來
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'tint', filter: PAINT[k] },
    { at, actor: 'sheriff', do: 'hop', amount: HOP[k], dur: 0.3 + 0.03 * HOP[k] },
  ]
  const fx: Fx[] = [
    { at: at - 0.22, kind: 'swoosh', actor: 'brush', target: 'sheriff', color: SWOOSH[k], width: 3.2, n: 9, dur: 0.3 },
    { at: at - 0.2, kind: 'blow', actor: 'brush', target: 'sheriff', emoji: BLOB[k], n: 3 + k, dur: 0.22, scale: 1 },
    // 第 4 次只打在帽子上：小小一圈、對準帽子
    k >= 4
      ? { at, kind: 'burst', x: SX, y: P - 15, emoji: BLOB[k], n: 6, dur: 0.45, scale: 1.3 }
      : { at, kind: 'burst', x: SX, y: P - 6, emoji: BLOB[k], n: 5 + 2 * k, dur: 0.45, scale: 1.3 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.45, do: 'punch', amount: 0.1 + 0.05 * Math.min(k, 3), to: { x: SX, y: P - 8 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.4 * Math.min(k, 3) },
  ]
  const cues: Cue[] = [{ at: at - 0.2, sfx: 'whoosh' }, { at, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: at + 0.04, sfx: 'splash' })
  if (k >= 2) cues.push({ at: at + 0.08, sfx: 'bonk' })
  return { moves, fx, camera, cues }
}

/**
 * 「洗」：泡泡從腳下冒出來、長到 FOAM[k]，警長在裡面用力搓（抖）→ 蓮蓬頭「嘩」一沖，泡泡和顏料一起沖掉 →
 * ✨ 亮晶晶、敬禮。k 是第幾次（泡泡越後面越多、越高）。回傳 rinse（沖水那一刻，筆畫從這裡飛出來）。
 */
function wash(at: number, k: number) {
  const rinse = at + 0.55
  const shine = rinse + 0.22
  const moves: Move[] = [
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at, actor: 'foam', do: 'pop', dur: 0.15 },
    { at, actor: 'foam', do: 'scaleTo', amount: FOAM[k], dur: 0.25, ease: 'back' },
    { at: at + 0.1, actor: 'sheriff', do: 'shake', amount: 1.2 + 0.3 * k, dur: 0.4 },
    { at: at + 0.1, actor: 'foam', do: 'shake', amount: 0.8 + 0.2 * k, dur: 0.4 },
    // 嘩——沖乾淨
    { at: rinse - 0.08, actor: 'shower', do: 'shake', amount: 0.8, dur: 0.3 },
    { at: rinse + 0.05, actor: 'foam', do: 'vanish', dur: 0.2 },
    { at: rinse + 0.1, actor: 'sheriff', do: 'tint', filter: '' },
    // ✨ 亮晶晶，得意敬禮
    { at: shine, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/salute' },
  ]
  const fx: Fx[] = [
    { at, kind: 'pop', actor: 'sheriff', emoji: '🧼', dx: -20, dy: 14, dur: 0.45, scale: 1.6 },
    { at, kind: 'burst', actor: 'foam', emoji: '🫧', n: 5 + 2 * k, dur: 0.55, scale: 1.2 + 0.3 * k },
    { at: at + 0.25, kind: 'burst', actor: 'foam', emoji: '🫧', n: 4 + 2 * k, dur: 0.4, scale: 1 + 0.3 * k, dy: -4 },
    { at: rinse - 0.05, kind: 'rain', actor: 'sheriff', emoji: '💧', n: 9 + 2 * k, dy: -16, dur: 0.4, scale: 1.4 + 0.15 * k },
    { at: rinse + 0.05, kind: 'burst', actor: 'sheriff', emoji: '💦', n: 6, dur: 0.35, scale: 1.4 + 0.2 * k, dy: 12 },
    { at: shine, kind: 'burst', actor: 'sheriff', emoji: '✨', n: 6 + k, dur: 0.45, scale: 1.4 + 0.25 * k },
  ]
  const cues: Cue[] = [
    { at, sfx: 'bubble' },
    { at: rinse - 0.05, sfx: 'splash' },
    { at: shine, sfx: 'clink' },
  ]
  if (k >= 1) cues.push({ at: at + 0.15, sfx: 'bubble' })
  if (k >= 2) cues.push({ at: at + 0.3, sfx: 'bubble' })
  return { moves, fx, cues, rinse, shine }
}

const S0 = 0.7, W1 = 1.05, S1 = 2.35, W2 = 2.7, S2 = 4.0, W3 = 4.35, S3 = 6.05
const s0 = splat(S0, 0)
const w1 = wash(W1, 0)
const s1 = splat(S1, 1)
const w2 = wash(W2, 1)
const s2 = splat(S2, 2)
const w3 = wash(W3, 2)
const s3 = splat(S3, 3)
/** 語詞「洗手」：國字讓到上方，他在中間洗手 */
const WORD = 8.15
/** 回馬槍：整座泡泡山，只露帽子；顏料打在帽子上 */
const W4 = 8.95, S4 = 9.95
const s4 = splat(S4, 4)

const clip: Clip = {
  format: 2,
  char: '洗',
  meta: { theme: '浴室裡洗不乾淨', cast: '狗狗警長＋小恐龍（畫家）', gags: ['警長每次洗得亮晶晶，小恐龍的畫筆一甩就潑他一身顏料，一次比一次髒、泡泡一次比一次多；回馬槍是他整個人埋進泡泡山只露帽子，顏料剛好打在帽子上'] },
  duration: 15,
  bg: { top: '#CDEFF5', bottom: '#F1FBFD', floor: '#9FD3DD', scenery: 'room' },
  actors: [
    // 蓮蓬頭在警長左上方（圖往左下噴，翻過來往右下噴到他頭上）
    { id: 'shower', emoji: '🚿', x: 48, y: 38, size: 14, float: true, flip: true },
    { id: 'rex', emoji: 'hero:rex/idle', x: RX, y: RP, size: RS },
    { id: 'brush', emoji: '🖌️', x: BRUSH.x, y: BRUSH.y, size: 10, float: true },
    // 警長面向右邊的小恐龍
    { id: 'sheriff', emoji: 'hero:sheriff/salute', x: SX, y: P, size: SIZE, flip: true },
    // 泡泡畫在警長前面，從腳底長上來
    { id: 'foam', emoji: '🫧', x: SX, y: 77 - 0.42 * FS, size: FS, hidden: true, float: true },
    // 泡泡山的另一半（翻過來、錯開一點，兩堆疊起來才看不到縫）
    { id: 'foam2', emoji: '🫧', x: SX + 9, y: 77 - 0.42 * FS, size: FS, hidden: true, float: true, flip: true },
  ],
  moves: [
    // 開場：警長乾乾淨淨、抬頭敬禮；小恐龍拿著畫筆看著他，眼睛一亮
    { at: 0.35, actor: 'rex', do: 'swap', emoji: 'hero:rex/drool' },
    ...s0.moves,
    ...w1.moves,
    ...s1.moves,
    ...w2.moves,
    ...s2.moves,
    ...w3.moves,
    // 第 3 次前停一拍：小恐龍又舉起畫筆——警長伸手比「等一下！」
    { at: 5.25, actor: 'rex', do: 'swap', emoji: 'hero:rex/drool' },
    { at: 5.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/wait' },
    { at: 5.45, actor: 'sheriff', do: 'shake', amount: 0.6, dur: 0.4 },
    ...s3.moves,
    // 跳好高、摔下來傻眼
    { at: S3 + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: 26, y: P }, arc: 10, dur: 0.55, ease: 'out' },
    { at: S3 + 0.85, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/angry' },
    { at: 7.75, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: P }, dur: 0.35 },
    // 語詞「洗手」：他先乖乖洗手
    { at: WORD - 0.15, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: WORD, actor: 'sheriff', do: 'shake', amount: 0.8, dur: 0.6 },
    // 回馬槍：泡泡山——整個人埋進去，只露帽子
    { at: W4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: W4, actor: 'foam', do: 'pop', dur: 0.15 },
    { at: W4, actor: 'foam', do: 'scaleTo', amount: FOAM[3], dur: 0.35, ease: 'back' },
    { at: W4, actor: 'foam2', do: 'pop', dur: 0.15 },
    { at: W4 + 0.05, actor: 'foam2', do: 'scaleTo', amount: 0.95, dur: 0.35, ease: 'back' },
    { at: W4 + 0.1, actor: 'foam2', do: 'shake', amount: 1, dur: 0.5 },
    { at: W4 + 0.2, actor: 'sheriff', do: 'tint', filter: '' },
    { at: W4 + 0.1, actor: 'foam', do: 'shake', amount: 1, dur: 0.5 },
    { at: W4 + 0.6, actor: 'rex', do: 'swap', emoji: 'hero:rex/drool' },
    ...s4.moves,
    // 泡泡「啵」地破掉：全身又是彩色的
    { at: S4 + 0.35, actor: 'foam', do: 'vanish', dur: 0.15 },
    { at: S4 + 0.35, actor: 'foam2', do: 'vanish', dur: 0.15 },
    // 小恐龍笑著溜走，畫筆跟著帶走；蓮蓬頭收起來
    { at: 10.4, actor: 'rex', do: 'swap', emoji: 'hero:rex/laugh' },
    { at: 10.45, actor: 'rex', do: 'moveTo', to: { x: 190, y: RP }, dur: 0.35, ease: 'in' },
    { at: 10.45, actor: 'brush', do: 'moveTo', to: { x: 190 - 11, y: RP - 1 }, dur: 0.35, ease: 'in' },
    { at: 10.6, actor: 'shower', do: 'vanish', dur: 0.2 },
    // 問他：走到左前方、變大，轉向觀眾
    { at: 10.75, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    { at: 10.75, actor: 'sheriff', do: 'moveTo', to: { x: 36, y: P + 4 }, dur: 0.3 },
    { at: 10.75, actor: 'sheriff', do: 'scaleTo', amount: 1.12, dur: 0.3, ease: 'back' },
    { at: 11.8, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: 11.8, actor: 'sheriff', do: 'rotateTo', amount: 10, dur: 0.3 },
    { at: 12.35, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: 12.85, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: 13.4, actor: 'sheriff', do: 'rotateTo', amount: -10, dur: 0.12 },
    { at: 13.4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 13.4, actor: 'sheriff', do: 'hop', amount: 6, dur: 0.25 },
    // 退場，畫面只留下字
    { at: 13.65, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: 13.65, actor: 'sheriff', do: 'flip' },
    { at: 13.67, actor: 'sheriff', do: 'moveTo', to: { x: -45, y: P + 4 }, dur: 0.25, ease: 'in' },
  ],
  builds: [
    // 第 1 次：沖下來的水花——三點水
    { at: w1.rinse + 0.05, dur: 0.55, strokes: [0, 1, 2], from: 'sheriff', color: partColor('氵') },
    // 第 2 次：泡泡堆裡飛出⺧
    { at: w2.rinse - 0.1, dur: 0.6, strokes: [3, 4, 5, 6], from: 'foam', color: partColor('⺧') },
    // 第 3 次：嚇得跳起來的兩條腿——儿
    { at: S3 + 0.1, dur: 0.55, strokes: [7, 8], from: 'sheriff', color: partColor('儿') },
  ],
  glyph: [
    { at: 6.85, dur: 0.45, do: 'home', ease: 'back' },
    { at: 7.8, dur: 0.45, do: 'park' },
    { at: 10.7, dur: 3.3, do: 'ask', keep: ['sheriff'], to: { x: 100, y: 43 }, amount: 0.82 },
    { at: 10.75, dur: 0.4, do: 'home' },
    { at: 13.4, dur: 0.35, do: 'pulse' },
    { at: 14.05, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...s0.fx,
    ...w1.fx,
    ...s1.fx,
    ...w2.fx,
    ...s2.fx,
    ...w3.fx,
    { at: 5.45, kind: 'sweat', actor: 'sheriff' },
    ...s3.fx,
    // 第 3 次潑成彩虹：五種顏色一起炸開
    ...['🟡', '🟢', '🔵', '🟣'].map((emoji, i): Fx => ({ at: S3 + 0.03 * i, kind: 'burst', x: SX, y: P - 6, emoji, n: 5, dur: 0.5, scale: 1.4 + 0.12 * i })),
    // 洗手：肥皂、泡泡在手上，水一沖，手亮晶晶
    { at: WORD, kind: 'pop', actor: 'sheriff', emoji: '🧼', dx: -20, dy: 14, dur: 0.5, scale: 1.8 },
    { at: WORD + 0.05, kind: 'burst', actor: 'sheriff', emoji: '🫧', n: 6, dur: 0.5, scale: 1.4, dy: 16 },
    { at: WORD + 0.5, kind: 'rain', actor: 'sheriff', emoji: '💧', n: 8, dy: -16, dur: 0.35, scale: 1.4 },
    { at: WORD + 0.65, kind: 'burst', actor: 'sheriff', emoji: '✨', n: 5, dur: 0.4, scale: 1.3, dy: 16 },
    // 泡泡山
    { at: W4, kind: 'burst', actor: 'foam', emoji: '🫧', n: 12, dur: 0.6, scale: 2.4 },
    { at: W4 + 0.35, kind: 'burst', actor: 'foam', emoji: '✨', n: 6, dur: 0.45, scale: 2 },
    ...s4.fx,
    { at: S4 + 0.35, kind: 'burst', actor: 'sheriff', emoji: '🫧', n: 12, dur: 0.5, scale: 2.4 },
    { at: 13.4, kind: 'burst', x: 100, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    ...s0.camera,
    ...s1.camera,
    ...s2.camera,
    ...s3.camera,
    ...s4.camera,
  ],
  lights: [
    // 每次亮晶晶白光一閃
    ...[w1.shine, w2.shine, w3.shine].flatMap((at, k) => [{ at, dur: 0.04, level: -0.2 - 0.06 * k }, { at: at + 0.04, dur: 0.25, level: 0 }]),
    { at: 6.85, dur: 0.05, level: -0.35 },
    { at: 6.9, dur: 0.35, level: 0 },
  ],
  cues: [
    ...s0.cues,
    ...w1.cues,
    { at: W1 + 0.05, say: '洗' },
    ...s1.cues,
    ...w2.cues,
    ...s2.cues,
    ...w3.cues,
    ...s3.cues,
    { at: 6.9, say: '洗' },
    { at: WORD + 0.05, say: '洗手' },
    { at: WORD + 0.5, sfx: 'splash' },
    { at: W4, sfx: 'bubble' },
    { at: W4 + 0.15, sfx: 'bubble' },
    ...s4.cues,
    { at: S4 + 0.35, sfx: 'poof' },
    { at: 10.85, say: FIXED_LINES.clipAsk },
    { at: 13.4, say: '洗' },
    { at: 13.45, sfx: 'cheer' },
  ],
}

export default clip
