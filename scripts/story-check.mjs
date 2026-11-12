// 檢查故事屋的場景（src/story/scenes/<id>.ts）有沒有常見錯誤：
//
//   npm run story:check            # 全部的故事
//   npm run story:check -- cold    # 只看這一本
//
// 錯誤（exit 1）：少了哪一段戲、唸的不是那一句、劇本太短句子唸不完、用了不存在的角色或主角圖、時間超出劇本長度。
// 注意：兩段戲接不起來（上一段結尾跟下一段開頭，同一個角色的位置或在不在場對不上——換頁時他會看到角色瞬間移動）。
// tests/stories.test.mjs 用同一個 sceneProblems，所以錯誤也會讓 npm test 失敗。
import fs from 'node:fs'
import path from 'node:path'
import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// 前端模組用不帶副檔名的相對路徑（給 Vite 用），Node 找不到時補上 .ts 再試
let hooked = false
function hook() {
  if (hooked) return
  hooked = true
  registerHooks({
    resolve(specifier, context, next) {
      try { return next(specifier, context) } catch (error) {
        if (specifier.startsWith('.') && !/\.\w+$/.test(specifier)) return next(`${specifier}.ts`, context)
        throw error
      }
    },
  })
}

const voiceIndex = () => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'public/voice/index.json'), 'utf8')).items } catch { return {} } }

/** 一本故事的場景檔；沒有檔回 undefined */
export async function loadStoryScenes(id) {
  hook()
  const file = path.join(ROOT, 'src/story/scenes', `${id}.ts`)
  if (!fs.existsSync(file)) return undefined
  return (await import(pathToFileURL(file).href)).default
}

/**
 * 一本故事的場景有什麼問題。回 { errors, warnings }，每一條都帶「故事/戲」開頭。
 */
export async function sceneProblems(story, scenes) {
  hook()
  const { isChoice, beatOf, beatsOf, advances } = await import('../shared/stories.mjs')
  const { POSES } = await import('../src/play/poses.ts')
  const { baseActorsAt } = await import('../src/anim/clip.ts')
  const voice = voiceIndex()
  const errors = [], warnings = []
  const lines = new Map(story.pages.flatMap((page) => (isChoice(page) ? page.options.map((o) => [beatOf(page, o), o.text]) : [[beatOf(page), page.text]])))
  for (const extra of Object.keys(scenes).filter((b) => !lines.has(b))) errors.push(`${story.id}/${extra}：故事裡沒有這一段（多的戲）`)
  for (const beat of beatsOf(story)) {
    const clip = scenes[beat]
    const where = `${story.id}/${beat}`
    if (!clip) { errors.push(`${where}：沒有劇本`); continue }
    if (clip.char !== '' || clip.builds.length) errors.push(`${where}：要用 scene() 包起來（沒有國字）`)
    const says = clip.cues.filter((c) => 'say' in c)
    if (says.length !== 1) errors.push(`${where}：要剛好一句 say，現在 ${says.length} 句`)
    else {
      if (says[0].say !== lines.get(beat)) errors.push(`${where}：唸的是「${says[0].say}」，要跟故事那一句「${lines.get(beat)}」一字不差`)
      const dur = voice[says[0].say]?.dur ?? 0.28 * [...says[0].say].length + 0.5
      if (says[0].at < 0.2) errors.push(`${where}：那句話 ${says[0].at}s 就唸，太早（一換頁他還沒看到畫面）`)
      if (clip.duration < says[0].at + dur + 0.5) errors.push(`${where}：太短。句子 ${says[0].at}s 開始、要唸 ${dur.toFixed(2)}s，劇本只有 ${clip.duration}s（唸完至少再留 0.5 秒）`)
    }
    if (clip.duration > 8) errors.push(`${where}：太長（${clip.duration}s），一頁最多 8 秒`)
    const ids = new Set(clip.actors.map((a) => a.id))
    if (ids.size !== clip.actors.length) errors.push(`${where}：角色 id 重複`)
    for (const m of clip.moves) {
      if (!ids.has(m.actor)) errors.push(`${where}：動作用了不存在的角色 ${m.actor}`)
      if (!(m.at >= 0 && m.at <= clip.duration)) errors.push(`${where}：動作的時間 ${m.at} 超出劇本長度`)
    }
    for (const f of clip.fx ?? []) {
      if (f.actor && !ids.has(f.actor)) errors.push(`${where}：效果用了不存在的角色 ${f.actor}`)
      if (f.target && !ids.has(f.target)) errors.push(`${where}：效果打到不存在的角色 ${f.target}`)
      if (!(f.at >= 0 && f.at <= clip.duration)) errors.push(`${where}：效果的時間 ${f.at} 超出劇本長度`)
    }
    for (const c of clip.camera ?? []) if ('actor' in c && c.actor && !ids.has(c.actor)) errors.push(`${where}：鏡頭跟著不存在的角色 ${c.actor}`)
    // 白光閃太亮對小孩的眼睛不好（識字動畫同一條規矩：不低於 -0.5）
    for (const l of clip.lights ?? []) if (l.level < -0.5) errors.push(`${where}：白光 ${l.level} 太亮，最多 -0.5`)
    for (const c of clip.cues) if (!(c.at >= 0 && c.at <= clip.duration)) errors.push(`${where}：聲音的時間 ${c.at} 超出劇本長度`)
    for (const e of [...clip.actors.map((a) => a.emoji), ...clip.moves.map((m) => m.emoji).filter(Boolean)]) {
      if (e.startsWith('hero:')) {
        const [hero, pose] = e.slice(5).split('/')
        if (!POSES[hero]?.includes(pose)) errors.push(`${where}：沒有這張主角圖 ${e}`)
      } else if (/[🧒👦👧👶]/u.test(e)) errors.push(`${where}：不能用兒童 emoji（${e}）`)
    }
  }

  // 接戲：上一段的結尾 → 下一段的開頭，同一個 id 的角色要在同一個地方、同樣在不在場
  const joins = []
  let before = [] // 走到這一頁之前，舞台上可能停著哪幾段的最後一格
  for (const page of story.pages) {
    if (!isChoice(page)) {
      for (const b of before) joins.push([b, beatOf(page)])
      before = [beatOf(page)]
      continue
    }
    const stay = page.options.filter((o) => !advances(page, o)).map((o) => beatOf(page, o))
    const go = page.options.filter((o) => advances(page, o)).map((o) => beatOf(page, o))
    // 每個選項都可能接在「選之前那一段」或任何一個「演完回來再選」的結果後面；all 的頁每個選項互相都可能接
    const from = [...before, ...stay, ...(page.all ? go : [])]
    for (const o of page.options) for (const b of from) if (b !== beatOf(page, o)) joins.push([b, beatOf(page, o)])
    before = go
  }
  for (const [a, b] of joins) {
    const ca = scenes[a], cb = scenes[b]
    if (!ca || !cb) continue
    const end = new Map(baseActorsAt(ca, ca.duration).map((s) => [s.id, s]))
    const start = new Map(baseActorsAt(cb, 0).map((s) => [s.id, s]))
    for (const [id, s] of start) {
      const e = end.get(id)
      const here = s.visible && s.o > 0.3, there = Boolean(e) && e.visible && e.o > 0.3
      if (here && !there) warnings.push(`${story.id}：${a} → ${b}，「${id}」上一段結尾不在場，這一段一開始就站在那裡（憑空出現）`)
      else if (here && there && (Math.abs(s.x - e.x) > 3 || Math.abs(s.y - e.y) > 3)) warnings.push(`${story.id}：${a} → ${b}，「${id}」從 (${e.x.toFixed(0)}, ${e.y.toFixed(0)}) 跳到 (${s.x.toFixed(0)}, ${s.y.toFixed(0)})`)
      else if (here && there && Math.abs(s.size * s.s - e.size * e.s) > 3) warnings.push(`${story.id}：${a} → ${b}，「${id}」大小從 ${(e.size * e.s).toFixed(0)} 變成 ${(s.size * s.s).toFixed(0)}`)
    }
    for (const [id, e] of end) {
      if (!(e.visible && e.o > 0.3) || e.x < -5 || e.x > 165 || e.y < -10 || e.y > 95) continue
      const s = start.get(id)
      if (!s || !(s.visible && s.o > 0.3)) warnings.push(`${story.id}：${a} → ${b}，「${id}」上一段結尾還在場，這一段一開始就不見了（憑空消失）`)
    }
  }
  return { errors, warnings: [...new Set(warnings)] }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { STORIES } = await import('../shared/stories.mjs')
  const only = process.argv.slice(2)
  const unknown = only.filter((id) => !STORIES.some((s) => s.id === id))
  if (unknown.length) { console.error(`沒有這本故事：${unknown.join('、')}（有：${STORIES.map((s) => s.id).join('、')}）`); process.exit(1) }
  let failed = false
  for (const story of STORIES.filter((s) => !only.length || only.includes(s.id))) {
    const scenes = await loadStoryScenes(story.id)
    const { errors, warnings } = scenes ? await sceneProblems(story, scenes) : { errors: [`${story.id}：還沒有場景檔 src/story/scenes/${story.id}.ts`], warnings: [] }
    if (errors.length) failed = true
    console.log(`${errors.length ? '✗' : warnings.length ? '△' : '✓'} ${story.id}「${story.title}」${errors.length + warnings.length ? '' : '  沒問題'}`)
    errors.forEach((e) => console.log(`    錯誤：${e}`))
    warnings.forEach((w) => console.log(`    注意：${w}`))
  }
  process.exit(failed ? 1 : 0)
}
