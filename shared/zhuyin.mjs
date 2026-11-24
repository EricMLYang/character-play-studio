/**
 * 注音找字（自己逛逛的「ㄅㄆㄇ 找字」，畫面在 src/play/ZhuyinPad.tsx）。
 * 他剛上小一、認得ㄅㄆㄇ但不會打字，所以找字改成「按注音」：按ㄅ就留下聲母是ㄅ的字，
 * 再按ㄠ就剩包、抱、寶……等於自己拼出一個音。
 *
 * 37 個符號照課本分三組：聲母、介音、韻母。每一組最多選一個——一個字的注音每一組本來就只有一個，
 * 同組選兩個一定找不到字。聲調和輕聲的「˙」不管：他還分不清四聲，按ㄅㄠ就該看到包、抱、寶全部。
 *
 * 這裡是純邏輯（孩子端與測試共用），音檔的句子也在這裡（server/voice.mjs 照 zhuyinLines() 預先做好）。
 */

/** 聲母 21 個，課本的順序 */
export const INITIALS = ['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ']
/** 介音 3 個 */
export const MEDIALS = ['ㄧ', 'ㄨ', 'ㄩ']
/** 韻母 13 個 */
export const FINALS = ['ㄚ', 'ㄛ', 'ㄜ', 'ㄝ', 'ㄞ', 'ㄟ', 'ㄠ', 'ㄡ', 'ㄢ', 'ㄣ', 'ㄤ', 'ㄥ', 'ㄦ']

/** 三組，畫面照這個順序排、顯示區也照這個順序把選的符號串起來 */
export const ZHUYIN_GROUPS = [
  { id: 'initial', name: '聲母', keys: INITIALS },
  { id: 'medial', name: '介音', keys: MEDIALS },
  { id: 'final', name: '韻母', keys: FINALS },
]
export const ZHUYIN_KEYS = [...INITIALS, ...MEDIALS, ...FINALS]

const GROUP_OF = new Map(ZHUYIN_GROUPS.flatMap((g) => g.keys.map((k) => [k, g.id])))
const TONES = new Set(['ˊ', 'ˇ', 'ˋ', '˙'])

/** 這個符號是哪一組（聲調、不認得的字回 undefined） */
export const groupOf = (sym) => GROUP_OF.get(sym)

/**
 * 把一個字的注音拆成聲母／介音／韻母（例如 ㄏㄨㄛˇ → ㄏ、ㄨ、ㄛ；˙ㄉㄜ → ㄉ、ㄜ）。
 * bad 記下拆不開的地方（不認得的符號、同一組出現兩次、順序顛倒），字庫的測試用它把關，畫面不用看。
 */
export function parseZhuyin(zhuyin = '') {
  const out = { initial: '', medial: '', final: '', bad: [] }
  let last = -1
  for (const ch of zhuyin) {
    if (TONES.has(ch)) continue
    const g = GROUP_OF.get(ch)
    if (!g) { out.bad.push(`不認得「${ch}」`); continue }
    const at = ZHUYIN_GROUPS.findIndex((x) => x.id === g)
    if (out[g]) out.bad.push(`${ZHUYIN_GROUPS[at].name}有兩個（${out[g]}、${ch}）`)
    else if (at < last) out.bad.push(`「${ch}」的位置不對`)
    out[g] = out[g] || ch
    last = Math.max(last, at)
  }
  return out
}

/** 選了什麼：{ initial?: 'ㄅ', medial?: 'ㄧ', final?: 'ㄠ' }，沒選的那組不放或空字串 */
export const hasPick = (pick) => Boolean(pick && (pick.initial || pick.medial || pick.final))

/** 照聲母→介音→韻母串起來（顯示區那一串大字） */
export const pickText = (pick) => ZHUYIN_GROUPS.map((g) => pick?.[g.id] || '').join('')

/** 這個注音符不符合：選了的每一組都要一樣，沒選的不管 */
export function matchesPick(zhuyin, pick) {
  if (!hasPick(pick)) return true
  const p = parseZhuyin(zhuyin)
  return ZHUYIN_GROUPS.every((g) => !pick[g.id] || p[g.id] === pick[g.id])
}

/** 按一顆鍵之後的選擇：同組換過去，按已經選的那顆是取消 */
export function togglePick(pick, sym) {
  const g = groupOf(sym)
  if (!g) return { ...pick }
  return { ...pick, [g]: pick?.[g] === sym ? '' : sym }
}

/**
 * 現在按得下去的鍵：照其他兩組目前的選擇，按下去還找得到字的才亮著（不會走進 0 個字的死路）。
 * 已經選的那顆一定按得下去（按了是取消，只會變多）。entries 是目前的字卡清單（要有 zhuyin）。
 */
export function availableKeys(entries, pick = {}) {
  const parsed = entries.map((e) => parseZhuyin(e.zhuyin))
  const out = new Set()
  for (const g of ZHUYIN_GROUPS) {
    if (pick[g.id]) out.add(pick[g.id])
    // 其他兩組符合的字，它們這一組是什麼，那幾顆就按得下去
    const others = ZHUYIN_GROUPS.filter((x) => x.id !== g.id && pick[x.id])
    for (const p of parsed) {
      if (p[g.id] && others.every((x) => p[x.id] === pick[x.id])) out.add(p[g.id])
    }
  }
  return out
}

/**
 * 字卡上的注音切成一段一段，選中的符號標上那一組的顏色（例如選了ㄠ：包 → ㄅ｜ㄠ✓）。
 * 回傳 [{ text, group, hit }]：group 是哪一組（聲調是 null），hit 是不是他選的那個。
 */
export function zhuyinSegments(zhuyin = '', pick = {}) {
  return [...zhuyin].map((text) => {
    const group = GROUP_OF.get(text) || null
    return { text, group, hit: Boolean(group && pick?.[group] === text) }
  })
}

/** 這個功能固定會唸的句子（音檔預先做好）。按鍵唸的是符號本身（「ㄅ」），也一起做 */
export const ZHUYIN_LINES = {
  /** 按「ㄅㄆㄇ 找字」打開鍵盤 */
  open: '按注音，找找看！',
  /** 按「清掉」 */
  clear: '清掉了！再按一次注音！',
}

/** 要預先做音檔的句子：37 個符號＋固定句 */
export const zhuyinLines = () => [...ZHUYIN_KEYS, ...Object.values(ZHUYIN_LINES)]
