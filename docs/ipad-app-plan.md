# iPad 單機版規劃

> 2026-10-24 起草。目標：孩子端變成 iPad 上**不需要 Mac、不需要網路**就能玩的 App，只給自家小孩用、不上架。
> 開發與製作照舊在 Mac 上（Studio 不搬）。
>
> 進行順序：**架構選定 → 第一階段（只動 Mac 上的程式）→ 第二階段（資安檢查關卡）→ 第三階段（才碰 iPad）**。
> 第一、二階段做完、確認妥當之前，不裝 Xcode、不碰 iPad。

---

## 0. 現況盤點（2026-10-24 量的）

孩子端（`/`）跟 Mac 上的伺服器只有**兩個接點**，其他都是讀靜態檔：

| 接點 | 程式位置 | 用途 |
|---|---|---|
| `GET /api/library` | `src/lib/api.ts` 的 `getLibrary`、`server/routes/library.mjs` | 字庫、拆字表、小孩紀錄一次拿回來（也夾帶 Studio 才用的 prompt 摘要、製作佇列、CLI 清單） |
| `POST /api/<kind>` | `src/lib/playQueue.ts` 的 `flushEvents`、`server/progress.mjs` | 每一筆遊玩紀錄先進瀏覽器佇列，再送到 Mac 寫進 `data/progress.json` |

紀錄規則本來就寫在 `shared/play-events.mjs`，伺服器跟前端共用（`acceptEvent`、`applyEvent`），所以搬到 iPad 上算紀錄不用重寫規則。

孩子端讀的靜態檔：

| 路徑 | 內容 | 大小 |
|---|---|---|
| `/media/<檔名>` | 上架且開放給孩子的影片／圖片：79 個（77 個保留原音、2 個系統朗讀），影片是 H.264 720p | 141 MB |
| `/voice/` | 預先做好的語音（美佳）4682 個 m4a ＋ `index.json` | 90 MB |
| `/hero/` | 主角各姿勢 PNG | 58 MB |
| `/emoji3d/` | Fluent 3D emoji（MIT） | 18 MB |
| `/strokes/` | 筆順資料（hanzi-writer-data） | 1.2 MB |

估計 App 大小約 **310 MB**，iPad 裝得下，不用另外下載內容。

其他有利條件：
- 孩子端程式裡沒有任何對外網址、沒有 `innerHTML`、`dangerouslySetInnerHTML`、`eval`
- Studio 與動畫試播頁已經另外打包（`src/main.tsx` 用 lazy import），拆出來不難
- 語音找不到音檔時，會改用系統朗讀（`speechSynthesis`）。iPad 上也有美佳的聲音

---

## 1. 架構選項

### 1-1 App 的形式

| 選項 | 說明 | 評估 |
|---|---|---|
| A. PWA（網頁加到主畫面） | 還是 Safari 開網頁，用 Service Worker 快取 | 必須放在一個 https 網址上，pCloud 不能當網站主機。孩子的影片和名字會變成放在網路上。**不採用** |
| **B. Capacitor（網頁裝進原生外殼）** | 現有 React 程式原封不動放進 App，畫面引擎跟 Safari 同一顆；可以呼叫原生功能（存檔、分享、震動） | 現有程式約九成照用，只改資料層。**採用** |
| C. React Native | 畫面改成原生元件 | 189 支動畫、描字、所有 CSS 都要重寫。不划算 |
| D. Swift 原生 | 全部重寫 | 不划算 |

### 1-2 內容放哪裡

| 選項 | 說明 | 評估 |
|---|---|---|
| **甲. 全部打包進 App** | 字庫、影片、語音跟著 App 一起裝 | 完全離線、App 不需要任何網路權限，資安面最乾淨。新增字要重新打包、重裝。**採用** |
| 乙. App 外殼 ＋ 內容包從 pCloud 下載 | 裝一次外殼，之後從 pCloud 拉新內容 | 更新方便，但 App 要能上網，還要驗證下載的內容沒被換掉（簽章）。複雜度和攻擊面都變大。等甲用一陣子、真的覺得重裝太煩再考慮 |

### 1-3 怎麼裝進 iPad（⚠ 這一項要你決定）

**先說一個限制：iPad 不能像 Mac 一樣「下載檔案點兩下就安裝」。** App 的安裝檔（`.ipa`）放在 pCloud，下載到 iPad 也裝不起來。iOS 只接受下面幾條路：

| 選項 | 費用 | 怎麼裝 | 有效期 | pCloud 的角色 |
|---|---|---|---|---|
| 1. Xcode 直接裝（免費帳號） | 免費 | iPad 用線接 Mac（之後可以走同一個 Wi-Fi），Xcode 按執行 | **7 天**，到期要再接一次 | 用不到 |
| 2. Xcode 直接裝（付費帳號） | US$99/年 | 同上 | 1 年 | 用不到 |
| 3. TestFlight（付費帳號） | US$99/年 | Mac 上傳到 Apple，iPad 用 TestFlight App 安裝與更新。自己當內部測試者不用審核 | 每個版本 90 天 | 用不到 |
| 4. Ad Hoc 安裝連結（付費帳號） | US$99/年 | 先登記 iPad 序號，`.ipa` 和一份說明檔放在 https 網址上，iPad 用 Safari 點連結安裝 | 1 年 | 理論上可以放檔案，但這條路需要「直接下載網址」，pCloud 的分享連結多半是網頁，不一定能用，要實測 |
| 5. SideStore／AltStore（非官方工具） | 免費 | `.ipa` 從 pCloud 存到「檔案」App，用這個工具安裝 | 7 天，工具可以在 iPad 上自己續期 | **能用**：下載後安裝 |

**建議**：
- 先用 **1（免費）** 試裝，確認小孩真的會玩
- 長期用 **2 或 3（付費）**：一年只要處理一次，或用 TestFlight 推更新，最省事
- **5 不建議**：要把 Apple ID 交給第三方工具處理，等於多一個資安破口（見第 3 節）
- pCloud 改用在**紀錄備份**：iPad 把紀錄匯出成檔案存到 pCloud，Mac 再匯入 Studio（見 2-3）

### 1-4 選定的架構

```
Mac（開發＋製作，照舊）                         iPad（單機）
┌────────────────────────────┐              ┌──────────────────────────────┐
│ Studio、伺服器、AI CLI       │              │ App（Capacitor 外殼）          │
│ data/characters.json        │  打包時產生   │  ├ 孩子端 React 程式（無 Studio）│
│ data/progress.json          │ ──────────▶ │  ├ 字庫快照 library.json        │
│ media/ public/voice ...     │   npm run    │  ├ 上架素材、語音、筆順、圖      │
│                             │  app:build   │  └ 紀錄：存在 App 自己的空間     │
│ 「匯入 iPad 紀錄」            │ ◀────────── │ 「匯出紀錄」→ 分享到 pCloud      │
└────────────────────────────┘   pCloud     └──────────────────────────────┘
                                                 不開任何連接埠、不連任何網路
```

---

## 2. 第一階段：只在 Mac 上改程式（不需要 Xcode、iPad）

完成標準：用一個**不帶任何 API 的純靜態伺服器**開 App 版，把網路關掉，孩子端每一個玩法都能正常跑、紀錄能存、能匯出。原本 `npm run dev` 的網頁版行為不變，現有測試全過。

### 2-1 拆出孩子端專用的打包
- 新增 App 版入口：只掛 `PlayApp`，不包 Studio、AnimLab（App 裡完全沒有 Studio 的程式碼，也就沒有「長按一秒進家長端」）
- Vite 加一個 `app` 模式，輸出到 `dist-app/`

### 2-2 資料層抽成兩種實作
- `src/lib/api.ts` 的 `getLibrary`、`recordPlay` 改成走一個「後端」介面：
  - **伺服器版**：現在的做法，網頁版繼續用
  - **單機版**：讀打包進去的 `library.json`，紀錄用 `shared/play-events.mjs` 的 `acceptEvent` ＋ `applyEvent` 在本機算，並沿用事件編號防重複
- `playQueue.ts` 在單機版不需要「送出、離線重送」，改成直接套用並存檔；畫面上的「同步失敗」提示在單機版不出現

### 2-3 紀錄的存放、備份與回 Mac
- 存放：先寫一個儲存介面，第一階段用 localStorage 跑通，到第三階段換成 Capacitor 的原生存檔（Preferences 或 Filesystem）。WKWebView 的 localStorage 在空間不足時可能被系統清掉，紀錄不能只放那裡
- **初始紀錄**：打包時從 Mac 的 `data/progress.json` 帶一份進去當起點（⚠ 要先處理 #130，決定用哪一份紀錄，不然髒資料會一起搬過去）
- **匯出**：家長用的隱藏操作（沿用長按）把紀錄存成 JSON，透過 iOS 分享選單存到 pCloud 或「檔案」
- **匯入回 Mac**（⚠ 要你決定要不要做）：Studio 加「匯入 iPad 紀錄」，把事件合併進 `data/progress.json`。因為事件有編號，重複匯入不會重複算
- **App 重裝**：同一個 App 識別碼覆蓋安裝時，紀錄會留著。**刪掉 App 紀錄就沒了**，所以匯出備份是必要的，不是選配

### 2-4 字庫快照（新腳本 `npm run app:build`）
- 從 `data/characters.json` 只取孩子看得到的：拿掉 `hidden` 的字、已刪除的字；`media` 只留 `review: published`
- 拿掉 Studio 才用的欄位：`promptVersions`、`production`、`queue`、`pendingAttempts`、`cliProviders`、`template`
- 帶上 `parts.json`（拆字表）和初始紀錄
- 加測試：快照裡不能有 hidden 的字、不能有未上架素材、不能有 prompt 全文

### 2-5 媒體
- 只複製快照裡用到的 79 個檔案到 `dist-app/media/`，不是整個 `media/`（323 MB，含草稿、停用版）
- 網址格式維持 `/media/<encodeURIComponent(檔名)>`（`src/play/source.ts` 的 `mediaUrl`），Capacitor 會從 App 內部提供，不用改
- 影片已經是 H.264 720p，iPad 直接能播。打包腳本要檢查每支影片的編碼，不是 H.264／HEVC 就擋下來

### 2-6 聲音
- `public/voice/` 照搬（90 MB）。可以只帶 `index.json` 裡快照用得到的句子，省一點空間（選配）
- iPad Safari 規定要使用者先點一下才能出聲音：要確認首頁第一次點擊有沒有把音訊「解鎖」，這一點要到 iPad 實機才驗得出來，先記下
- 系統朗讀（2 支 narration 影片和缺檔時的備案）在 iPad 上會用 iPad 的中文聲音，口音可能跟 Mac 不同。屬於可接受的備案
- 授權：美佳是 macOS 內建聲音，個人、非商業、自家使用沒問題；**不上架是前提**

### 2-7 其他靜態檔
- `hero/`（58 MB）、`emoji3d/`、`strokes/` 照搬
- 選配：hero 的 PNG 轉成 WebP 可以省一半以上，但會動到動畫劇本的路徑，不急

### 2-8 觸控調校（網頁版也會受益）
- 全域：`touch-action: manipulation`（去掉雙擊放大）、`-webkit-touch-callout: none`（長按不跳選單）、`user-select: none`、`overscroll-behavior: none`（不會整頁回彈）
- 已經有 `viewport-fit=cover`，App 裡要確認瀏海和底部橫條的安全區域
- 描字區、拖曳區要保留各自的 `touch-action` 設定，不能被全域設定蓋掉

### 2-9 斷網保護（寫進 App 版）
- App 版的 HTML 加內容安全政策（CSP）：只允許讀 App 自己的檔案，`connect-src 'self'`，禁止外部腳本、外部連線、表單送出、內嵌外部頁面
- 加一個測試：掃 `dist-app/` 的 JS，不能出現 `http://`、`https://` 的對外網址（白名單：無）

### 2-10 驗收
1. `npm test` 全過（現在 162 個）＋新測試（快照內容、單機後端、紀錄匯出匯入）
2. `npm run app:build` → 用純靜態伺服器開 `dist-app/` → 瀏覽器斷網 → 每一種玩法玩一輪：字卡、影片、動畫、描字、餵大怪獸、詞語拼圖、字火車、魔法鍋、跳石頭過河、小偵探、小鎮
3. 重新整理後紀錄還在、星星數對得上；匯出的 JSON 匯入 Mac 後，紀錄跟 iPad 上一致
4. 用 390px／iPad 尺寸的 iframe 看版面（這台機器的 `resize_window` 不能用）
5. 試玩一律用隔離的資料目錄，不要碰到小孩的 `data/progress.json`

---

## 3. 第二階段：資安檢查（通過才進第三階段）

### 問題：App 裝上 iPad、iPad 連上 Wi-Fi 之後，這個 App 會不會變成資安破口？

**結論：照第一階段的設計做，不會。** 理由和要逐項打勾的檢查如下。

#### 3-1 別人能不能從網路連進來？→ 不能
- App 裡**沒有伺服器**。Capacitor 是用 App 內部的網址（`capacitor://localhost`）提供檔案，那不是網路連接埠，同一個 Wi-Fi 上的其他裝置看不到、也連不進來
- 對照：現在 Mac 上的開發伺服器，才是真正有 API 的地方（可以刪素材、叫 AI CLI）。它目前只聽本機（Vite 預設沒有 `--host`；`play.mjs` 綁 127.0.0.1），也有檢查請求來源。**這部分不會進 App**
- ☐ 檢查：`dist-app/` 裡沒有任何 `/api/` 呼叫；Capacitor 設定裡沒有 `server.url`（那是開發時連 Mac 即時重載用的，絕對不能出現在要裝給小孩的版本）

#### 3-2 App 會不會自己往外連？→ 設計上一條都沒有
- 內容全部打包，不需要任何網路
- 第二道防線：CSP（2-9）擋掉所有對外連線；iOS 預設的 ATS 也會擋掉 http
- ☐ 檢查：在 iPad 上開飛航模式玩一輪，和連 Wi-Fi 時行為完全一樣
- ☐ 檢查：Capacitor 設定不開 `allowNavigation`，App 內點任何東西都不會跳到外部網頁

#### 3-3 App 能不能碰到 iPad 上的其他東西？→ 不能
- iOS 的沙盒：每個 App 只能讀寫自己的空間，碰不到照片、其他 App 的資料、帳號密碼
- App 不申請相機、麥克風、位置、通訊錄、照片等任何權限
- ☐ 檢查：`Info.plist` 沒有任何隱私權限的使用說明（有就代表某個套件偷偷要了權限）

#### 3-4 套件會不會夾帶東西？（供應鏈）
- 孩子端相依套件很少：`react`、`react-dom`、`hanzi-writer`
- Capacitor 只裝必要的官方套件：核心、iOS、存檔（Preferences 或 Filesystem）、分享（Share，匯出紀錄用）；震動（Haptics）選配。不裝第三方外掛、不裝任何分析或廣告套件
- ☐ 檢查：`npm audit`；鎖定版本（package-lock）；列出 iOS 專案裡所有原生套件

#### 3-5 安裝檔本身的隱私
- `.ipa` 其實就是一個壓縮檔，**任何拿到它的人解開就能看到所有影片、主角圖，以及小孩的名字**（`src/play/words.ts`、`partners.ts`、`shared/voice-lines.mjs`、楊／捷／睿的動畫）
- ☐ 如果安裝檔或匯出的紀錄放在 pCloud：**不要建立公開分享連結**，只放私人資料夾
- 紀錄 JSON 裡有小孩學了哪些字、什麼時候玩，屬於個人資料，同樣只放私人位置

#### 3-6 安裝方式本身的風險
| 方式 | 風險 |
|---|---|
| Xcode 直接裝 | iPad 要打開「開發者模式」（iOS 16 起）。這只代表允許執行開發者簽名的 App，不會開放遠端存取，風險低。改用 TestFlight 或 Ad Hoc 就不需要 |
| TestFlight／Ad Hoc | 走 Apple 官方管道，最乾淨 |
| SideStore／AltStore | 要讓第三方工具用你的 Apple ID 簽名，帳號有外洩風險。真的要用，就用另外申請的 Apple ID，不要用主帳號 |

#### 3-7 兒童使用面
- App 裡沒有 Studio、沒有連結、沒有購買、沒有廣告，小孩點不出去
- 匯出紀錄的按鈕藏在長按後面，避免小孩誤觸

#### 3-8 檢查方式
第一階段完成後，照上面每一個 ☐ 逐項跑一次，結果寫回這份文件。全部通過才開始第三階段。

---

## 4. 第三階段：移植到 iPad（第二階段通過後才做）

1. 安裝 Xcode（App Store，免費，約十幾 GB），登入 Apple ID
2. 加入 Capacitor：`@capacitor/core`、`@capacitor/ios`，`webDir` 指向 `dist-app/`；設定 App 識別碼（之後不能改，改了等於另一個 App、紀錄會分開）
3. 儲存介面換成 Capacitor 原生存檔；匯出改用 Share
4. iPad 接 Mac、打開開發者模式、信任這台電腦，`npx cap run ios` 裝進去
5. 實機驗收：
   - 第一次點擊後聲音正常、語音接句的停頓（#147）
   - 描字用手指／Apple Pencil 畫一次（#150）
   - 橫直螢幕、安全區域
   - 飛航模式玩一輪（3-2）
   - 關掉 App、重開機後紀錄還在
   - 匯出紀錄到 pCloud，Mac 匯入後一致
6. 給小孩玩，順便完成 #146、#148 要觀察的事

---

## 5. 之後的日常流程

1. 照舊在 Mac 的 Studio 做字、上架影片
2. 想更新 iPad：先在 iPad 匯出紀錄 → Mac 匯入 → `npm run app:build` → 重裝（Xcode 或 TestFlight）
3. 新版會把 Mac 上的最新紀錄當起點，所以**先匯入再打包**，iPad 上的紀錄才不會倒退。這個順序要寫進打包腳本裡檢查（例如打包時比對最後一次匯入的時間）

---

## 6. 要你決定的事

| # | 問題 | 建議 |
|---|---|---|
| 1 | 安裝方式（1-3）：pCloud 不能直接裝 App | 先用免費帳號＋Xcode 試；長期用付費帳號（直接裝或 TestFlight） |
| 2 | 紀錄要不要回 Mac（2-3） | 要。Studio 的今日建議、星星、#130 這類檢查都靠它 |
| 3 | #130：用哪一份紀錄當 iPad 的起點 | 兩個備份檔都過時了：現在的 `progress.json` 多了 10/21、10/22、10/24 共 84 筆事件，兩個備份檔都沒有，直接套用會把這些弄丟。建議用同樣的精準清理法，從**現在的** `progress.json` 重新做一份（只退回自動試玩灌進去的 124 個字），你確認後再套用 |
| 4 | 第一階段可以開始做了嗎 | 這一階段只改 Mac 上的程式，網頁版行為不變 |
