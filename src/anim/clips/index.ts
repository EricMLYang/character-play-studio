import type { CharEntry } from '../../types'
import { hasPublishedVideo } from '../../../shared/selection.mjs'
import type { Clip } from '../clip'

/**
 * 動畫劇本：這個資料夾裡一個字一個檔（例如 果.ts），export default 一份 Clip，檔名就是那個字。
 * 新增檔案就會自動出現在播放器、Studio 與 /anim 試播頁，不必改這裡。
 * 怎麼寫一份新劇本見 .claude/skills/char-animation/SKILL.md。
 *
 * 按需載入：189 支劇本如果開頁就全部載入，主程式會超過 1MB，手機連進來很慢。
 * 「哪些字有動畫」看檔名就知道（不必載入內容）；真的要播時才用 loadClip 下載那一支。
 */
const loaders = import.meta.glob<{ default: Clip }>(['./*.ts', '!./index.ts'])
const byChar = new Map(Object.entries(loaders).map(([path, load]) => [path.slice(2, -3), load]))

/** 有動畫劇本的字，照注音順序 */
export const CLIP_CHARS = [...byChar.keys()].sort((a, b) => a.localeCompare(b, 'zh-Hant'))

export const hasClip = (char: string) => byChar.has(char)

const cache = new Map<string, Clip>()
/** 已經載入過的劇本（沒載入過是 undefined） */
export const cachedClip = (char: string) => cache.get(char)

/** 載入這個字的劇本；沒有劇本是 undefined。同一支只下載一次。 */
export async function loadClip(char: string): Promise<Clip | undefined> {
  const hit = cache.get(char)
  if (hit) return hit
  const load = byChar.get(char)
  if (!load) return undefined
  const clip = (await load()).default
  cache.set(char, clip)
  return clip
}

/** 全部載入（/anim 試播頁與 npm run anim:check 用） */
export async function loadAllClips(): Promise<Clip[]> {
  const clips = await Promise.all(CLIP_CHARS.map(loadClip))
  return clips.filter((c): c is Clip => Boolean(c))
}

/** 孩子端的「有影片」：上架的影片，或已經有動畫劇本的字。 */
export const hasMovie = (entry: CharEntry) => hasPublishedVideo(entry) || hasClip(entry.char)
