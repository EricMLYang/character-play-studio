/**
 * 3D 圖（Fluent Emoji）跟 Apple emoji 朝向相反的 emoji。劇本的 flip 都是照 Apple 的朝向寫，
 * 播放 3D 角色時這些要再翻一次。逐支看 3D 版時發現方向不對就加進來（用 emoji 本身，不用編碼）。
 */
const LIST = ['🐕', '🚐', '📢', '🐌', '🚗']

const codeOf = (e: string) => [...e.replace(/️/g, '')].map((c) => c.codePointAt(0)!.toString(16)).join('-')
export const FLIP_3D = new Set(LIST.map(codeOf))
