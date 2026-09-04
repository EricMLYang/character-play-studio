# 字字樂園 · Character Play Studio

給 6 歲兒子的識字影片產線 + 播放器。跑在你自己的 MacBook 上，不需要部署、不需要網路。

```bash
npm install
npm run dev        # → http://localhost:5180
```

- **`/`** 小孩模式（他用的）
- **`/studio`** 大人模式（你用的）

---

## 每天的流程（大概 5 分鐘）

1. 開 `/studio`，最上面「今天要生的 3 個字」按一個字
2. 按 **複製** → 貼到你訂閱的影片 AI
3. 影片下載好之後，**拖進 Studio 的虛線框** → 自動改名、入庫、上架
4. 兒子開 `/` 就看得到

> 一個字在拿到影片之前都會留在今天的清單上，中斷了也接得回來。

## 還沒有影片也能玩

字庫裡沒有影片的字會用**字卡動畫**頂上：emoji 掉下來 → 變形成國字 → 定格呼吸，
同時用系統語音唸 4 次。所以第一天就有東西看，不用等影片累積。

## 小孩模式的設計原則

| 原則 | 怎麼做到 |
|---|---|
| 焦點 100% 在字上 | 字撐滿卡片與畫面；影片 `object-fit: contain` 絕不裁切 |
| 每天有份量 | 一天 6 張卡，看完就是結束畫面，沒有無限滑 |
| 不知不覺學習 | 不出考卷。看過的字變貼紙；隔 2 天以上的字會自己混回今天的清單 |
| 不會亂跑出去 | 全螢幕、鎖鍵盤（只留方向鍵/空白鍵）、擋右鍵、無外連 |
| 不會卡住 | 影片播不動 → 大播放鍵；檔案壞掉 → 自動退回字卡動畫 |

左下角有個淡淡的小圓點，**長按 2.5 秒**才會回到 Studio（小孩按不住）。

> ⚠️ 瀏覽器擋不掉 `Cmd+W` / `Cmd+Q`。全螢幕會把分頁列藏起來，已經擋掉大部分意外，
> 但要真的關死，得用 Chrome 的 kiosk 模式開：
> `open -na "Google Chrome" --args --kiosk http://localhost:5180`

## Prompt 是怎麼組出來的

三層，都在 `data/`：

- `prompt-template.json` → `constraints`：8 秒、70% 佔比、Pixar 風、禁止項。**幾乎不動**
- `prompt-template.json` → `styleRules`：會被回饋修改的部分（例：筆畫對比、定格秒數）
- `characters.json` → 每個字的 `concept`：什麼實物登場、怎麼變成這個字

生成 = 組裝，所以同樣的資料永遠產出同樣的 prompt，可以 diff、可以回溯。

命令列也能用：

```bash
npm run prompt 山              # 單一個字
npm run prompt -- --today      # 今天該生的 3 個字
```

## 回饋迴路

看完在 Studio 按標籤（他超愛 / 字看不清 / 太吵太亂 / 形變沒看懂 / 太快）。
負面標籤會把那個字標成 `needsRedo`，自動排回今天的佇列最前面。

> 累積到 20-30 支影片、真的看出問題模式之後，再把標籤變成 `styleRules` 的自動增修。
> 太早做會是在猜。

## 檔案放哪

```
data/characters.json       字庫 + 狀態（進 git，可 diff）
data/prompt-template.json  prompt 三層
data/progress.json         兒子的觀看紀錄（不進 git）
media/                     影片圖片（不進 git，靠 Google Drive 同步）
```
