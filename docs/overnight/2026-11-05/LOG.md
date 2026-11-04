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
