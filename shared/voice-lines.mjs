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
  /** 詞語拼圖：這個字的詞全部收集到了 */
  puzzleAll: (char) => `${char}的詞全部找到了！`,
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
  /**
   * 首頁那隻角色講的話（src/play/nudge.ts）。他還不會讀字，這幾句要唸得出來才有用。
   *
   * 畫面上寫的那句會帶數字與字（「『楊』只差一顆星星！」），每次都不一樣、做不出音檔；
   * 所以唸的是拆開來的固定句子＋那個字本身（那個字的音檔本來就有），一句接一句唸完，
   * 全部都用做好的音檔，不會落到每台裝置都不一樣的瀏覽器朗讀。
   */
  nudgeFirst: '點一張字卡，我們一起看看它！',
  nudgeToday: '今天還沒看字喔！挑一張字卡看看吧',
  nudgeLab: '魔法鍋可以把一個字變成另一個字，你還沒玩過！',
  nudgeTrain: '字火車可以自己接一個詞，你還沒接過！',
  nudgePuzzle: '詞語拼圖要把字補進詞裡，你還沒拼過！',
  nudgeMore: '再多看幾個字，遊戲裡就有更多字可以玩！',
  nudgeFeedDue: '我肚子餓了，有好幾個字想吃！',
  nudgeChest: '快要有新夥伴了！再去拿幾顆星星！',
  nudgeStars: '你收集了好多星星！再去拿幾顆？',
  /** 差一顆就滿星的字：先說這句，再唸那個字，最後說要去哪裡拿（下面 nudgeDo*） */
  nudgeNearly: '這個字只差一顆星星了！',
  nudgeDoWatch: '看一次就拿到了！',
  nudgeDoWrite: '按「換你寫」，自己把它描完！',
  nudgeDoRecall: '去餵大怪獸，自己把它找出來！',
  nudgeDoPuzzle: '去詞語拼圖，把它補進一個詞裡！',
  nudgeDoBrew: '去魔法鍋，把它變出來！',
  nudgeDoFamily: '去部首家族，找到它的家！',
  /** 進到魔法鍋、字火車時先說一句「這裡要做什麼」（其他五個玩法本來就會開口，他讀不到字） */
  labHello: '把字丟進鍋子，攪一攪！',
  trainHello: '選一個字，當火車頭！',
  /** 看過的字再打開：先想一下再看（每次重看都變成一次回想） */
  recallAsk: '你還記得這是什麼字嗎？',
  /** 他自己把字描完了（先唸那個字，再唸這句）：整個看字流程最值得講的一刻 */
  movedIn: '搬進你的小鎮了！',
  /** 描完之後邀他遮起來憑記憶寫；寫出來了先唸那個字再唸這句 */
  blindInvite: '遮起來，自己寫寫看！',
  wroteBlind: '沒有偷看就寫出來了！好厲害！',
  movedGrow: '在小鎮長大了！',
  movedCrown: '戴上皇冠了！好厲害！',
  /** 開寶箱、加冕、三件事做完：三個最大的時刻，他讀不到字，要唸出來 */
  chestOpen: '哇！新朋友來了！',
  /** 一個字的星星集滿了（先唸那個字，再唸這句） */
  crownFull: '的星星集滿了！好厲害！',
  /** 今天的路（src/play/today.ts）：每一站的那句話，以及走完 */
  pathRecall: '先把前幾天的字想起來！',
  pathNew: '來認識今天的新朋友！',
  pathFamily: '看看今天的字住在哪一家！',
  pathRead: '用今天的字，讀一本小書！',
  pathHome: '回家囉！去小鎮看看！',
  pathAllDone: '今天的路走完了！好厲害！',
  /** 餵大怪獸的神秘料理（原本的小偵探）：怪獸不說字，盤子上一筆一筆畫出來，猜猜是誰 */
  guessWho: '猜猜我要吃誰？',
  guessFast: '哇！好厲害！',
  /** 詞語拼圖 */
  puzzleHello: '來拼詞語囉！',
  puzzleRecap: '你拼好了這些詞！',
  puzzleNew: '新的詞！',
  puzzlePicture: '哪一張圖是這個詞？',
  puzzlePerfect: '全部自己拼出來了！好厲害！',
}

/**
 * 餵大怪獸每一輪由一位夥伴來端菜，一進來先說這句：十八位各一句。
 * 字面是 src/play/partners.ts 的 serveLine 組出來的；放在這裡是因為音檔要先做好
 * （server/voice.mjs 只看得到 shared/）。兩邊對不上的話 tests/partners.test.mjs 會擋下來。
 */
export const PARTNER_SERVES = [
  '楊捷睿端菜來了！', '小老鼠端菜來了！', '大怪獸端菜來了！', '機器人端菜來了！', '海盜端菜來了！', '恐龍端菜來了！',
  '浣熊端菜來了！', '小豬端菜來了！', '太空人端菜來了！', '披風英雄端菜來了！', '忍者端菜來了！', '警長端菜來了！',
  '鯊魚端菜來了！', '勇士端菜來了！', '消防員端菜來了！', '外星人端菜來了！', '小汽車端菜來了！', '積木人端菜來了！',
]

/** 一個字在孩子端會唸到的所有句子：字、語詞、小故事、小鎮自我介紹。 */
export function linesForEntry(entry) {
  const out = [entry.char, LINES.townHello(entry.char), LINES.feedAsk(entry.char), LINES.feedNotThis(entry.char)]
  for (const w of entry.words ?? []) if (w?.text) out.push(w.text, LINES.townWord(entry.char, w.text), LINES.puzzleAsk(entry.char, w.text))
  if (entry.words?.length) out.push(LINES.puzzleAll(entry.char))
  if (entry.concept?.hook) out.push(entry.concept.hook)
  return out
}
