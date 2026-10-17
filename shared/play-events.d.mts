import type { Progress } from '../src/types'

export type PlayEvent =
  | { kind?: 'watch'; char: string; id: string; at: string }
  | { kind: 'trace'; char: string; id: string; at: string; strokes: number[][] }
  | { kind: 'discover'; char: string; id: string; at: string }
  /** char 是整個詞 */
  | { kind: 'word'; char: string; id: string; at: string; remove?: boolean }
  /** 餵大怪獸：ok 是第一次就找對 */
  | { kind: 'recall'; char: string; id: string; at: string; ok: boolean }
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
