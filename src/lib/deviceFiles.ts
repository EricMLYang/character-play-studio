/**
 * 單機版跟裝置交換檔案：匯出紀錄存成檔、從檔案還原紀錄。
 * 現在用瀏覽器的下載與檔案選擇（電腦上測得到）；裝進 iPad 時存檔換成 Capacitor 的分享選單
 * （WKWebView 不支援 <a download>），選檔在 iPad 上本來就會開「檔案」App，可以照用。
 */
export function saveTextFile(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 讓家長選一個檔，回傳內容；取消回 null */
export function pickTextFile(accept = 'application/json,.json'): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      file.text().then(resolve, () => resolve(null))
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}
