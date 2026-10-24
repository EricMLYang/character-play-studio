import type { CharEntry, DailyBatch, Library, Progress, Prompt } from '../types'
import type { PlayEventKind } from '../../shared/play-events.mjs'
import { ApiError } from './apiError'
import { STANDALONE } from './target'
import { localLibrary, localRecord } from './standalone'

export { ApiError }

/** 字庫變動後伺服器順便更新的筆順與字的家族 */
export type AssetReport = { missingStrokes: string[]; partsError?: string }

const j = async (r: Response) => {
  const body = await r.json()
  if (!r.ok) throw new ApiError(body.error || '操作失敗，請再試一次', r.status)
  return body
}

// 孩子端只透過這兩個跟「伺服器」講話；iPad 單機版換成裝置上的實作（standalone.ts），孩子端其他地方不用知道
export const getLibrary = (): Promise<Library> => STANDALONE ? localLibrary() : fetch('/api/library').then(j)
export const getPrompt = (char: string): Promise<Prompt> => fetch(`/api/prompt?char=${encodeURIComponent(char)}`).then(j)
export const generatePrompt = (body: { char: string; provider: string; model: string; direction: string }, signal: AbortSignal): Promise<Prompt> =>
  fetch('/api/prompt/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal }).then(j)
export const getDailyBatch = (): Promise<DailyBatch> => fetch('/api/prompt/today').then(j)
export const startDailyBatch = (provider: string, model: string): Promise<DailyBatch> =>
  fetch('/api/prompt/today', { method: 'POST', body: JSON.stringify({ provider, model }) }).then(j)
export const cancelDailyBatch = (): Promise<DailyBatch> => fetch('/api/prompt/today/cancel', { method: 'POST' }).then(j)
export const selectPrompt = (char: string, id: string): Promise<Prompt> =>
  fetch('/api/prompt/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ char, id }) }).then(j)
export const sendFeedback = (char: string, tags: string[], mediaFile?: string) =>
  fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ char, tags, mediaFile }) }).then(j)
export const addCharacter = (body: Record<string, string>) =>
  fetch('/api/character', { method: 'POST', body: JSON.stringify(body) }).then(j)
export const updateCharacter = (body: Record<string, string>) =>
  fetch('/api/character/update', { method: 'POST', body: JSON.stringify(body) }).then(j)
export const deleteCharacter = (char: string) =>
  fetch('/api/character/delete', { method: 'POST', body: JSON.stringify({ char }) }).then(j)
export const restoreCharacter = (char: string) =>
  fetch('/api/character/restore', { method: 'POST', body: JSON.stringify({ char }) }).then(j)
export const suggestCharacter = (body: { char: string; provider: string; model: string }, signal: AbortSignal): Promise<{ char: string; zhuyin: string; meaning: string; emoji: string; words: string; scene: string }> =>
  fetch('/api/character/suggest', { method: 'POST', body: JSON.stringify(body), signal }).then(j)
export const setVisibility = (char: string, hidden: boolean): Promise<{ ok: true; entry: CharEntry; assets: AssetReport }> =>
  fetch('/api/character/visibility', { method: 'POST', body: JSON.stringify({ char, hidden }) }).then(j)
export const importFile = (char: string, file: File, attemptId = '') => {
  const ext = file.name.split('.').pop() || 'mp4'
  return fetch(`/api/import?char=${encodeURIComponent(char)}&ext=${encodeURIComponent(ext)}&attemptId=${encodeURIComponent(attemptId)}`, {
    method: 'POST', body: file,
  }).then(j)
}
export const recordSubmission = (char: string, hash: string, id: string) =>
  fetch('/api/submission', { method: 'POST', body: JSON.stringify({ char, hash, id }) }).then(j)
export const markSubmissionFailed = (id: string) =>
  fetch('/api/submission-failed', { method: 'POST', body: JSON.stringify({ id }) }).then(j)
export const reviewMedia = (body: Record<string, unknown>) =>
  fetch('/api/media-review', { method: 'POST', body: JSON.stringify(body) }).then(j)
export const recordPlay = (route: PlayEventKind, body: Record<string, unknown>): Promise<Progress> => STANDALONE ? localRecord(route, body) :
  fetch(`/api/${route}`, { method: 'POST', body: JSON.stringify(body), keepalive: true }).then(j)
export const importDeviceProgress = (data: unknown): Promise<{ added: number; skipped: number; already: number }> =>
  fetch('/api/progress/import', { method: 'POST', body: JSON.stringify(data) }).then(j)
