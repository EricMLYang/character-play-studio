import type { Progress } from '../src/types'

export type PlayEvent =
  | { kind?: 'watch'; char: string; id: string; at: string }
  /** blind＝遮起來憑記憶寫的 */
  | { kind: 'trace'; char: string; id: string; at: string; strokes: number[][]; blind?: boolean }
  | { kind: 'discover'; char: string; id: string; at: string }
  /** char 是整個詞 */
  | { kind: 'word'; char: string; id: string; at: string; remove?: boolean }
  /** 餵大怪獸：ok 是第一次就找對 */
  | { kind: 'recall'; char: string; id: string; at: string; ok: boolean }
  /** 詞語拼圖：char 是補上的字，word 是整個詞，ok 是第一下就找對 */
  | { kind: 'puzzle'; char: string; id: string; at: string; word: string; ok: boolean }
  /** 部首家族：family 是 shared/radicals.mjs 的 id，char 是找到的那個家人，ok 是第一下就找對 */
  | { kind: 'radical'; char: string; id: string; at: string; family: string; ok: boolean }
export type PlayEventKind = NonNullable<PlayEvent['kind']>

export const PLAY_EVENTS: Record<PlayEventKind, {
  error: string
  valid?: (event: any) => boolean
  chars?: (event: any) => string[]
  apply: (progress: Progress, event: any) => Progress
}>
export function eventKind(event: PlayEvent): PlayEventKind
export function validEventId(id: unknown): id is string
export function acceptEvent(kind: string, event: Record<string, unknown>, isKnown: (char: string) => boolean, now?: number): boolean
export function applyEvent(progress: Progress, event: PlayEvent): Progress
export const KEEP_EVENT_DAYS: number
export function pruneCompleted(completed?: Progress['completedEvents'], today?: string): NonNullable<Progress['completedEvents']>
export function recordEvent(progress: Progress, kind: string, event: Record<string, unknown>, isKnown: (char: string) => boolean, today?: string, now?: number):
  { progress: Progress; added: boolean; error?: undefined } | { error: string; progress?: undefined; added?: undefined }
