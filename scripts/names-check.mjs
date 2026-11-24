// 檢查主角館的動畫（src/names/scenes/<id>.ts）有沒有常見錯誤：
//
//   npm run names:check            # 全部有動畫的名字（沒有動畫的列成一行，不算錯）
//   npm run names:check -- dino    # 只看這一支
//
// 錯誤（exit 1）：檔名對不到名字、唸的不是那個名字（要剛好一句 say、一字不差）、太早唸、劇本長度不在 7～12 秒或唸不完、
// 用了不存在的角色或主角圖、時間超出劇本長度、白光太亮、用了兒童 emoji、用了沒有 3D 圖的 emoji、檔頭沒寫「演的是本尊：」或「演的是字面意思：」、貼紙沒有圖、parts 寫錯（接起來不是名字、圖沒有 3D 圖也不是有圖的 prop:、word 沒包含那幾個字）。
// 注意：效果不夠（品質標準：鏡頭推近或 punch、shake、粒子、光線或背景變化、5 個以上音效、至少兩個角色）。
// tests/names.test.mjs 用同一個 nameSceneProblems，所以錯誤也會讓 npm test 失敗。
import fs from 'node:fs'
import path from 'node:path'
import { registerHooks } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'src/names/scenes')
export const MIN_SEC = 7
export const MAX_SEC = 12

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
const code3d = (e) => [...e.replace(/️/g, '')].map((c) => c.codePointAt(0).toString(16)).join('-')
const has3d = (e) => fs.existsSync(path.join(ROOT, 'public/emoji3d', `${code3d(e)}.png`))
/**
 * 名字的貼紙與 parts 的圖畫不畫得出來：'prop:<名字>' 要有 public/props/<名字>.png（專門畫的圖，公版人物用），
 * 其他要有 3D 圖（public/emoji3d/）。孩子端畫的時候走同一套（src/play/ui.tsx 的 emojiArt）。tests/names.test.mjs 也用它。
 */
export const nameArtOk = (e) => typeof e === 'string' && e !== '' &&
  (e.startsWith('prop:') ? fs.existsSync(path.join(ROOT, 'public/props', `${e.slice(5)}.png`)) : has3d(e))

/** 有動畫檔的名字 id */
export const sceneIds = () => fs.readdirSync(DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts').map((f) => f.slice(0, -3))

/** 一個名字的動畫；沒有檔回 undefined */
export async function loadNameClip(id) {
  hook()
  const file = path.join(DIR, `${id}.ts`)
  if (!fs.existsSync(file)) return undefined
  return (await import(pathToFileURL(file).href)).default
}

/** 一支動畫有什麼問題。回 { errors, warnings } */
export async function nameSceneProblems(name, clip) {
  hook()
  const { POSES } = await import('../src/play/poses.ts')
  const voice = voiceIndex()
  const errors = [], warnings = []
  const where = name.id
  const src = fs.readFileSync(path.join(DIR, `${name.id}.ts`), 'utf8')
  // 公版人物（孫悟空、虎姑婆）演本尊的故事、通用的詞（卡車、恐龍）演字面意思：兩種都要寫明，寫的人才會先想過所有權規則
  if (!/演的是(字面意思|本尊)：/.test(src.split('\n').slice(0, 6).join('\n'))) errors.push(`${where}：檔頭要有一行註解「演的是本尊：……」或「演的是字面意思：……」（所有權規則）`)
  if (clip.char !== '' || clip.builds.length) errors.push(`${where}：要用 scene() 包起來（沒有國字）`)
  const says = clip.cues.filter((c) => 'say' in c)
  if (says.length !== 1) errors.push(`${where}：要剛好一句 say（名字本身），現在 ${says.length} 句`)
  else {
    if (says[0].say !== name.text) errors.push(`${where}：唸的是「${says[0].say}」，要跟名字「${name.text}」一字不差`)
    const dur = voice[says[0].say]?.dur ?? 0.28 * [...says[0].say].length + 0.5
    if (says[0].at < 0.2) errors.push(`${where}：名字 ${says[0].at}s 就唸，太早`)
    if (clip.duration < says[0].at + dur + 0.5) errors.push(`${where}：太短。名字 ${says[0].at}s 開始、要唸 ${dur.toFixed(2)}s，劇本只有 ${clip.duration}s（唸完至少再留 0.5 秒）`)
  }
  if (clip.duration < MIN_SEC || clip.duration > MAX_SEC) errors.push(`${where}：長度 ${clip.duration}s，要 ${MIN_SEC}～${MAX_SEC} 秒`)
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
  for (const l of clip.lights ?? []) if (l.level < -0.5) errors.push(`${where}：白光 ${l.level} 太亮，最多 -0.5`)
  for (const c of clip.cues) if (!(c.at >= 0 && c.at <= clip.duration)) errors.push(`${where}：聲音的時間 ${c.at} 超出劇本長度`)
  const emojis = [...clip.actors.map((a) => a.emoji), ...clip.moves.map((m) => m.emoji).filter(Boolean), ...(clip.fx ?? []).map((f) => f.emoji).filter(Boolean)]
  for (const e of new Set(emojis)) {
    if (e.startsWith('hero:')) {
      const [hero, pose] = e.slice(5).split('/')
      if (!POSES[hero]?.includes(pose)) errors.push(`${where}：沒有這張主角圖 ${e}`)
    } else if (e.startsWith('prop:')) {
      // 自製道具圖（跟 anim-check 一樣）：public/props/ 有那張圖就好
      if (!fs.existsSync(path.join(ROOT, 'public/props', `${e.slice(5)}.png`))) errors.push(`${where}：沒有道具圖 ${e}（public/props/）`)
    } else if (/[🧒👦👧👶]/u.test(e)) errors.push(`${where}：不能用兒童 emoji（${e}）`)
    else if (!has3d(e)) errors.push(`${where}：${e} 沒有 3D 圖（public/emoji3d/），換一個有的`)
  }
  if (!nameArtOk(name.emoji)) errors.push(`${where}：貼紙 ${name.emoji} 沒有圖（emoji 要有 3D 圖，prop: 要有 public/props/ 的圖）`)
  // parts（拼字時一段一段跳出來的圖、牆上的預告）：寫法在 .claude/skills/name-scenes/SKILL.md 的「parts」
  const parts = name.parts ?? []
  if (!parts.length) errors.push(`${where}：沒有 parts（名字切成幾段、每段一個圖）`)
  else if (parts.map((p) => p.chars).join('') !== name.text) errors.push(`${where}：parts 的 chars 接起來是「${parts.map((p) => p.chars).join('')}」，要剛好等於「${name.text}」`)
  for (const p of parts) {
    const han = [...(p.chars ?? '')].filter((c) => /\p{Script=Han}/u.test(c)).join('')
    if (!han) errors.push(`${where}：parts「${p.chars}」沒有要拼的國字，併到相鄰那一段`)
    if (!nameArtOk(p.emoji)) errors.push(`${where}：parts「${p.chars}」的圖 ${p.emoji ?? '（沒寫）'} 沒有圖（emoji 要有 3D 圖，prop: 要有 public/props/ 的圖）`)
    if (p.word !== undefined && !p.word.includes(han)) errors.push(`${where}：parts「${p.chars}」的 word「${p.word}」要包含「${han}」`)
  }

  // 品質標準（.claude/skills/name-scenes/SKILL.md）：缺了列成注意
  const cam = clip.camera ?? []
  if (!cam.some((c) => c.do === 'punch' || (c.do === 'zoom' && (c.amount ?? 1) > 1.05) || c.do === 'follow')) warnings.push(`${where}：沒有鏡頭推近（punch／zoom／follow）`)
  if (!cam.some((c) => c.do === 'shake')) warnings.push(`${where}：沒有 shake`)
  if (!(clip.fx ?? []).some((f) => ['burst', 'puff', 'sweat', 'dizzy', 'rain', 'stink', 'fountain', 'zzz'].includes(f.kind))) warnings.push(`${where}：沒有粒子效果（揚塵、星星、汗、煙）`)
  if (!(clip.lights ?? []).length && !clip.moves.some((m) => m.do === 'tint')) warnings.push(`${where}：沒有光線或背景變化（lights、tint）`)
  const sfx = clip.cues.filter((c) => 'sfx' in c).length
  if (sfx < 5) warnings.push(`${where}：音效只有 ${sfx} 個（至少 5 個，對上動作）`)
  if (clip.actors.length < 2) warnings.push(`${where}：只有一個角色（至少兩個角色互動）`)
  return { errors, warnings }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { NAMES, nameById } = await import('../shared/names.mjs')
  const only = process.argv.slice(2)
  const unknown = only.filter((id) => !nameById(id))
  if (unknown.length) { console.error(`沒有這個名字：${unknown.join('、')}（有：${NAMES.map((n) => n.id).join('、')}）`); process.exit(1) }
  let failed = false
  const orphan = sceneIds().filter((id) => !nameById(id))
  if (orphan.length) { failed = true; console.log(`✗ 動畫檔對不到名字：${orphan.join('、')}`) }
  const todo = []
  for (const name of NAMES.filter((n) => !only.length || only.includes(n.id))) {
    const clip = await loadNameClip(name.id)
    if (!clip) { todo.push(name.text); continue }
    const { errors, warnings } = await nameSceneProblems(name, clip)
    if (errors.length) failed = true
    console.log(`${errors.length ? '✗' : warnings.length ? '△' : '✓'} ${name.id}「${name.text}」${clip.duration}s${errors.length + warnings.length ? '' : '  沒問題'}`)
    errors.forEach((e) => console.log(`    錯誤：${e}`))
    warnings.forEach((w) => console.log(`    注意：${w}`))
  }
  if (todo.length) console.log(`還沒有動畫（牆上先不顯示）：${todo.join('、')}`)
  process.exit(failed ? 1 : 0)
}
