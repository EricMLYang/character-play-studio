export type Media = { file: string; kind: 'video' | 'image'; addedAt: string }

export type CharEntry = {
  char: string
  zhuyin: string
  meaning: string
  emoji: string
  concept: { object: string; morph: string; hook: string }
  status: 'seed' | 'prompted' | 'live'
  priority: number
  media: Media[]
  feedback: { tags: string[]; at: string }[]
  needsRedo?: boolean
  promptedAt?: string
}

export type Progress = {
  watched: Record<string, { count: number; last: string }>
  days: Record<string, string[]>
  stickers: string[]
}

export type Library = {
  characters: CharEntry[]
  template: any
  progress: Progress
  queue: string[]
}
