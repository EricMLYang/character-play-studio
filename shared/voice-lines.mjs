/**
 * 孩子端固定會唸的句型。伺服器照這裡預先把每個字會唸到的句子做成音檔（server/voice.mjs），
 * 畫面也用同一個函式組句子，兩邊才會一字不差地對上；對不上的句子會退回瀏覽器朗讀，聲音不一樣、手機上可能沒聲音。
 *
 * 新遊戲有固定台詞：在 LINES 加一個句型、畫面上用 LINES.xxx(…) 組，再把它加進 linesForEntry。
 * 臨時組出來、沒辦法預先做的句子（字火車接的詞、魔法鍋的反應）不用放這裡。
 */
export const LINES = {
  /** 小鎮居民的自我介紹 */
  townHello: (char) => `我是${char}！`,
  townWord: (char, word) => `我是${char}！${word}的${char}`,
}

/** 一個字在孩子端會唸到的所有句子：字、語詞、小故事、小鎮自我介紹。 */
export function linesForEntry(entry) {
  const out = [entry.char, LINES.townHello(entry.char)]
  for (const w of entry.words ?? []) if (w?.text) out.push(w.text, LINES.townWord(entry.char, w.text))
  if (entry.concept?.hook) out.push(entry.concept.hook)
  return out
}
