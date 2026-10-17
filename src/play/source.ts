import type { CharEntry, Media } from '../types'
import type { Clip } from '../anim/clip'
import { publishedMedia } from '../../shared/domain.mjs'
import { clipFor } from '../anim/clips'

/**
 * 一個字要播什麼：上架影片 → 動畫劇本 → 上架圖片 → 字卡動畫（什麼都沒有）。
 * 影片或圖片檔壞掉（broken）就往下一種退。觀看層跟字火車都用這個順序，不要各寫一份。
 */
export type Source =
  | { kind: 'video'; media: Media }
  | { kind: 'clip'; clip: Clip }
  | { kind: 'image'; media: Media }
  | { kind: 'card' }

export type Broken = { video?: boolean; image?: boolean }

export function pickSource(entry: CharEntry, broken: Broken = {}, { images = true } = {}): Source {
  const media = publishedMedia(entry)
  const video = broken.video ? undefined : media.find((m) => m.kind === 'video')
  if (video) return { kind: 'video', media: video }
  const clip = clipFor(entry.char)
  if (clip) return { kind: 'clip', clip }
  const image = !images || broken.image ? undefined : media.find((m) => m.kind === 'image')
  if (image) return { kind: 'image', media: image }
  return { kind: 'card' }
}

export const mediaUrl = (media: Media) => `/media/${encodeURIComponent(media.file)}`
