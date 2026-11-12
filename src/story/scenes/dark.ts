import { scene } from '../scene'
import type { Scenes } from './index'

// 超人怕黑：帥氣的超人擺好姿勢，燈一關就垮掉發抖。給他燈就不怕；給他雷被劈到焦掉、給他蛇嚇到繞著畫面跑。
// 燈亮了，牆上卻出現一隻大黑熊的影子——其實是小貓。抱抱小貓或餵牠吃魚，最後超人頂著小貓，關了燈也不怕。
// 主角 cape（size 24 站在地上 y = 66.9），一直站在 x 70；右邊留給影子與小貓。
// 黑：lights 0.6（不要更暗，超人要看得清楚）；燈亮之後 lights 0.12（晚上開燈的房間）。
const G = 66.9
const X = 70
const DARK = 0.62
const LIT = 0.12
const BG = { top: '#B9B4E6', bottom: '#DCD7F5', floor: '#B58A66', scenery: 'room' as const }
/** 窗外的月亮：畫在黑幕上面，關了燈還在發亮 */
const moon = { id: 'moon', emoji: '🌙', x: 23, y: 25, size: 9, float: true, top: true }
/** 天花板垂下來的燈泡（給他燈以後一直都在） */
const lamp = { id: 'lamp', emoji: '💡', x: 100, y: 22, size: 11, float: true, pivot: 'center' as const }
/** 小貓（kitten 以後）：站在超人右邊的地上 */
const KIT = { x: 98, y: 72 }
/** 被超人抱在胸前的小貓（兩種結局都停在這裡，brave 從這裡接） */
const HUG = { x: 77, y: 67 }
/**
 * 燈泡的電線：從畫面上緣外面的掛勾拉到燈泡。不掛在燈泡身上，因為效果會讓燈泡一直「在演」，
 * 自動取景就整段去框天花板的燈泡。掛勾在 y -16（畫面外，自動取景與接戲檢查都不看）
 */
const hook = { id: 'hook', emoji: '💡', x: 100, y: -16, size: 1, float: true }
const cord = (dur: number, at = 0) => ({ at, kind: 'line' as const, actor: 'hook', to: { x: 100, y: 17 }, color: '#4A3B33', width: 0.5, dur: dur - at })
/** 一開始就是黑的（接上一段的最後一格） */
const stayDark = { at: 0, dur: 0, level: DARK }
const stayLit = { at: 0, dur: 0, level: LIT }

const scenes: Scenes = {
  // 夜晚，天好黑。——超人擺著帥氣姿勢走進來、亮一下，啪！燈關了
  dark: scene({
    duration: 4.8,
    bg: BG,
    actors: [moon, { id: 'hero', emoji: 'hero:cape/pose', x: X, y: G, size: 24, hidden: true }],
    moves: [
      { at: 0, actor: 'hero', do: 'enter', from: { x: -18, y: G }, dur: 1.0, ease: 'out' },
      { at: 1.15, actor: 'hero', do: 'squash', amount: -0.2, dur: 0.35 },
      { at: 1.5, actor: 'hero', do: 'tilt', amount: 8, dur: 0.4 },
      // 燈一關：愣住
      { at: 2.3, actor: 'hero', do: 'hop', amount: 2, dur: 0.2 },
      // 左看看、右看看
      { at: 3.0, actor: 'hero', do: 'flip' },
      { at: 3.5, actor: 'hero', do: 'flip' },
      { at: 3.9, actor: 'hero', do: 'shake', amount: 0.7, dur: 0.6 },
    ],
    fx: [
      { at: 1.2, kind: 'burst', actor: 'hero', emoji: '✨', n: 7, dur: 0.8 },
      { at: 1.3, kind: 'pop', actor: 'hero', emoji: '😎', dx: 9, dur: 0.9 },
      { at: 2.4, kind: 'pop', actor: 'hero', emoji: '❓', dur: 1.2 },
      { at: 3.6, kind: 'sweat', actor: 'hero' },
    ],
    lights: [{ at: 2.2, dur: 0.12, level: DARK }],
    cues: [
      { at: 2.2, sfx: 'tap' },
      { at: 2.5, say: '夜晚了，天好黑。' },
    ],
  }),

  // 超人好怕！——帥氣姿勢垮掉，兩手捧臉狂抖、冒汗，縮成一團
  scared: scene({
    duration: 4.2,
    bg: BG,
    actors: [moon, { id: 'hero', emoji: 'hero:cape/pose', x: X, y: G, size: 24 }],
    moves: [
      { at: 0.3, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
      { at: 0.3, actor: 'hero', do: 'hop', amount: 5, dur: 0.35 },
      { at: 0.7, actor: 'hero', do: 'shake', amount: 1.6, dur: 1.0 },
      { at: 1.8, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.8 },
      { at: 1.8, actor: 'hero', do: 'shake', amount: 2.2, dur: 0.8 },
      // 等他選的時候停在這裡：捧著臉發抖
      { at: 2.7, actor: 'hero', do: 'flip' },
      { at: 3.1, actor: 'hero', do: 'flip' },
      { at: 3.3, actor: 'hero', do: 'shake', amount: 1.2, dur: 0.9 },
    ],
    fx: [
      { at: 0.3, kind: 'pop', actor: 'hero', emoji: '😱', dx: 9, dur: 1.3 },
      { at: 1.0, kind: 'sweat', actor: 'hero' },
      { at: 2.0, kind: 'burst', actor: 'hero', emoji: '💦', n: 4, dy: -4, dur: 0.6 },
    ],
    lights: [stayDark],
    camera: [{ at: 1.8, dur: 0.4, do: 'punch', amount: 1.05 }],
    cues: [
      { at: 0.4, say: '超人好怕！' },
      { at: 1.8, sfx: 'rumble' },
    ],
  }),

  // 給他燈！——燈泡從天花板啵一聲亮起來，超人嚇一跳、鬆一口氣、又擺回帥氣姿勢
  'light:燈': scene({
    duration: 4.6,
    bg: BG,
    actors: [moon, { ...hook, hidden: true }, { ...lamp, hidden: true }, { id: 'hero', emoji: 'hero:cape/surprised', x: X, y: G, size: 24 }],
    moves: [
      { at: 0, actor: 'hero', do: 'shake', amount: 1.2, dur: 0.4 },
      { at: 0.3, actor: 'lamp', do: 'drop', dur: 0.35 },
      { at: 0.3, actor: 'hook', do: 'pop', dur: 0.05 },
      { at: 0.7, actor: 'lamp', do: 'squash', amount: -0.3, dur: 0.4 },
      { at: 0.75, actor: 'hero', do: 'hop', amount: 5, dur: 0.35 },
      { at: 1.2, actor: 'lamp', do: 'tilt', amount: 12, dur: 1.2 },
      // 呼——鬆一口氣
      { at: 1.4, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
      { at: 1.5, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.5 },
      // 又帥回來了
      { at: 2.8, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
      { at: 2.8, actor: 'hero', do: 'hop', amount: 4, dur: 0.35 },
    ],
    fx: [
      cord(4.6, 0.3),
      { at: 0.7, kind: 'burst', actor: 'lamp', emoji: '✨', n: 8, dy: 4, dur: 0.8 },
      { at: 0.75, kind: 'pop', actor: 'hero', emoji: '❗', dur: 0.5 },
      { at: 1.5, kind: 'pop', actor: 'hero', emoji: '💨', dx: -15, dy: 10, dur: 0.8 },
      { at: 2.85, kind: 'burst', actor: 'hero', emoji: '⭐', n: 7, dur: 0.9 },
      { at: 2.9, kind: 'pop', actor: 'hero', emoji: '😎', dx: 9, dur: 1.4 },
    ],
    lights: [stayDark, { at: 0.7, dur: 0.06, level: -0.5 }, { at: 0.78, dur: 0.3, level: LIT }],
    cues: [
      { at: 0.3, sfx: 'plop' },
      { at: 0.7, sfx: 'blip' },
      { at: 1.4, say: '有燈了，不怕了！' },
      { at: 2.85, sfx: 'cheer' },
    ],
  }),

  // 給他雷！——雷雲飄進來，第一道雷劈在旁邊，超人跳到半空；第二道直接劈中，整隻焦掉眼冒金星，雷雲走了又回去發抖
  'light:雷': scene({
    duration: 6.6,
    bg: BG,
    actors: [
      moon,
      { id: 'hero', emoji: 'hero:cape/surprised', x: X, y: G, size: 24 },
      { id: 'spot', emoji: '💥', x: 98, y: 72, size: 1, hidden: true, float: true },
      { id: 'cloud', emoji: '⛈️', x: 82, y: 18, size: 22, hidden: true, float: true, top: true },
    ],
    moves: [
      { at: 0, actor: 'hero', do: 'shake', amount: 1.2, dur: 0.3 },
      { at: 0.2, actor: 'cloud', do: 'enter', from: { x: 180, y: 14 }, dur: 0.6, ease: 'out' },
      { at: 0.9, actor: 'cloud', do: 'shake', amount: 1.2, dur: 0.4 },
      // 第一道劈在右邊：跳到半空
      { at: 1.3, actor: 'hero', do: 'hop', amount: 22, dur: 0.7 },
      { at: 1.3, actor: 'hero', do: 'shake', amount: 1.5, dur: 0.7 },
      { at: 2.0, actor: 'hero', do: 'shake', amount: 2.4, dur: 0.6 },
      // 雲移到頭上
      { at: 2.0, actor: 'cloud', do: 'moveTo', to: { x: X, y: 18 }, dur: 0.5 },
      { at: 2.6, actor: 'cloud', do: 'squash', amount: 0.25, dur: 0.3 },
      // 第二道直接劈中：焦掉、坐在地上眼冒金星
      { at: 2.9, actor: 'hero', do: 'swap', emoji: 'hero:cape/dizzy' },
      { at: 2.9, actor: 'hero', do: 'tint', filter: 'brightness(.75) sepia(.8)' },
      { at: 2.9, actor: 'hero', do: 'squash', amount: 0.35, dur: 0.35 },
      // 雷雲滿意地飄走
      { at: 4.0, actor: 'cloud', do: 'moveTo', to: { x: 190, y: 12 }, dur: 1.0, ease: 'in' },
      // 甩甩頭，焦黑掉下來，回到捧著臉發抖
      { at: 4.6, actor: 'hero', do: 'shake', amount: 1.8, dur: 0.35 },
      { at: 4.95, actor: 'hero', do: 'tint', filter: '' },
      { at: 4.95, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
      { at: 5.4, actor: 'hero', do: 'shake', amount: 1.3, dur: 1.0 },
    ],
    fx: [
      { at: 1.3, kind: 'zap', actor: 'cloud', target: 'spot', dur: 0.3 },
      { at: 1.3, kind: 'burst', x: 98, y: 70, n: 1, dur: 0.4 },
      { at: 1.35, kind: 'pop', actor: 'hero', emoji: '😱', dx: 10, dur: 1.2 },
      { at: 2.9, kind: 'zap', actor: 'cloud', target: 'hero', dur: 0.35 },
      { at: 2.9, kind: 'burst', actor: 'hero', emoji: '⚡', n: 7, dur: 0.7 },
      { at: 3.0, kind: 'stink', actor: 'hero', dur: 1.6 },
      { at: 3.2, kind: 'dizzy', actor: 'hero', dur: 1.4 },
      { at: 4.95, kind: 'puff', actor: 'hero', dur: 0.5 },
      { at: 5.2, kind: 'sweat', actor: 'hero' },
    ],
    lights: [
      stayDark,
      { at: 1.3, dur: 0.04, level: -0.5 }, { at: 1.4, dur: 0.3, level: DARK },
      { at: 2.9, dur: 0.04, level: -0.5 }, { at: 3.0, dur: 0.35, level: DARK },
    ],
    camera: [
      { at: 1.3, dur: 0.35, do: 'shake', amount: 1.6 },
      { at: 2.9, dur: 0.45, do: 'shake', amount: 2.4 },
    ],
    cues: [
      { at: 0.2, sfx: 'rumble' },
      { at: 1.3, sfx: 'crack' },
      { at: 1.5, say: '打雷了！好怕！好怕！' },
      { at: 2.9, sfx: 'crack' },
      { at: 4.0, sfx: 'whoosh' },
    ],
  }),

  // 給他蛇！——蛇溜進來，超人尖叫著衝出畫面、從另一邊繞回來跳過蛇再衝出去，蛇搞不清楚走掉，他喘著氣回來發抖
  'light:蛇': scene({
    duration: 6.6,
    bg: BG,
    actors: [
      moon,
      { id: 'snake', emoji: '🐍', x: 104, y: 71.5, size: 13, hidden: true, top: true, flip: true },
      { id: 'hero', emoji: 'hero:cape/surprised', x: X, y: G, size: 24 },
    ],
    moves: [
      { at: 0, actor: 'hero', do: 'shake', amount: 1.2, dur: 0.3 },
      { at: 0.2, actor: 'snake', do: 'enter', from: { x: 175, y: 71.5 }, dur: 0.7, ease: 'out' },
      { at: 0.95, actor: 'snake', do: 'squash', amount: -0.25, dur: 0.3 },
      { at: 0.95, actor: 'hero', do: 'hop', amount: 7, dur: 0.35 },
      // 第一圈：往左衝出去
      { at: 1.45, actor: 'hero', do: 'moveTo', to: { x: -25, y: G }, dur: 0.45, anticipate: 4, ease: 'in' },
      { at: 1.5, actor: 'snake', do: 'moveTo', to: { x: 66, y: 71.5 }, dur: 1.6, ease: 'linear' },
      // 從右邊繞回來，跳過蛇，再從左邊衝出去
      { at: 2.0, actor: 'hero', do: 'moveTo', to: { x: 185, y: G }, dur: 0 },
      { at: 2.1, actor: 'hero', do: 'moveTo', to: { x: -25, y: G }, dur: 0.9, arc: 12, ease: 'linear' },
      // 蛇搞不清楚，轉頭溜走
      { at: 3.2, actor: 'snake', do: 'shake', amount: 0.8, dur: 0.4 },
      { at: 3.6, actor: 'snake', do: 'flip' },
      { at: 3.65, actor: 'snake', do: 'moveTo', to: { x: 180, y: 71.5 }, dur: 1.0, ease: 'out' },
      // 喘著氣從左邊走回原位
      { at: 4.2, actor: 'hero', do: 'moveTo', to: { x: X, y: G }, dur: 0.9, ease: 'out' },
      { at: 5.0, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.4 },
      { at: 5.7, actor: 'hero', do: 'shake', amount: 1.3, dur: 0.9 },
    ],
    fx: [
      { at: 0.95, kind: 'pop', actor: 'hero', emoji: '😱', dx: 9, dur: 0.9 },
      { at: 1.45, kind: 'puff', actor: 'hero', dur: 0.4 },
      { at: 3.25, kind: 'pop', actor: 'snake', emoji: '❓', dur: 0.8 },
      { at: 5.0, kind: 'sweat', actor: 'hero' },
      { at: 5.05, kind: 'pop', actor: 'hero', emoji: '💨', dx: -15, dy: 10, dur: 0.7 },
    ],
    lights: [stayDark],
    cues: [
      { at: 0.2, sfx: 'slide' },
      { at: 1.0, say: '有蛇！快跑！' },
      { at: 1.45, sfx: 'whoosh' },
      { at: 2.1, sfx: 'whoosh' },
      { at: 3.65, sfx: 'slide' },
    ],
  }),

  // 牆上有大黑熊！——牆上一個影子越長越大，變成一隻大黑熊，舉起手來；超人嚇到變成石頭
  shadow: scene({
    duration: 4.4,
    bg: BG,
    actors: [
      moon,
      { id: 'bear', emoji: '🐻', x: 114, y: 68, size: 20, hidden: true, float: true, tint: 'brightness(0) opacity(.55)' },
      hook, lamp,
      { id: 'hero', emoji: 'hero:cape/pose', x: X, y: G, size: 24 },
    ],
    moves: [
      { at: 0.3, actor: 'bear', do: 'pop', dur: 0.3 },
      { at: 0.5, actor: 'bear', do: 'scaleTo', amount: 2.7, dur: 0.9, ease: 'back' },
      { at: 0.5, actor: 'lamp', do: 'tilt', amount: 10, dur: 1.0 },
      { at: 1.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
      { at: 1.0, actor: 'hero', do: 'hop', amount: 6, dur: 0.35 },
      // 熊影子撲過來一下
      { at: 2.6, actor: 'bear', do: 'squash', amount: -0.15, dur: 0.5 },
      { at: 2.6, actor: 'bear', do: 'tilt', amount: -8, dur: 0.6 },
      // 嚇到僵住：變成灰色石像
      { at: 2.8, actor: 'hero', do: 'tint', filter: 'grayscale(1) brightness(1.1)' },
      { at: 2.8, actor: 'hero', do: 'squash', amount: -0.12, dur: 0.25 },
      { at: 3.2, actor: 'hero', do: 'shake', amount: 0.5, dur: 1.1 },
      // 熊影子晃來晃去，越靠越近
      { at: 3.2, actor: 'bear', do: 'tilt', amount: 10, dur: 0.6 },
      { at: 3.8, actor: 'bear', do: 'tilt', amount: -10, dur: 0.6 },
      { at: 3.8, actor: 'bear', do: 'squash', amount: -0.12, dur: 0.6 },
    ],
    fx: [
      cord(4.4),
      { at: 1.0, kind: 'pop', actor: 'hero', emoji: '❗', dur: 0.8 },
      { at: 3.0, kind: 'sweat', actor: 'hero' },
      { at: 3.2, kind: 'pop', actor: 'hero', emoji: '😨', dx: -10, dur: 1.2 },
    ],
    lights: [stayLit],
    camera: [
      { at: 0, dur: 0, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } },
      { at: 2.6, dur: 0.4, do: 'shake', amount: 1.2 },
    ],
    cues: [
      { at: 0.5, sfx: 'rumble' },
      { at: 1.4, say: '牆上有大大的黑熊！' },
      { at: 2.6, sfx: 'rumble' },
    ],
  }),

  // 不是熊。是小貓！——影子一下縮小，從右邊走出來的是一隻小貓，喵；超人石像裂開，愣住，然後笑了
  kitten: scene({
    duration: 4.4,
    bg: BG,
    actors: [
      moon,
      // 跟 shadow 結尾一樣大（20 × 自動放大 1.26 × 2.7 ≈ 68）：直接寫成 size（t = 0 的 scaleTo 自動取景看不到，鏡頭會先推近影子）
      { id: 'bear', emoji: '🐻', x: 114, y: 68, size: 68, float: true, tint: 'brightness(0) opacity(.55)' },
      hook, lamp,
      { id: 'hero', emoji: 'hero:cape/surprised', x: X, y: G, size: 24, tint: 'grayscale(1) brightness(1.1)' },
      { id: 'cat', emoji: '🐈', x: KIT.x, y: KIT.y, size: 12, hidden: true },
    ],
    moves: [
      // 影子一口氣縮小不見
      { at: 0.3, actor: 'bear', do: 'scaleTo', amount: 0.11, dur: 0.6, ease: 'in' },
      { at: 0.3, actor: 'bear', do: 'moveTo', to: { x: 112, y: 72 }, dur: 0.6, ease: 'in' },
      { at: 0.9, actor: 'bear', do: 'vanish', dur: 0.1 },
      { at: 0.6, actor: 'cat', do: 'enter', from: { x: 172, y: KIT.y }, dur: 0.8, ease: 'out' },
      { at: 1.5, actor: 'cat', do: 'hop', amount: 3, dur: 0.3 },
      // 石像碎掉，愣住
      { at: 1.2, actor: 'hero', do: 'tint', filter: '' },
      { at: 1.2, actor: 'hero', do: 'shake', amount: 1, dur: 0.3 },
      { at: 2.2, actor: 'hero', do: 'tilt', amount: 12, dur: 0.6 },
      { at: 2.3, actor: 'cat', do: 'tilt', amount: -12, dur: 0.6 },
      { at: 3.2, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
      { at: 3.2, actor: 'hero', do: 'hop', amount: 4, dur: 0.35 },
      { at: 3.9, actor: 'cat', do: 'hop', amount: 3, dur: 0.3 },
    ],
    fx: [
      cord(4.4),
      { at: 0.3, kind: 'puff', x: 120, y: 60, dur: 0.5 },
      { at: 1.2, kind: 'burst', actor: 'hero', emoji: '🪨', n: 6, dur: 0.6 },
      { at: 1.5, kind: 'pop', actor: 'cat', emoji: '🎵', dur: 0.9 },
      { at: 2.2, kind: 'pop', actor: 'hero', emoji: '❓', dur: 0.9 },
      { at: 3.3, kind: 'burst', actor: 'cat', emoji: '💗', n: 5, dur: 0.8 },
    ],
    lights: [stayLit],
    camera: [{ at: 0, dur: 0, do: 'zoom', amount: 1.02, to: { x: 80, y: 45 } }, { at: 1.1, dur: 0.6, do: 'zoom', amount: 1.35, to: { x: 84, y: 58 } }],
    cues: [
      { at: 0.3, sfx: 'deflate' },
      { at: 1.4, say: '那不是熊。是小小的貓！' },
      { at: 1.2, sfx: 'crack' },
      { at: 3.2, sfx: 'boing' },
    ],
  }),

  // 小貓要抱！——小貓一跳跳進超人懷裡，抱著搖來搖去，愛心冒不停
  'pet:抱': scene({
    duration: 5.0,
    bg: BG,
    actors: [moon, hook, lamp, { id: 'hero', emoji: 'hero:cape/happy', x: X, y: G, size: 24 }, { id: 'cat', emoji: '🐈', x: KIT.x, y: KIT.y, size: 12 }],
    moves: [
      { at: 0.2, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.2 },
      { at: 0.4, actor: 'cat', do: 'moveTo', to: HUG, arc: 12, dur: 0.5, ease: 'out' },
      { at: 0.9, actor: 'hero', do: 'squash', amount: 0.25, dur: 0.3 },
      { at: 1.4, actor: 'hero', do: 'tilt', amount: -8, dur: 0.6 },
      { at: 1.4, actor: 'cat', do: 'tilt', amount: -8, dur: 0.6 },
      { at: 2.0, actor: 'hero', do: 'tilt', amount: 8, dur: 0.6 },
      { at: 2.0, actor: 'cat', do: 'tilt', amount: 8, dur: 0.6 },
      { at: 3.0, actor: 'hero', do: 'hop', amount: 3, dur: 0.3 },
      { at: 3.0, actor: 'cat', do: 'hop', amount: 3, dur: 0.3 },
    ],
    fx: [
      cord(5.0),
      { at: 0.95, kind: 'burst', actor: 'hero', emoji: '💗', n: 8, dur: 1.0 },
      { at: 1.6, kind: 'pop', actor: 'hero', emoji: '😊', dx: -9, dur: 1.6 },
      { at: 2.6, kind: 'burst', actor: 'cat', emoji: '💖', n: 6, dur: 1.0 },
      { at: 3.6, kind: 'zzz', actor: 'cat', emoji: '🎵', dur: 1.2 },
    ],
    lights: [stayLit],
    cues: [
      { at: 0.4, sfx: 'boing' },
      { at: 1.0, say: '超人抱抱小貓。不怕了。' },
      { at: 2.6, sfx: 'cheer' },
    ],
  }),

  // 小貓要魚！——一條魚掉下來，小貓大口吃；超人流口水伸手也要，結果第二條魚砸在他頭上，他也吃到了，小貓跳進懷裡
  'pet:魚': scene({
    duration: 7.6,
    bg: BG,
    actors: [
      moon, hook, lamp,
      { id: 'hero', emoji: 'hero:cape/happy', x: X, y: G, size: 24 },
      { id: 'fish', emoji: '🐟', x: 110, y: 72, size: 11, hidden: true, pivot: 'center' },
      { id: 'cat', emoji: '🐈', x: KIT.x, y: KIT.y, size: 12 },
      { id: 'fish2', emoji: '🐟', x: X, y: 48, size: 11, hidden: true, pivot: 'center', float: true },
    ],
    moves: [
      { at: 0.2, actor: 'fish', do: 'drop', dur: 0.45 },
      { at: 0.7, actor: 'cat', do: 'hop', amount: 4, dur: 0.3 },
      { at: 0.7, actor: 'cat', do: 'flip' },
      { at: 1.1, actor: 'cat', do: 'moveTo', to: { x: 104, y: KIT.y }, dur: 0.25, ease: 'in' },
      { at: 1.4, actor: 'fish', do: 'scaleTo', amount: 0.7, dur: 0.12 },
      { at: 1.4, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.25 },
      { at: 1.9, actor: 'fish', do: 'scaleTo', amount: 0.6, dur: 0.12 },
      { at: 1.9, actor: 'cat', do: 'squash', amount: 0.25, dur: 0.25 },
      // 超人看著流口水，伸手也要
      { at: 2.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/fly' },
      { at: 2.0, actor: 'hero', do: 'flip' },
      { at: 2.0, actor: 'hero', do: 'moveTo', to: { x: 80, y: G }, dur: 0.5 },
      { at: 2.6, actor: 'fish', do: 'vanish', dur: 0.12 },
      { at: 2.6, actor: 'cat', do: 'squash', amount: 0.3, dur: 0.25 },
      // 吃光了……超人好失望
      { at: 3.0, actor: 'hero', do: 'swap', emoji: 'hero:cape/surprised' },
      { at: 3.0, actor: 'hero', do: 'flip' },
      { at: 3.0, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.4 },
      // 叩！第二條魚砸在頭上
      { at: 3.6, actor: 'fish2', do: 'moveTo', to: { x: 80, y: 48 }, dur: 0 },
      { at: 3.6, actor: 'fish2', do: 'drop', dur: 0.35 },
      { at: 3.95, actor: 'hero', do: 'squash', amount: 0.3, dur: 0.3 },
      { at: 4.3, actor: 'hero', do: 'swap', emoji: 'hero:cape/happy' },
      { at: 4.3, actor: 'fish2', do: 'moveTo', to: { x: 80, y: 58 }, dur: 0.25 },
      { at: 4.6, actor: 'fish2', do: 'scaleTo', amount: 0.5, dur: 0.12 },
      { at: 4.9, actor: 'fish2', do: 'vanish', dur: 0.12 },
      { at: 5.0, actor: 'hero', do: 'moveTo', to: { x: X, y: G }, dur: 0.5 },
      { at: 5.0, actor: 'cat', do: 'moveTo', to: KIT, dur: 0.3 },
      // 吃飽了，小貓轉身跳進懷裡
      { at: 5.4, actor: 'cat', do: 'flip' },
      { at: 5.6, actor: 'cat', do: 'moveTo', to: HUG, arc: 12, dur: 0.5, ease: 'out' },
      { at: 6.1, actor: 'hero', do: 'squash', amount: 0.2, dur: 0.3 },
    ],
    fx: [
      { ...cord(7.6) },
      { at: 0.7, kind: 'pop', actor: 'cat', emoji: '❗', dur: 0.5 },
      { at: 1.4, kind: 'burst', actor: 'fish', emoji: '💦', n: 4, dur: 0.4 },
      { at: 2.1, kind: 'pop', actor: 'hero', emoji: '🤤', dx: -9, dur: 1.0 },
      { at: 3.1, kind: 'sweat', actor: 'hero' },
      { at: 3.95, kind: 'burst', actor: 'hero', n: 1, dy: -2, dur: 0.4 },
      { at: 4.6, kind: 'pop', actor: 'hero', emoji: '😋', dx: -9, dur: 1.2 },
      { at: 6.1, kind: 'burst', actor: 'hero', emoji: '💗', n: 6, dur: 0.9 },
    ],
    lights: [stayLit],
    cues: [
      { at: 0.2, sfx: 'plop' },
      { at: 1.4, say: '小貓吃魚。超人也想吃！' },
      { at: 2.6, sfx: 'gulp' },
      { at: 3.95, sfx: 'bonk' },
      { at: 4.6, sfx: 'gulp' },
    ],
  }),

  // 超人不怕黑。——小貓爬上超人的頭，燈關了，超人頂著小貓擺帥氣姿勢，星星亮起來
  brave: scene({
    duration: 5.0,
    bg: BG,
    actors: [moon, hook, lamp, { id: 'hero', emoji: 'hero:cape/happy', x: X, y: G, size: 24 }, { id: 'cat', emoji: '🐈', x: HUG.x, y: HUG.y, size: 12 }],
    moves: [
      { at: 0.3, actor: 'cat', do: 'moveTo', to: { x: X, y: 55 }, arc: 8, dur: 0.45 },
      { at: 0.75, actor: 'hero', do: 'swap', emoji: 'hero:cape/pose' },
      // 燈關了：抬頭看一下，還是笑著
      { at: 1.2, actor: 'lamp', do: 'tint', filter: 'grayscale(1) brightness(.5)' },
      { at: 1.4, actor: 'hero', do: 'hop', amount: 2, dur: 0.25 },
      { at: 1.4, actor: 'cat', do: 'hop', amount: 2, dur: 0.25 },
      { at: 2.6, actor: 'hero', do: 'squash', amount: -0.15, dur: 0.4 },
      { at: 2.6, actor: 'cat', do: 'hop', amount: 3, dur: 0.4 },
      { at: 3.4, actor: 'hero', do: 'tilt', amount: 6, dur: 0.6 },
      { at: 3.4, actor: 'cat', do: 'tilt', amount: 6, dur: 0.6 },
    ],
    fx: [
      cord(5.0),
      { at: 1.5, kind: 'pop', actor: 'hero', emoji: '❗', dx: 10, dur: 0.5 },
      { at: 1.9, kind: 'burst', actor: 'hero', emoji: '⭐', n: 9, dy: 10, dur: 1.2 },
      { at: 2.1, kind: 'pop', actor: 'hero', emoji: '😎', dx: 13, dy: 8, dur: 2.0 },
      { at: 2.8, kind: 'burst', x: 80, y: 30, emoji: '✨', n: 10, dur: 1.2 },
    ],
    lights: [stayLit, { at: 1.2, dur: 0.15, level: 0.5 }],
    // 自動取景會去框頭上的小貓、把超人的腳切掉：自己定住
    camera: [{ at: 0.2, dur: 0.6, do: 'zoom', amount: 1.3, to: { x: X + 4, y: 54 } }],
    cues: [
      { at: 1.2, sfx: 'tap' },
      { at: 1.9, say: '超人再也不怕黑了。' },
      { at: 2.7, sfx: 'cheer' },
    ],
  }),
}

export default scenes
