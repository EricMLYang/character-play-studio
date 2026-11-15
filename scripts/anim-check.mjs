// 檢查動畫劇本有沒有常見錯誤（char-animation skill 寫完劇本後跑）：
//
//   npm run anim:check            # 檢查全部
//   npm run anim:check -- 果 雷   # 只檢查這幾個字
//
// 錯誤（exit 1）：唸字不是「字、字、語詞」、筆畫漏掉或重複、引用不存在的角色或主角姿勢、時間超出影片長度、
//   國字拼好不到 0.8 秒就 park（讓位）、park 之後結尾 pulse 前沒有 home。
// 警告：唸字會被下一句打斷（有音檔就用真實長度算）、國字完成後有角色擋住字或被鏡頭切掉（照國字當下的位置與大小）、效果跑出畫面、沒有 meta。
// 只檢查正式劇本 src/anim/clips/；src/anim/clips-old/ 的舊版只給試播頁比較用，不檢查。
//
// v2 片型（劇本寫 format: 2，docs/clip-v2-plan.md）換一套唸字與結構的規則（錯誤）：
//   唸的順序是「字、字、語詞、這是什麼字？、字」（字至少 3 次）、問句唸完到回答之間至少安靜 1.5 秒（不能有任何聲音）、
//   最後 1 秒只有國字（拼好、在正中央、沒有效果、畫面上看不到任何角色與道具、不在 ask 裡）、meta.gags 只有 1 條（主軸笑點，回馬槍寫在同一條）、
//   卡司至少一個固定明星（src/anim/heroes/ 底下有 <id>.cut.json 的主角：pig／raccoon／mouse／sheriff／yang／rex／bunny／bot）、片長 12～15 秒。
//   擋字、出界、鏡頭切字、會被打斷照舊；空字框階段還沒填的部分角色經過不算擋字，但已經填上去的筆畫被角色擋住 0.3 秒以上會提醒。
//   v2 的字從頭到尾都在：任何時刻（含空字框階段）國字外框被鏡頭切到超過 1 單位就提醒，印出秒數。
import { createServer } from 'vite'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
// 唸字音檔的長度（npm run voice 做出來的）；沒有就退回「至少隔 0.9 秒」的估計
const VOICE = (() => { try { return JSON.parse(readFileSync(join(root, 'public/voice/index.json'), 'utf8')).items } catch { return null } })()
const voiceDur = (text) => VOICE?.[text]?.dur
// 常見多音字：語詞裡除了目標字以外不能有這些（系統朗讀會唸錯）。發現新的就加進來。
const POLYPHONIC = new Set([...'長行樂重了得著數還都好為參落降度調傳種模地的乾色匙紅綠背空和看要會少中當差把只便覺分省'])
const only = process.argv.slice(2).join('').replace(/\s/g, '')
// v2 的問句與固定明星
const { FIXED_LINES } = await import('../shared/voice-lines.mjs')
const ASK = FIXED_LINES.clipAsk
// 固定明星＝有綠幕姿勢表設定（<id>.cut.json）的主角；新明星加了 .cut.json 就自動算進來
const STARS = readdirSync(join(root, 'src/anim/heroes')).filter((f) => f.endsWith('.cut.json')).map((f) => f.slice(0, -'.cut.json'.length)).sort()

const server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom' })
let failed = false
try {
  const { loadAllClips } = await server.ssrLoadModule('/src/anim/clips/index.ts')
  const CLIPS = await loadAllClips()
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

function check(clip, engine) {
  const { actorsAt, fxAt, buildTiming, viewAt, glyphCore, glyphPlaceAt, glyphDoneAt } = engine
  const errors = [], warnings = []
  const ids = new Set(clip.actors.map((a) => a.id))
  const end = clip.duration
  const v2 = clip.format === 2

  // 唸字：v1 是「字、字、語詞」；v2 另外檢查（checkV2）
  const says = clip.cues.filter((c) => 'say' in c).sort((a, b) => a.at - b.at)
  if (v2) checkV2(clip, engine, says, errors, warnings)
  else if (says.length !== 3) errors.push(`唸了 ${says.length} 句，應該是「字、字、語詞」三句`)
  else {
    if (says[0].say !== clip.char || says[1].say !== clip.char) errors.push(`前兩句要唸「${clip.char}」，現在是「${says[0].say}」「${says[1].say}」`)
    if (!says[2].say.includes(clip.char) || says[2].say === clip.char) errors.push(`第三句「${says[2].say}」要是含「${clip.char}」的語詞`)
    const poly = [...says[2].say].filter((c) => c !== clip.char && POLYPHONIC.has(c))
    if (poly.length) errors.push(`語詞「${says[2].say}」裡的「${poly.join('、')}」是多音字，系統朗讀可能唸錯，換一個詞`)
    if (says[0].at < 0.6 || says[0].at > 2.6) warnings.push(`第一聲在 ${says[0].at}s，建議 1–2s 之間`)
    for (let i = 1; i < 3; i++) {
      const dur = voiceDur(says[i - 1].say)
      const gap = says[i].at - says[i - 1].at
      if (dur !== undefined ? gap < dur + 0.15 : gap < 0.9) warnings.push(`第 ${i} 句「${says[i - 1].say}」${dur !== undefined ? `要唸 ${dur}s` : ''}，第 ${i + 1} 句 ${gap.toFixed(2)}s 後就來，會被打斷`)
    }
    const lastDur = voiceDur(says[2].say)
    if (lastDur !== undefined && says[2].at + lastDur > end) warnings.push(`語詞「${says[2].say}」要唸 ${lastDur}s，${says[2].at}s 開始會唸到影片結束之後`)
    for (const c of says) if (VOICE && voiceDur(c.say) === undefined) warnings.push(`「${c.say}」還沒有音檔（跑 npm run voice，或 dev server 開著就會自動補）`)
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
  for (const c of clip.camera ?? []) if ('actor' in c && c.actor && !ids.has(c.actor)) errors.push(`camera 跟拍不存在的角色「${c.actor}」（${c.at}s）`)
  // 主角圖要真的存在（npm run hero 產生）
  const heroes = [...clip.actors.map((a) => a.emoji), ...clip.moves.map((m) => m.emoji ?? '')].filter((e) => e.startsWith('hero:'))
  for (const h of new Set(heroes)) if (!existsSync(join(root, 'public/hero', `${h.slice(5)}.png`))) errors.push(`沒有主角圖「${h}」（public/hero/${h.slice(5)}.png；跑 npm run hero）`)
  // 道具圖（prop:<名字>）也要真的存在、量過範圍（npm run prop:cut 產生）；效果裡的 emoji 也可以是道具圖
  const props = [...clip.actors.map((a) => a.emoji), ...clip.moves.map((m) => m.emoji ?? ''), ...(clip.fx ?? []).map((f) => f.emoji ?? '')].filter((e) => e.startsWith('prop:'))
  for (const p of new Set(props)) {
    const name = p.slice(5)
    if (!existsSync(join(root, 'public/props', `${name}.png`)) || !engine.PROP_BOX[name]) errors.push(`沒有道具圖「${p}」（public/props/${name}.png；沒有就列出來請生圖模型畫，見 assets/prop-sheets/README.md）`)
  }

  // 時間
  const times = [...clip.moves.map((m) => m.at), ...clip.cues.map((c) => c.at), ...clip.builds.map((b) => b.at + b.dur), ...(clip.fx ?? []).map((f) => f.at)]
  const late = times.filter((t) => t > end)
  if (late.length) errors.push(`有 ${late.length} 個時間點超過影片長度 ${end}s`)
  if (!clip.meta) warnings.push('沒有 meta（主題、卡司、笑點），之後挑字時沒辦法避開重複')

  // 國字讓位（park／home）：拼好後至少停 0.8 秒才 park，結尾 pulse 時要已經回到正中央原本的大小
  const built = glyphDoneAt(clip)
  const glyphOps = (clip.glyph ?? []).filter((g) => g.do === 'park' || g.do === 'home').sort((a, b) => a.at - b.at)
  // v2 第一筆飛進來之前的 park 是「把空字框搬到別的地方」（例：「頭」東西從畫面中間往下掉，字框搬到左上），不是讓位
  const firstBuild = Math.min(...clip.builds.map((b) => b.at))
  for (const g of glyphOps) {
    if (v2 && g.do === 'park' && g.at < firstBuild) continue
    if (g.do === 'park' && g.at < built + 0.8) errors.push(`國字 ${built.toFixed(2)}s 才拼好，${g.at}s 就 park：至少停 0.8 秒讓小孩看清楚整個字`)
  }
  if (glyphOps.length || v2) {
    const finalPulse = (clip.glyph ?? []).filter((g) => g.do === 'pulse' && g.at >= built).sort((a, b) => b.at - a.at)[0]
    const tEnd = finalPulse ? finalPulse.at : end - 0.85
    const home = glyphPlaceAt(clip, tEnd)
    if (Math.abs(home.k - 1) > 0.01 || Math.abs(home.x - 80) > 0.5 || Math.abs(home.y - 45) > 0.5) {
      errors.push(`國字${v2 ? '（v2 一開始就在上方）' : ' park 之後'}，${finalPulse ? `結尾 pulse（${tEnd}s）` : `結尾掃光（${tEnd}s）`}前沒有 home 回到正中央`)
    }
  }

  // 國字完成後，角色不能擋住字的中間（照國字當下的位置與大小算：讓位後變小、在上方）
  const done = Math.max(...clip.builds.map((b) => b.at + b.dur)) + 0.2
  const blocking = new Map()
  for (let t = done; t <= end; t += 0.1) {
    const core = glyphCore(clip, t)
    // 問他（ask）的時候國字畫在黑幕上面，只有也畫在上面的角色（top、keep）擋得到
    const ask = engine.askAt(clip, t) > 0 ? engine.askFxAt(clip, t) : null
    for (const a of actorsAt(clip, t)) {
      if (!a.visible || a.o < 0.3) continue
      if (ask && !a.top && !(ask.keep ?? []).includes(a.id)) continue
      const b = engine.bodyBox(a, 0.4)
      if (b.x1 > core.x0 && b.x0 < core.x1 && b.y1 > core.y0 && b.y0 < core.y1) {
        if (!blocking.has(a.id)) blocking.set(a.id, [t, t])
        blocking.get(a.id)[1] = t
      }
    }
  }
  for (const [id, [from, to]] of blocking) {
    if (to - from >= 0.25) warnings.push(`國字完成後「${id}」擋住字 ${from.toFixed(1)}–${to.toFixed(1)}s`)
  }
  // 國字完成後鏡頭不能把字推出畫面（邊緣擦到幾個單位的 punch 不算）
  let cutGlyph = null
  for (let t = done; t <= end; t += 0.1) {
    const v = viewAt(clip, t)
    const core = glyphCore(clip, t)
    // 國字縮小時，能被切掉的邊也跟著縮小
    const slack = 12 * glyphPlaceAt(clip, t).k
    if (v.x0 > core.x0 + slack || v.x1 < core.x1 - slack || v.y0 > core.y0 + slack || v.y1 < core.y1 - slack) { cutGlyph ??= [t, t]; cutGlyph[1] = t }
  }
  if (cutGlyph) warnings.push(`國字完成後鏡頭把字切掉了 ${cutGlyph[0].toFixed(1)}–${cutGlyph[1].toFixed(1)}s（zoom／follow 推太近或中心偏掉）`)

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

/** v2 片型的唸字與結構規則（docs/clip-v2-plan.md「規則」標 ✔ 的幾條） */
function checkV2(clip, engine, says, errors, warnings) {
  const { actorsAt, fxAt, glyphCore, glyphPlaceAt, glyphDoneAt, askAt } = engine
  const end = clip.duration
  const ch = clip.char
  const words = says.filter((c) => c.say !== ch && c.say !== ASK)
  const word = words[0]?.say
  // 唸的順序：字、字、語詞、這是什麼字？、字（字可以多唸，但順序不能亂）
  const seq = says.map((c) => (c.say === ch ? '字' : c.say === ASK ? '問' : '詞')).join('')
  if (!/^字字+詞字*問字+$/.test(seq) || words.length !== 1) {
    errors.push(`唸的順序要是「${ch}、${ch}、語詞、${ASK}、${ch}」，現在是「${says.map((c) => c.say).join('、')}」`)
  }
  if (says.filter((c) => c.say === ch).length < 3) errors.push(`「${ch}」至少要唸 3 次`)
  if (word) {
    if (!word.includes(ch)) errors.push(`語詞「${word}」要含「${ch}」`)
    const poly = [...word].filter((c) => c !== ch && POLYPHONIC.has(c))
    if (poly.length) errors.push(`語詞「${word}」裡的「${poly.join('、')}」是多音字，系統朗讀可能唸錯，換一個詞`)
  }
  if (says[0] && (says[0].at < 0.3 || says[0].at > 1.6)) warnings.push(`第一聲在 ${says[0].at}s，v2 要在 0–1.5s（明星抬頭看字框的時候）`)
  // 每一句都要唸完才接下一句
  for (let i = 1; i < says.length; i++) {
    const dur = voiceDur(says[i - 1].say)
    const gap = says[i].at - says[i - 1].at
    if (dur !== undefined ? gap < dur + 0.15 : gap < 0.9) warnings.push(`「${says[i - 1].say}」${dur !== undefined ? `要唸 ${dur}s` : ''}，下一句 ${gap.toFixed(2)}s 後就來，會被打斷`)
  }
  const last = says.at(-1)
  if (last && voiceDur(last.say) !== undefined && last.at + voiceDur(last.say) > end) warnings.push(`「${last.say}」${last.at}s 開始會唸到影片結束之後`)
  for (const c of says) if (VOICE && voiceDur(c.say) === undefined) warnings.push(`「${c.say}」還沒有音檔（跑 npm run voice，或 dev server 開著就會自動補）`)
  // 問句唸完到回答之間：至少安靜 1.5 秒（不能有唸字也不能有音效）
  const qi = says.findIndex((c) => c.say === ASK)
  if (qi >= 0) {
    const q = says[qi]
    const qEnd = q.at + (voiceDur(ASK) ?? 1.2)
    const answer = says[qi + 1]
    if (answer) {
      if (answer.at - qEnd < 1.5) errors.push(`問句 ${q.at}s 開始、${qEnd.toFixed(2)}s 唸完，回答 ${answer.at}s 就來：中間要安靜至少 1.5 秒（現在 ${(answer.at - qEnd).toFixed(2)}s）`)
      const noisy = clip.cues.filter((c) => c.at > q.at && c.at < answer.at && c !== answer && !('say' in c && c.say === ASK))
      if (noisy.length) errors.push(`問句到回答之間要安靜，現在有聲音：${noisy.map((c) => `${'sfx' in c ? c.sfx : c.say}@${c.at}s`).join('、')}`)
    }
    // 問句要在 ask（畫面暗下來只剩國字）裡面
    if (askAt(clip, q.at + 0.3) < 0.9) errors.push(`問句 ${q.at}s 時畫面沒有暗下來：glyph 要有 { at, dur, do: 'ask' } 蓋住問句`)
  }
  // 結尾至少 1 秒只有國字：拼好、在正中央、沒有效果、沒有角色擋字、不在 ask 裡
  const tail = []
  if (glyphDoneAt(clip) > end - 1) tail.push(`國字 ${glyphDoneAt(clip).toFixed(2)}s 才拼好`)
  for (let t = end - 1; t <= end + 1e-6; t += 0.1) {
    const at = `${t.toFixed(1)}s`
    const g = glyphPlaceAt(clip, t)
    if (Math.abs(g.k - 1) > 0.01 || Math.abs(g.x - 80) > 0.5 || Math.abs(g.y - 45) > 0.5) { tail.push(`${at} 國字不在正中央`); break }
    if (askAt(clip, t) > 0.02) { tail.push(`${at} 還在 ask（畫面暗著）`); break }
    const fx = fxAt(clip, t).filter((f) => f.o > 0.05)
    if (fx.length) { tail.push(`${at} 還有效果 ${fx.map((f) => f.emoji ?? (f.line ? 'line' : f.bolt ? 'zap' : '效果')).slice(0, 3).join('')}`); break }
    // 研究的重點是把圖拿掉、只留字：角色與道具都要退場（畫面外、消失、透明都算）
    const seen = actorsAt(clip, t).find((a) => {
      const b = engine.bodyBox(a, 0.45)
      return a.visible && a.o > 0.05 && a.s > 0.05 && b.x1 > 0 && b.x0 < 160 && b.y1 > 0 && b.y0 < 90
    })
    if (seen) { tail.push(`${at}「${seen.id}」還在畫面上`); break }
  }
  if (tail.length) errors.push(`結尾最後 1 秒要只有國字：${tail.join('；')}`)
  // 笑點：只有一個主軸笑點（同一個動作／原因／音效做四次，第四次就是回馬槍，寫在同一條裡）
  if ((clip.meta?.gags.length ?? 0) !== 1) errors.push(`meta.gags 有 ${clip.meta?.gags.length ?? 0} 條，v2 只寫 1 條主軸笑點（回馬槍是它的第四次，寫在同一條裡）`)
  // 固定明星
  const emojis = [...clip.actors.map((a) => a.emoji), ...clip.moves.map((m) => m.emoji ?? '')]
  if (!emojis.some((e) => STARS.some((s) => e.startsWith(`hero:${s}/`)))) errors.push(`卡司裡要有固定明星（${STARS.join('／')}）`)
  // 片長
  if (end < 12 || end > 15) errors.push(`片長 ${end}s，v2 要 12～15 秒`)
  // 角色、道具不要太多（規則沒有標 ✔，只提醒）
  if (clip.actors.length > 5) warnings.push(`有 ${clip.actors.length} 個角色＋道具，v2 是角色最多 3 個、道具最多 2 個`)
  // 空字框階段：還沒填的部分角色經過不算（筆畫本來就是從角色身上飛上去的）；
  // 已經填上去的筆畫被角色擋住 0.3 秒以上要提醒（等於把小孩已經看到的部件遮掉）
  const done = glyphDoneAt(clip)
  const medians = JSON.parse(readFileSync(join(root, 'public/strokes', `${ch}.json`), 'utf8')).medians ?? []
  const landed = new Map(engine.landings(clip).map((k) => [k.stroke, k.at]))
  const span = new Map()
  const report = (id, sp) => { if (sp.to - sp.from >= 0.3) warnings.push(`空字框階段「${id}」擋住已經填上去的部件 ${sp.from.toFixed(1)}–${sp.to.toFixed(1)}s`) }
  for (let t = 0; t < done; t += 0.1) {
    const g = glyphPlaceAt(clip, t)
    const pts = []
    for (const [i, at] of landed) {
      if (at > t) continue
      for (const [px, py] of medians[i] ?? []) {
        const st = engine.toStage(px, py)
        pts.push({ x: g.x + (st.x - 80) * g.k, y: g.y + (st.y - 45) * g.k })
      }
    }
    for (const a of actorsAt(clip, t)) {
      const b = engine.bodyBox(a, 0.4)
      const on = a.visible && a.o >= 0.3 && pts.some((q) => q.x > b.x0 && q.x < b.x1 && q.y > b.y0 && q.y < b.y1)
      const sp = span.get(a.id)
      if (on) { if (!sp || sp.closed) span.set(a.id, { from: t, to: t }); else sp.to = t }
      else if (sp && !sp.closed) { sp.closed = true; report(a.id, sp) }
    }
  }
  for (const [id, sp] of span) if (!sp.closed) report(id, sp)
  // 字從頭到尾都在：任何時刻國字當下的整個外框都要在畫面裡（震動可以擦出去 1 單位，再多就報）。
  // 引擎會把劇本的 punch／zoom／follow 收回來（clip.ts 的 keepGlyphInView），這條是防引擎或之後的改動漏掉
  const cuts = []
  for (let i = 0; i * 0.05 <= end + 1e-9; i++) {
    const t = i * 0.05
    const v = engine.viewAt(clip, t), g = engine.glyphBoxAt(clip, t)
    const over = Math.max(v.x0 - g.x0, g.x1 - v.x1, v.y0 - g.y0, g.y1 - v.y1)
    if (over <= 1.05) continue
    const last = cuts.at(-1)
    if (last && t - last.to < 0.06) { last.to = t; last.max = Math.max(last.max, over) } else cuts.push({ from: t, to: t, max: over })
  }
  if (cuts.length) warnings.push(`鏡頭把國字的外框切掉了：${cuts.map((c) => `${c.from.toFixed(2)}${c.to > c.from ? `–${c.to.toFixed(2)}` : ''}s（${c.max.toFixed(1)}）`).join('、')}`)
}
