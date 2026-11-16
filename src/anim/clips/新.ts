import type { Build, Camera, Clip, Cue, Fx, Move, Vec } from '../clip'
import { partColor } from '../parts'
import { FIXED_LINES } from '../../../shared/voice-lines.mjs'

// 新（v2）：新東西亮晶晶。狗狗警長每拿到一樣新東西，「叮！」東西上冒出一圈大大的 ✨，他捧在胸前、看得流口水——
// 頭上那朵調皮的小烏雲一抖，「啪！」一坨泥巴正好掉在新東西上，✨ 沒了，他傻眼、大哭，一次比一次大、一次比一次崩潰：
// 新鞋（哭）→ 新書包（哭到跳起來）→ 先停一拍：他抬頭懷疑地看烏雲，烏雲變白裝乖，他鬆一口氣——
// 「啪！」最大的一坨打在新熊熊上，他哭到跳好高（每一次的髒東西都被他哭著往後一丟）。
// 語詞那一刻：「叮！」畫面正中間冒出一雙亮晶晶的新鞋，✨ 最大一圈，他衝回來流口水：「新鞋」。
// 回馬槍（第四次）：烏雲又一抖——這次他學乖了，一把把新鞋往旁邊伸得遠遠的——「啪！」最大的一坨泥巴整個打在他自己頭上，
// 他變成泥巴狗、傻眼……可是新鞋還是「叮！」亮晶晶的，他開心得跳起來，抱著新鞋跑走。
// 最後畫面暗下來只剩「新」，警長走回來問「這是什麼字？」，手放耳邊等他回答，再指著字說「新！」，然後退場只留字。
// 刻意不跟「洗」（乾淨的警長被潑顏料、洗澡泡泡）、「喜」（開禮物盒）、「穿」「脫」（衣物）撞：這支只演「新＝剛拿到、亮晶晶（✨）」，
// 髒掉的是新東西本身（泥巴從頭上那朵雲掉下來），沒有洗、沒有潑、沒有拆禮物，也不拿舊東西來比。
// 新、新、新鞋、這是什麼字？、新

/** 狗狗警長（hero:sheriff；圖朝左，看著左前方捧著的新東西） */
const SS = 40
const SY = 77 - 0.42 * SS
/** 每次都站在同一個地方（畫面中間偏右），字框讓到左上 */
const SX = 109
/** 捧在胸前的新東西（中心）：在他左前方，頭上那朵雲正下方 */
const HOLD: Vec = { x: 82, y: 57 }
/** 調皮的小烏雲：一直飄在捧著的東西正上方 */
const CLOUD: Vec = { x: 82, y: 13 }
/** 新東西共用一個角色換圖：底子 size 寫最大的（新熊熊），其他用 scaleTo 縮 */
const IB = 38
const ITEMS = [
  { emoji: '👟', size: 27 },
  { emoji: 'prop:backpack', size: 32 },
  { emoji: '🧸', size: 38 },
]
/** 語詞那一刻的新鞋 */
const SHOE = 36
/** 泥巴（🟤 壓扁成一坨）：底子 size 寫最大的（第 4 次），一次比一次大 */
const MB = 34
const MUD = [12, 15, 18, 26]
/** 國字讓位的地方（左上，背後是素色的天空） */
const PARK_AT: Vec = { x: 34, y: 22 }
/** 傻眼停多久 */
const HOLD_FACE = 0.42
/** 泥巴從雲底掉下來要多久 */
const FALL = 0.22
/** 回馬槍被打成泥巴狗 */
/** 新東西被弄髒 */
const DIRTY = 'sepia(.7) saturate(.7) brightness(.72)'
const MUDDY = 'sepia(.75) saturate(1.6) hue-rotate(-12deg) brightness(.78)'

/** 角色以腳底為準縮放：要讓縮過的東西「中心」在 cy，角色的 y 要這樣算 */
const yFor = (cy: number, size: number, base: number) => cy + 0.42 * size - 0.42 * base

type Gag = { moves: Move[]; fx: Fx[]; camera: Camera[]; cues: Cue[] }

/** 「叮！」新東西冒出來：一圈大大的 ✨ 長在東西上，再閃一下 */
function shine(at: number, c: Vec, size: number, big = 1): { fx: Fx[]; cues: Cue[] } {
  return {
    fx: [
      { at, kind: 'burst', x: c.x, y: c.y, emoji: '✨', n: 8, dur: 0.6, scale: (1.5 + size / 40) * big },
      { at: at + 0.3, kind: 'burst', x: c.x + size * 0.32, y: c.y - size * 0.3, emoji: '✨', n: 1, dur: 0.5, scale: 1.1 + size / 50 },
    ],
    cues: [{ at, sfx: 'clink' }, { at: at + 0.05, sfx: 'blip' }],
  }
}

/** 泥巴從雲底「咻」地掉到 feet（泥巴的腳底），在 at 那一刻打中，壓扁成一坨 */
function mudFall(at: number, feet: Vec, size: number): Move[] {
  const start = at - FALL - 0.06
  return [
    { at: start - 0.02, actor: 'mud', do: 'moveTo', to: { x: CLOUD.x, y: yFor(CLOUD.y + 9, size, MB) }, dur: 0.01 },
    { at: start, actor: 'mud', do: 'pop', dur: 0.06 },
    { at: start + 0.001, actor: 'mud', do: 'scaleTo', amount: size / MB, dur: 0.01 },
    { at: at - FALL, actor: 'mud', do: 'moveTo', to: { x: feet.x, y: feet.y - 0.42 * MB }, dur: FALL, ease: 'in' },
    // 啪！壓扁成一坨
    { at, actor: 'mud', do: 'stretchTo', amount: 1.45, dur: 0.12, ease: 'out' },
  ]
}

/** 烏雲一抖（預備）：要掉泥巴了 */
function cloudShiver(at: number, k: number): Move[] {
  return [
    { at, actor: 'cloud', do: 'shake', amount: 1.2 + 0.4 * k, dur: 0.3 },
    { at: at + 0.12, actor: 'cloud', do: 'squash', amount: 0.18 + 0.04 * k, dur: 0.2 },
  ]
}

/** 「啪！」打中那一下的效果（泥巴四濺＋💥＋鏡頭推一下＋震＋同一個音效，一次多疊一個音） */
function splat(at: number, c: Vec, k: number): Gag {
  const fx: Fx[] = [
    { at, kind: 'burst', x: c.x, y: c.y, n: 1, dur: 0.35, scale: 0.9 + 0.3 * k },
    { at, kind: 'burst', x: c.x, y: c.y + 2, emoji: '🟤', n: 6 + k, dur: 0.45, scale: 0.9 + 0.25 * k },
  ]
  const camera: Camera[] = [
    { at, dur: 0.4, do: 'punch', amount: 0.04 + 0.02 * k, to: { x: c.x + 8, y: 50 } },
    { at, dur: 0.3, do: 'shake', amount: 0.8 + 0.45 * k },
  ]
  const cues: Cue[] = [{ at, sfx: 'splash' }, { at: at + 0.03, sfx: 'plop' }]
  if (k >= 1) cues.push({ at: at + 0.06, sfx: 'bonk' })
  if (k >= 2) cues.push({ at: at + 0.09, sfx: 'rumble' })
  return { moves: [], fx, camera, cues }
}

/**
 * 同一個笑點（第 1～3 次）：「叮！」新東西捧在胸前、✨ 一圈（流口水）→ 烏雲一抖 → 「啪！」泥巴掉在新東西上 →
 * 傻眼停住 → 大哭（一次比一次誇張）→ 哭著把髒掉的東西往後一丟（飛出畫面左邊）。at 是「啪」那一刻，k 是第幾次。
 */
function spoil(at: number, k: number, opts: { pause?: number; keep?: boolean } = {}): Gag & { pop: number } {
  const item = ITEMS[k]
  const s = item.size / IB
  const pop = at - 0.9 - (opts.pause ?? 0)
  const iy = yFor(HOLD.y, item.size, IB)
  const top = HOLD.y - 0.45 * item.size
  const sh = shine(pop, HOLD, item.size)
  const hit = splat(at, { x: HOLD.x, y: top }, k)
  const moves: Move[] = [
    // 叮！新東西出現在他手上
    { at: pop - 0.03, actor: 'item', do: 'swap', emoji: item.emoji },
    { at: pop - 0.02, actor: 'item', do: 'moveTo', to: { x: HOLD.x, y: iy }, dur: 0.01 },
    { at: pop - 0.02, actor: 'item', do: 'tint', filter: '' },
    { at: pop, actor: 'item', do: 'pop', dur: 0.3 },
    { at: pop + 0.001, actor: 'item', do: 'scaleTo', amount: s, dur: 0.01 },
    { at: pop, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
    { at: pop, actor: 'sheriff', do: 'hop', amount: 3, dur: 0.25 },
    { at: pop + 0.35, actor: 'sheriff', do: 'tilt', amount: -6, dur: 0.4 },
    // 烏雲一抖、泥巴掉下來
    ...cloudShiver(at - 0.5, k),
    ...mudFall(at, { x: HOLD.x, y: top + 0.2 * item.size + 2 }, MUD[k]),
    // 啪！傻眼
    { at, actor: 'item', do: 'squash', amount: 0.15, dur: 0.2 },
    // 被泥巴弄髒：整個變得灰灰髒髒的，不亮了
    { at: at + 0.06, actor: 'item', do: 'tint', filter: DIRTY },
    { at, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at, actor: 'sheriff', do: 'squash', amount: -0.12, dur: 0.16 },
    // 大哭：一次比一次誇張（第 2 次哭到跳起來、第 3 次跳好高）
    { at: at + HOLD_FACE, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/cry' },
    { at: at + HOLD_FACE, actor: 'sheriff', do: 'shake', amount: 1 + 0.6 * k, dur: 0.4 },
  ]
  if (k >= 1) moves.push({ at: at + HOLD_FACE, actor: 'sheriff', do: 'hop', amount: k === 1 ? 6 : 15, dur: k === 1 ? 0.3 : 0.4 })
  // 哭著把髒掉的東西往後一丟：東西和泥巴一起飛出畫面左邊
  const toss = at + 0.72 + (k === 2 ? 0.06 : 0)
  const out: Vec = { x: -34, y: iy + 4 }
  moves.push(
    { at: toss, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/throw' },
    { at: toss, actor: 'item', do: 'moveTo', to: out, arc: 4, dur: 0.36, ease: 'in' },
    { at: toss, actor: 'item', do: 'rotateTo', amount: -60, dur: 0.36 },
    { at: toss, actor: 'mud', do: 'moveTo', to: { x: out.x, y: out.y - (iy - (top + 0.2 * item.size + 2 - 0.42 * MB)) }, arc: 4, dur: 0.36, ease: 'in' },
    { at: toss + 0.37, actor: 'item', do: 'vanish', dur: 0.01 },
    { at: toss + 0.37, actor: 'item', do: 'rotateTo', amount: 60, dur: 0.01 },
    { at: toss + 0.37, actor: 'mud', do: 'vanish', dur: 0.01 },
  )
  const fx: Fx[] = [...sh.fx, ...hit.fx]
  if (k >= 1) fx.push({ at: at + HOLD_FACE, kind: 'sweat', actor: 'sheriff', dx: 12 })
  const cues: Cue[] = [...sh.cues, ...hit.cues, { at: toss, sfx: 'whoosh' }]
  return { moves, fx, camera: hit.camera, cues, pop }
}

// 第 1 次：新鞋
const S1 = 1.9
const g1 = spoil(S1, 0)
// 第 2 次：新書包
const S2 = S1 + 2.05
const g2 = spoil(S2, 1)
// 第 3 次前停一拍：他抬頭懷疑地看烏雲，烏雲變白裝乖，他鬆一口氣——啪！
const PAUSE = 0.45
const S3 = S2 + 2.05 + PAUSE
const g3 = spoil(S3, 2, { pause: PAUSE })
const SUSPECT = g3.pop + 0.38
/** 丟完新熊熊，哭著退到右邊（國字要回中央） */
const STEP_BACK = S3 + 0.95
const SIDE: Vec = { x: 134, y: SY }
/** 字框填滿、國字到正中央 */
const HOME = S3 + 1.12
const PARK = HOME + 0.92
/** 語詞那一刻：「叮！」正中間冒出一雙新鞋，他衝回來 */
const WORD = PARK + 0.03
const SHOE_FLOOR: Vec = { x: 78, y: yFor(77 - 0.42 * SHOE, SHOE, IB) }
const SHOE_C: Vec = { x: 78, y: 77 - 0.42 * SHOE }
// 回馬槍（第 4 次）
const PICK = WORD + 0.55
const CLOUD_BACK = WORD + 0.4
const SHIVER4 = PICK + 0.3
const DODGE = SHIVER4 + 0.15
/** 他往左一步、把新鞋往右邊伸得遠遠的：頭剛好在雲正下方 */
const DODGE_X = CLOUD.x + 2
const AWAY: Vec = { x: 124, y: yFor(HOLD.y, SHOE, IB) }
const S4 = DODGE + 0.35
/** 他的帽頂（泥巴的腳底） */
const HAT_TOP = SY - 0.45 * SS + 10
/** 回過神來：新鞋還是亮晶晶的 */
const STILL = S4 + 0.45
const RUN = STILL + 0.3
/** 問他 */
const ASK = RUN + 0.34
const ASK_SAY = ASK + 0.1
const ANSWER = ASK_SAY + 2.5
/** 問他時他站的地方（右前方，國字讓到左邊） */
const ASK_AT: Vec = { x: 122, y: SY + 3 }

const shoeShine = shine(WORD, SHOE_C, SHOE, 1.25)
const g4 = splat(S4, { x: DODGE_X, y: HAT_TOP - 3 }, 3)
const stillShine = shine(STILL, { x: AWAY.x, y: HOLD.y }, SHOE, 0.62)

const builds: Build[] = [
  // 啪！從被打髒的新東西上彈出來：立 → 木 → 斤
  { at: S1 + 0.05, dur: 0.5, strokes: [0, 1, 2, 3, 4], from: 'item', color: partColor('立') },
  { at: S2 + 0.05, dur: 0.5, strokes: [5, 6, 7, 8], from: 'item', color: partColor('木') },
  { at: S3 + 0.05, dur: 0.48, strokes: [9, 10, 11, 12], from: 'item', color: partColor('斤') },
]

const clip: Clip = {
  format: 2,
  char: '新',
  meta: { theme: '新東西被泥巴打髒', cast: '狗狗警長＋調皮小烏雲＋新東西', gags: ['狗狗警長每拿到一樣新東西，「叮！」冒出一圈大大的 ✨，他捧著看得流口水——頭上的調皮小烏雲一抖，「啪！」一坨泥巴掉在新東西上，✨ 沒了，他傻眼大哭，一次比一次大、一次比一次崩潰（新鞋→新書包→先停一拍，烏雲裝乖，還是啪在新熊熊上，他哭到跳好高）；回馬槍是他學乖了把新鞋往旁邊伸得遠遠的，最大的一坨泥巴整個打在他自己頭上，可是新鞋還是「叮！」亮晶晶的，他變成泥巴狗開心地抱著跑走'] },
  duration: 15,
  bg: { top: '#C4E6FF', bottom: '#EEF8FF', floor: '#C3E09A', scenery: 'hills' },
  actors: [
    { id: 'cloud', emoji: 'prop:cloud-dark', x: 190, y: 2, size: 30, float: true },
    { id: 'sheriff', emoji: 'hero:sheriff/walk', x: SX, y: SY, size: SS },
    { id: 'item', emoji: '👟', x: HOLD.x, y: HOLD.y, size: IB, hidden: true, float: true },
    { id: 'mud', emoji: '🟤', x: CLOUD.x, y: CLOUD.y, size: MB, hidden: true, float: true, tint: 'brightness(.6) saturate(1.3)' },
  ],
  moves: [
    // 開場：走進來，抬頭指著字框「新」；調皮的小烏雲飄過來停在頭上
    { at: 0, actor: 'sheriff', do: 'enter', from: { x: 190, y: SY }, dur: 0.5 },
    { at: 0.45, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: 0.2, actor: 'cloud', do: 'moveTo', to: CLOUD, dur: 0.65, ease: 'out' },
    // 第 1 次：新鞋
    ...g1.moves,
    // 第 2 次：新書包
    ...g2.moves,
    // 第 3 次：新熊熊。先停一拍：抬頭懷疑地看烏雲，烏雲變白裝乖，他鬆一口氣
    { at: SUSPECT, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/ponder' },
    { at: SUSPECT + 0.05, actor: 'sheriff', do: 'tilt', amount: 7, dur: 0.3 },
    { at: SUSPECT + 0.12, actor: 'cloud', do: 'swap', emoji: 'prop:cloud-happy' },
    { at: SUSPECT + 0.32, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/smug' },
    { at: S3 - 0.55, actor: 'cloud', do: 'swap', emoji: 'prop:cloud-dark' },
    ...g3.moves,
    // 烏雲得意地飄走（國字要回中央）；他哭著退到右邊
    { at: S3 + 0.5, actor: 'cloud', do: 'moveTo', to: { x: 196, y: 0 }, dur: 0.55, ease: 'in' },
    { at: STEP_BACK, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/cry' },
    { at: STEP_BACK, actor: 'sheriff', do: 'moveTo', to: SIDE, dur: 0.3, ease: 'out' },
    // 語詞：「叮！」正中間冒出一雙亮晶晶的新鞋，他流著口水衝回來
    { at: WORD - 0.03, actor: 'item', do: 'swap', emoji: '👟' },
    { at: WORD - 0.02, actor: 'item', do: 'moveTo', to: SHOE_FLOOR, dur: 0.01 },
    { at: WORD - 0.02, actor: 'item', do: 'tint', filter: '' },
    { at: WORD, actor: 'item', do: 'pop', dur: 0.32 },
    { at: WORD + 0.001, actor: 'item', do: 'scaleTo', amount: SHOE / IB, dur: 0.01 },
    { at: WORD + 0.02, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/drool' },
    { at: WORD + 0.05, actor: 'sheriff', do: 'moveTo', to: { x: SX, y: SY }, dur: 0.28, ease: 'out' },
    { at: WORD + 0.33, actor: 'sheriff', do: 'hop', amount: 4, dur: 0.25 },
    // 回馬槍：捧起新鞋；烏雲又飄回來
    { at: PICK, actor: 'item', do: 'moveTo', to: { x: HOLD.x, y: yFor(HOLD.y, SHOE, IB) }, arc: 3, dur: 0.2 },
    { at: CLOUD_BACK, actor: 'cloud', do: 'moveTo', to: CLOUD, dur: 0.45, ease: 'out' },
    ...cloudShiver(SHIVER4, 3),
    // 他抬頭看到了！把新鞋往右邊伸得遠遠的（自己往左一步，頭剛好在雲底下）
    { at: SHIVER4 + 0.05, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: DODGE, actor: 'sheriff', do: 'flip' },
    { at: DODGE, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/reach' },
    { at: DODGE, actor: 'sheriff', do: 'moveTo', to: { x: DODGE_X, y: SY }, dur: 0.16, ease: 'out' },
    { at: DODGE, actor: 'item', do: 'moveTo', to: AWAY, dur: 0.16, ease: 'out' },
    ...mudFall(S4, { x: DODGE_X, y: HAT_TOP }, MUD[3]),
    // 啪！最大的一坨打在他自己頭上：變成泥巴狗、傻眼
    { at: S4, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/surprised' },
    { at: S4, actor: 'sheriff', do: 'tint', filter: MUDDY },
    { at: S4, actor: 'sheriff', do: 'squash', amount: 0.2, dur: 0.22 },
    // 可是新鞋還是亮晶晶的！開心得跳起來
    { at: STILL, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: STILL, actor: 'sheriff', do: 'hop', amount: 6, dur: 0.3 },
    { at: STILL, actor: 'mud', do: 'hop', amount: 6, dur: 0.3 },
    { at: STILL, actor: 'item', do: 'hop', amount: 4, dur: 0.3 },
    { at: STILL + 0.05, actor: 'cloud', do: 'swap', emoji: 'prop:cloud-puff' },
    { at: STILL + 0.15, actor: 'cloud', do: 'moveTo', to: { x: 196, y: 0 }, dur: 0.5, ease: 'in' },
    // 抱著新鞋跑走
    { at: RUN, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/dash' },
    { at: RUN, actor: 'sheriff', do: 'moveTo', to: { x: DODGE_X + 120, y: SY }, dur: 0.32, ease: 'in' },
    { at: RUN, actor: 'mud', do: 'moveTo', to: { x: DODGE_X + 120, y: HAT_TOP - 0.42 * MB }, dur: 0.32, ease: 'in' },
    { at: RUN, actor: 'item', do: 'moveTo', to: { x: AWAY.x + 120, y: AWAY.y }, dur: 0.32, ease: 'in' },
    { at: RUN + 0.34, actor: 'mud', do: 'vanish', dur: 0.01 },
    { at: RUN + 0.34, actor: 'item', do: 'vanish', dur: 0.01 },
    // 問他：洗乾淨了、從右邊走回來，轉向國字、變大
    { at: ASK + 0.02, actor: 'sheriff', do: 'vanish', dur: 0.01 },
    { at: ASK + 0.04, actor: 'sheriff', do: 'tint', filter: '' },
    { at: ASK + 0.05, actor: 'sheriff', do: 'moveTo', to: ASK_AT, dur: 0.01 },
    { at: ASK + 0.06, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/walk' },
    { at: ASK + 0.08, actor: 'sheriff', do: 'flip' },
    { at: ASK + 0.1, actor: 'sheriff', do: 'enter', from: { x: 200, y: ASK_AT.y }, dur: 0.45 },
    { at: ASK + 0.12, actor: 'sheriff', do: 'scaleTo', amount: 1.15, dur: 0.01 },
    { at: ASK + 0.55, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/idle' },
    // 安靜等他回答：手放耳邊、身體前傾
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/listen' },
    { at: ASK_SAY + 1.0, actor: 'sheriff', do: 'rotateTo', amount: -8, dur: 0.3 },
    { at: ASK_SAY + 1.55, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    { at: ASK_SAY + 2.05, actor: 'sheriff', do: 'hop', amount: 1.5, dur: 0.3 },
    // 回答：跳起來指著字
    { at: ANSWER, actor: 'sheriff', do: 'rotateTo', amount: 8, dur: 0.12 },
    { at: ANSWER, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/point' },
    { at: ANSWER, actor: 'sheriff', do: 'hop', amount: 7, dur: 0.3 },
    // 退場，畫面只留下字
    { at: ANSWER + 0.16, actor: 'sheriff', do: 'swap', emoji: 'hero:sheriff/happy' },
    { at: ANSWER + 0.16, actor: 'sheriff', do: 'flip' },
    { at: ANSWER + 0.18, actor: 'sheriff', do: 'moveTo', to: { x: 215, y: ASK_AT.y }, dur: 0.24, ease: 'in' },
  ],
  builds,
  glyph: [
    // 空字框一開始就讓到左上（他和烏雲在中間偏右）
    { at: 0, dur: 0.01, do: 'park', to: PARK_AT },
    { at: HOME, dur: 0.45, do: 'home', ease: 'back' },
    { at: PARK, dur: 0.45, do: 'park', to: PARK_AT },
    // 問他：國字稍微偏左、縮一點，右前方讓給警長
    { at: ASK, dur: ANSWER + 0.36 - ASK, do: 'ask', keep: ['sheriff'], to: { x: 58, y: 43 }, amount: 0.82 },
    { at: ASK + 0.05, dur: 0.4, do: 'home' },
    { at: ANSWER, dur: 0.35, do: 'pulse' },
    { at: 14.3, dur: 0.5, do: 'pulse' },
  ],
  fx: [
    ...g1.fx,
    ...g2.fx,
    { at: SUSPECT + 0.1, kind: 'pop', actor: 'sheriff', emoji: '❓', dx: 4 },
    ...g3.fx,
    // 語詞：新鞋上最大的一圈 ✨
    ...shoeShine.fx,
    // 回馬槍
    { at: SHIVER4 + 0.05, kind: 'pop', actor: 'sheriff', emoji: '❗', dx: 6 },
    ...g4.fx,
    ...stillShine.fx,
    { at: ANSWER, kind: 'burst', x: 58, y: 38, emoji: '🌟', n: 10, dur: 0.38 },
  ],
  camera: [
    // 手寫一個幾乎全景的 zoom，蓋掉自動取景（推近會切到頭上的烏雲）
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
    ...g1.camera,
    ...g2.camera,
    ...g3.camera,
    { at: WORD, dur: 0.5, do: 'punch', amount: 0.08, to: { x: SHOE_C.x + 8, y: 52 } },
    ...g4.camera,
  ],
  lights: [
    { at: HOME, dur: 0.05, level: -0.35 },
    { at: HOME + 0.05, dur: 0.35, level: 0 },
  ],
  cues: [
    { at: 0.5, say: '新' },
    ...g1.cues,
    ...g2.cues,
    ...g3.cues,
    { at: HOME + 0.2, say: '新' },
    ...shoeShine.cues,
    { at: WORD + 0.08, say: '新鞋' },
    { at: SHIVER4 + 0.05, sfx: 'tap' },
    ...g4.cues,
    ...stillShine.cues,
    { at: ASK_SAY, say: FIXED_LINES.clipAsk },
    { at: ANSWER, say: '新' },
    { at: ANSWER + 0.05, sfx: 'cheer' },
  ],
}

export default clip
