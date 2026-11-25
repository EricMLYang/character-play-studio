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
 *   hero 是 public/hero/ 的主角：封面用他的 idle／happy，今天的路「讀一讀」那一站也是他站在那裡。
 *   主演是公版人物（年獸、孫悟空、豬八戒，只有 public/props/ 的道具圖）時另外寫 cover: { idle, happy }（'prop:<名字>'），
 *   封面改用這兩張（coverOf）；hero 照樣要填一位 public/hero/ 的主角，給今天的路用。
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
  // 小骷髏主演（hero:jerry）。「骷、髏」不在字庫，所以故事裡只叫「他」；封面看得到是誰
  {
    id: 'candy', title: '誰在門後', hero: 'jerry', emoji: '🎃',
    pages: [
      { id: 'want', text: '夜晚了，他想吃糖。' },
      { id: 'door', text: '前面有一個大門。' },
      { id: 'who', ask: '門後是＿！', options: [
        { char: '姑', emoji: '🍬', text: '姑姑給他好多糖！', ok: true },
        { char: '獅', emoji: '🦁', text: '是獅子！快跑！' },
        { char: '熊', emoji: '🐻', text: '熊在睡。不要叫他！' },
      ] },
      { id: 'bag', text: '好多糖！他要回家了。' },
      { id: 'ride', ask: '他坐＿回家！', options: [
        { char: '車', emoji: '🚗', text: '坐車回家，好快！', ok: true },
        { char: '馬', emoji: '🐎', text: '馬跑太快了！糖都飛了！', ok: true },
        { char: '雲', emoji: '☁️', text: '雲太高了！他好怕！' },
      ] },
      { id: 'home', text: '到家了。他累了，睡了。' },
    ],
  },
  {
    id: 'cake', title: '小老鼠偷吃', hero: 'mouse', emoji: '🍰',
    pages: [
      { id: 'table', text: '桌上有一個大蛋糕。' },
      { id: 'cat', text: '小老鼠想偷吃。貓在睡。' },
      { id: 'cross', ask: '他要＿過去！', options: [
        { char: '爬', emoji: '🤫', text: '慢慢爬，貓沒聽到。', ok: true },
        { char: '跑', emoji: '🙀', text: '貓聽到了！快回去！' },
        { char: '跳', emoji: '🐾', text: '他跳到貓的頭上了！' },
      ] },
      { id: 'wake', text: '貓起來了！貓也想吃！' },
      { id: 'feed', ask: '給貓吃＿的！', options: [
        { char: '甜', emoji: '🧁', text: '甜甜的蛋糕！貓笑了。', ok: true },
        { char: '酸', emoji: '🍋', text: '好酸！貓的毛都起來了！' },
        { char: '苦', emoji: '🤢', text: '好苦！貓的臉綠了！' },
      ] },
      { id: 'share', text: '貓和小老鼠一起吃蛋糕。' },
    ],
  },
  {
    id: 'fart', title: '好大的屁', hero: 'rex', emoji: '💨',
    pages: [
      { id: 'beans', text: '小恐龍吃了好多豆。' },
      { id: 'belly', text: '他的肚子叫了。屁要來了！' },
      { id: 'blast', ask: '屁噴到＿了！', all: true, options: [
        { char: '花', emoji: '🌸', text: '花聞到屁，不笑了！' },
        { char: '蜂', emoji: '🐝', text: '蜂飛不起來了！' },
        { char: '象', emoji: '🐘', text: '屁太大了！象飛上天了！' },
      ] },
      { id: 'alone', text: '大家都怕他的屁。他哭了。' },
      { id: 'stuck', text: '小車沒電了，不會走。' },
      { id: 'push', ask: '小恐龍用＿推車！', options: [
        { char: '屁', emoji: '🚀', text: '好大的屁！小車跑好快！', ok: true },
        { char: '手', emoji: '✋', text: '用手推，車不走。' },
        { char: '頭', emoji: '💫', text: '用頭推！頭上有星星！' },
      ] },
      { id: 'love', text: '大家都愛他的屁了！' },
    ],
  },
  {
    id: 'ufo', title: '外星人來了', hero: 'alien', emoji: '🛸',
    pages: [
      { id: 'light', text: '夜晚，天上有光。' },
      { id: 'come', text: '外星人來了！他想玩。' },
      { id: 'grab', ask: '光把＿拉上去！', all: true, options: [
        { char: '牛', emoji: '🐄', text: '牛飛上天了！牛在叫！' },
        { char: '爸', emoji: '🧔', text: '爸爸飛上天了！爸爸好怕！' },
        { char: '豬', emoji: '🐷', text: '小豬也上去了！他在笑！' },
      ] },
      { id: 'heavy', text: '太多了！外星人飛不起來了！' },
      { id: 'gift', ask: '外星人給我＿！', options: [
        { char: '星', emoji: '⭐', text: '好美的星星！', ok: true },
        { char: '蛋', emoji: '🐣', text: '蛋裡有小外星人！', ok: true },
        { char: '石', emoji: '🌑', text: '是天上來的石！', ok: true },
      ] },
      { id: 'bye', text: '再見，外星人！' },
    ],
  },
  {
    // 2026-11-23：爸爸（hero:eric，楊捷睿的爸爸）第一次主演。孩子叫不醒爸爸、叫醒了又把爸爸玩到累——他有權力的那種好笑
    id: 'dad', title: '爸爸不起來', hero: 'eric', emoji: '💤',
    pages: [
      { id: 'sleep', text: '早上了。爸爸在睡。' },
      { id: 'want', text: '楊捷睿想玩。爸爸不起來！' },
      { id: 'wake', ask: '用＿叫他！', options: [
        { char: '肉', emoji: '🍖', text: '爸爸聞到肉了。他起來了！', ok: true },
        { char: '蛙', emoji: '🐸', text: '蛙在他的頭上叫。他沒聽到！' },
        { char: '冰', emoji: '🧊', text: '好冰！爸爸跳到天上了！' },
      ] },
      { id: 'up', text: '爸爸起來了！一起玩！' },
      { id: 'game', ask: '爸爸是大＿！', all: true, options: [
        { char: '馬', emoji: '🐎', text: '爸爸是大馬！跑好快！' },
        { char: '山', emoji: '⛰️', text: '爸爸是大山！爬上去了！' },
        { char: '熊', emoji: '🐻', text: '爸爸是大熊！抱抱！' },
      ] },
      { id: 'tired', text: '玩了好多。爸爸累了。' },
      { id: 'end', text: '爸爸睡了。楊捷睿也睡了。' },
    ],
  },
  {
    // 2026-11-24：他在主角館拼的是豬探長、屁屁偵探——喜歡偵探。這本要他照線索（大大的耳）自己推出小偷是誰；
    // 探長的「長」是多音字，故事裡叫「豬偵探」
    id: 'thief', title: '誰偷了包子', hero: 'pig', emoji: '🔍',
    pages: [
      { id: 'gone', text: '桌上的包子不見了！' },
      { id: 'clue', text: '豬偵探來了。小偷有大大的耳！' },
      { id: 'who', ask: '小偷是＿！', options: [
        { char: '兔', emoji: '🐰', text: '是兔！兔的嘴裡有包子！', ok: true },
        { char: '象', emoji: '🐘', text: '象太大了！門太小了！' },
        { char: '蛇', emoji: '🐍', text: '不是蛇。蛇沒有耳！' },
      ] },
      { id: 'run', text: '兔跑了！跑好快！' },
      { id: 'throw', ask: '豬偵探丟＿！', options: [
        { char: '菜', emoji: '🥬', text: '兔看到菜，不跑了！', ok: true },
        { char: '豆', emoji: '🫘', text: '好多豆！豬偵探飛起來了！' },
        { char: '糖', emoji: '🍬', text: '兔吃了糖。兔跑太快了！' },
      ] },
      { id: 'sorry', text: '兔說對不起！' },
      { id: 'end', text: '看！豬偵探也在偷吃！' },
    ],
  },
  {
    // 2026-11-24：他在主角館拼過消防車。前半是「用什麼打火」，後半是救完火還噴上癮、看到紅的熱的都噴（全部都要）
    id: 'fire', title: '消防車來了', hero: 'firefighter', emoji: '🚒',
    pages: [
      { id: 'burn', text: '不好了！樹上有火！' },
      { id: 'truck', text: '消防車來了！' },
      { id: 'put', ask: '用＿打火！', options: [
        { char: '水', emoji: '💦', text: '水來了！火沒了！', ok: true },
        { char: '木', emoji: '🪵', text: '不能給火吃木！火大了！' },
        { char: '茶', emoji: '🍵', text: '茶太少了！火在笑！' },
      ] },
      { id: 'more', text: '火沒了。他想再噴水！' },
      { id: 'spray', ask: '他噴＿！', all: true, options: [
        { char: '龍', emoji: '🐉', text: '小龍不能噴火了！他哭了。' },
        { char: '爸', emoji: '🍖', text: '爸爸的肉都是水了！' },
        { char: '陽', emoji: '🌞', text: '太陽太高了！噴不到！' },
      ] },
      { id: 'wet', text: '大家都是水！消防車回家了。' },
    ],
  },
  {
    // 2026-11-25：媽媽（hero:three，小三）第一次主演，跟爸爸（hero:eric）、楊捷睿一起。媽媽下班好累，父子倆想讓她笑——
    // 先送東西（幫倒忙最好笑），再端飯（三種口味都要選，每種都有人遭殃），最後一起抱抱
    id: 'mom', title: '媽媽好累', hero: 'three', emoji: '🌷',
    pages: [
      { id: 'home', text: '媽媽回家了。媽媽好累。' },
      { id: 'want', text: '楊捷睿想要媽媽笑。' },
      { id: 'give', ask: '給媽媽＿！', options: [
        { char: '花', emoji: '🌷', text: '媽媽聞到花，笑了！', ok: true },
        { char: '蛇', emoji: '🐍', text: '有蛇！媽媽跳到爸爸的頭上！' },
        { char: '冰', emoji: '🧊', text: '好冰！媽媽跳起來了！' },
      ] },
      { id: 'eat', text: '媽媽想吃飯了。' },
      { id: 'dish', ask: '爸爸給媽媽＿的飯！', all: true, options: [
        { char: '辣', emoji: '🌶️', text: '好辣！爸爸的嘴裡有火！' },
        { char: '苦', emoji: '🥬', text: '好苦！大家的臉都綠了！' },
        { char: '甜', emoji: '🍰', text: '好甜！楊捷睿吃了好多！' },
      ] },
      { id: 'hug', text: '大家一起抱抱媽媽。' },
    ],
  },
  {
    // 2026-11-25：主角館改成公版人物、有專門畫的九個姿勢以後，他比較愛拼了——爸爸要年獸、孫悟空、豬八戒也到故事屋來。
    // 主角館演的是「一吼就冒出紅的東西嚇到自己」；這本是楊捷睿不怕他，先找出他怕什麼顏色，再發現他只是餓了。
    // 選項第一次用顏色的字（紅、粉、黑）。選項盡量挑他看過的字：這本只差「紅」就打開（紅有動畫可看）
    id: 'nian', title: '年獸來了', hero: 'yang', cover: { idle: 'prop:nian', happy: 'prop:nian-dance' }, emoji: '🧨',
    pages: [
      { id: 'night', text: '過年的夜晚，年獸來了！' },
      { id: 'roar', text: '年獸大叫！楊捷睿不怕！' },
      { id: 'scare', ask: '年獸怕＿的！', options: [
        { char: '紅', emoji: '🧣', text: '年獸好怕紅的！他跑了！', ok: true },
        { char: '粉', emoji: '🌸', text: '不怕粉的！他愛粉的花！' },
        { char: '黑', emoji: '🎩', text: '不怕黑的！可是他看不見了！' },
      ] },
      { id: 'cry', text: '年獸哭了。他只是好餓。' },
      { id: 'feed', ask: '給他吃＿！', options: [
        { char: '餃', emoji: '🥟', text: '好吃的餃子！年獸笑了！', ok: true },
        { char: '糖', emoji: '🍭', text: '好甜的糖！他的嘴打不開了！' },
        { char: '燈', emoji: '🏮', text: '他吃了燈！肚子裡有光！' },
      ] },
      { id: 'red', text: '年獸不怕紅的了！' },
      { id: 'party', text: '大家一起過年！' },
    ],
  },
  {
    // 2026-11-25：孫悟空的七十二變——他讀的字就是孫悟空變的東西。主角館演的是拔毛變分身疊羅漢；
    // 這本是偷吃了豬八戒的果子、變東西躲他，再用猴毛變吃的賠他。「空」是多音字，只准出現在「孫悟空」這個名字裡（測試有寫）
    id: 'wukong', title: '孫悟空會變', hero: 'raccoon', cover: { idle: 'prop:wukong', happy: 'prop:wukong-happy' }, emoji: 'prop:peach',
    pages: [
      { id: 'steal', text: '孫悟空偷吃豬八戒的果子。' },
      { id: 'back', text: '豬八戒回來了！快變！' },
      { id: 'hide', ask: '孫悟空變＿！', options: [
        { char: '蟲', emoji: '🐛', text: '變小蟲了！豬八戒看不見他！', ok: true },
        { char: '石', emoji: '🪨', text: '豬八戒坐在石上。他太胖了！' },
        { char: '花', emoji: '🌸', text: '豬八戒聞花。花跑到鼻子裡了！' },
      ] },
      { id: 'hungry', text: '果子沒了。豬八戒好餓！' },
      { id: 'hair', ask: '猴毛變＿！', options: [
        { char: '瓜', emoji: '🍉', text: '毛變大瓜了！豬八戒吃好多！', ok: true },
        { char: '蜂', emoji: '🐝', text: '好多蜂！豬八戒快跑！' },
        { char: '蟹', emoji: '🦀', text: '蟹拉他的鼻子！鼻子好大！' },
      ] },
      { id: 'full', text: '豬八戒吃太多了。他笑了。' },
      { id: 'cloud', text: '他們坐雲回家。雲飛好慢！' },
    ],
  },
  {
    // 2026-11-25：豬八戒——貪吃、圓肚子。主角館演的是「吃西瓜、踩到自己丟的皮」；這本是瓜在河的對面：
    // 選項第一次用動作的字過河（游、跳、走），吃太多回不來，再選坐什麼回去。這本只差「游」就打開
    id: 'bajie', title: '豬八戒吃瓜', hero: 'raccoon', cover: { idle: 'prop:bajie', happy: 'prop:bajie-melon' }, emoji: 'prop:watermelon-slice',
    pages: [
      { id: 'hungry', text: '豬八戒好餓。他的肚子在叫。' },
      { id: 'river', text: '看！河的對面有好多瓜！' },
      { id: 'cross', ask: '豬八戒＿過河！', options: [
        { char: '游', emoji: '🛟', text: '肚子大大的，游過去了！', ok: true },
        { char: '跳', emoji: '💦', text: '跳不過去！好多水！' },
        { char: '走', emoji: '🐟', text: '走到水裡了！他不見了！' },
      ] },
      { id: 'eat', text: '到了！豬八戒吃瓜，吃了好多！' },
      { id: 'big', text: '肚子太大了！他游不回去了！' },
      { id: 'back', ask: '他坐＿過河！', options: [
        { char: '瓜', emoji: '🍉', text: '坐在瓜皮上，過河了！', ok: true },
        { char: '龜', emoji: '🐢', text: '龜太小了！龜起不來！' },
        { char: '蝶', emoji: '🦋', text: '蝶拉不起來！蝶累了！' },
      ] },
      { id: 'home', text: '到家了。肚子叫了。他想再吃！' },
    ],
  },
]

export const storyById = (id) => STORIES.find((s) => s.id === id)

/** 封面那張圖（跟劇本裡角色的寫法一樣：'hero:<id>/<姿勢>' 或 'prop:<名字>'）。open＝打得開、讀完了，用開心的那張 */
export const coverOf = (story, open = true) => story.cover?.[open ? 'happy' : 'idle'] ?? `hero:${story.hero}/${open ? 'happy' : 'idle'}`

/** 多音字只准出現在這幾個名字裡（名字的唸法是固定的）：檢查多音字前先把名字拿掉 */
export const STORY_NAMES = ['孫悟空']

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
