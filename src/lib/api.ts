import type { Library, Progress, Prompt } from '../types'

const j = async (r: Response) => {
  const body = await r.json()
  if (!r.ok) throw new Error(body.error || '操作失敗，請再試一次')
  return body
}

export const getLibrary = (): Promise<Library> => fetch('/api/library').then(j)
export const getPrompt = (char: string): Promise<Prompt> => fetch(`/api/prompt?char=${encodeURIComponent(char)}`).then(j)
export const generatePrompt = (body: { char: string; provider: string; model: string; direction: string }, signal: AbortSignal): Promise<Prompt> =>
  fetch('/api/prompt/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal }).then(j)
export const selectPrompt = (char: string, id: string): Promise<Prompt> =>
  fetch('/api/prompt/select', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ char, id }) }).then(j)
export const sendFeedback = (char: string, tags: string[], mediaFile?: string) =>
  fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ char, tags, mediaFile }) }).then(j)
export const addCharacter = (body: Record<string, string>) =>
  fetch('/api/character', { method: 'POST', body: JSON.stringify(body) }).then(j)
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
export const recordWatch = (char: string, id: string, at: string): Promise<Progress> =>
  fetch('/api/watch', { method: 'POST', body: JSON.stringify({ char, id, at }), keepalive: true }).then(j)
