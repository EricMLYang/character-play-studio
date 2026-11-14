// 演的是字面意思：偵探拿放大鏡找線索，屁屁「噗」一聲把壞人吹跑（臉不是屁股形狀，偵探是一般的 🕵️）。
import { scene } from '../../story/scene'

// 黃昏的樹林：偵探跳進來，彎腰沿著腳印一個一個看，腳印通到大樹叢。他把頭伸進樹叢找——什麼都沒有。
// 其實海盜抱著寶箱早就溜到他背後，對觀眾偷笑。偵探彎下腰再找……停一拍……肚子咕嚕……「噗！」一陣大風把海盜吹上天，
// 寶箱裡的鑽石掉下來。偵探回頭什麼都沒看到，撿起鑽石用放大鏡一照：「屁屁偵探」。最後又小小噗一聲，他臉紅了。
const G = 66.1 // 偵探（size 26）
const P = 66.9 // 海盜（size 24）
// 🕵️ 的 3D 圖手上本來就拿著放大鏡，不另外放

export default scene({
  duration: 9.4,
  bg: { top: '#F2A65A', bottom: '#FCE3B0', floor: '#7DA35B', scenery: 'forest' },
  actors: [
    { id: 'mush', emoji: '🍄', x: 18, y: 71.5, size: 11 },
    { id: 'log', emoji: '🪵', x: 150, y: 71.5, size: 14 },
    { id: 'f1', emoji: '🐾', x: 72, y: 73, size: 6, float: true },
    { id: 'f2', emoji: '🐾', x: 88, y: 73, size: 6, float: true },
    { id: 'f3', emoji: '🐾', x: 104, y: 73, size: 6, float: true },
    { id: 'pirate', emoji: 'hero:pirate/treasure', x: 128, y: P, size: 24 },
    { id: 'bush', emoji: '🌳', x: 128, y: 59.4, size: 42 },
    { id: 'gas', emoji: '💨', x: 86, y: 60, size: 16, hidden: true, float: true, flip: true },
    { id: 'gem', emoji: '💎', x: 60, y: 60, size: 10, hidden: true, float: true, pivot: 'center' },
    { id: 'sleuth', emoji: '🕵️', x: 52, y: G, size: 26, flip: true },
  ],
  moves: [
    // 跳進來
    { at: 0, actor: 'sleuth', do: 'enter', from: { x: -18, y: G }, dur: 0.6, ease: 'out' },
    { at: 0.6, actor: 'sleuth', do: 'hop', amount: 4, dur: 0.3 },
    // 彎腰沿著腳印一個一個看過去
    { at: 1.0, actor: 'sleuth', do: 'tilt', amount: 12, dur: 2.2 },
    { at: 1.5, actor: 'sleuth', do: 'moveTo', to: { x: 70, y: G }, dur: 0.5 },
    { at: 2.0, actor: 'sleuth', do: 'moveTo', to: { x: 88, y: G }, dur: 0.5 },
    // 海盜趁他低頭，從樹叢後面溜到他背後
    { at: 2.3, actor: 'pirate', do: 'moveTo', to: { x: 60, y: P }, dur: 0.8, ease: 'inOut' },
    { at: 2.3, actor: 'pirate', do: 'bounce', amount: 1.2, times: 4, dur: 0.8 },
    // 把頭伸進樹叢找——什麼都沒有
    { at: 2.6, actor: 'sleuth', do: 'moveTo', to: { x: 104, y: G }, dur: 0.4 },
    { at: 3.0, actor: 'bush', do: 'shake', amount: 1.2, dur: 0.6 },
    { at: 3.3, actor: 'pirate', do: 'hop', amount: 3, dur: 0.3 },
    // 再彎下腰看地上……停一拍……
    { at: 4.0, actor: 'sleuth', do: 'tilt', amount: 22, dur: 1.4 },
    { at: 4.3, actor: 'pirate', do: 'moveTo', to: { x: 80, y: P }, dur: 0.5 },
    { at: 4.9, actor: 'sleuth', do: 'shake', amount: 0.6, dur: 0.4 },
    // 噗！海盜被吹上天，鑽石掉下來
    { at: 5.4, actor: 'sleuth', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 5.45, actor: 'pirate', do: 'swap', emoji: 'hero:pirate/surprised' },
    { at: 5.5, actor: 'pirate', do: 'moveTo', to: { x: 14, y: 4 }, arc: 10, dur: 1.0, ease: 'out' },
    { at: 5.5, actor: 'pirate', do: 'spin', times: -3, dur: 1.0, pivot: 'center' },
    { at: 6.5, actor: 'pirate', do: 'vanish', dur: 0.2 },
    // 一大團風從他背後噴出來
    { at: 5.42, actor: 'gas', do: 'pop', dur: 0.12 },
    { at: 5.45, actor: 'gas', do: 'moveTo', to: { x: 70, y: 60 }, dur: 0.45, ease: 'out' },
    { at: 5.45, actor: 'gas', do: 'scaleTo', amount: 2.2, dur: 0.45, ease: 'out' },
    { at: 5.95, actor: 'gas', do: 'vanish', dur: 0.3 },
    { at: 5.55, actor: 'gem', do: 'pop', dur: 0.15 },
    { at: 5.6, actor: 'gem', do: 'moveTo', to: { x: 86, y: 70 }, arc: 14, dur: 0.6, ease: 'out' },
    { at: 5.6, actor: 'gem', do: 'spin', times: 2, dur: 0.6 },
    // 回頭：什麼都沒看到
    { at: 6.4, actor: 'sleuth', do: 'flip' },
    { at: 6.4, actor: 'sleuth', do: 'scaleTo', amount: 1.15, dur: 0.3, ease: 'back' },
    // 撿起鑽石，用放大鏡一照：亮相
    { at: 6.9, actor: 'sleuth', do: 'moveTo', to: { x: 92, y: G }, dur: 0.3 },
    { at: 7.0, actor: 'gem', do: 'moveTo', to: { x: 92, y: 33 }, arc: 6, dur: 0.3, ease: 'back' },
    { at: 7.3, actor: 'gem', do: 'scaleTo', amount: 1.5, dur: 0.3, ease: 'back' },
    { at: 7.3, actor: 'sleuth', do: 'hop', amount: 5, dur: 0.4 },
    { at: 7.3, actor: 'sleuth', do: 'scaleTo', amount: 1.05, dur: 0.35, ease: 'back' },
    // 回馬槍：又小小噗一聲，臉紅
    { at: 8.3, actor: 'sleuth', do: 'squash', amount: 0.15, dur: 0.25 },
    { at: 8.3, actor: 'gas', do: 'moveTo', to: { x: 76, y: 64 }, dur: 0.01 },
    { at: 8.31, actor: 'gas', do: 'scaleTo', amount: 0.3, dur: 0.01 },
    { at: 8.32, actor: 'gas', do: 'pop', dur: 0.2 },
    { at: 8.35, actor: 'gas', do: 'moveTo', to: { x: 70, y: 62 }, dur: 0.4, ease: 'out' },
    { at: 8.9, actor: 'gas', do: 'vanish', dur: 0.25 },
  ],
  fx: [
    { at: 0.55, kind: 'puff', actor: 'sleuth', dur: 0.4 },
    { at: 1.1, kind: 'pop', actor: 'sleuth', emoji: '🤔', dx: -8, dur: 0.7 },
    { at: 2.4, kind: 'pop', actor: 'pirate', emoji: '🤫', dur: 0.6 },
    { at: 3.0, kind: 'burst', actor: 'bush', emoji: '🍃', n: 6, dur: 0.6 },
    { at: 3.4, kind: 'pop', actor: 'sleuth', emoji: '❓', dx: 6, dur: 0.6 },
    { at: 3.4, kind: 'pop', actor: 'pirate', emoji: '😆', dur: 0.6 },
    { at: 4.95, kind: 'pop', actor: 'pirate', emoji: '😳', dx: -6, dur: 0.5 },
    { at: 5.45, kind: 'burst', x: 88, y: 58, emoji: '💨', n: 12, dur: 1.0 },
    { at: 5.45, kind: 'stink', actor: 'pirate', dur: 0.9 },
    { at: 5.6, kind: 'burst', actor: 'pirate', emoji: '⭐', n: 5, dur: 0.7 },
    { at: 5.5, kind: 'puff', actor: 'sleuth', n: 10, dur: 0.6 },
    { at: 6.45, kind: 'pop', actor: 'sleuth', emoji: '❓', dx: -8, dur: 0.5 },
    { at: 7.3, kind: 'burst', actor: 'gem', emoji: '✨', n: 9, dur: 0.9 },
    { at: 7.6, kind: 'burst', actor: 'sleuth', emoji: '🎉', n: 7, dur: 0.9 },
    { at: 8.3, kind: 'burst', x: 100, y: 62, emoji: '💨', n: 3, dur: 0.6 },
    { at: 8.4, kind: 'pop', actor: 'sleuth', emoji: '😳', dx: -10, dur: 0.8 },
  ],
  camera: [
    { at: 1.0, dur: 0.4, do: 'zoom', amount: 1.35, to: { x: 86, y: 60 } },
    { at: 3.2, dur: 0.3, do: 'zoom', amount: 1.15, to: { x: 92, y: 52 } },
    { at: 5.45, dur: 0.4, do: 'shake', amount: 1.8 },
    // 噗的那一刻推近偵探（定點在他身上，他留在原地變大）；海盜飛出畫面時鏡頭不要跟上去
    { at: 4.95, dur: 0.45, do: 'zoom', amount: 1.5, to: { x: 88, y: 64 } },
    { at: 7.3, dur: 0.45, do: 'zoom', amount: 1.55, to: { x: 92, y: 62 } },
  ],
  lights: [
    { at: 0, dur: 0.01, level: 0.2 },
    { at: 5.45, dur: 0.05, level: -0.3 },
    { at: 5.5, dur: 0.3, level: 0.2 },
    { at: 7.3, dur: 0.4, level: 0 },
  ],
  cues: [
    { at: 0.55, sfx: 'plop' },
    { at: 1.1, sfx: 'tap' },
    { at: 1.6, sfx: 'tap' },
    { at: 3.0, sfx: 'slide' },
    { at: 4.9, sfx: 'rumble' },
    { at: 5.45, sfx: 'poof' },
    { at: 5.5, sfx: 'whoosh' },
    { at: 6.2, sfx: 'clink' },
    { at: 7.3, sfx: 'blip' },
    { at: 7.45, say: '屁屁偵探' },
    { at: 8.3, sfx: 'deflate' },
    { at: 8.6, sfx: 'cheer' },
  ],
})
