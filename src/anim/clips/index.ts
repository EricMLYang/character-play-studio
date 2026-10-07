import type { CharEntry } from '../../types'
import { hasPublishedVideo } from '../../../shared/selection.mjs'
import type { Clip } from '../clip'

/**
 * 動畫劇本：這個資料夾裡一個字一個檔（例如 果.ts），export default 一份 Clip。
 * 新增檔案就會自動出現在播放器、Studio 與 /anim 試播頁，不必改這裡。
 * 怎麼寫一份新劇本見 .claude/skills/char-animation/SKILL.md。
 */
const modules = import.meta.glob<{ default: Clip }>(['./*.ts', '!./index.ts'], { eager: true })

export const CLIPS: Clip[] = Object.values(modules).map((m) => m.default).sort((a, b) => a.char.localeCompare(b.char, 'zh-Hant'))

export const clipFor = (char: string) => CLIPS.find((c) => c.char === char)

/** 孩子端的「有影片」：上架的影片，或已經有動畫劇本的字。 */
export const hasMovie = (entry: CharEntry) => hasPublishedVideo(entry) || Boolean(clipFor(entry.char))
