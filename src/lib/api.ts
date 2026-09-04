import type { Library, Progress } from '../types'

const j = async (r: Response) => {
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export const getLibrary = (): Promise<Library> => fetch('/api/library').then(j)
export const getPrompt = (char: string) => fetch(`/api/prompt?char=${encodeURIComponent(char)}`).then(j)
export const saveProgress = (p: Progress) =>
  fetch('/api/progress', { method: 'POST', body: JSON.stringify(p) }).then(j)
export const sendFeedback = (char: string, tags: string[]) =>
  fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ char, tags }) }).then(j)
export const addCharacter = (body: Record<string, string>) =>
  fetch('/api/character', { method: 'POST', body: JSON.stringify(body) }).then(j)
export const importFile = (char: string, file: File) => {
  const ext = file.name.split('.').pop() || 'mp4'
  return fetch(`/api/import?char=${encodeURIComponent(char)}&ext=${ext}`, {
    method: 'POST', body: file,
  }).then(j)
}
