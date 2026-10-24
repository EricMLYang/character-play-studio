/**
 * iPad 單機版存在裝置上的東西（進度、事件紀錄、裝置編號），只有這裡碰儲存空間。
 *
 * 現在用 localStorage，瀏覽器裡就能測；裝進 iPad 時換成 Capacitor 的原生存檔
 * （WKWebView 的 localStorage 在空間不夠時可能被系統清掉）。介面一開始就是 async，換的時候呼叫端不用動。
 * 讀不到回 undefined；寫不進去會丟例外，讓呼叫端知道這筆沒存到。
 */
const PREFIX = 'cps-device:'

export async function readItem<T>(key: string): Promise<T | undefined> {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? undefined : JSON.parse(raw)
  } catch { return undefined }
}

export async function writeItem(key: string, value: unknown): Promise<void> {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}
