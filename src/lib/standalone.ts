import type { CharEntry, Library, Progress } from '../types'
import { recordEvent, type PlayEventKind } from '../../shared/play-events.mjs'
import { EXPORT_TYPE, EXPORT_VERSION, checkExport, type LoggedEvent, type ProgressExport } from '../../shared/progress-export.mjs'
import { readItem, writeItem } from './deviceStore'
import { ApiError } from './apiError'
import { BUILD } from './target'

/**
 * iPad 單機版的「伺服器」：字庫讀打包進去的 library.json（scripts/app-build.mjs 產生），
 * 紀錄用跟 Mac 伺服器同一套規則（shared/play-events.mjs 的 recordEvent）存在裝置上。
 *
 * - 進度只在裝置上還沒有任何紀錄時（第一次安裝）拿 library.json 裡帶的那份當起點；
 *   之後更新版本都以裝置上的為準，不會倒退。
 * - 每一筆收下的紀錄另外記進事件紀錄（帶 seq），匯出時一起帶走，Mac 匯入時只補沒收過的。
 */
export type Snapshot = { characters: CharEntry[]; parts: Library['parts']; progress: Progress; builtAt: string }

const EMPTY: Progress = { watched: {} }
let known: Set<string> | undefined

async function deviceState() {
  let deviceId = await readItem<string>('deviceId')
  if (!deviceId) {
    deviceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    await writeItem('deviceId', deviceId)
  }
  return { deviceId, seq: (await readItem<number>('seq')) || 0 }
}

export async function localLibrary(): Promise<Library> {
  const response = await fetch('/library.json')
  if (!response.ok) throw new Error('字庫檔不見了')
  const snapshot: Snapshot = await response.json()
  known = new Set(snapshot.characters.map((c) => c.char))
  let progress = await readItem<Progress>('progress')
  if (!progress) {
    progress = snapshot.progress || EMPTY
    await writeItem('progress', progress)
  }
  return {
    characters: snapshot.characters, parts: snapshot.parts, progress,
    // 以下是 Studio 才用的欄位，單機版沒有 Studio
    template: null, queue: [], production: { date: '', limit: 0, queue: [], attempts: [] }, pendingAttempts: [], cliProviders: [],
  }
}

export async function localRecord(kind: PlayEventKind, body: Record<string, unknown>): Promise<Progress> {
  if (!known) await localLibrary()
  const current = (await readItem<Progress>('progress')) || EMPTY
  const result = recordEvent(current, kind, body, (c) => known!.has(c))
  if (result.error !== undefined) throw new ApiError(result.error, 422)
  if (result.added) {
    const { seq } = await deviceState()
    const events = (await readItem<LoggedEvent[]>('events')) || []
    await writeItem('progress', result.progress)
    await writeItem('events', [...events, { ...body, kind, seq: seq + 1 }])
    await writeItem('seq', seq + 1)
  }
  return result.progress
}

/** 整份紀錄打包成一個檔（家長按「匯出紀錄」） */
export async function exportProgress(): Promise<ProgressExport> {
  const { deviceId } = await deviceState()
  return {
    type: EXPORT_TYPE, version: EXPORT_VERSION, deviceId, exportedAt: new Date().toISOString(),
    app: { version: BUILD.version, build: BUILD.build },
    progress: (await readItem<Progress>('progress')) || EMPTY,
    events: (await readItem<LoggedEvent[]>('events')) || [],
  }
}

/** 匯入檔的摘要，讓家長確認要不要用它取代這台的紀錄 */
export async function describeImport(data: unknown) {
  const error = checkExport(data)
  if (error) return { error }
  const file = data as ProgressExport
  const here = await exportProgress()
  return { error: '', exportedAt: file.exportedAt, fileEvents: file.events.length, hereEvents: here.events.length,
    sameDevice: file.deviceId === here.deviceId }
}

/**
 * 用匯出檔整份取代這台的紀錄（換簽名帳號後的新 App、換 iPad、誤刪重裝）。
 * 連裝置編號和 seq 一起接手：對 Mac 來說還是同一台，接著往下數，不會重複算。
 */
export async function restoreProgress(data: unknown): Promise<Progress> {
  const error = checkExport(data)
  if (error) throw new Error(error)
  const file = data as ProgressExport
  const seq = file.events.reduce((max, e) => Math.max(max, e.seq), 0)
  await writeItem('progress', file.progress)
  await writeItem('events', file.events)
  await writeItem('seq', seq)
  await writeItem('deviceId', file.deviceId)
  return file.progress
}
