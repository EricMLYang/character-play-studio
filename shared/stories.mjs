/**
 * 故事屋：他讀的字，決定故事怎麼演。
 *
 * 樂園裡看、寫、認、詞、家族都各有玩法，唯獨沒有「讀一段有意思的話，而且讀了有用」——
 * 指讀小書是句型湊出來的句子（他要日出。），讀對讀錯故事都一樣。這裡的故事是一句一句手寫的：
 *
 * - **每個字都是字庫裡的字**（tests/stories.test.mjs 會擋）：他點任何一個字都聽得到、都有字卡可以看。
 *   句子短短的、像橋樑書的第一級（2026-11-12 字庫加了「的、了」、開放了「我」，句子才順得起來）；寫新故事時先跑測試看哪個字不在字庫。
 *   故事裡的「我」是讀的人自己（機器人給我花）；主角一律用名字或「他」。
 * - **故事走到一半停下來讓他選**：選項只有字，沒有圖、也不唸。選了哪個字，那個字的意思就演出來：
 *   「給他火！」小豬烤火；「給他雪！」小豬被埋成雪人。選到幫不上忙的不是錯——是最好笑的那一段，演完再選一次。
 *   （魔法筆是「寫出來就變出來」，這裡是「讀出來就演出來」：獎勵就是那個字的意思。）
 * - **每一種結果是一張貼紙**：好笑的那幾種也算，所以他會回頭把每個選項都讀過一遍。
 * - **選項的字都看過，這本才打開**：還沒看過的字列在封面上，點了去看字卡——學新字有了「打開下一本」這個理由。
 *
 * 一本故事的資料：
 *   pages 依序是一頁一頁。兩種頁：
 *   - 讀的頁 { id, text }：唸這一句、演這一段。
 *   - 選的頁 { id, ask, options, all? }：ask 裡的 ＿ 是空格；options 每個 { char, emoji, text, ok? }。
 *     ok 的選項選了故事才往下走，其他的演完回來再選；all: true 是每個都要選過一次（順序他決定），不用標 ok。
 *     emoji 是這個結果的貼紙。
 *   每一頁演什麼在 src/story/scenes/<id>.ts：讀的頁用頁的 id，選項用「頁 id:字」（beatOf）。
 *
 * 多音字：句子是這台 Mac 的 say 唸的，避開 長、樂、重、行、還、得、地、背、空、相、分、種、乾。
 */
export const BLANK = '＿'

export const STORIES = [
  {
    id: 'cold', title: '小豬好冷', hero: 'pig', emoji: '❄️',
    pages: [
      { id: 'snow', text: '下雪了，小豬好冷。' },
      { id: 'warm', ask: '給他＿！', options: [
        { char: '火', emoji: '🔥', text: '有火了，不冷了！', ok: true },
        { char: '雪', emoji: '⛄', text: '太冷了！太冷了！' },
      ] },
      { id: 'hungry', text: '小豬想吃飯了。' },
      { id: 'food', ask: '給他＿！', options: [
        { char: '餅', emoji: '🍪', text: '好好吃的餅！', ok: true },
        { char: '石', emoji: '🪨', text: '石不能吃！' },
      ] },
      { id: 'hug', text: '小豬笑了。他抱抱我！' },
    ],
  },
  {
    id: 'ball', title: '球在樹上', hero: 'yang', emoji: '⚽',
    pages: [
      { id: 'play', text: '楊捷睿在打球。' },
      { id: 'fly', text: '球飛上天了！' },
      { id: 'tree', text: '球在樹上了。他太矮了！' },
      { id: 'help', ask: '叫＿來！', options: [
        { char: '象', emoji: '🐘', text: '象好高！象把球給他了！', ok: true },
        { char: '龜', emoji: '🐢', text: '龜好慢！太慢了！' },
        { char: '猴', emoji: '🐵', text: '猴想玩他的球！不給他！' },
      ] },
      { id: 'thanks', text: '楊捷睿笑了。他抱抱象。' },
      { id: 'again', ask: '象也想玩＿！', options: [
        { char: '球', emoji: '🌙', text: '象打球！球飛上天了！', ok: true },
        { char: '水', emoji: '💦', text: '象給他水！好冷的水！', ok: true },
      ] },
    ],
  },
  {
    id: 'robot', title: '機器人不走', hero: 'robot', emoji: '🔋',
    pages: [
      { id: 'stuck', text: '機器人不走了，也不說話了。' },
      { id: 'need', text: '他沒有電了！' },
      { id: 'charge', ask: '給他＿！', options: [
        { char: '電', emoji: '⚡', text: '有電了！機器人笑了。', ok: true },
        { char: '水', emoji: '💧', text: '不能給他水！' },
        { char: '飯', emoji: '🍚', text: '機器人不吃飯！' },
      ] },
      { id: 'zoom', text: '機器人快跑！太快了！太快了！' },
      { id: 'slow', ask: '叫他＿！', options: [
        { char: '慢', emoji: '🐌', text: '慢慢走，真乖。', ok: true },
        { char: '快', emoji: '🚀', text: '太快了！他飛上天了！' },
        { char: '跳', emoji: '☁️', text: '他跳到雲上了！好高！' },
      ] },
      { id: 'gift', text: '機器人給我花。他愛我。' },
    ],
  },
  {
    id: 'dragon', title: '小龍愛吃', hero: 'dino', emoji: '🍉',
    pages: [
      { id: 'mouth', text: '小龍的嘴好大。他愛吃！' },
      { id: 'eat', ask: '他吃＿！', all: true, options: [
        { char: '瓜', emoji: '🍉', text: '好甜的瓜！' },
        { char: '辣', emoji: '🌶️', text: '好辣！嘴裡有火了！' },
        { char: '蟲', emoji: '🐛', text: '蟲在他的嘴裡跳！' },
      ] },
      { id: 'full', text: '小龍的肚子大大的。他累了。' },
      { id: 'night', text: '夜晚，蟲在他的肚子裡叫。' },
    ],
  },
  {
    id: 'dark', title: '超人怕黑', hero: 'cape', emoji: '🌙',
    pages: [
      { id: 'dark', text: '夜晚了，天好黑。' },
      { id: 'scared', text: '超人好怕！' },
      { id: 'light', ask: '給他＿！', options: [
        { char: '燈', emoji: '💡', text: '有燈了，不怕了！', ok: true },
        { char: '雷', emoji: '🌩️', text: '打雷了！好怕！好怕！' },
        { char: '蛇', emoji: '🐍', text: '有蛇！快跑！' },
      ] },
      { id: 'shadow', text: '牆上有大大的黑熊！' },
      { id: 'kitten', text: '那不是熊。是小小的貓！' },
      { id: 'pet', ask: '小貓要＿！', options: [
        { char: '抱', emoji: '💗', text: '超人抱抱小貓。不怕了。', ok: true },
        { char: '魚', emoji: '🐟', text: '小貓吃魚。超人也想吃！', ok: true },
      ] },
      { id: 'brave', text: '超人再也不怕黑了。' },
    ],
  },
]

export const storyById = (id) => STORIES.find((s) => s.id === id)

/** 這一頁是不是「選的頁」 */
export const isChoice = (page) => Array.isArray(page.options)

/** 一段戲的編號：讀的頁就是頁 id，選項是「頁 id:字」。場景檔與貼紙紀錄都用它 */
export const beatOf = (page, option) => (option ? `${page.id}:${option.char}` : page.id)

/** 把選的字填進空格的整句（給他火！）：畫面與音檔共用 */
export const filled = (page, option) => page.ask.replace(BLANK, option.char)

/** 空格前面唸得出來的那一段（給他＿！ → 給他）；整句都在空格後面就不唸 */
export const askLead = (page) => page.ask.split(BLANK)[0].replace(/[。！？，]/g, '')

/** 這個選項選了故事會不會往下走（all 的頁每個都算，全部選過才走） */
export const advances = (page, option) => Boolean(page.all || option.ok)

/** 一本故事所有的戲（依序）：場景檔要每一段都有 */
export function beatsOf(story) {
  return story.pages.flatMap((page) => (isChoice(page) ? page.options.map((o) => beatOf(page, o)) : [beatOf(page)]))
}

/** 一本故事的貼紙：每個選項的結果一張 */
export function stickersOf(story) {
  return story.pages.filter(isChoice).flatMap((page) => page.options.map((o) => ({ beat: beatOf(page, o), char: o.char, emoji: o.emoji })))
}

/** 他要自己讀的字（選項）：都看過這本才打開 */
export const choiceChars = (story) => [...new Set(story.pages.filter(isChoice).flatMap((page) => page.options.map((o) => o.char)))]

/** 一本故事用到的所有字（不含標點與空格）：都要在字庫裡 */
export function storyChars(story) {
  const texts = [story.title, ...story.pages.flatMap((page) => (isChoice(page) ? [page.ask, ...page.options.flatMap((o) => [o.char, o.text])] : [page.text]))]
  return [...new Set([...texts.join('')].filter((c) => !/[。！？，＿\s]/.test(c)))]
}

/** 一個字會打開哪幾本（今天的新字優先挑這種字，src/play/today.ts） */
export const storiesNeeding = (char) => STORIES.filter((s) => choiceChars(s).includes(char))

/**
 * 只唸不顯示的固定句子（他讀不到畫面上的說明，要唸出來）。
 * 畫面上要他讀的只有故事本身；這幾句是旁邊帶路的人講的話，不受「只用字庫的字」限制。
 */
export const STORY_FIXED = {
  storyHello: '歡迎來到故事屋！挑一本來讀！',
  storyChoose: '換你決定！讀讀看，選一個字！',
  storyChooseShort: '你來選！',
  storyAgain: '哈哈！再選一次！',
  storyMore: '還有別的！再選一個！',
  storyDone: '故事讀完了！好厲害！',
  storyNewSticker: '你拿到新的貼紙了！',
  storyUnseen: '還有沒看過的！再讀一次，選別的字試試看！',
  storyAll: '這本書的貼紙，全部被你找到了！',
  storyYourTurn: '這次換你先讀！讀好了，按一下，看看對不對！',
  storyLocked: '認識這幾個字，這本故事就會打開！',
  storyTapChar: '不會的字，點一下就會唸！',
}

/** 要先做成音檔的句子：固定句、書名、每一句故事、填好的整句、空格前那一段 */
export function storyLines() {
  const out = new Set(Object.values(STORY_FIXED))
  for (const story of STORIES) {
    out.add(story.title)
    for (const page of story.pages) {
      if (!isChoice(page)) { out.add(page.text); continue }
      if (askLead(page)) out.add(askLead(page))
      for (const o of page.options) { out.add(filled(page, o)); out.add(o.text) }
    }
  }
  return [...out]
}

/** 故事紀錄收不收：beat 要是這本故事裡某個選項的結果；done 是讀完一遍 */
export function validStory(event) {
  const story = storyById(event.char)
  if (!story) return false
  if (event.done !== undefined && event.done !== true) return false
  if (event.beat !== undefined && !stickersOf(story).some((s) => s.beat === event.beat)) return false
  return event.done === true || typeof event.beat === 'string'
}
