import { isPublished } from '../shared/domain.mjs'

/**
 * iPad 單機版要打包進去的字庫快照（scripts/app-build.mjs 用）。純函式，好測。
 *
 * 只放孩子看得到的：開放給孩子的字（沒有 hidden）、已上架的素材；
 * Studio 才用的欄位（prompt、回饋、重做標記）拿掉，安裝檔被解開也看不到製作過程。
 * 新功能在字卡上加了欄位，孩子端要用的話不必改這裡（只拿掉下面列的）。
 */
export const STUDIO_ONLY_FIELDS = ['promptVersions', 'activePromptId', 'promptedAt', 'needsRedo', 'feedback']

export function buildSnapshot({ characters, parts, progress, builtAt = new Date().toISOString() }) {
  const visible = characters.filter((c) => !c.hidden).map((entry) => {
    const copy = { ...entry, media: (entry.media || []).filter(isPublished) }
    for (const field of STUDIO_ONLY_FIELDS) delete copy[field]
    return copy
  })
  return {
    snapshot: { characters: visible, parts, progress, builtAt },
    mediaFiles: visible.flatMap((c) => c.media.map((m) => m.file)),
  }
}

/**
 * 打包出來的程式裡不該出現對外網址（App 不連網，docs/ipad-app-plan.md 2-9）。
 * 白名單是套件裡寫死、但不會真的去連的字串：SVG／XML 命名空間、React 錯誤說明、
 * hanzi-writer 預設的筆順來源（我們一律給 charDataLoader，不會用到；CSP 也會擋）。
 */
export const URL_ALLOW = [
  /^http:\/\/www\.w3\.org\//,
  /^https:\/\/reactjs\.org\/docs\/error-decoder\.html/,
  /^https:\/\/cdn\.jsdelivr\.net\/npm\/hanzi-writer-data/,
]

export function externalUrls(code) {
  const found = code.match(/https?:\/\/[a-zA-Z0-9.\-]+[^\s'"`)]*/g) || []
  return [...new Set(found.filter((url) => !URL_ALLOW.some((allow) => allow.test(url))))]
}

/** 只收 iPad 直接播得動的影片編碼 */
export const PLAYABLE_VIDEO = ['h264', 'hevc']
