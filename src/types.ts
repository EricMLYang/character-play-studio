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

export type CharWord = { text: string; emoji?: string }

export type CharEntry = {
  char: string
  zhuyin: string
  meaning: string
  emoji: string
  /** 把字放回孩子已經會說的話裡：日 → 生日🎂、日出🌅。每個詞都含這個字。 */
  words?: CharWord[]
  concept: { object: string; morph: string; hook: string }
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

export type Progress = {
  watched: Record<string, { count: number; last: string }>
  town?: Record<string, Resident>
  /** 魔法鍋變出來過的字 → 第一次發現的時間 */
  lab?: Record<string, string>
}

export type Library = {
  characters: CharEntry[]
  deletedCharacters?: { char: string; deletedAt: string }[]
  template: any
  progress: Progress
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
