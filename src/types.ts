export type Prompt = {
  char: string; formatted: string; hash: string; templateVersion: number; appliedFeedback: string[]; feedbackCount: number
  id?: string; provider?: string; requestedModel?: string | null; actualModel?: string | null
  generatedAt?: string; creativeAngle?: string; conceptZh?: string; stale?: boolean
}
export type Attempt = { id: string; char: string; at: string; prompt: Prompt; mediaFile?: string; failedAt?: string }
export type Media = {
  file: string; kind: 'video' | 'image'; addedAt: string
  review?: 'draft' | 'published' | 'paused'
  audioMode?: 'original' | 'narration'
  volume?: number
  prompt?: Prompt
  attemptId?: string
  feedbackCount?: number
}

export type Scene = 'rain' | 'fire' | 'glow' | 'grow' | 'fly' | 'bounce' | 'zap' | 'sparkle'

export type CharWord = { text: string; emoji?: string }

export type CharEntry = {
  char: string
  zhuyin: string
  meaning: string
  emoji: string
  /** 把字放回孩子已經會說的話裡：日 → 生日🎂、日出🌅。每個詞都含這個字。 */
  words?: CharWord[]
  concept: { object: string; morph: string; hook: string }
  /** 背景小動畫與魔法鍋反應用的分類；沒填就是 sparkle */
  scene?: Scene
  status: 'seed' | 'prompted' | 'live'
  priority: number
  media: Media[]
  feedback: { tags: string[]; at: string; mediaFile?: string }[]
  needsRedo?: boolean
  /** 孩子端隱藏。新加入的字預設隱藏，等家長確認教材備齊才開放。 */
  hidden?: boolean
  promptedAt?: string
  /** /api/library 只給摘要；全文用 getPrompt 取 */
  promptVersions?: Pick<Prompt, 'id' | 'provider' | 'conceptZh' | 'generatedAt'>[]
  activePromptId?: string
}

/** 小鎮居民：他描完的字。strokes 是他自己的筆跡，hanzi-writer 內部座標。 */
export type Resident = { traces: number; first: string; last: string; strokes: number[][] }

/**
 * 孩子的進度（data/progress.json）。新遊戲要記東西就在這裡加一個欄位，
 * 規則寫在 shared/domain.mjs，紀錄種類登記在 shared/play-events.mjs。
 */
export type Recall = { box: number; due: string; last: string; right: number; wrong: number }
export type Puzzle = { char: string; first: string; last: string; count: number; right: number }

export type Progress = {
  /** 檔案格式版本，伺服器載入時自動升級（server/progress.mjs） */
  version?: number
  watched: Record<string, { count: number; last: string }>
  town?: Record<string, Resident>
  /** 魔法鍋變出來過的字 → 第一次發現的時間 */
  lab?: Record<string, string>
  /** 字火車：他自己組的詞 → 最後一次組的時間 */
  words?: Record<string, string>
  /** 餵大怪獸：每個字記住的程度（box 0–5）、下次該考的日子（台灣日期）、對錯次數 */
  recall?: Record<string, Recall>
  /** 詞語拼圖：拼好過的詞 → 補的是哪個字、第一次與最後一次拼好的時間、拼了幾次、幾次第一下就對 */
  puzzles?: Record<string, Puzzle>
  /** 已經算過的事件編號（防離線重送重複算）；伺服器自己管，畫面只用來過濾還沒送出的紀錄 */
  completedEvents?: Record<string, { char: string; day: string }>
}

export type Library = {
  characters: CharEntry[]
  deletedCharacters?: { char: string; deletedAt: string }[]
  template: any
  progress: Progress
  /** 哪個字裡面有哪個字，以及那個部件佔的筆畫 */
  parts: Record<string, { char: string; strokes: number[]; role?: string }[]>
  queue: string[]
  production: { date: string; limit: number; queue: string[]; attempts: Attempt[] }
  pendingAttempts: Attempt[]
  cliProviders: { id: string; name: string; installed: boolean }[]
}

export type DailyBatch = {
  date: string
  queue: string[]
  ready: string[]
  pending: string[]
  job: null | {
    active: boolean; date: string; provider: string; total: number; done: number
    current: string | null; startedAt: string; finishedAt?: string; cancelled?: boolean
    results: { char: string; ok: boolean; error?: string; conceptZh?: string }[]
  }
}
