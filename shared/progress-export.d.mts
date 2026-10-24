import type { Progress } from '../src/types'
import type { PlayEvent } from './play-events.mjs'

export type LoggedEvent = PlayEvent & { seq: number }
export type ProgressExport = {
  type: 'cps-progress'
  version: 1
  deviceId: string
  exportedAt: string
  app: { version: string; build: number }
  progress: Progress
  events: LoggedEvent[]
}
export const EXPORT_TYPE: 'cps-progress'
export const EXPORT_VERSION: 1
export function validDeviceId(id: unknown): id is string
export function checkExport(data: unknown): string
export function mergeExport(progress: Progress, data: ProgressExport, lastSeq: number, isKnown: (char: string) => boolean, today?: string, now?: number):
  { progress: Progress; lastSeq: number; added: number; skipped: number }
