import type { Clip } from '../../anim/clip'

/**
 * 故事的戲：這個資料夾裡一本故事一個檔（檔名是 shared/stories.mjs 的故事 id），
 * export default 一張「戲的編號 → 劇本」的表（讀的頁用頁 id，選項用「頁 id:字」）。
 * 按需載入：打開那一本才下載它的戲。
 */
export type Scenes = Record<string, Clip>

const loaders = import.meta.glob<{ default: Scenes }>(['./*.ts', '!./index.ts'])
const byId = new Map(Object.entries(loaders).map(([path, load]) => [path.slice(2, -3), load]))

/** 有戲可以演的故事 */
export const hasScenes = (id: string) => byId.has(id)

const cache = new Map<string, Scenes>()
export async function loadScenes(id: string): Promise<Scenes | undefined> {
  const hit = cache.get(id)
  if (hit) return hit
  const load = byId.get(id)
  if (!load) return undefined
  const scenes = (await load()).default
  cache.set(id, scenes)
  return scenes
}
