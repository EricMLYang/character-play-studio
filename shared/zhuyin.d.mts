export type ZhuyinGroupId = 'initial' | 'medial' | 'final'
export type ZhuyinPick = Partial<Record<ZhuyinGroupId, string>>
export type ZhuyinSegment = { text: string; group: ZhuyinGroupId | null; hit: boolean }

export const INITIALS: string[]
export const MEDIALS: string[]
export const FINALS: string[]
export const ZHUYIN_GROUPS: { id: ZhuyinGroupId; name: string; keys: string[] }[]
export const ZHUYIN_KEYS: string[]
export function groupOf(sym: string): ZhuyinGroupId | undefined
export function parseZhuyin(zhuyin?: string): Record<ZhuyinGroupId, string> & { bad: string[] }
export function hasPick(pick: ZhuyinPick | null | undefined): boolean
export function pickText(pick: ZhuyinPick | null | undefined): string
export function matchesPick(zhuyin: string, pick: ZhuyinPick | null | undefined): boolean
export function togglePick(pick: ZhuyinPick, sym: string): ZhuyinPick
export function availableKeys(entries: { zhuyin: string }[], pick?: ZhuyinPick): Set<string>
export function zhuyinSegments(zhuyin?: string, pick?: ZhuyinPick | null): ZhuyinSegment[]
export const ZHUYIN_LINES: { open: string; clear: string }
export function zhuyinLines(): string[]
