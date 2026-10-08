// 下載動畫劇本用到的 3D emoji 圖（Microsoft Fluent Emoji 3D，MIT 授權）到 public/emoji3d/，
// 並產生 src/anim/emoji3d.ts（播放器用來判斷哪些 emoji 有 3D 圖）。
//
//   npm run emoji3d
//
// 已經下載過的不會重抓。新劇本用到新的 emoji 時再跑一次就好。對不到 3D 圖的 emoji 會列出來，播放器照樣用原本的 emoji 字。
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const outDir = join(root, 'public/emoji3d')
const REPO = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/'
mkdirSync(outDir, { recursive: true })

const norm = (e) => e.replace(/️/g, '')
export const codeOf = (e) => [...norm(e)].map((c) => c.codePointAt(0).toString(16)).join('-')

// 劇本裡所有 emoji（角色、換造型、效果），加上引擎效果的預設 emoji
const used = new Set(['💥', '✨', '💫', '❓', '💦', '💨', '💤', '❗', '💧'])
const clipDir = join(root, 'src/anim/clips')
for (const f of readdirSync(clipDir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')) {
  for (const m of readFileSync(join(clipDir, f), 'utf8').matchAll(/emoji: '([^']+)'/g)) used.add(m[1])
}

const missing = [...used].filter((e) => !existsSync(join(outDir, `${codeOf(e)}.png`)))
let notFound = []
if (missing.length) {
  console.log(`要下載 ${missing.length} 個 3D emoji，先讀 Fluent Emoji 的清單…`)
  const tree = await (await fetch('https://api.github.com/repos/microsoft/fluentui-emoji/git/trees/main?recursive=1')).json()
  const paths = tree.tree.map((x) => x.path)
  const metas = paths.filter((p) => p.endsWith('metadata.json'))
  const pngs = paths.filter((p) => p.endsWith('.png') && p.includes('/3D/'))
  const glyphToFolder = new Map()
  // 每個 emoji 一個 metadata.json，分批平行抓
  for (let i = 0; i < metas.length; i += 32) {
    await Promise.all(metas.slice(i, i + 32).map(async (m) => {
      try {
        const d = await (await fetch(REPO + encodeURI(m))).json()
        if (d.glyph) glyphToFolder.set(norm(d.glyph), m.slice(0, m.lastIndexOf('/')))
      } catch { /* 個別失敗就跳過 */ }
    }))
  }
  for (const e of missing) {
    const folder = glyphToFolder.get(norm(e))
    const png = folder && pngs.find((p) => p.startsWith(`${folder}/3D/`) || p.startsWith(`${folder}/Default/3D/`))
    if (!png) { notFound.push(e); continue }
    const res = await fetch(REPO + encodeURI(png))
    if (!res.ok) { notFound.push(e); continue }
    writeFileSync(join(outDir, `${codeOf(e)}.png`), Buffer.from(await res.arrayBuffer()))
  }
}

const have = readdirSync(outDir).filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, '')).sort()
writeFileSync(join(root, 'src/anim/emoji3d.ts'),
  `// 由 scripts/emoji3d.mjs 產生，不要手改。有 3D 圖（public/emoji3d/<編碼>.png）的 emoji 編碼。\n` +
  `export const EMOJI_3D = new Set(${JSON.stringify(have)})\n`)
writeFileSync(join(outDir, 'LICENSE.txt'),
  'These images are from Microsoft Fluent Emoji (https://github.com/microsoft/fluentui-emoji).\nMIT License, Copyright (c) Microsoft Corporation.\n')
console.log(`3D emoji：共 ${have.length} 張${notFound.length ? `；對不到 3D 圖、會用原本 emoji 的：${notFound.join(' ')}` : ''}`)
