# 夜間迭代紀錄（2026-11-05）

> 規劃：PLAN.md。這份是唯一的狀態——會話被壓縮後先 `tail -60` 這份＋`git log --oneline -15`。
> worktree：/Users/ericmlyang/Coding/character-play-studio-night，分支 overnight/2026-11-05，試玩 PORT=5197。

## 23:12 準備
- worktree 從 main 656f34c 開出；data/progress.json 複製一份進 worktree（gitignore，只給 npm run play 當來源）；media/*、public/voice symlink 回主 repo（public/voice 加進 info/exclude）。
- 基準：npm test 169 過、tsc 過。

## 3-1 舞台與角色 rig ✅ af1f877
- 新檔：`Stage.tsx`＋`stageScenes.ts`（天色照時間 dawn/day/dusk/night、雲、遠近兩層山、3D 道具、偶爾飛過去的蝴蝶／鳥、手指視差 --px/--py）、
  `Buddy.tsx`＋`poses.ts`（呼吸、看手指、反應 cheer/oops/think/wave/sleep，姿勢表跟 public/hero 對過）、`styles/stage.css`、`styles/buddy.css`、`tests/stage.test.mjs`（6 個）。
- 接上：PlayApp（取代三顆模糊軟球）、首頁今天的路（角色換站揮手、點他會跳＋再講一次）、餵大怪獸（自己的舞台，天色跟夥伴；端菜夥伴答對跳、點錯歪頭）、字的家族／小書／詞語拼圖背景改透明。小鎮、字火車有自己的景，沒動。
- 畫面切換加 .scene-enter 浮上來的轉場。
- 踩到的坑：`stage.ts` 跟 `Stage.tsx` 大小寫撞名（README 有警告）；改名時 `mv` 蓋掉了既有的 `scenes.ts`，已從 git 救回、我的改叫 `stageScenes.ts`。首頁舊有一組沒在用的 `.buddy` 樣式（home.css:117），我的 class 改用 `rig-*`。
- 晚上的天刻意是紫粉色黃昏不是黑的，深色字照樣讀得到；logo 加白邊。
- 驗：175 測試過、tsc、app:build 過；桌面首頁／餵大怪獸／家族／小書／拼圖、手機直橫（iframe）都看過。
- **早上要人驗**：iPad 上視差與呼吸順不順（transform 動畫應該沒問題）；晚上紫色天空小孩覺得好不好看。
- 尾巴：怪獸本身沒套 rig（它的階段動畫已經很完整，硬套會打架）；詞語拼圖的浣熊、部首家族的角色還是靜態圖 → 3-2 一起換。

## 3-2 拖放手感包 ✅ 3ad9823
- `dragDrop.ts`（純函式：10px 才算拖、目標四邊放寬 36px、拿著走會斜）＋`useDrag.ts`（直接改 DOM style，不經 React；拖完吃掉瀏覽器補的 click，避免同一張算兩次）＋`tests/drag-drop.test.mjs`。
- 接上：餵大怪獸（拖進怪獸，拿到面前牠湊過來抖著等 `.craving`）、詞語拼圖（拖進空格／圖框）、字的家族找家人（拖進房子）。**點一下照樣算**，拖只是多一種。
- 拼圖的浣熊換成 Buddy（拼對跳、放錯歪頭、出場揮手）。
- 全域按鈕按下去壓扁（`:where()` 壓低特異度，不蓋掉各遊戲自己的 :active）。
- 新音效 `pickUp`（拿起來）、`letGo`（沒放進去，軟的、不像「錯」）；放對不另外出聲，交給遊戲原本的「喀／啊嗚」。
- 驗：178 測試、tsc、app:build；Chrome 實際拖過三個遊戲各一題（computer use 的 left_click_drag）。
- **早上要人驗**：iPad 單指拖的手感（touch-action: none 已設）；他會不會自己發現可以拖。

## 3-3 聲音設計包 ✅
- `sfx.ts`：`ladder(step)`（五聲音階，連對越多起點越高，最多爬 8 級；錯一次回到底）、`arrive(scene)`（走進每個地方一陣風聲＋那裡的 3～4 音小旋律）、`critter(emoji)`（景裡飛過的小鳥啾啾／蜜蜂嗡／蝴蝶叮，peak ≤ 0.025）。
- `audio.ts` 加 `isSpeaking()`：小動物叫之前先問，正在唸字就不叫。
- `streak.ts`＋`tests/sound-kit.test.mjs`（連對、音階單調往上、每個景都有旋律、新音效 peak ≤ 0.07 掃原始碼檢查）。
- 接上：餵大怪獸、詞語拼圖、字的家族找家人的「第一下就對」都響 ladder；靠提示才對的不響。
- 環境底噪（廚房咕嚕、村子鳥叫的持續音）**刻意沒做**：會跟唸字搶，改成「飛過去才叫一聲」。
- **早上要人戴耳機聽**：ladder 跟唸字幾乎同時開始（餵大怪獸找對時會唸語詞），會不會蓋到字音；到站小旋律會不會太常聽到而煩。

## 3-4 部首意符微動畫 ✅ c8b6f04
- `radicalFx.ts`（23 家：粒子動作 fall/rise/walk/pop/orbit/peek/slash/wave × 部首本身 beat/blink/chomp/sway/shiver/flicker/grow）、`MeaningFx.tsx`、`styles/radicalfx.css`、`tests/radical-fx.test.mjs`（每家都有、粒子有 3D 圖、每種動作都有 CSS）。
- 接上：變身故事（部首出現後一直演）、找家人找對那一下（演一次）、字卡「住在○○的家」那顆小圖。
- 粒子放在筆畫後面（z-index），筆畫一直讀得到。
- 看過：三點水滴水、四點火冒火（連拍）。其他 21 家只靠測試＋CSS，沒有逐一目視。
- 大廳每棟房子**沒有**一直演：23 棟同時動太吵，留著。
- **早上要人看**：哪幾家的演法小孩看得懂（例如 hole 是兔子從洞裡探頭、knife 是刀劃一下、flesh 是 💪）；不合適的改 radicalFx.ts 一行就好。

## 3-5 蓋字工坊 ✅ 9c99e99
- `building.ts`（純函式：用 radStrokes 把字切成部首／其餘兩塊、判斷部首在哪一邊、出題、配干擾積木、其餘那塊是不是學過的字）、`Workshop.tsx`、roots.css 的 .ws-*、`tests/workshop.test.mjs`（6 個，用真的筆順檔）。
- 入口：找完家人的大合照多一顆「🔨 來蓋字」（只有部首家）。一次 3 題，看過的字先出。
- 流程：「哪一塊放上去，會變成＿」→ 6 秒沒動作唸它住這裡的原因當提示 → 再久對的那塊發亮。放錯：那塊變淡搖一下、唸那一家的名字＋「放不上去耶」。放對：部首從它那一邊滑進來、喀、ladder、MeaningFx 演一次、「三點水，加上，可，變成，河！」。
- 新台詞 6 句（shared/radicals.mjs 的 build*，音檔已做好）。
- 紀錄：不新增事件種類，記成既有的 `radical`（findFamily），算「找到牠的家」那顆星。
- 看過：三點水家實際蓋了「沙」（拖）、「河」（先點錯肉字旁、再點對）。
- 踩到的坑：又一次 Workshop.tsx／workshop.ts 大小寫撞名，純函式改叫 building.ts。
- **早上要人看**：他會不會覺得「哪一塊放上去」好懂；切出來的積木像不像（例如 背、肩 的肉在下面、相 的目在右邊）。

## 3-6 小鎮打盹（衰退看得見）✅ c8ea120
- `naps.ts`（純函式：recall.due ≤ 今天＝睡著、明天＝想睡）＋`tests/naps.test.mjs`。
- 小鎮：睡著的居民蓋條紋被子、閉眼、zzz、不走路、字被蓋住；想睡的半閉眼打呵欠。點睡著的 → 「叫醒他」小卡：聽「他睡著了！找出這個字，叫醒他：＿」、兩張卡（pickDecoy，不挑長得像的）。第一下就對記 recall ok、ladder；點錯記一次 recall false、翻開說「這是○耶」，找到了照樣醒來（這次進來記在 state，不會又睡回去）。
- 首頁「回家」那一站：有睡著的就說「小鎮裡有字睡著了，去叫醒他們！」（不列出是哪幾個字，到了小鎮要自己想）。
- 新台詞 3 句（voice-lines 的 pathWake／wakeAsk／wakeUp，音檔已做）。
- **另修一個我自己造成的 bug**：stage.css 的 `cloudDrift`／`twinkle` 跟 train.css、feed.css 同名，被後面的檔蓋掉（雲一直擠在左邊不飄）。改名 stageCloud／stageTwinkle，stage.test 加一條：我新寫的三個 CSS 檔的 keyframes 不能跟別檔撞名。既有的 fall/hop/puff/rise/shake/spin 撞名不是今晚造成的，沒動（記成待辦）。
- 看過：13 個居民全睡著（複製來的紀錄 10/28 之後沒玩，全部到期——**小孩真實的小鎮明天打開也會是這樣**）、叫醒「火」。
- **早上要人看**：13 個同時睡著會不會太多、他會不會覺得是壞事；被子的樣子。

## 3-7 字彙擴充 ✅ 5217c54（腳本＋表）、cf644ba（字庫，單獨一個 commit）
- **跟規劃不同**：語詞上限是 4 個（server/character-metadata.mjs 的 parseWords、Studio 編輯器都這樣擋），不是 5～6。沒有動上限（要不要放寬是爸爸的決定），改成「最常看、目前 3 個詞的 56 個字各補 1 個到 4 個」。
- Claude 手寫（不用 AI CLI 額度），逐一對過讀音（多音字：長 ㄔㄤˊ 長褲、上 ㄕㄤˋ 上廁所、中 ㄓㄨㄥ 中秋、家 ㄐㄧㄚ 搬家…）。挑具體、畫得出來、好玩的：火箭、氣球、熊抱、土司、楊桃、遠足、吸塵器、直升機、光頭、高鐵、慢動作、寄居蟹、上廁所、電梯、爆米花、龍捲風、鯊魚、忍者刀…
- 跳過（沒有好的具體詞）：捷、睿、有、今、你、他、在、森。
- `scripts/words-extra.mjs`：用 Studio 同一套 parseWords 驗證，只補不刪、圖示重複就跳過。表在 `words-extra.json`，**爸爸過目後不合適的直接改表、`git checkout data/characters.json` 再跑一次**。
- 新詞的音檔（詞本身、「○○的○」）用 `npm run voice` 背景補做。
- **併回 main 要注意**：main 工作樹上 `data/characters.json` 有伺服器寫的 10/27、10/28 今日建議清單沒 commit，併之前先 commit 或 stash 那份。
