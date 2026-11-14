import type { Clip } from '../../anim/clip'

/**
 * 主角館的動畫：這個資料夾裡一個名字一個檔（檔名是 shared/names.mjs 的 id），
 * export default 一份沒有國字的劇本（scene({...})，src/story/scene.ts）。
 * 按需載入：點開那張卡片才下載它的動畫。寫法與所有權規則：.claude/skills/name-scenes/SKILL.md。
 */
const loaders = import.meta.glob<{ default: Clip }>(['./*.ts', '!./index.ts'])
const byId = new Map(Object.entries(loaders).map(([path, load]) => [path.slice(2, -3), load]))

/** 有動畫的名字（沒有的先不上牆） */
export const hasNameScene = (id: string) => byId.has(id)

const cache = new Map<string, Clip>()
export async function loadNameScene(id: string): Promise<Clip | undefined> {
  const hit = cache.get(id)
  if (hit) return hit
  const load = byId.get(id)
  if (!load) return undefined
  const clip = (await load()).default
  cache.set(id, clip)
  return clip
}
