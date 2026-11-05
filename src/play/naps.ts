import type { Progress } from '../types'

/**
 * 小鎮居民打盹：快忘的字看得出來。
 *
 * Duolingo 的技能會「裂開」提醒你該複習了；這裡是小鎮居民睡著。記住程度（shared/domain.mjs 的 recall）
 * 本來就排好了哪一天要再考，但那只在餵大怪獸出題時才看得到——他不知道哪些字快忘了。
 * 現在：明天要考的字在小鎮裡打呵欠，今天（或更早）就該考的字蓋著被子睡著，字被被子蓋住看不到。
 * 點他，要聽音找出他的名字叫醒他——就是一次「隔幾天再想起來」（間隔提取，證據最強的那種）。
 *
 * 沒有新的進度欄位：全部從 progress.recall 算。叫醒時記一筆既有的 recall 紀錄，排程自己往後推，他就醒著了。
 */
export type Nap = 'awake' | 'sleepy' | 'asleep'

/** 台灣日期字串 +1 天（YYYY-MM-DD） */
const nextDay = (day: string) => new Date(Date.parse(`${day}T00:00:00Z`) + 864e5).toISOString().slice(0, 10)

export function napOf(progress: Progress, char: string, today: string): Nap {
  const r = progress.recall?.[char]
  if (!r?.due) return 'awake'
  if (r.due <= today) return 'asleep'
  if (r.due === nextDay(today)) return 'sleepy'
  return 'awake'
}

/** 小鎮裡睡著的居民（首頁「回家」那一站會說「有字睡著了」） */
export const sleepersIn = (progress: Progress, today: string) =>
  Object.keys(progress.town || {}).filter((c) => napOf(progress, c, today) === 'asleep')
