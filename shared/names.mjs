import { LINES } from './voice-lines.mjs'

/**
 * 主角館：他把名字一個字一個字拼出來，那個主角就出場演一段。
 *
 * 6～7 歲的男孩最想讀的字，常常就是他喜歡的角色的名字（孫悟空、恐龍、消防車）。
 * 這裡把那些名字當成「詞」來拼：字塊打散，他照順序點，拼完那個主角就出場——拼字的獎勵就是看到他。
 *
 * - **名單只收三種**（規則在 .claude/skills/name-scenes/SKILL.md，每一支動畫都要守）：
 *   1. 公版的知名人物：童話、民間故事、神話（三隻小豬、小紅帽、孫悟空、虎姑婆、白雪公主⋯）。可以照本尊畫、演他本人的招牌事蹟，
 *      但不照任何一部改編作品（動畫、電影）的造型。
 *   2. 通用的詞：恐龍、消防車、機器人、卡車⋯⋯演這幾個字的字面意思。
 *   3. 樂園自家的主角（hero:raccoon 花生、hero:monster 大怪獸⋯）。
 *   **不收有版權的角色名字。** 2026-11-24 爸爸決定把有版權疑慮的 29 個拿掉：麵包小偷、蘋果假面超人、飯糰男孩、哆啦Ａ夢、屁屁偵探、
 *   野貓軍團、皮卡丘、寶可夢、汪汪隊、巧虎、蠟筆小新、海綿寶寶、小小兵、佩佩豬、蜘蛛人、鋼鐵人、米老鼠、瑪利歐、麵包超人、屁屁超人、
 *   龍貓、小火龍、雪寶、超人力霸王、變形金剛、怪傑佐羅力、名偵探柯南、湯瑪士小火車、角落小夥伴
 *   （id 依序 bread、apple、riceball、dora、butt、catarmy、pika、pocket、woof、tiger、crayon、sponge、minion、peppa、spider、ironman、
 *   mouse、mario、anpan、fartman、totoro、firedragon、snowman、ultra、transformer、zorori、conan、thomas、corner；
 *   動畫檔在 git 歷史裡，commit ce8b97a 之前的 src/names/scenes/）。
 *   他的紀錄（progress.names）裡還留著拼過的那幾個：不刪紀錄，但讀紀錄的地方一律只算名單上還有的（collectedNames）。
 * - **名字裡每個國字都要在字庫、而且開放**（tests/names.test.mjs 會擋）：他點的每一塊字都唸得出來、都有字卡。
 *   不是國字的（全形字母、標點）先填好，不用拼。
 * - 有動畫的名字才上牆（src/names/scenes/<id>.ts）；資料先建好，動畫一支一支補。
 *
 * 一個名字：{ id, text, emoji, parts, note? }
 *   id     動畫檔名與紀錄用（progress.names[id]）
 *   text   名字本身（畫面上、唸的都是它，動畫裡那一句 say 要一字不差）
 *   emoji  貼紙。兩種寫法：有 3D 圖的 emoji（public/emoji3d/），或專門畫的圖 'prop:<名字>'（public/props/<名字>.png，
 *          跟劇本裡的 prop: 是同一批圖）。公版人物用專門畫的圖比較精緻，emoji 湊不出孫悟空。
 *   parts  名字照「動畫裡演的東西」切成幾段，每段一個圖：{ chars, word?, emoji }。
 *          為什麼要有：動畫整支只唸名字，「花朵＋生出來＝花生」這個梗沒有人講，六歲看不出這段戲跟名字有什麼關係
 *          （2026-11-23 看紀錄：當時 44 個只拼過 10 個、沒有一支重看）。拼對一段，那一段的東西就跳出來、唸出來；牆上的卡片也先排出來預告。
 *          - chars 依序接起來要剛好等於 text；不是國字的、沒有字面意思的音譯字併在相鄰那一段
 *          - word：這幾個字在動畫裡代表的日常語詞，一定要包含 chars 的國字（花→花朵、拉→用力拉）；chars 本身已經是詞（恐龍、小豬）就不寫
 *          - emoji：那個東西的圖，跟貼紙一樣可以是有 3D 圖的 emoji 或 'prop:<名字>'
 *   note   還沒寫動畫的：可以怎麼演（給寫劇本的人的建議，不是規定）；寫好了就是「演的是什麼」
 */
export const NAMES = [
  { id: 'wukong', text: '孫悟空', emoji: 'prop:wukong', parts: [{ chars: '孫悟空', emoji: 'prop:wukong' }], note: '公版人物（西遊記），演本尊：搆不到樹上的仙桃，拔毛一吹變出分身疊羅漢，一次疊得比一次高，最上面那隻摘到桃子卻自己吃掉；他氣得舉金箍棒往頭上一敲，分身全變回毛，咬過的桃子砸在他頭上再彈進他懷裡，抱著桃子坐上筋斗雲亮相。造型照傳統年畫（prop:wukong 那一套），不照任何動畫漫畫的版本' },
  { id: 'tigeraunt', text: '虎姑婆', emoji: 'prop:tigeraunt', parts: [{ chars: '虎', word: '老虎', emoji: '🐅' }, { chars: '姑婆', emoji: 'prop:tigeraunt-wave' }], note: '公版人物（台灣民間故事），演本尊的搞笑版：假扮老婆婆甜甜地招手騙小孩過來，尾巴卻一直從裙子後面翹出來，她塞回去再裝沒事，一次翹得比一次誇張，第三次把頭巾都掀了只好現原形大吼；小孩一腳踩住尾巴她嚇得彈起來摔暈，最後拿到一碗花生坐著吃得很開心。不演吃小孩手指那一段；造型用 prop:tigeraunt 那一套' },
  { id: 'nian', text: '年獸', emoji: 'prop:nian', parts: [{ chars: '年', word: '過年', emoji: '🧨' }, { chars: '獸', word: '怪獸', emoji: 'prop:nian-roar' }], note: '公版人物（過年的故事），演本尊的搞笑版：年獸想嚇人，一吼就冒出紅色或很吵的東西反過來嚇到他自己——小紅包、紅燈籠、最後是一串鞭炮，一次嚇得比一次慘，摀著耳朵逃到撞暈；小孩端一盤餃子給他、幫他圍上紅圍巾，他發現紅色其實很漂亮，開心地跳起舞來。造型用 prop:nian 那一套' },
  { id: 'bajie', text: '豬八戒', emoji: 'prop:bajie', parts: [{ chars: '豬', emoji: '🐷' }, { chars: '八戒', emoji: 'prop:bajie-drool' }], note: '公版人物（西遊記），演本尊：「豬八戒吃西瓜」的老故事——吃一片西瓜、把皮往後一丟、才走一步就踩到自己丟的皮滑倒，一次摔得比一次慘；第三次他學乖了小心跨過去，還是滑進整堆西瓜皮裡。造型用 prop:bajie 那一套（跟自家的豬探長不一樣）' },
  { id: 'labrador', text: '拉布拉多警長', emoji: '🚨', parts: [{ chars: '拉', word: '用力拉', emoji: '💪' }, { chars: '布', word: '布袋', emoji: '💰' }, { chars: '拉', word: '用力拉', emoji: '💪' }, { chars: '多', word: '好多', emoji: '🦴' }, { chars: '警長', emoji: '🚨' }], note: '頭上頂著警燈的狗警長（hero:sheriff）抓住小黑貓小偷的布袋往後拉，袋子越拉越長、骨頭越掉越多，最後空袋子彈回去把小偷套住，只剩頭從袋口冒出來' },
  { id: 'pigsleuth', text: '豬探長', emoji: '🔍', parts: [{ chars: '豬', emoji: '🐷' }, { chars: '探長', emoji: '🔍' }], note: '小豬拿放大鏡找犯人，他一回頭，犯人就繞到他背後躲起來' },
  { id: 'peanut', text: '花生', emoji: '🥜', parts: [{ chars: '花', word: '花朵', emoji: '🌻' }, { chars: '生', word: '花生', emoji: '🥜' }], note: '自家的浣熊花生（hero:raccoon）澆一次水土裡就冒出一顆花生砸他頭，越冒越大，最大那顆裂開「生」出一朵花' },
  { id: 'threepigs', text: '三隻小豬', emoji: '🐷', parts: [{ chars: '三隻', emoji: '3️⃣' }, { chars: '小豬', emoji: '🐖' }], note: '三隻小豬一隻一隻疊羅漢搆牆上的蛋糕，越疊下面越扁，最後彈上去（老童話，沒有原作的問題）' },
  { id: 'redhood', text: '小紅帽', emoji: '👒', parts: [{ chars: '小紅', emoji: '🔴' }, { chars: '帽', word: '帽子', emoji: '👒' }], note: '一頂紅帽子被風吹走，每次跳起來快抓到，風又把它吹更高（熊頭上→樹枝→樹頂），不追了，帽子自己落回頭上' },
  { id: 'wolf', text: '大野狼', emoji: '🐺', parts: [{ chars: '大野狼', emoji: '🐺' }], note: '大野狼對著房子吸氣、用力吹，房子吹不倒，最後吹太用力自己飛走、掉到屋頂上' },
  { id: 'caterpillar', text: '毛毛蟲', emoji: '🐛', parts: [{ chars: '毛毛', emoji: '🪶' }, { chars: '蟲', word: '小蟲', emoji: '🐛' }], note: '毛毛蟲一伸一縮爬過誰的腳，毛就把誰搔得哈哈大笑（兔子偷笑→大象笑到坐倒），最後被兔子用羽毛搔回來；不要演吃一洞一洞的水果、肚子痛、變蝴蝶' },
  { id: 'dino', text: '恐龍', emoji: '🦖', parts: [{ chars: '恐龍', emoji: '🦖' }], note: '蛋裡跳出來的恐龍吼跑了老虎、吼飛了獅子，結果被一隻小雞「啾」一聲嚇得躲回蛋殼裡（恐）' },
  { id: 'monster', text: '大怪獸', emoji: '👾', parts: [{ chars: '大怪獸', emoji: '👾' }], note: '自家的大怪獸（hero:monster）跳上小雞的彈簧床，太重了一跳就把小雞彈飛、最後把床踩扁——原來他的大肚子才是最好的彈簧床' },
  { id: 'firetruck', text: '消防車', emoji: '🚒', parts: [{ chars: '消防車', emoji: '🚒' }], note: '消防員小狗接著消防車的水管要滅垃圾桶的小火，一打水水管就亂甩、噴到企鵝，第三次翹起來淋回自己；落湯狗甩甩身體，水珠把火甩熄' },
  { id: 'robot', text: '機器人', emoji: '🤖', parts: [{ chars: '機器人', emoji: '🤖' }], note: '自家的機器人（hero:robot）聽到音樂就轉圈跳舞，跳一次冒一次煙，第三次當機，第四次煙從腳底噴出來變火箭' },
  { id: 'alien', text: '外星人', emoji: '👽', parts: [{ chars: '外星', emoji: '🛸' }, { chars: '人', emoji: '👽' }], note: '自家的外星人（hero:alien）渴了，用飛碟光束吸水桶，吸上來的都是別的東西（襪子、青蛙、大象）' },
  { id: 'dragon', text: '神龍', emoji: '🐉', parts: [{ chars: '神', word: '神奇', emoji: '✨' }, { chars: '龍', emoji: '🐉' }], note: '住在雲裡的神龍幫熱壞的楊捷睿吹風，一次吹得比一次大，最後把雲吹去遮住太陽；不要七顆球、許願、噴火' },
  { id: 'truck', text: '卡車', emoji: '🚚', parts: [{ chars: '卡車', emoji: '🚚' }], note: '卡車每次多載一樣東西過同一座矮橋，第三次卡在橋下（卡），一推把整片橋面頂走了' },
  // 2026-11-14 第二批留下來的（同一批其他的都是有版權的角色，2026-11-24 拿掉了）
  { id: 'spitfire', text: '噴火龍', emoji: '🐲', parts: [{ chars: '噴', word: '打噴嚏', emoji: '🤧' }, { chars: '火', word: '噴火', emoji: '🔥' }, { chars: '龍', word: '恐龍', emoji: '🦖' }], note: '感冒的小恐龍一打噴嚏就噴火，把阿嬤晾的衣服烤焦，最後一次火噴在阿嬤舉的平底鍋上、蛋煎好了；不要橘色有翅膀、尾巴有火的原作造型，也不要「被蚊子叮才噴火」' },
]

export const nameById = (id) => NAMES.find((n) => n.id === id)

/**
 * 他收了哪幾張還在名單上的貼紙（名字的 id，照 NAMES 的順序）。
 * 紀錄裡有、名單上已經拿掉的（2026-11-24 拿掉的那 29 個）不算：不然「主角貼紙收了 N 張」會比牆上數得到的還多。
 * 紀錄本身不刪，哪天名字放回來，他拼過的照樣算。
 */
export const collectedNames = (progress) => NAMES.filter((n) => (progress?.names?.[n.id]?.count ?? 0) > 0).map((n) => n.id)

/** 這個字要不要拼：國字才拼，其他（全形字母、標點）先填好 */
export const isHan = (c) => /\p{Script=Han}/u.test(c)

/** 名字裡要拼的字（照順序，重複的字照樣出現兩次：拉布拉多的拉、毛毛） */
export const spellChars = (name) => [...name.text].filter(isHan)

/** 名字用到哪幾個國字（不重複）：都要在字庫裡 */
export const nameChars = (name) => [...new Set(spellChars(name))]

/** 他點開一張卡片時唸的那一句 */
export const askLine = (name) => `${name.text}！把他的名字拼出來！`

/**
 * 一段拼好時，唸完那個字接著唸的話（沒有就是 null）：
 * 有 word 唸「花朵的花」（跟拼圖的 LINES.puzzleAsk 同一個句型）；沒有 word、兩個字以上就唸那個詞（小豬）；
 * 一個字又沒有 word，剛剛唸過那個字了，不用再唸。不是國字的（全形字母）不唸。
 */
export function partLine(part) {
  const han = [...part.chars].filter(isHan).join('')
  if (part.word) return LINES.puzzleAsk(han, part.word)
  return [...han].length > 1 ? han : null
}

/**
 * 每一段對到名字的哪幾格（[...text] 的位置，含全形字母這種不用拼的）：from～to（不含 to）；
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
 * 當時的 44 支名字動畫在這天全部重做完（加強版，好笑很多；其中 29 支 2026-11-24 跟著名字拿掉了）。他在這天以前看過的，看的都是舊版：牆上標 🆕，點進去先告訴他有新的。
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
