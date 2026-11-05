/**
 * 魔法筆：寫出來，就變出來。
 *
 * 他自己寫的那幾筆從格子裡飛出來、變成那個東西，照它的意思動：魚游走、鳥飛走、雨落下來、球彈起來。
 * 寫字的獎勵就是那個字的意思（市面上做得好的寫字 App 都這樣：寫完 jump，字母真的跳起來）。
 *
 * 每一個會變身的字：
 *   n      幾筆（跟 public/strokes 一樣，測試對過）：第一次寫的字挑筆畫少的（wishes.ts）
 *   act    怎麼動（Conjure.tsx 的 .cj-act-<act>）
 *   wish   夥伴的願望（唸給他聽；畫面上的字他讀不到，所以整句要唸）
 *   thanks 變出來之後夥伴說的話
 *
 * 只收「寫出來看得到」的字：東西、動物、天氣、食物。抽象的字（快、好、不）變不出東西，留給別的遊戲。
 * 這張表同時是伺服器預先做音檔的來源（server/voice.mjs 的 spellLines）。
 */

/** 動作：每一種對應一段 CSS 動畫 */
export const ACTS = ['swim', 'fly', 'fall', 'grow', 'bounce', 'burn', 'shine', 'drive', 'run', 'hop', 'stomp', 'slither', 'crawl', 'float', 'splash', 'yum']

export const SPELLS = [
  // ---- 水裡的 ----
  { char: '魚', n: 11, act: 'swim', wish: '池塘裡好空喔，幫我變一條魚！', thanks: '魚游來游去，好可愛！' },
  { char: '蝦', n: 15, act: 'swim', wish: '我想看蝦子游泳，幫我寫一隻蝦！', thanks: '蝦子彈呀彈地游走了！' },
  { char: '龜', n: 18, act: 'crawl', wish: '我想要一個慢慢走的朋友，寫一隻龜！', thanks: '烏龜慢慢爬，好有耐心！' },
  { char: '蟹', n: 19, act: 'crawl', wish: '沙灘上少了一隻螃蟹，幫我寫蟹！', thanks: '螃蟹橫著走耶！' },
  { char: '鴨', n: 16, act: 'swim', wish: '河裡好安靜，幫我變一隻鴨！', thanks: '呱呱呱，鴨子游過去了！' },
  { char: '蛙', n: 12, act: 'hop', wish: '荷葉上沒有人，幫我變一隻蛙！', thanks: '青蛙跳起來了，呱！' },
  // ---- 天上飛的 ----
  { char: '鳥', n: 11, act: 'fly', wish: '天空好空喔，幫我變一隻鳥！', thanks: '小鳥飛上天了！' },
  { char: '蝶', n: 15, act: 'fly', wish: '花園裡少了蝴蝶，幫我寫蝶！', thanks: '蝴蝶飛呀飛！' },
  { char: '蜂', n: 13, act: 'fly', wish: '花需要蜜蜂，幫我寫一隻蜂！', thanks: '嗡嗡嗡，蜜蜂去採蜜了！' },
  { char: '燕', n: 16, act: 'fly', wish: '春天到了，幫我變一隻燕子！', thanks: '燕子咻一下飛走了！' },
  { char: '龍', n: 16, act: 'fly', wish: '我想要一隻會飛的龍，寫龍！', thanks: '哇！龍飛起來了！' },
  { char: '飛', n: 9, act: 'fly', wish: '我好想飛，幫我寫一個飛！', thanks: '飛機飛上天了！' },
  // ---- 地上跑的 ----
  { char: '犬', n: 4, act: 'run', wish: '我想要一隻小狗陪我玩，寫犬！', thanks: '汪汪！小狗跑過來了！' },
  { char: '貓', n: 16, act: 'run', wish: '我想抱一隻貓，幫我寫貓！', thanks: '喵～小貓跑來了！' },
  { char: '兔', n: 8, act: 'hop', wish: '草地上少了一隻兔子，寫兔！', thanks: '兔子蹦蹦跳！' },
  { char: '虎', n: 8, act: 'stomp', wish: '我想看老虎，幫我寫虎！', thanks: '吼！老虎來了！' },
  { char: '獅', n: 13, act: 'stomp', wish: '森林需要一個國王，寫獅！', thanks: '獅子大吼一聲！' },
  { char: '象', n: 11, act: 'stomp', wish: '我想要一個很大很大的朋友，寫象！', thanks: '大象咚咚咚走過來了！' },
  { char: '熊', n: 14, act: 'stomp', wish: '我想要一個抱抱，幫我寫熊！', thanks: '大熊給你一個熊抱！' },
  { char: '豬', n: 15, act: 'run', wish: '我想要一隻小豬，幫我寫豬！', thanks: '小豬噗噗噗跑來了！' },
  { char: '羊', n: 6, act: 'run', wish: '草好多，幫我變一隻羊來吃草！', thanks: '咩～小羊來吃草了！' },
  { char: '猴', n: 12, act: 'hop', wish: '樹上少了一隻猴子，寫猴！', thanks: '猴子跳來跳去！' },
  { char: '鹿', n: 11, act: 'run', wish: '森林裡好安靜，幫我寫鹿！', thanks: '小鹿跑過去了！' },
  { char: '豹', n: 10, act: 'run', wish: '我想看跑最快的動物，寫豹！', thanks: '咻！豹跑好快！' },
  { char: '狼', n: 10, act: 'run', wish: '月亮出來了，幫我寫狼！', thanks: '嗷嗚～狼來了！' },
  { char: '蛇', n: 11, act: 'slither', wish: '我想看會扭來扭去的動物，寫蛇！', thanks: '蛇扭呀扭地爬走了！' },
  { char: '蟲', n: 18, act: 'crawl', wish: '葉子上少了一隻小蟲，寫蟲！', thanks: '小蟲蟲慢慢爬！' },
  { char: '鵝', n: 18, act: 'swim', wish: '湖上少了一隻鵝，幫我寫鵝！', thanks: '鵝在湖上游呀游！' },
  // ---- 天氣與天上的東西 ----
  { char: '雨', n: 8, act: 'fall', wish: '花好渴喔，幫我寫雨！', thanks: '下雨了，花喝飽了！' },
  { char: '雪', n: 11, act: 'fall', wish: '我想堆雪人，幫我寫雪！', thanks: '下雪了！好漂亮！' },
  { char: '雲', n: 12, act: 'float', wish: '太陽好曬，幫我變一朵雲！', thanks: '雲飄過來了，好涼！' },
  { char: '風', n: 9, act: 'float', wish: '好熱喔，幫我變一陣風！', thanks: '呼～風吹過來了！' },
  { char: '日', n: 4, act: 'shine', wish: '天好黑，幫我寫一個日！', thanks: '太陽出來了，好亮！' },
  { char: '月', n: 4, act: 'shine', wish: '晚上好黑，幫我變一個月亮！', thanks: '月亮出來了！' },
  { char: '星', n: 9, act: 'shine', wish: '夜空好空，幫我寫一顆星！', thanks: '星星一閃一閃！' },
  { char: '電', n: 13, act: 'shine', wish: '燈不亮了，幫我寫電！', thanks: '有電了，亮起來了！' },
  { char: '虹', n: 9, act: 'float', wish: '雨停了，幫我寫一道虹！', thanks: '出現彩虹了！' },
  // ---- 會長大的 ----
  { char: '木', n: 4, act: 'grow', wish: '這裡好空，幫我種一棵木！', thanks: '長出一棵大樹了！' },
  { char: '樹', n: 16, act: 'grow', wish: '我想在樹下乘涼，寫樹！', thanks: '大樹長好高！' },
  { char: '花', n: 7, act: 'grow', wish: '我想送媽媽花，幫我寫花！', thanks: '花開了，好香！' },
  { char: '草', n: 9, act: 'grow', wish: '小羊沒有東西吃，幫我寫草！', thanks: '長出綠綠的草了！' },
  { char: '葉', n: 13, act: 'fall', wish: '秋天到了，幫我寫葉！', thanks: '葉子飄下來了！' },
  // ---- 會動的東西 ----
  { char: '火', n: 4, act: 'burn', wish: '好冷喔，幫我寫一點火！', thanks: '好暖和喔！' },
  { char: '水', n: 4, act: 'splash', wish: '好渴喔，幫我寫一點水！', thanks: '咕嚕咕嚕，好好喝！' },
  { char: '海', n: 10, act: 'splash', wish: '我想去玩水，幫我寫海！', thanks: '海浪嘩啦嘩啦！' },
  { char: '球', n: 11, act: 'bounce', wish: '我想踢球，幫我寫球！', thanks: '球彈起來了！' },
  { char: '車', n: 7, act: 'drive', wish: '我要出門，幫我寫一台車！', thanks: '叭叭！車子開走了！' },
  { char: '傘', n: 12, act: 'float', wish: '下雨了，幫我寫一把傘！', thanks: '有傘就不怕雨了！' },
  { char: '燈', n: 16, act: 'shine', wish: '房間好暗，幫我寫燈！', thanks: '燈亮了！' },
  { char: '石', n: 5, act: 'bounce', wish: '我要蓋城堡，幫我寫石！', thanks: '咚！石頭掉下來了！' },
  // ---- 好吃的 ----
  { char: '果', n: 8, act: 'yum', wish: '我肚子餓了，幫我寫果！', thanks: '蘋果好甜！' },
  { char: '蛋', n: 11, act: 'yum', wish: '我想吃早餐，幫我寫蛋！', thanks: '荷包蛋好香！' },
  { char: '餅', n: 14, act: 'yum', wish: '點心時間到了，幫我寫餅！', thanks: '餅乾脆脆的！' },
  { char: '糖', n: 16, act: 'yum', wish: '我想吃甜甜的，幫我寫糖！', thanks: '糖果好甜！' },
  { char: '瓜', n: 5, act: 'yum', wish: '好熱喔，幫我寫瓜！', thanks: '西瓜好涼！' },
  { char: '麵', n: 20, act: 'yum', wish: '我想吃麵，幫我寫麵！', thanks: '麵好好吃，呼嚕呼嚕！' },
  { char: '飯', n: 12, act: 'yum', wish: '吃飯時間到了，幫我寫飯！', thanks: '白飯香噴噴！' },
  { char: '糕', n: 16, act: 'yum', wish: '今天有人生日，幫我寫糕！', thanks: '蛋糕來了，生日快樂！' },
  { char: '肉', n: 6, act: 'yum', wish: '大怪獸想吃肉，幫我寫肉！', thanks: '肉好香！' },
  { char: '米', n: 6, act: 'yum', wish: '小雞想吃東西，幫我寫米！', thanks: '小雞吃得好開心！' },
]

/** 每一次寫字都用得到的固定句 */
export const SPELL_FIXED = {
  hello: '魔法筆來了！寫什麼，就變什麼！',
  look: '看一眼，記住喔！',
  gone: '變不見了！你自己寫出來！',
  peek: '偷看一下！',
  traceIt: '跟著描描看！',
  again: '再變一個！',
  done: '你今天變出了好多東西！',
}

/** 這個字會不會變身；不會的回 undefined */
export const spellFor = (char) => SPELLS.find((s) => s.char === char)

/** 伺服器要預先做的句子 */
export const spellLines = () => [...Object.values(SPELL_FIXED), ...SPELLS.flatMap((s) => [s.wish, s.thanks])]
