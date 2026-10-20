/**
 * 孩子端固定會唸的句型。伺服器照這裡預先把每個字會唸到的句子做成音檔（server/voice.mjs），
 * 畫面也用同一個函式組句子，兩邊才會一字不差地對上；對不上的句子會退回瀏覽器朗讀，聲音不一樣、手機上可能沒聲音。
 *
 * 新遊戲有固定台詞：跟字有關的在 LINES 加句型並放進 linesForEntry；跟字無關的放 FIXED_LINES。
 * 臨時組出來、沒辦法預先做的句子（字火車接的詞、魔法鍋的反應）不用放這裡。
 */
export const LINES = {
  /** 小鎮居民的自我介紹 */
  townHello: (char) => `我是${char}！`,
  townWord: (char, word) => `我是${char}！${word}的${char}`,
  /** 餵大怪獸：點菜、點錯時說那是什麼字 */
  feedAsk: (char) => `我要吃${char}！`,
  feedNotThis: (char) => `這是${char}耶！`,
  /** 詞語拼圖：先唸詞，再說要補的是哪個字（生日的日） */
  puzzleAsk: (char, word) => `${word}的${char}`,
}

/** 跟字無關、每次都一樣的句子 */
export const FIXED_LINES = {
  feedHungry: '我肚子好餓喔！',
  feedFull: '我吃飽了！謝謝你！',
  feedRecap: '我吃到了這些字！',
  /** 肚子撐滿了要爆炸、爆完縮回來 */
  feedSwell: '肚子好撐喔…',
  feedBoom: '砰！',
  feedAgain: '好好玩！我還要吃！',
  /** 吃太飽睡著 */
  feedSleepy: '吃得好飽…好想睡喔…',
  feedSnore: '呼…呼…',
  feedWake: '我睡飽了！還要吃！',
  /** 打嗝飛上天 */
  feedBloat: '肚子好脹喔…',
  feedBurp: '嗝～！',
  feedFly: '哇！我飛上天又掉下來了！',
  /** 變成彩虹怪獸 */
  feedWarm: '肚子熱熱的…',
  feedMagic: '變！',
  feedRainbow: '我變成彩虹怪獸了！',
  /** 詞語拼圖 */
  puzzleHello: '來拼詞語囉！',
  puzzleRecap: '你拼好了這些詞！',
  puzzleNew: '新的詞！',
}

/** 一個字在孩子端會唸到的所有句子：字、語詞、小故事、小鎮自我介紹。 */
export function linesForEntry(entry) {
  const out = [entry.char, LINES.townHello(entry.char), LINES.feedAsk(entry.char), LINES.feedNotThis(entry.char)]
  for (const w of entry.words ?? []) if (w?.text) out.push(w.text, LINES.townWord(entry.char, w.text), LINES.puzzleAsk(entry.char, w.text))
  if (entry.concept?.hook) out.push(entry.concept.hook)
  return out
}
