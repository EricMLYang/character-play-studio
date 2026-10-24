/**
 * 指讀小書：用他看過的字、字卡上的語詞，照句型組出 3～5 句的小書，一句一句唸、唸到哪個字哪個字亮，
 * 唸完問「哪一個是『火』？」讓他指出來（研究上「共讀時指著字讀」是證據最強的一種）。
 *
 * 句型只用字庫裡有的字（好、大、小、你、他、有、要、愛、玩），每一段固定的話都先做成音檔；
 * 空格放一個有圖的語詞（火車、火山），語詞本來就有音檔，所以整句都用做好的音檔唸，不會落到瀏覽器朗讀。
 *
 * before／after 是空格前後固定的字；after 的標點只顯示不唸。
 */
export const PATTERNS = [
  { id: 'big', before: '', after: '好大！' },
  { id: 'small', before: '', after: '好小！' },
  { id: 'cute', before: '', after: '好可愛！' },
  { id: 'fun', before: '', after: '好好玩！' },
  { id: 'have', before: '你有', after: '。' },
  { id: 'want', before: '他要', after: '。' },
  { id: 'love', before: '你愛', after: '。' },
]

export const patternById = (id) => PATTERNS.find((p) => p.id === id)

/** 一句話的文字（含標點） */
export const sentenceText = (pattern, word) => `${pattern.before}${word}${pattern.after}`

/** 句型裡要唸的固定段落（去掉只有標點的） */
const spoken = (segment) => segment.replace(/[。！？，]/g, '')

/** 句型用到的所有字（檢查字庫有沒有） */
export const patternChars = (pattern) => [...new Set([...spoken(pattern.before) + spoken(pattern.after)])]

export const BOOK_FIXED = {
  bookHello: '我們來讀一本小書！',
  bookAsk: '哪一個是',
  bookPage: '翻頁！',
  bookMine: '最後一頁，換你自己接一句！',
  bookDone: '你自己讀完一本小書了！好厲害！',
  bookPerfect: '每一個字都自己指對了！',
}

/** 要先做成音檔的句子：固定句、每個句型的固定段落 */
export function bookLines() {
  return [...Object.values(BOOK_FIXED), ...PATTERNS.flatMap((p) => [spoken(p.before), spoken(p.after)]).filter(Boolean)]
}

export { spoken as spokenPart }
