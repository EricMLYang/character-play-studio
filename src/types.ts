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

export type CharEntry = {
  char: string
  zhuyin: string
  meaning: string
  emoji: string
  concept: { object: string; morph: string; hook: string }
  status: 'seed' | 'prompted' | 'live'
  priority: number
  media: Media[]
  feedback: { tags: string[]; at: string; mediaFile?: string }[]
  needsRedo?: boolean
  /** 孩子端隱藏。新加入的字預設隱藏，等家長確認教材備齊才開放。 */
  hidden?: boolean
  promptedAt?: string
  promptVersions?: Prompt[]
  activePromptId?: string
}

export type Progress = {
  watched: Record<string, { count: number; last: string }>
}

export type Library = {
  characters: CharEntry[]
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
