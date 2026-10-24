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
  /** 跳石頭過河：這一步要跳到哪一顆石頭 */
  riverJump: (char) => `跳到${char}！`,
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
  /** 跳石頭過河：出發、上岸、把跳對的字唸一遍。對岸有什麼用圖示表示，不唸出來（他還不會讀） */
  riverArrive: '過河了！',
  riverRecap: '我跳對了這些字！',
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
  nudgeRiverDue: '有好幾個字可以再認一次，陪我過河好不好？',
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
  questsDone: '今天的三件事都做完了！',
  /** 小偵探：一筆一筆畫出來，猜猜我是誰；沒幾筆就猜到要誇張一點；最後把他猜到的字唸一遍 */
  guessWho: '猜猜我是誰？',
  guessFast: '哇！好厲害！',
  spyRecap: '你自己猜到了這些字！',
  spyPerfect: '全部都自己猜到了！好厲害！',
  /** 跳石頭過河：五顆都自己跳對 */
  riverPerfect: '一次都沒掉下去！',
  /** 詞語拼圖 */
  puzzleHello: '來拼詞語囉！',
  puzzleRecap: '你拼好了這些詞！',
  puzzleNew: '新的詞！',
  puzzlePicture: '哪一張圖是這個詞？',
  puzzlePerfect: '全部自己拼出來了！好厲害！',
}

/**
 * 跳石頭過河一開始那句「誰想要什麼」：十八位夥伴各一句，說清楚這一趟是為了什麼
 * （對岸那個東西本來就畫在那裡，但他讀不到「小老鼠想要起司」這幾個字）。
 *
 * 這張表是 src/play/partners.ts 的 name 與 want 組出來的字面；
 * 放在這裡是因為音檔要先做好（server/voice.mjs 只看得到 shared/）。
 * 兩邊對不上的話 tests/river-crossing.test.mjs 會擋下來。
 */
export const PARTNER_WANTS = [
  '楊捷睿想要賽車！', '小老鼠想要起司！', '大怪獸想要蛋糕！', '機器人想要電池！', '海盜想要寶藏！', '恐龍想要大骨頭！',
  '浣熊想要西瓜！', '小豬想要蘋果！', '太空人想要火箭！', '披風英雄想要星星！', '忍者想要飯糰！', '警長想要獎盃！',
  '鯊魚想要小魚！', '勇士想要盾牌！', '消防員想要消防車！', '外星人想要飛碟！', '小汽車想要加油！', '積木人想要積木！',
]

/** 一個字在孩子端會唸到的所有句子：字、語詞、小故事、小鎮自我介紹。 */
export function linesForEntry(entry) {
  const out = [entry.char, LINES.townHello(entry.char), LINES.feedAsk(entry.char), LINES.feedNotThis(entry.char),
    LINES.riverJump(entry.char)]
  for (const w of entry.words ?? []) if (w?.text) out.push(w.text, LINES.townWord(entry.char, w.text), LINES.puzzleAsk(entry.char, w.text))
  if (entry.words?.length) out.push(LINES.puzzleAll(entry.char))
  if (entry.concept?.hook) out.push(entry.concept.hook)
  return out
}
