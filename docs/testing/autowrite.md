# 自動描字（在瀏覽器裡把一個字寫完）

> 2026-11-06 第二夜做魔法筆時發現的方法。以前以為描字沒辦法自動測（#150、第一夜的 LOG），其實可以。

hanzi-writer 收的是一般的 `mousedown`／`mousemove`／`mouseup`（`mouseup` 掛在 `document`）。
沿著每一筆的標準路線（`public/strokes/<字>.json` 的 `medians`）送事件，它全部接受，跟真的手指寫一樣會觸發
`onCorrectStroke`、`onComplete`，紀錄也會照常送出。

**只在 `npm run play`（隔離資料）用**，不要對著 5180 跑，會寫進小孩的真實紀錄。

## 用法（Claude in Chrome 的 javascript_tool 貼進去）

```js
window.__autoWrite = async (char, scope = document) => {
  const data = await fetch(`/strokes/${encodeURIComponent(char)}.json`).then((r) => r.json())
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  for (let s = 0; s < data.medians.length; s++) {
    const svg = scope.querySelector('.stroke-canvas svg')
    // 字座標（1024 格、y 朝上）→ 畫面座標：直接用 hanzi-writer 畫字那一層的矩陣
    const m = svg.querySelector('g[transform]').getScreenCTM()
    const pts = data.medians[s].map(([x, y]) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }))
    const ev = (type, p, target) => target.dispatchEvent(new MouseEvent(type, { clientX: p.x, clientY: p.y, bubbles: true }))
    ev('mousedown', pts[0], svg)
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i]
      for (let k = 1; k <= 4; k++) { ev('mousemove', { x: a.x + (b.x - a.x) * k / 4, y: a.y + (b.y - a.y) * k / 4 }, svg); await wait(8) }
    }
    ev('mouseup', pts[pts.length - 1], document)
    await wait(450)   // 等它判定、演完那一筆
  }
}
await window.__autoWrite('魚')
```

- **要等示範播完**：提示那行出現「換你」「自己寫」「開始寫」才開始寫（示範播放中送的事件不算）。
- **故意寫錯**：在格子底下橫畫一條（不在任何一筆上）就是錯一次；同一筆錯兩次會閃提示。
- **超過 45 秒的流程**（例如魔法筆一整輪）：工具一次最多等 45 秒，把流程寫成 `window.__run = async () => {…}` 丟到背景跑，結果寫進 `window.__log`，再分次讀。

## 拍動畫

- `document.getAnimations().forEach((a) => a.pause())` 可以把 CSS 動畫定格再截圖。
- 但 React 的計時器還在跑，截圖慢一點就會跳到下一段。要完全定住，可以先把 `window.setTimeout` 包一層，用旗標擋住之後的回呼（第二夜 LOG 第 17 輪拍火山就是這樣）。
- 手動掛上去測的元件（`createRoot` 掛 Fuse、Conjure）測完要 `unmount` 並移除，不然下一個檢查會量到它。
