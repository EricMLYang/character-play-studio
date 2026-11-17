// 演的是字面意思：噴＋火＋龍——一隻感冒的小恐龍，一打噴嚏就噴火，把阿嬤晾的衣服一件一件烤焦（不是橘色有翅膀、尾巴有火的原作造型，也沒有蚊子）。
import type { Camera, Cue, Fx, Move } from '../../anim/clip'
import { scene } from '../../story/scene'

// 主軸笑點（一句話）：感冒的小恐龍「哈……哈……啾！」一打噴嚏就噴出火來，燒到的東西一次比一次大。
// 同一個預備（仰頭吸氣兩下）、同一個噴嚏、同一聲「哈啾」，三次只有火變大：一小撮火把襪子烤黑 →
// 一大條火把衣服褲子整排烤黑、冒一大團黑煙 → 阿嬤氣得跑走，他鼻子又癢了（停一拍：哈……哈……），
// 阿嬤舉著平底鍋衝回來擋在他面前——第三次最大的火整團打在鍋子上（阿嬤嚇得往後仰），煙散開：蛋煎好了（反轉），阿嬤開心地舉起來。
// 小恐龍得意地仰頭再噴一小口火：「噴火龍」。
const S = 36 // 小恐龍的 size（圖朝左，臉對著曬衣繩）
const R = 77 - 0.42 * S
const REX = 118
/** sneeze 姿勢嘴巴前面那一點（火從這裡噴出去） */
const MOUTH = { x: 108, y: 63 }
const GS = 28 // 阿嬤
const GY = 77 - 0.42 * GS
const G_HOME = 28
/** 第三次阿嬤舉著鍋子站的地方 */
const G3 = 74
const PAN = { x: G3 + 14, y: 60 }
const EGG = { x: PAN.x + 2, y: PAN.y - 1 }
const LINE_Y = 44
const TREE = 36
const TY = 77 - 0.42 * TREE
const SOCK = { x: 74, y: LINE_Y + 5.5 }
const SHIRT = { x: 55, y: LINE_Y + 6.5 }
const PANTS = { x: 37, y: LINE_Y + 7.5 }
const BURNT = 'brightness(0.22) saturate(0.3)'
/** 曬衣繩右邊的竿子 */
const POLE = 92
/** 鏡頭推近 z 倍、讓畫面正中間是 (x, y)：zoom 的 to 是不動點，不是中心，換算一下 */
const look = (x: number, y: number, z: number) => ({ x: (x * z - 80) / (z - 1), y: (y * z - 45) / (z - 1) })
/** 傻眼停多久 */
const HOLD = 0.6

/**
 * 「哈……哈……啾！」：仰頭吸氣（yawn 姿勢＋拉長）兩下 → 噴嚏（sneeze 姿勢）那一刻一串火從嘴巴噴到 to，
 * 火球撞上去、一圈小火、黑煙往上冒 → 他傻眼停 HOLD 秒。k 是第幾次：火一次比一次粗、一次比一次遠、煙一次比一次大、音效多疊一個。
 * gap 是兩聲「哈」之間停多久（第三次拉長，讓阿嬤衝回來）。
 * pan：第三次火打在阿嬤舉的平底鍋上——火球、一圈小火、煙都收在鍋子上方偏右，不蓋到阿嬤的身體和臉（火不能燒到人）。
 */
function sneeze(hit: number, k: number, to: { x: number; y: number }, burn: string[], gap = 0.5, pan = false) {
  const h1 = hit - 0.5 - gap
  const h2 = hit - 0.5
  const big = pan ? 1.9 : [1.3, 1.9, 2.6][k]
  // 火球、小火、煙的中心（打鍋子時往右上挪，離阿嬤遠一點）
  const hot = pan ? { x: to.x + 6, y: to.y - 2 } : to
  // blow 的 scale 會把整條路徑以起點放大，終點要先縮回去才會剛好撞到 to
  const end = { x: MOUTH.x + (to.x - MOUTH.x) / big, y: MOUTH.y + (to.y - MOUTH.y) / big }
  const moves: Move[] = [
    // 哈……
    { at: h1, actor: 'rex', do: 'swap', emoji: 'hero:rex/yawn' },
    { at: h1, actor: 'rex', do: 'squash', amount: -0.1, dur: gap },
    // 哈……（更大口）
    { at: h2, actor: 'rex', do: 'squash', amount: -0.16 - 0.04 * k, dur: 0.5 },
    { at: h2, actor: 'rex', do: 'tilt', amount: 6 + 3 * k, dur: 0.5 },
    // 啾！
    { at: hit, actor: 'rex', do: 'swap', emoji: 'hero:rex/sneeze' },
    { at: hit, actor: 'rex', do: 'squash', amount: 0.22 + 0.06 * k, dur: 0.25 },
    { at: hit + 0.35, actor: 'rex', do: 'swap', emoji: 'hero:rex/surprised' },
    { at: hit + 0.4, actor: 'rex', do: 'shake', amount: 0.4 + 0.2 * k, dur: HOLD - 0.15 },
  ]
  burn.forEach((id, i) => {
    moves.push({ at: hit + 0.12 + 0.08 * i, actor: id, do: 'tint', filter: BURNT })
    moves.push({ at: hit + 0.12 + 0.08 * i, actor: id, do: 'shake', amount: 0.8, dur: 0.35 })
  })
  const fx: Fx[] = [
    // 一串火從嘴巴噴出去
    { at: hit, kind: 'blow', x: MOUTH.x, y: MOUTH.y, to: end, emoji: '🔥', n: 4 + 3 * k, dur: 0.35 + 0.05 * k, scale: big },
    // 撞上去：一大團火＋一圈小火
    { at: hit + 0.12, kind: 'burst', x: hot.x, y: hot.y, emoji: '🔥', n: 1, dur: 0.5, scale: pan ? 1.7 : 1.1 + 0.5 * k },
    { at: hit + 0.15, kind: 'burst', x: hot.x, y: hot.y - (pan ? 6 : 0), emoji: '🔥', n: 5 + 2 * k, dur: 0.5, scale: pan ? 0.75 : 1.2 + 0.3 * k },
    // 黑煙往上冒，一次比一次大
    { at: hit + 0.3, kind: 'burst', x: hot.x + (pan ? 2 : 0), y: hot.y - 3 - 2 * k - (pan ? 8 : 0), emoji: 'prop:smoke', n: 1, dur: [0.8, 1.1, 1.0][k], scale: pan ? 2.4 : [1.1, 2.2, 3.4][k] },
  ]
  const camera: Camera[] = [
    { at: hit, dur: 0.45, do: 'punch', amount: 0.05 + 0.04 * k, to: { x: (MOUTH.x + to.x) / 2, y: 56 } },
    { at: hit, dur: 0.3 + 0.1 * k, do: 'shake', amount: 0.8 + 0.6 * k },
  ]
  // 同一個音效：「哈」一聲、哈啾（achoo 自己前 0.4 秒是「哈——」）、呼地噴火，一次比一次多疊一個
  const cues: Cue[] = [{ at: h1, sfx: 'blip' }, { at: hit - 0.4, sfx: 'achoo' }, { at: hit + 0.02, sfx: 'whoosh' }]
  if (k >= 1) cues.push({ at: hit + 0.15, sfx: 'crack' })
  if (k >= 2) cues.push({ at: hit + 0.2, sfx: 'rumble' })
  return { moves, fx, camera, cues, end: hit + 0.35 + HOLD }
}

const H1 = 1.9, H2 = 4.1, H3 = 7.2
const s1 = sneeze(H1, 0, SOCK, ['sock'])
const s2 = sneeze(H2, 1, { x: 44, y: LINE_Y + 7 }, ['shirt', 'pants'])
const s3 = sneeze(H3, 2, { x: PAN.x, y: PAN.y - 2 }, [], 1.3, true)
/** 第三次：阿嬤拿著鍋子衝回來的時間 */
const BACK = H3 - 1.45
/** 亮相 */
const POSE = 9.1
/** 煙散開、看到蛋煎好了 */
const REVEAL = H3 + 1.05

export default scene({
  duration: 11.5,
  bg: { top: '#7FAFD9', bottom: '#DCEBF7', floor: '#F2F7FF', scenery: 'snow' },
  actors: [
    { id: 'tree1', emoji: '🌲', x: 8, y: TY, size: TREE },
    { id: 'pants', emoji: '👖', x: PANTS.x, y: PANTS.y, size: 16, float: true },
    { id: 'shirt', emoji: '👕', x: SHIRT.x, y: SHIRT.y, size: 15, float: true },
    { id: 'sock', emoji: '🧦', x: SOCK.x, y: SOCK.y, size: 12, float: true, hidden: true },
    { id: 'grandma', emoji: 'prop:grandma', x: SOCK.x, y: GY, size: GS },
    { id: 'pan', emoji: 'prop:pan', x: PAN.x, y: PAN.y, size: 18, float: true, hidden: true },
    { id: 'egg', emoji: '🥚', x: EGG.x, y: EGG.y, size: 7, float: true, hidden: true },
    { id: 'rex', emoji: 'hero:rex/cold', x: REX, y: R, size: S },
  ],
  moves: [
    // ① 阿嬤把最後一隻襪子夾上去，走回旁邊；小恐龍圍著圍巾縮成一團發抖（感冒了）
    { at: 0.1, actor: 'grandma', do: 'hop', amount: 4, dur: 0.3 },
    { at: 0.25, actor: 'sock', do: 'pop', dur: 0.25 },
    { at: 0.1, actor: 'rex', do: 'shake', amount: 0.6, dur: 0.6 },
    { at: 0.6, actor: 'grandma', do: 'moveTo', to: { x: G_HOME, y: GY }, dur: 0.6, ease: 'out' },
    // 第一次：一小撮火，襪子烤黑
    ...s1.moves,
    { at: H1 + 0.3, actor: 'grandma', do: 'swap', emoji: 'prop:grandma-shock' },
    { at: H1 + 0.3, actor: 'grandma', do: 'hop', amount: 3, dur: 0.3 },
    { at: s1.end, actor: 'rex', do: 'swap', emoji: 'hero:rex/cold' },
    { at: s1.end + 0.1, actor: 'grandma', do: 'swap', emoji: 'prop:grandma' },
    // 第二次：一大條火，衣服褲子整排烤黑
    ...s2.moves,
    { at: H2 + 0.3, actor: 'grandma', do: 'swap', emoji: 'prop:grandma-shock' },
    { at: H2 + 0.3, actor: 'grandma', do: 'hop', amount: 6, dur: 0.4 },
    // 阿嬤氣得跑掉
    { at: s2.end, actor: 'grandma', do: 'moveTo', to: { x: -40, y: GY }, dur: 0.4, ease: 'in' },
    { at: s2.end, actor: 'rex', do: 'swap', emoji: 'hero:rex/cold' },
    // 第三次前停一拍：他鼻子又癢了（哈……），阿嬤拿著鍋子衝回來擋在他面前
    ...s3.moves,
    { at: BACK - 0.05, actor: 'grandma', do: 'swap', emoji: 'prop:grandma' },
    { at: BACK - 0.05, actor: 'pan', do: 'pop', dur: 0.01 },
    { at: BACK - 0.05, actor: 'egg', do: 'pop', dur: 0.01 },
    { at: BACK - 0.05, actor: 'pan', do: 'moveTo', to: { x: -40 + 14, y: PAN.y }, dur: 0.01 },
    { at: BACK - 0.05, actor: 'egg', do: 'moveTo', to: { x: -40 + 16, y: EGG.y }, dur: 0.01 },
    { at: BACK, actor: 'grandma', do: 'moveTo', to: { x: G3, y: GY }, dur: 0.45, ease: 'back' },
    { at: BACK, actor: 'pan', do: 'moveTo', to: PAN, dur: 0.45, ease: 'back' },
    { at: BACK, actor: 'egg', do: 'moveTo', to: EGG, dur: 0.45, ease: 'back' },
    // 啾！最大的火打在平底鍋上——煙裡蛋煎好了
    // 阿嬤嚇一跳、往後仰（火只打在鍋子上）
    { at: H3 + 0.12, actor: 'grandma', do: 'swap', emoji: 'prop:grandma-shock' },
    { at: H3 + 0.12, actor: 'grandma', do: 'tilt', amount: -12, dur: 0.5 },
    { at: REVEAL - 0.05, actor: 'grandma', do: 'swap', emoji: 'prop:grandma' },
    { at: H3 + 0.15, actor: 'pan', do: 'shake', amount: 1, dur: 0.4 },
    { at: H3 + 0.35, actor: 'egg', do: 'vanish', dur: 0.05 },
    { at: H3 + 0.35, actor: 'pan', do: 'swap', emoji: '🍳' },
    { at: H3 + 0.35, actor: 'pan', do: 'flip' },
    { at: H3 + 0.35, actor: 'pan', do: 'scaleTo', amount: 1.05, dur: 0.01 },
    // 煙散開：阿嬤把煎好的蛋舉起來給你看
    { at: REVEAL, actor: 'pan', do: 'moveTo', to: { x: PAN.x, y: PAN.y - 6 }, dur: 0.3, ease: 'back' },
    { at: REVEAL + 0.15, actor: 'grandma', do: 'hop', amount: 3, dur: 0.3 },
    // ⑤ 亮相：小恐龍得意地仰頭，再噴一小口火
    { at: POSE - 0.3, actor: 'rex', do: 'swap', emoji: 'hero:rex/happy' },
    { at: POSE, actor: 'rex', do: 'swap', emoji: 'hero:rex/roar' },
    { at: POSE, actor: 'rex', do: 'scaleTo', amount: 1.1, dur: 0.3, ease: 'back' },
    { at: POSE + 0.9, actor: 'grandma', do: 'hop', amount: 2, dur: 0.3 },
  ],
  fx: [
    { at: 0, kind: 'line', actor: 'tree1', dx: 4, dy: LINE_Y - TY, to: { x: POLE, y: LINE_Y }, color: '#8A6A4A', width: 0.5, dur: 11.5 },
    { at: 0, kind: 'line', actor: 'tree1', dx: POLE - 8, dy: 75 - TY, to: { x: POLE, y: LINE_Y - 2 }, color: '#7A5A3A', width: 1.4, dur: 11.5 },
    ...s1.fx,
    { at: H1 + 0.6, kind: 'stink', x: SOCK.x, y: SOCK.y, dur: 1.5 },
    ...s2.fx,
    { at: H2 + 0.7, kind: 'sweat', actor: 'rex' },
    ...s3.fx,
    { at: REVEAL, kind: 'burst', x: PAN.x, y: PAN.y - 8, emoji: '✨', n: 8, dur: 0.6, scale: 1.3 },
    // 亮相：仰頭噴一小口火＋彩帶
    { at: POSE + 0.05, kind: 'blow', x: REX - 12, y: R - 6, to: { x: REX - 26, y: R - 24 }, emoji: '🔥', n: 4, dur: 0.45, scale: 1.2 },
    { at: POSE + 0.1, kind: 'burst', x: REX - 2, y: R - 22, emoji: '✨', n: 10, dur: 0.9, scale: 1.4 },
    { at: POSE + 0.45, kind: 'burst', x: REX + 14, y: R - 16, emoji: '🎉', n: 6, dur: 0.9, scale: 1.2 },
  ],
  camera: [
    // 定住構圖：曬衣繩、阿嬤、小恐龍都在畫面裡
    { at: 0, dur: 0.01, do: 'zoom', amount: 1.2, to: look(80, 52, 1.2) },
    ...s1.camera,
    ...s2.camera,
    // 停一拍：慢慢推近，阿嬤衝回來、他鼻子癢
    { at: BACK - 0.4, dur: 0.8, do: 'zoom', amount: 1.4, to: look(96, 56, 1.4) },
    ...s3.camera,
    // 亮相
    { at: POSE - 0.3, dur: 0.5, do: 'zoom', amount: 1.55, to: look(100, 54, 1.55) },
    { at: POSE, dur: 0.3, do: 'shake', amount: 1 },
  ],
  lights: [
    { at: H3, dur: 0.05, level: -0.4 },
    { at: H3 + 0.05, dur: 0.4, level: 0.15 },
    { at: H3 + 0.6, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.1, sfx: 'boing' },
    { at: 0.25, sfx: 'clink' },
    ...s1.cues,
    ...s2.cues,
    { at: s2.end, sfx: 'whoosh' },
    { at: BACK, sfx: 'slide' },
    ...s3.cues,
    { at: REVEAL, sfx: 'blip' },
    { at: POSE, sfx: 'whoosh' },
    { at: POSE + 0.25, say: '噴火龍' },
    { at: POSE + 0.5, sfx: 'cheer' },
  ],
})
