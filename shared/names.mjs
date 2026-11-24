import { LINES } from './voice-lines.mjs'

/**
 * 主角館：他把名字一個字一個字拼出來，那個主角就出場演一段。
 *
 * 6～7 歲的男孩最想讀的字，常常就是他喜歡的角色的名字（皮卡丘、恐龍、消防車）。
 * 這裡把那些名字當成「詞」來拼：字塊打散，他照順序點，拼完那個主角就出場——拼字的獎勵就是看到他。
 *
 * - **名字只是詞，動畫演的是這幾個字的字面意思，不是原作角色的長相**（所有權規則在
 *   .claude/skills/name-scenes/SKILL.md，每一支動畫都要守）：皮卡丘是「一顆皮球坐卡車上山丘」，
 *   哆啦Ａ夢是「鈴鐺哆啦哆啦響、主角睡著做夢」。
 * - **名字裡每個國字都要在字庫、而且開放**（tests/names.test.mjs 會擋）：他點的每一塊字都唸得出來、都有字卡。
 *   不是國字的（哆啦Ａ夢的「Ａ」）先填好，不用拼。
 * - 有動畫的名字才上牆（src/names/scenes/<id>.ts）；資料先建好，動畫一支一支補。
 *
 * 一個名字：{ id, text, emoji, parts, note? }
 *   id     動畫檔名與紀錄用（progress.names[id]）
 *   text   名字本身（畫面上、唸的都是它，動畫裡那一句 say 要一字不差）
 *   emoji  貼紙（要有 3D 圖，public/emoji3d/）
 *   parts  名字照「動畫裡演的東西」切成幾段，每段一個圖：{ chars, word?, emoji }。
 *          為什麼要有：動畫整支只唸名字，「皮球＋卡車＋山丘＝皮卡丘」這個梗沒有人講，六歲看不出這段戲跟名字有什麼關係
 *          （2026-11-23 看紀錄：44 個只拼過 10 個、沒有一支重看）。拼對一段，那一段的東西就跳出來、唸出來；牆上的卡片也先排出來預告。
 *          - chars 依序接起來要剛好等於 text；不是國字的（Ａ）、沒有字面意思的音譯字（佐羅力、柯南）併在相鄰那一段
 *          - word：這幾個字在動畫裡代表的日常語詞，一定要包含 chars 的國字（皮→皮球、丘→山丘）；chars 本身已經是詞（恐龍、小偷）就不寫
 *          - emoji：那個東西的圖，要有 3D 圖；是字面的東西，不拼出原作角色的造型（所有權規則，.claude/skills/name-scenes/SKILL.md）
 *   note   還沒寫動畫的：字面上可以怎麼演（給寫劇本的人的建議，不是規定）；寫好了就是「演的是什麼」
 */
export const NAMES = [
  { id: 'bread', text: '麵包小偷', emoji: '🍞', parts: [{ chars: '麵包', emoji: '🍞' }, { chars: '小偷', emoji: '🥷' }], note: '小忍者踮腳偷麵包，看店的阿公一睜眼他就舉葉子定住；最後砰一團煙連人帶麵包不見（不是披著麵包的老鼠，整支沒有老鼠）' },
  { id: 'apple', text: '蘋果假面超人', emoji: '🍎', parts: [{ chars: '蘋果', emoji: '🍎' }, { chars: '假面', emoji: '🥸' }, { chars: '超人', emoji: '🦸' }], note: '超人拿一顆蘋果擋在臉前當面具，看不到路一直撞到蘋果樹，最後被猴子咬走面具才看得到；亮相時蘋果拿在手上、臉要露出來，不要做成食物做的圓臉' },
  { id: 'riceball', text: '飯糰男孩', emoji: '🍙', parts: [{ chars: '飯糰', emoji: '🍙' }, { chars: '男孩', emoji: '🙋' }], note: '楊捷睿抓一把飯拍拍拍捏飯糰，一次比一次大，最後整碗倒上去、舉不住被壓扁；松鼠咬一小口，大飯糰散成一堆小飯糰，大家一人一顆；飯糰不要有臉手腳、不要套在頭上或身上' },
  { id: 'dora', text: '哆啦Ａ夢', emoji: '🔔', parts: [{ chars: '哆啦Ａ', emoji: '🔔' }, { chars: '夢', word: '做夢', emoji: '💭' }], note: '鈴鐺「哆啦哆啦」一響，浣熊夢到一半的大西瓜就破掉（鵝跳起來啄鈴鐺），夢一次比一次大；最後他閉著眼把鈴鐺抱走，終於咬到夢裡的西瓜；不要貓、藍色機器人、口袋、竹蜻蜓、任意門、銅鑼燒' },
  { id: 'labrador', text: '拉布拉多警長', emoji: '🚨', parts: [{ chars: '拉', word: '用力拉', emoji: '💪' }, { chars: '布', word: '布袋', emoji: '💰' }, { chars: '拉', word: '用力拉', emoji: '💪' }, { chars: '多', word: '好多', emoji: '🦴' }, { chars: '警長', emoji: '🚨' }], note: '頭上頂著警燈的狗警長（hero:sheriff）抓住小黑貓小偷的布袋往後拉，袋子越拉越長、骨頭越掉越多，最後空袋子彈回去把小偷套住，只剩頭從袋口冒出來' },
  { id: 'pigsleuth', text: '豬探長', emoji: '🔍', parts: [{ chars: '豬', emoji: '🐷' }, { chars: '探長', emoji: '🔍' }], note: '小豬拿放大鏡找犯人，他一回頭，犯人就繞到他背後躲起來' },
  { id: 'peanut', text: '花生', emoji: '🥜', parts: [{ chars: '花', word: '花朵', emoji: '🌻' }, { chars: '生', word: '花生', emoji: '🥜' }], note: '自家的浣熊花生（hero:raccoon）澆一次水土裡就冒出一顆花生砸他頭，越冒越大，最大那顆裂開「生」出一朵花' },
  { id: 'butt', text: '屁屁偵探', emoji: '💨', parts: [{ chars: '屁屁', emoji: '💨' }, { chars: '偵探', emoji: '🔍' }], note: '兔子偵探（hero:bunny）一彎腰拿放大鏡找線索，屁屁就噗一聲把背後的落葉堆吹掉一層，最後吹出躲在裡面的小偷，她根本不知道是自己破的案；不要把臉做成屁股形狀' },
  { id: 'catarmy', text: '野貓軍團', emoji: '🐈', parts: [{ chars: '野貓', emoji: '🐈' }, { chars: '軍團', emoji: '🪖' }], note: '三隻戴頭盔的貓咪齊步走，東西一經過就有貓忍不住撲出去（蝴蝶→毛線球），隊長吼回來；最後大毛線球滾來，小兵忍住了，撲出去的是隊長自己；不要偷東西被罰、排排跪著道歉、麵包店、飛船' },
  { id: 'threepigs', text: '三隻小豬', emoji: '🐷', parts: [{ chars: '三隻', emoji: '3️⃣' }, { chars: '小豬', emoji: '🐖' }], note: '三隻小豬一隻一隻疊羅漢搆牆上的蛋糕，越疊下面越扁，最後彈上去（老童話，沒有原作的問題）' },
  { id: 'redhood', text: '小紅帽', emoji: '👒', parts: [{ chars: '小紅', emoji: '🔴' }, { chars: '帽', word: '帽子', emoji: '👒' }], note: '一頂紅帽子被風吹走，每次跳起來快抓到，風又把它吹更高（熊頭上→樹枝→樹頂），不追了，帽子自己落回頭上' },
  { id: 'wolf', text: '大野狼', emoji: '🐺', parts: [{ chars: '大野狼', emoji: '🐺' }], note: '大野狼對著房子吸氣、用力吹，房子吹不倒，最後吹太用力自己飛走、掉到屋頂上' },
  { id: 'caterpillar', text: '毛毛蟲', emoji: '🐛', parts: [{ chars: '毛毛', emoji: '🪶' }, { chars: '蟲', word: '小蟲', emoji: '🐛' }], note: '毛毛蟲一伸一縮爬過誰的腳，毛就把誰搔得哈哈大笑（兔子偷笑→大象笑到坐倒），最後被兔子用羽毛搔回來；不要演吃一洞一洞的水果、肚子痛、變蝴蝶' },
  { id: 'pika', text: '皮卡丘', emoji: '⚡', parts: [{ chars: '皮', word: '皮球', emoji: '🏀' }, { chars: '卡', word: '卡車', emoji: '🚚' }, { chars: '丘', word: '山丘', emoji: '⛰️' }], note: '小機器人（hero:bot）用「卡」車載大「皮」球上山「丘」，車一爬坡球就滾下來撞他，一次比一次慘；最後被壓扁的他把球彈回去，球自己滾上山頂；不要黃色老鼠、閃電尾巴、紅臉頰，也不要閃電打雷（舊版的烏雲閃電已拿掉）' },
  { id: 'pocket', text: '寶可夢', emoji: '💎', parts: [{ chars: '寶', word: '寶石', emoji: '💎' }, { chars: '可', word: '可以', emoji: '👍' }, { chars: '夢', word: '做夢', emoji: '💭' }], note: '寶（寶石）可以夢到：小骷髏（hero:jerry）閉著眼睛夢遊，一絆到石頭就蹦出寶石疊在頭上，一顆比一顆大；拚命撞石頭的山羊把自己撞扁，反而絆他坐上大石頭，裂出一顆比他還大的寶石；不要紅白球、收服、對戰，整支不出現老鼠' },
  { id: 'woof', text: '汪汪隊', emoji: '🐶', parts: [{ chars: '汪汪', word: '汪汪叫', emoji: '📢' }, { chars: '隊', word: '排隊', emoji: '🐕' }], note: '三隻狗排成一隊輪流對著樹汪汪叫，想把卡住的球叫下來，越小的叫越大聲，最小的一叫把整個樹冠吹飛；不要徽章、制服、每隻狗一台車（所以不用 hero:sheriff、hero:firefighter）' },
  { id: 'tiger', text: '巧虎', emoji: '🐯', parts: [{ chars: '巧', word: '巧妙', emoji: '💡' }, { chars: '虎', word: '老虎', emoji: '🐅' }], note: '大老虎想用大爪子輕輕拿起小雞推過來的蛋，一碰就破，蛋黃一次比一次噴得慘；最後想到巧妙的辦法——用尾巴尖把蛋送進鳥窩，小雞孵出來了；老虎不要穿衣服，配角不要兔子、鸚鵡、貓、綿羊' },
  { id: 'dino', text: '恐龍', emoji: '🦖', parts: [{ chars: '恐龍', emoji: '🦖' }], note: '蛋裡跳出來的恐龍吼跑了老虎、吼飛了獅子，結果被一隻小雞「啾」一聲嚇得躲回蛋殼裡（恐）' },
  { id: 'monster', text: '大怪獸', emoji: '👾', parts: [{ chars: '大怪獸', emoji: '👾' }], note: '自家的大怪獸（hero:monster）跳上小雞的彈簧床，太重了一跳就把小雞彈飛、最後把床踩扁——原來他的大肚子才是最好的彈簧床' },
  { id: 'firetruck', text: '消防車', emoji: '🚒', parts: [{ chars: '消防車', emoji: '🚒' }], note: '消防員小狗接著消防車的水管要滅垃圾桶的小火，一打水水管就亂甩、噴到企鵝，第三次翹起來淋回自己；落湯狗甩甩身體，水珠把火甩熄' },
  { id: 'robot', text: '機器人', emoji: '🤖', parts: [{ chars: '機器人', emoji: '🤖' }], note: '自家的機器人（hero:robot）聽到音樂就轉圈跳舞，跳一次冒一次煙，第三次當機，第四次煙從腳底噴出來變火箭' },
  { id: 'alien', text: '外星人', emoji: '👽', parts: [{ chars: '外星', emoji: '🛸' }, { chars: '人', emoji: '👽' }], note: '自家的外星人（hero:alien）渴了，用飛碟光束吸水桶，吸上來的都是別的東西（襪子、青蛙、大象）' },
  { id: 'dragon', text: '神龍', emoji: '🐉', parts: [{ chars: '神', word: '神奇', emoji: '✨' }, { chars: '龍', emoji: '🐉' }], note: '住在雲裡的神龍幫熱壞的楊捷睿吹風，一次吹得比一次大，最後把雲吹去遮住太陽；不要七顆球、許願、噴火' },
  { id: 'truck', text: '卡車', emoji: '🚚', parts: [{ chars: '卡車', emoji: '🚚' }], note: '卡車每次多載一樣東西過同一座矮橋，第三次卡在橋下（卡），一推把整片橋面頂走了' },
  // 2026-11-14 第二批：台灣小朋友喜歡的角色（一樣只演字面意思）
  { id: 'crayon', text: '蠟筆小新', emoji: '✏️', parts: [{ chars: '蠟筆', emoji: '✏️' }, { chars: '小', emoji: '🤏' }, { chars: '新', word: '全新', emoji: '✨' }], note: '小恐龍（hero:rex）拿一支全新的蠟筆在牆上畫獅子，敲一下就活過來撲他，一次畫得比一次大；最後畫一扇門躲進去，追來的大獅子撞在牆上；不要小孩主角、粗眉毛、露屁股、小白狗、大象' },
  { id: 'sponge', text: '海綿寶寶', emoji: '🧽', parts: [{ chars: '海綿寶寶', emoji: '🧽' }], note: '小老鼠餵小海綿寶寶喝水，一杯、一桶、整個水池，海綿越吸越大；拍拍背打個嗝，水全吐回池子、縮回小小一塊；海綿不要有臉、不要穿褲子、不在海底、不要鳳梨屋與抓水母' },
  { id: 'minion', text: '小小兵', emoji: '🪖', parts: [{ chars: '小小', emoji: '🐜' }, { chars: '兵', word: '士兵', emoji: '🪖' }], note: '一整隊戴頭盔的螞蟻小兵齊步走，合力扛走桌上掉下來的東西，越扛越大，最後連桌子帶蛋糕扛走；不要黃色膠囊身體、護目鏡、吊帶褲、香蕉' },
  { id: 'peppa', text: '佩佩豬', emoji: '🐖', parts: [{ chars: '佩', word: '佩戴', emoji: '🥇' }, { chars: '佩', word: '佩戴', emoji: '🥇' }, { chars: '豬', emoji: '🐖' }], note: '小機器人把金牌一面一面「佩」到豬探長身上，重到走不動、被壓扁，最後滾上頒獎台（用 hero:pig、hero:bot）；不要側臉粉紅豬穿紅裙、不要跳泥巴坑' },
  { id: 'spider', text: '蜘蛛人', emoji: '🕷️', parts: [{ chars: '蜘蛛', emoji: '🕷️' }, { chars: '人', emoji: '🙋' }], note: '海盜（hero:pirate）學蜘蛛拿毛線繞圈織網，每繞一圈就把自己多纏一截，最後蜘蛛一拉線頭，他轉開變成一張大網、站在正中間；不要紅藍緊身衣、手腕噴絲、盪大樓、倒吊' },
  { id: 'ironman', text: '鋼鐵人', emoji: '🔩', parts: [{ chars: '鋼鐵', emoji: '🔩' }, { chars: '人', emoji: '🙋' }], note: '穿一身鋼鐵的小騎士（hero:warrior），兔子哥哥一舉大磁鐵，平底鍋、大鍋子就一個比一個大地黏到他身上，最後連他自己都被吸過去；不要紅金盔甲、胸口發光的圓、手掌光束、飛行' },
  { id: 'mouse', text: '米老鼠', emoji: '🐁', parts: [{ chars: '米', word: '白米', emoji: '🍚' }, { chars: '老鼠', emoji: '🐁' }], note: '老鼠偷咬米袋，一口比一口噴出更多米，最後整袋爆開把他埋住，他把米山吃光（可用 hero:mouse）；不要黑色圓耳朵、紅褲子、白手套' },
  { id: 'mario', text: '瑪利歐', emoji: '🏃', parts: [{ chars: '瑪利歐', emoji: '🏃' }], note: '名字沒有字面意思，演「愛跳的人」：小骷髏（hero:jerry）看到擋路的東西就要跳過去（石頭→綿羊→睡著的河馬），河馬醒來反過來從他頭上跳過去；不要紅帽子鬍子吊帶褲、水管、問號磚、蘑菇、烏龜殼、金幣、踩敵人，也不要做成橫向闖關的樣子（楊捷睿是紅外套藍短褲，這支不要用他）' },
  { id: 'anpan', text: '麵包超人', emoji: '🥖', parts: [{ chars: '麵包', emoji: '🍞' }, { chars: '超人', emoji: '🦸' }], note: '自家超人（hero:cape）一直撲過去接住熊甩鍋甩飛的麵包，最後一次追上天摔下來，麵包自己掉到他手上；不要圓臉紅鼻子紅臉頰、不要把臉掰給人吃、不要細菌人' },
  { id: 'fartman', text: '屁屁超人', emoji: '🦸', parts: [{ chars: '屁屁', emoji: '💨' }, { chars: '超人', emoji: '🦸' }], note: '自家超人（hero:cape）飛不起來，用力噗屁當推進器，一次噴得比一次高，最後屁雲把他托上天；不要番薯、校長等原作情節' },
  { id: 'totoro', text: '龍貓', emoji: '🐈‍⬛', parts: [{ chars: '龍', emoji: '🐉' }, { chars: '貓', emoji: '🐈' }], note: '一條龍和一隻貓：貓撲龍的尾巴，尾巴一直甩開，最後用假動作抓到；不要灰色大肚子、葉子傘、貓巴士、公車站' },
  { id: 'firedragon', text: '小火龍', emoji: '🔥', parts: [{ chars: '小', emoji: '🤏' }, { chars: '火', word: '噴火', emoji: '🔥' }, { chars: '龍', emoji: '🐉' }], note: '小小的龍噴出來的都是小火星，連生日蛋糕上的蠟燭都點不著，最後打一個嗝噴出大火；不要尾巴有火的橘色蜥蜴' },
  { id: 'spitfire', text: '噴火龍', emoji: '🐲', parts: [{ chars: '噴', word: '打噴嚏', emoji: '🤧' }, { chars: '火', word: '噴火', emoji: '🔥' }, { chars: '龍', word: '恐龍', emoji: '🦖' }], note: '感冒的小恐龍一打噴嚏就噴火，把阿嬤晾的衣服烤焦，最後一次火噴在阿嬤舉的平底鍋上、蛋煎好了；不要橘色有翅膀、尾巴有火的原作造型，也不要「被蚊子叮才噴火」' },
  { id: 'snowman', text: '雪寶', emoji: '⛄', parts: [{ chars: '雪', word: '下雪', emoji: '❄️' }, { chars: '寶', word: '寶寶', emoji: '⛄' }], note: '雪做的寶寶：小雪人怕太陽，騎士舉盾幫他擋卻把陽光反射到他身上，一照就融一截；最後反光打到雲、下大雪，他長得更大；不要三根頭髮、樹枝手、大門牙、想過夏天' },
  { id: 'ultra', text: '超人力霸王', emoji: '💪', parts: [{ chars: '超人', emoji: '🦸' }, { chars: '力', word: '力氣', emoji: '💪' }, { chars: '霸王', emoji: '👑' }], note: '超厲害的大力士（hero:rex）比拔河想當霸王，對手越小輸越慘，最後輸給一隻小螞蟻；不要銀紅色巨人、胸口計時燈、十字光線、變身道具、在城市打怪獸' },
  { id: 'transformer', text: '變形金剛', emoji: '🦍', parts: [{ chars: '變形', emoji: '👏' }, { chars: '金剛', emoji: '🦍' }], note: '金剛（大猩猩）一拍黏土就變出一隻動物，一次比一次大（老鼠→小豬），最後變出一隻跟他一樣大的黏土金剛，學他一拍把他拍扁變形；不要車子變機器人、陣營標誌' },
  { id: 'zorori', text: '怪傑佐羅力', emoji: '🎩', parts: [{ chars: '怪傑', emoji: '😜' }, { chars: '佐羅力', emoji: '🍌' }], note: '愛惡作劇的怪傢伙（楊捷睿 hero:yang）在路上擺香蕉、躲在樹叢後偷笑等老烏龜滑倒，結果每次滑倒的都是自己，一次比一次慘；不要戴面具披風的狐狸（任何狐狸都不要）、野豬雙胞胎' },
  { id: 'conan', text: '名偵探柯南', emoji: '🥇', parts: [{ chars: '名', word: '有名', emoji: '📷' }, { chars: '偵探柯南', emoji: '🔍' }], note: '太有「名」的偵探（豬探長 hero:pig）：一舉起放大鏡要辦案，小雞粉絲就衝來拍照、他忍不住擺 pose，刺蝟小偷趁機從背後溜過去，粉絲和贓物一次比一次大；最後一大群的閃光把小偷照得清清楚楚；不要大眼鏡、紅領結、藍西裝、小孩、手錶麻醉針、變聲器（跟 butt、pigsleuth 兩支偵探套路要不同）' },
  { id: 'thomas', text: '湯瑪士小火車', emoji: '🚃', parts: [{ chars: '湯瑪士', emoji: '🍲' }, { chars: '小火車', emoji: '🚂' }], note: '小火車載一大鍋「湯」進站，一煞車湯就潑到等車的小怪獸身上，越潑越多，最後他張大嘴全喝掉；不要藍色車頭上有臉、編號 1' },
  { id: 'corner', text: '角落小夥伴', emoji: '🧸', parts: [{ chars: '角落', emoji: '🗄️' }, { chars: '小夥伴', emoji: '🤝' }], note: '角落已經有人了，後來的一個比一個大（小老鼠→小機器人→大怪獸），屁股先塞把先到的擠扁；最後一隻小雞鑽進去，大家像瓶塞一樣被擠出來滾成一團；不要白熊、企鵝、炸豬排、貓、恐龍那一組造型' },
]

export const nameById = (id) => NAMES.find((n) => n.id === id)

/** 這個字要不要拼：國字才拼，其他（Ａ、標點）先填好 */
export const isHan = (c) => /\p{Script=Han}/u.test(c)

/** 名字裡要拼的字（照順序，重複的字照樣出現兩次：屁屁、汪汪、毛毛） */
export const spellChars = (name) => [...name.text].filter(isHan)

/** 名字用到哪幾個國字（不重複）：都要在字庫裡 */
export const nameChars = (name) => [...new Set(spellChars(name))]

/** 他點開一張卡片時唸的那一句 */
export const askLine = (name) => `${name.text}！把他的名字拼出來！`

/**
 * 一段拼好時，唸完那個字接著唸的話（沒有就是 null）：
 * 有 word 唸「皮球的皮」（跟拼圖的 LINES.puzzleAsk 同一個句型）；沒有 word、兩個字以上就唸那個詞（蘋果）；
 * 一個字又沒有 word，剛剛唸過那個字了，不用再唸。不是國字的（Ａ）不唸。
 */
export function partLine(part) {
  const han = [...part.chars].filter(isHan).join('')
  if (part.word) return LINES.puzzleAsk(han, part.word)
  return [...han].length > 1 ? han : null
}

/**
 * 每一段對到名字的哪幾格（[...text] 的位置，含 Ａ 這種不用拼的）：from～to（不含 to）；
 * last 是這一段最後一個要拼的格子——那一格填進去的瞬間，這一段的圖跳出來。
 */
export function partSpans(name) {
  let from = 0
  return name.parts.map((part) => {
    const to = from + [...part.chars].length
    let last = -1
    for (let k = from; k < to; k++) if (isHan([...name.text][k])) last = k
    const span = { part, from, to, last }
    from = to
    return span
  })
}

/**
 * 44 支名字動畫在這天全部重做完（加強版，好笑很多）。他在這天以前看過的，看的都是舊版：牆上標 🆕，點進去先告訴他有新的。
 * 之後整批重做再改這個日期；只重做一兩支不用改（會把其他沒變的也標成新的）。
 * 紀錄的 last 是 ISO 時間（UTC），直接拿字串比：早於這一天 0 點（UTC）的就算舊版。
 */
export const NAME_SCENES_REDONE = '2026-11-23'

/** 這張卡片有沒有他還沒看過的新動畫：拼過（count > 0）、而且最後一次看是在重做之前 */
export const hasNewScene = (log, redone = NAME_SCENES_REDONE) => Boolean(log && log.count > 0 && typeof log.last === 'string' && log.last < redone)

/**
 * 只唸不顯示的固定句子（他讀不到畫面上的說明，要唸出來）。
 * 名字本身與 askLine 也會先做成音檔（nameLines）。
 */
export const NAME_FIXED = {
  nameHello: '歡迎來到主角館！點一張卡片，把名字拼出來，主角就會出來！',
  nameAgain: '再找找看！下一個字在哪裡？',
  nameDone: '拼好了！主角出來囉！',
  nameSticker: '你拿到新的貼紙了！',
  nameSeen: '好厲害！又拼對了！',
  nameNew: '有新的字喔！點一下字塊，聽聽看它是什麼字。',
  /** 拼過的卡片再點：兩個大按鈕（圖示＋唸出來，他讀不到按鈕上的字） */
  nameChoose: '要看動畫，還是再拼一次？',
  nameWatch: '看動畫！',
  nameRespell: '再拼一次！',
  /** 演完停在亮相那一格：點主角就再演一次 */
  nameTapHero: '點一下主角，他會再演一次！',
  /** 拼過、但看的是舊版的卡片（hasNewScene）：點進去先講這句 */
  nameNewScene: '有新的動畫喔！',
}

/** 要先做成音檔的句子：固定句、每個名字、每個名字的「把他的名字拼出來」、每一段拼好時唸的話（partLine） */
export function nameLines() {
  const out = new Set(Object.values(NAME_FIXED))
  for (const name of NAMES) {
    out.add(name.text)
    out.add(askLine(name))
    for (const part of name.parts) { const line = partLine(part); if (line) out.add(line) }
  }
  return [...out]
}

/** 主角紀錄收不收：char 是名字的 id，done 是拼完、看完那一段 */
export const validName = (event) => Boolean(nameById(event?.char)) && event.done === true
