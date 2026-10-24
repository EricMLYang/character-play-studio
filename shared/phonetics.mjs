/**
 * 聲音家族：一個字跑到別的字旁邊，那個字念起來就像它（包 → 跑、抱）。
 * 部首家族教「意思」，這裡教「聲音」。研究上小二學新字時聲旁真的有幫助，但聲旁不一定準——
 * 所以**只收念法真的接近的**（韻母一樣，聲母也相近），例如 良 → 狼、浪 韻母不同就不收。
 *
 * 跟 radicals.mjs 同一個形狀（forms／name／emoji／intro／change／common／members），
 * 孩子端的部首家族（src/play/Roots.tsx）兩種一起放；每一句都先做成音檔。
 * head 不一定在字庫裡（工、巴、反、登）：只當門牌，筆順檔與字音會一起準備。
 */
export const SOUNDS = [
  { id: 'sound-bao', forms: ['包'], name: '包的聲音', emoji: '🔊',
    intro: '這是包！聽聽看它的聲音：包！', change: '包跑到字的旁邊，那個字念起來就像包！', common: '有包的字，念起來都像包！',
    members: { 跑: '跑，念起來像包！', 抱: '抱，念起來像包！' } },
  { id: 'sound-ma', forms: ['馬'], name: '馬的聲音', emoji: '🔊',
    intro: '這是馬！聽聽看它的聲音：馬！', change: '馬跑到字的旁邊，那個字念起來就像馬！', common: '有馬的字，念起來都像馬！',
    members: { 媽: '媽，念起來像馬！' } },
  { id: 'sound-ke', forms: ['可'], name: '可的聲音', emoji: '🔊',
    intro: '這是可！聽聽看它的聲音：可！', change: '可跑到字的旁邊，那個字念起來就像可！', common: '有可的字，念起來都像可！',
    members: { 河: '河，念起來像可！', 哥: '哥，念起來像可！' } },
  { id: 'sound-fen', forms: ['分'], name: '分的聲音', emoji: '🔊',
    intro: '這是分！聽聽看它的聲音：分！', change: '分跑到字的旁邊，那個字念起來就像分！', common: '有分的字，念起來都像分！',
    members: { 粉: '粉，念起來像分！' } },
  { id: 'sound-gong', forms: ['工'], name: '工的聲音', emoji: '🔊',
    intro: '這是工！聽聽看它的聲音：工！', change: '工跑到字的旁邊，那個字念起來就像工！', common: '有工的字，念起來都像工！',
    members: { 紅: '紅，念起來像工！', 空: '空，念起來像工！', 虹: '虹，念起來像工！' } },
  { id: 'sound-tu', forms: ['土'], name: '土的聲音', emoji: '🔊',
    intro: '這是土！聽聽看它的聲音：土！', change: '土跑到字的旁邊，那個字念起來就像土！', common: '有土的字，念起來都像土！',
    members: { 肚: '肚，念起來像土！' } },
  { id: 'sound-zao', forms: ['早'], name: '早的聲音', emoji: '🔊',
    intro: '這是早！聽聽看它的聲音：早！', change: '早跑到字的下面，那個字念起來就像早！', common: '有早的字，念起來都像早！',
    members: { 草: '草，念起來像早！' } },
  { id: 'sound-dou', forms: ['豆'], name: '豆的聲音', emoji: '🔊',
    intro: '這是豆！聽聽看它的聲音：豆！', change: '豆跑到字的旁邊，那個字念起來就像豆！', common: '有豆的字，念起來都像豆！',
    members: { 頭: '頭，念起來像豆！' } },
  { id: 'sound-jia', forms: ['甲'], name: '甲的聲音', emoji: '🔊',
    intro: '這是甲！聽聽看它的聲音：甲！', change: '甲跑到字的旁邊，那個字念起來就像甲！', common: '有甲的字，念起來都像甲！',
    members: { 鴨: '鴨，念起來像甲！' } },
  { id: 'sound-ba', forms: ['巴'], name: '巴的聲音', emoji: '🔊',
    intro: '這是巴！聽聽看它的聲音：巴！', change: '巴跑到字的旁邊，那個字念起來就像巴！', common: '有巴的字，念起來都像巴！',
    members: { 爸: '爸，念起來像巴！', 爬: '爬，念起來像巴！' } },
  { id: 'sound-fan', forms: ['反'], name: '反的聲音', emoji: '🔊',
    intro: '這是反！聽聽看它的聲音：反！', change: '反跑到字的旁邊，那個字念起來就像反！', common: '有反的字，念起來都像反！',
    members: { 飯: '飯，念起來像反！', 板: '板，念起來像反！' } },
  { id: 'sound-deng', forms: ['登'], name: '登的聲音', emoji: '🔊',
    intro: '這是登！聽聽看它的聲音：登！', change: '登跑到字的旁邊，那個字念起來就像登！', common: '有登的字，念起來都像登！',
    members: { 橙: '橙，念起來像登！', 燈: '燈，念起來像登！' } },
]

export const soundById = (id) => SOUNDS.find((s) => s.id === id)

/** 聲音家族固定會唸的句子 */
export const SOUND_LINES = {
  ask: (s) => `哪一個字念起來像${s.forms[0]}？`,
  home: (s) => `${s.name}的家`,
}

/** 要先做成音檔的所有句子（含門牌那個字本身：工、巴、反、登 不在字庫裡） */
export function soundLines() {
  return SOUNDS.flatMap((s) => [s.forms[0], s.intro, s.change, s.common, s.name, SOUND_LINES.ask(s), SOUND_LINES.home(s), ...Object.values(s.members)])
}

/** 門牌要一筆一筆寫出來 */
export const soundGlyphs = () => [...new Set(SOUNDS.map((s) => s.forms[0]))]
