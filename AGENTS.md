# 給在這個 repo 工作的 agent

給 6 歲兒子的識字樂園：孩子端（`/`）＋家長的 Studio（`/studio`）。功能、玩法細節在 `README.md`，這裡只放工作規矩。

## 日常規矩
- 改完跑 `npm test`、`npx tsc -b`；動到孩子端就 `npm run app:build` 確認 iPad 版還打包得起來。
- Commit 直接進 `main`，逐一 stage 檔案（不要 `git add -A`）。`data/characters.json` 常有伺服器寫入的變動，不是你的產出就別一起 commit。
- 試玩孩子端一律用 `npm run play`（隔離的資料目錄）。直接開 5180 玩會寫進小孩的真實紀錄 `data/progress.json`。
- 畫面上的話小孩讀不到，要唸得出來：固定句放 `shared/voice-lines.mjs`（或各功能自己的 shared 表），伺服器會預先做音檔。
- 程式註解與文件用繁體中文，口吻照既有檔案。

## 未來要上 iPad（單機、不上架）
規劃與進度在 `docs/ipad-app-plan.md`。已決定：Capacitor 外殼、內容全部打包進 App、App 不連網；先用免費帳號＋Xcode 直接裝，程式照 TestFlight 準備。
第一階段（Mac 上的程式）已完成：`npm run app:build` 產出 `dist-app/`。之後碰 Xcode／iPad 之前要先過第二階段的資安檢查（該文件第 3 節）。

**開發新功能時要守的（有測試把關，違反 `npm test`／`app:build` 會失敗）：**
- 孩子端不要直接呼叫 `/api/`，一律透過 `src/lib/api.ts` 的 `getLibrary`、`recordPlay`。
- 新遊戲要記進度：在 `shared/play-events.mjs` 加一種紀錄、規則寫在 `shared/domain.mjs`，Mac 與單機版自動一起支援。
- 孩子端要的新資料放在字卡上（`data/characters.json`）或 `shared/`；只有 Studio 用的欄位加進 `server/app-bundle.mjs` 的 `STUDIO_ONLY_FIELDS`。
- 新的靜態檔放 `public/` 底下；放別處要在 `scripts/app-build.mjs` 加複製。
- 不要引入任何外部網址（CDN、字型、分析工具）。
- 裝置儲存只碰 `src/lib/deviceStore.ts`，檔案交換只碰 `src/lib/deviceFiles.ts`（第三階段換成 Capacitor 原生實作只改這兩個檔）。

## 留痕
用 repo-context（MCP）：開工 `context_for`，做了判斷 `log_decision`，發現待辦 `add_todo`，收尾一定 `handoff`。
