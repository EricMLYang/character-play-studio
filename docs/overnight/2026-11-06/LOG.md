# 第二夜紀錄（魔法筆）

## 23:45 評估
- 數據：描字有史以來 13 次、10/24 後 1 次；recall 35 字；看影片 366 次；10/27 之後沒玩
- 研究＋市面：寫＞描＞看；遮起來寫＞抄；獎勵綁意思（PLAN.md 第 1 節）
- 決定單一突破點：魔法筆——寫出來，就變出來

## 23:55 第 1 輪：變身 ✅
- shared/spells.mjs（60 字、16 種動作、願望／謝謝；server/voice.mjs 接上）、conjuring.ts（純函式）、Conjure.tsx、conjure.css
- 字卡描完就變身。位置用 hanzi-writer 畫字那層的矩陣換算（格子有 5% 內距），筆跡浮起來剛好疊在他寫的地方
- 測試方法：scratchpad/autowrite.js 沿 medians 送 mouse 事件，hanzi-writer 全部接受 → 描字終於能自動測了；拍動畫用 getAnimations().pause() 定格
- 截圖確認：金色筆跡（glow）→ 魚從字裡冒出來（act）
- 209 測試、tsc、app:build 過

## 00:20 第 2 輪：魔法筆遊戲 ✅
- Spell.tsx（新畫面 #/spell，自己逛逛裡 🪄 魔法筆 🆕）：夥伴許願 → 他寫 → 筆跡變身 → 夥伴道謝 → 東西排上架子；三個願望後結算「你今天變出了好多東西！」
- wishes.ts：pickWishes（看過的先、該複習的更先、沒寫過的先、動作不重複、want 第一）＋ writeLevel（trace／look／blind）
- Strokes.tsx 加 startLook（不示範、外框 1.6 秒後淡掉）、preview（遮起來寫前先亮整個字）——第 3 輪要實測
- 記成 trace 紀錄：隔離資料裡葉、花、雲各 +1（小鎮、星星照算）
- 抓到：最外層的階段 class `spell-write` 跟寫字區 `.spell-write` 同名 → 改 spell-is-*／spell-pad；通用名 .small/.on/.now/.go 被撞名測試擋下 → 加前綴
- 願望唸完才出格子要等 6.5 秒 → 招呼完、願望一開始唸格子就出來
- 自動跑完一整輪（三個願望）60 秒；212 測試、tsc、app:build 過
