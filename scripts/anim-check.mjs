// 檢查動畫劇本有沒有常見錯誤（char-animation skill 寫完劇本後跑）：
//
//   npm run anim:check            # 檢查全部
//   npm run anim:check -- 果 雷   # 只檢查這幾個字
//
// 錯誤（exit 1）：唸字不是「字、字、語詞」、筆畫漏掉或重複、引用不存在的角色、時間超出影片長度。
// 警告：唸字間隔太近、國字完成後有角色擋住字、效果跑出畫面、沒有 meta。
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
// 常見多音字：語詞裡除了目標字以外不能有這些（系統朗讀會唸錯）。發現新的就加進來。
const POLYPHONIC = new Set([...'長行樂重了得著數還都好為參落降度調傳種模地的乾色匙紅綠背空和看要會少中當差把只便覺分省'])
const only = process.argv.slice(2).join('').replace(/\s/g, '')

const server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
let failed = false
try {
  const { CLIPS } = await server.ssrLoadModule('/src/anim/clips/index.ts')
  const engine = await server.ssrLoadModule('/src/anim/clip.ts')
  const clips = only ? CLIPS.filter((c) => only.includes(c.char)) : CLIPS
  for (const clip of clips) {
    const { errors, warnings } = check(clip, engine)
    if (errors.length) failed = true
    const mark = errors.length ? '✗' : warnings.length ? '△' : '✓'
    console.log(`${mark} ${clip.char}${errors.length + warnings.length ? '' : '  沒問題'}`)
    errors.forEach((e) => console.log(`    錯誤：${e}`))
    warnings.forEach((w) => console.log(`    注意：${w}`))
  }
  console.log(`\n共 ${clips.length} 支${failed ? '，有錯誤要修' : ''}`)
} finally {
  await server.close()
}
process.exit(failed ? 1 : 0)

function check(clip, { actorsAt, fxAt, buildTiming, GLYPH }) {
  const errors = [], warnings = []
  const ids = new Set(clip.actors.map((a) => a.id))
  const end = clip.duration

  // 唸字：字、字、語詞
  const says = clip.cues.filter((c) => 'say' in c).sort((a, b) => a.at - b.at)
  if (says.length !== 3) errors.push(`唸了 ${says.length} 句，應該是「字、字、語詞」三句`)
  else {
    if (says[0].say !== clip.char || says[1].say !== clip.char) errors.push(`前兩句要唸「${clip.char}」，現在是「${says[0].say}」「${says[1].say}」`)
    if (!says[2].say.includes(clip.char) || says[2].say === clip.char) errors.push(`第三句「${says[2].say}」要是含「${clip.char}」的語詞`)
    const poly = [...says[2].say].filter((c) => c !== clip.char && POLYPHONIC.has(c))
    if (poly.length) errors.push(`語詞「${says[2].say}」裡的「${poly.join('、')}」是多音字，系統朗讀可能唸錯，換一個詞`)
    if (says[0].at < 0.6 || says[0].at > 2.6) warnings.push(`第一聲在 ${says[0].at}s，建議 1–2s 之間`)
    for (let i = 1; i < 3; i++) if (says[i].at - says[i - 1].at < 0.9) warnings.push(`第 ${i} 和第 ${i + 1} 句只隔 ${(says[i].at - says[i - 1].at).toFixed(2)}s，會被打斷`)
  }

  // 筆畫：每一筆剛好出現一次
  const strokeFile = join(root, 'public/strokes', `${clip.char}.json`)
  const total = JSON.parse(readFileSync(strokeFile, 'utf8')).strokes.length
  const used = clip.builds.flatMap((b) => b.strokes)
  const missing = [...Array(total).keys()].filter((i) => !used.includes(i))
  const dup = used.filter((s, i) => used.indexOf(s) !== i)
  const out = used.filter((s) => s < 0 || s >= total)
  if (missing.length) errors.push(`筆畫沒用到：${missing.join(', ')}（共 ${total} 劃）`)
  if (dup.length) errors.push(`筆畫重複：${[...new Set(dup)].join(', ')}`)
  if (out.length) errors.push(`沒有這幾筆：${out.join(', ')}`)

  // 引用的角色要存在
  for (const m of clip.moves) if (!ids.has(m.actor)) errors.push(`moves 用了不存在的角色「${m.actor}」（${m.at}s）`)
  for (const f of clip.fx ?? []) {
    if (f.actor && !ids.has(f.actor)) errors.push(`fx 用了不存在的角色「${f.actor}」（${f.at}s）`)
    if (f.target && !ids.has(f.target)) errors.push(`fx 的 target「${f.target}」不存在（${f.at}s）`)
  }
  for (const b of clip.builds) if (typeof b.from === 'string' && !ids.has(b.from)) errors.push(`builds 從不存在的角色「${b.from}」飛出來`)

  // 時間
  const times = [...clip.moves.map((m) => m.at), ...clip.cues.map((c) => c.at), ...clip.builds.map((b) => b.at + b.dur), ...(clip.fx ?? []).map((f) => f.at)]
  const late = times.filter((t) => t > end)
  if (late.length) errors.push(`有 ${late.length} 個時間點超過影片長度 ${end}s`)
  if (!clip.meta) warnings.push('沒有 meta（主題、卡司、笑點），之後挑字時沒辦法避開重複')

  // 國字完成後，角色不能擋住字的中間
  const done = Math.max(...clip.builds.map((b) => b.at + b.dur)) + 0.2
  const core = { x0: GLYPH.x + 6, x1: GLYPH.x + GLYPH.size - 6, y0: GLYPH.y + 6, y1: GLYPH.y + GLYPH.size - 8 }
  const blocking = new Map()
  for (let t = done; t <= end; t += 0.1) {
    for (const a of actorsAt(clip, t)) {
      if (!a.visible || a.o < 0.3) continue
      const half = a.size * a.s * 0.4
      if (a.x + half > core.x0 && a.x - half < core.x1 && a.y + half > core.y0 && a.y - half < core.y1) {
        if (!blocking.has(a.id)) blocking.set(a.id, [t, t])
        blocking.get(a.id)[1] = t
      }
    }
  }
  for (const [id, [from, to]] of blocking) {
    if (to - from >= 0.25) warnings.push(`國字完成後「${id}」擋住字 ${from.toFixed(1)}–${to.toFixed(1)}s`)
  }

  // 效果跑出畫面（被切掉）
  const cut = new Set()
  for (let t = 0; t <= end; t += 0.1) {
    for (const f of fxAt(clip, t)) {
      if (!f.emoji || f.o < 0.4) continue
      const r = (f.bubble ? 7 : f.size / 2) * f.s
      if (f.x - r < -1 || f.x + r > 161 || f.y - r < -1) cut.add(`${f.emoji}@${t.toFixed(1)}s`)
    }
  }
  if (cut.size) warnings.push(`效果被畫面切掉：${[...cut].slice(0, 4).join('、')}${cut.size > 4 ? '…' : ''}`)
  void buildTiming
  return { errors, warnings }
}
