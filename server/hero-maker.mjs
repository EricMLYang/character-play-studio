import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fail } from './http.mjs'
import { MEDIA, ROOT } from './core.mjs'

/**
 * 角色九宮格：Studio 瀏覽所有主角的姿勢表，以及「上傳一張圖 → 做成新的固定明星」。
 *
 * 新角色的流程跟手動做的一樣，只是幫爸爸一步一步跑完（約 10～15 分鐘，Codex 一張表 1～2 分鐘）：
 *   1. 上傳的圖存在 media/hero-uploads/（不進 git：可能是家人的照片，跟 README 說的參考圖不放 repo 同一個理由）
 *   2. sheet:gen --from 上傳的圖 → A 表（順便請 Codex 寫一句「名字——長相」）
 *   3. 用剛生好的 A 表當參考，補 B～F（共用的九格清單 scripts/sheets/hero-*.txt；C 表跟豬探長一樣用放大鏡 think、抱胸 doubt）
 *   4. 寫 src/anim/heroes/<id>.cut.json、hero:cut 切成 public/hero/<id>/、登記到 src/play/custom-heroes.json
 * 只做 A 表（「先看長相」）時停在第 2 步，跟 fox、kitty、penguin 一樣是「還沒接進引擎」；之後按「補齊」接著做 3、4。
 * 有 .cut.json 的主角就是固定明星，測試要求 52 個共用姿勢一個不少，所以 A～F 沒到齊不寫 .cut.json。
 *
 * 同一時間只跑一件（Codex 一次一張）；工作狀態只放記憶體，伺服器重開就沒了（已經生好的表還在，按「補齊」就能接著做）。
 */

const SHEETS = path.join(ROOT, 'assets/hero-sheets')
const HEROES = path.join(ROOT, 'src/anim/heroes')
const PUBLIC_HERO = path.join(ROOT, 'public/hero')
export const CUSTOM_POSES = path.join(ROOT, 'src/play/custom-heroes.json')
const UPLOADS = path.join(MEDIA, 'hero-uploads')
const TAGS = ['A', 'B', 'C', 'D', 'E', 'F']

const readJSON = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback } }
/** 共用的九格姿勢名，以豬探長為準（新角色整套照抄，C 表也是放大鏡 think＋抱胸 doubt） */
const pigSheets = () => readJSON(path.join(HEROES, 'pig.cut.json'), { sheets: {} }).sheets
/** 九格清單的每一行（「格子的說明」），給沒有 .cut.json 的表當標籤 */
const cellsOf = (tag) => {
  const f = path.join(ROOT, 'scripts/sheets', `hero-${tag}.txt`)
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^\d+[.、)]\s*/, '')) : []
}

/** 所有主角：有姿勢表的（新明星、還沒接進引擎的）＋只有切好的圖的舊主角 */
export function listHeroes() {
  const pig = pigSheets()
  const files = fs.existsSync(SHEETS) ? fs.readdirSync(SHEETS).filter((f) => /^[a-z0-9]+-[A-Z]\.png$/.test(f)) : []
  const ids = new Set(files.map((f) => f.split('-')[0]))
  if (fs.existsSync(PUBLIC_HERO)) for (const d of fs.readdirSync(PUBLIC_HERO)) if (fs.statSync(path.join(PUBLIC_HERO, d)).isDirectory()) ids.add(d)
  const custom = readJSON(CUSTOM_POSES, {})
  return [...ids].sort().map((id) => {
    const cfg = readJSON(path.join(HEROES, `${id}.cut.json`), null)
    const old = readJSON(path.join(HEROES, `${id}.json`), null)
    const heroDir = path.join(PUBLIC_HERO, id)
    const poses = fs.existsSync(heroDir) ? fs.readdirSync(heroDir).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort() : []
    const sheets = files.filter((f) => f.startsWith(`${id}-`)).sort().map((file) => {
      const tag = file.slice(id.length + 1, -4)
      const fromCfg = cfg && Object.values(cfg.sheets).find((s) => s.file === file)
      return { tag, file, poses: fromCfg?.poses ?? pig[tag]?.poses ?? [], cells: cellsOf(tag) }
    })
    const look = cfg?.look ?? readLookDraft(id) ?? readmeLook(id)
    return {
      id, name: cfg?.name ?? (look?.includes('——') ? look.split('——')[0] : undefined) ?? old?.name ?? id,
      look: look ?? '', star: !!cfg, custom: id in custom, sheets, poses,
      missing: sheets.some((s) => s.tag === 'A') && !cfg ? TAGS.filter((t) => !sheets.some((s) => s.tag === t)) : [],
      magenta: !!cfg && Object.values(cfg.sheets).some((s) => s.key === '#FF00FF'),
    }
  })
}

/** README「還沒接進引擎的新角色」那張表裡寫的 --look（fox、kitty、penguin 那種手動先生 A 表的），補齊時預先填好 */
function readmeLook(id) {
  const readme = path.join(SHEETS, 'README.md')
  if (!fs.existsSync(readme)) return undefined
  const row = fs.readFileSync(readme, 'utf8').split('\n').find((l) => l.startsWith(`| \`${id}\` | \`${id}-A.png\``))
  return row?.split('|')[3]?.trim() || undefined
}

/** 上傳做 A 表時 Codex 寫的描述（還沒寫進 .cut.json 前先放這裡） */
const lookDraftFile = (id) => path.join(UPLOADS, `${id}.look.txt`)
const readLookDraft = (id) => fs.existsSync(lookDraftFile(id)) ? fs.readFileSync(lookDraftFile(id), 'utf8').trim() || undefined : undefined
const magentaFile = (id) => path.join(UPLOADS, `${id}.magenta`)

// ---- 背景工作 ----
let job = null
/** 給 Studio 看的工作狀態（不含子行程） */
export const currentJob = () => job && (({ child, cancelled, ...rest }) => rest)(job)

const log = (line) => { job.log.push(line); if (job.log.length > 200) job.log.shift() }
function run(cmd, args) {
  return new Promise((resolve, reject) => {
    // 自成一個行程群組：取消時連 sheet-gen 底下的 codex 一起停
    const p = spawn(cmd, args, { cwd: ROOT, env: process.env, detached: true })
    job.child = p
    const take = (d) => String(d).split('\n').map((l) => l.trim()).filter(Boolean).forEach(log)
    p.stdout.on('data', take)
    p.stderr.on('data', take)
    p.on('error', reject)
    p.on('close', (code) => { job.child = null; code === 0 ? resolve() : reject(new Error(job.cancelled ? '已取消' : `${path.basename(args[0] ?? cmd)} 結束碼 ${code}`)) })
  })
}

async function pipeline({ id, name, look, magenta, from, onlyA }) {
  const gen = (tag, extra) => run(process.execPath, [path.join(ROOT, 'scripts/sheet-gen.mjs'), 'hero', id, tag,
    path.join(ROOT, 'scripts/sheets', `hero-${tag}.txt`), ...(magenta ? ['--magenta'] : []), ...extra])
  const has = (tag) => fs.existsSync(path.join(SHEETS, `${id}-${tag}.png`))
  if (!has('A')) {
    job.step = '生 A 表（表情）'
    await gen('A', ['--from', from, '--look-out', lookDraftFile(id), ...(look ? ['--look', look] : [])])
  }
  // Codex 寫的是「暱稱——長相」；家長有填名字就換成家長的
  let finalLook = look || readLookDraft(id) || ''
  if (name) finalLook = `${name}——${finalLook.includes('——') ? finalLook.split('——').slice(1).join('——') : finalLook}`
  if (!finalLook.includes('——')) throw new Error('沒有角色描述（Codex 沒寫 look.txt）：在「補齊」那裡自己填一句再按一次')
  fs.writeFileSync(lookDraftFile(id), finalLook + '\n')
  if (onlyA) return
  for (const tag of TAGS.slice(1)) {
    if (has(tag)) continue
    job.step = `生 ${tag} 表（${TAGS.indexOf(tag) + 1}／6）`
    await gen(tag, ['--look', finalLook])
  }
  job.step = '切圖'
  const pig = pigSheets()
  const cfg = {
    name: finalLook.split('——')[0],
    look: finalLook,
    about: `Studio「上傳圖片做新角色」做的${magenta ? '洋紅底' : '綠幕'}姿勢表（3×3，Codex 照家長上傳的圖畫、豬探長的表對齊畫風；上傳的圖在 media/hero-uploads/，不進 git）。A～F 六張表的九格跟豬探長同一套（C 表也是放大鏡 think、抱胸 doubt）；朝左。比例以 A 表的 idle 身高為準。`,
    ref: 'idle',
    sheets: Object.fromEntries(TAGS.map((t) => [t, { file: `${id}-${t}.png`, ...(magenta ? { key: '#FF00FF' } : {}), poses: pig[t].poses }])),
  }
  fs.writeFileSync(path.join(HEROES, `${id}.cut.json`), JSON.stringify(cfg, null, 2) + '\n')
  await run(process.execPath, [path.join(ROOT, 'scripts/hero-cut.mjs'), id])
  const poses = fs.readdirSync(path.join(PUBLIC_HERO, id)).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort()
  const custom = readJSON(CUSTOM_POSES, {})
  custom[id] = poses
  fs.writeFileSync(CUSTOM_POSES, JSON.stringify(Object.fromEntries(Object.entries(custom).sort()), null, 2) + '\n')
}

function start(opts) {
  if (job?.status === 'running') fail(409, `「${job.id}」還在做（${job.step}），等它做完再開下一個`)
  job = { id: opts.id, status: 'running', step: '準備', log: [], startedAt: new Date().toISOString(), onlyA: !!opts.onlyA }
  const mine = job
  pipeline(opts).then(
    () => { mine.status = 'done'; mine.step = opts.onlyA ? 'A 表好了：看過長相再按「補齊」' : '做好了，劇本可以用 hero:' + opts.id },
    (e) => { mine.status = 'failed'; mine.step = e.message },
  ).finally(() => { mine.finishedAt = new Date().toISOString() })
  return currentJob()
}

const ID = /^[a-z][a-z0-9]{1,15}$/
const EXTS = ['png', 'jpg', 'jpeg', 'webp']

/** 上傳一張圖，開始做新角色 */
export function startFromUpload({ id, name, look, magenta, onlyA, ext, buffer }) {
  if (!ID.test(id)) fail(400, '代號要小寫英文開頭、只用小寫英文和數字（2～16 個字），例如 puppy')
  const taken = fs.existsSync(path.join(PUBLIC_HERO, id)) || fs.existsSync(path.join(HEROES, `${id}.cut.json`)) || fs.existsSync(path.join(HEROES, `${id}.json`))
    || (fs.existsSync(SHEETS) && fs.readdirSync(SHEETS).some((f) => f.startsWith(`${id}-`)))
  if (taken) fail(409, `已經有叫 ${id} 的角色了，換一個代號`)
  if (!EXTS.includes(ext)) fail(400, '請上傳 PNG、JPG 或 WebP')
  if (!buffer.length) fail(400, '圖是空的')
  if (name && name.includes('——')) fail(400, '名字裡不要有「——」')
  fs.mkdirSync(UPLOADS, { recursive: true })
  const from = path.join(UPLOADS, `${id}.${ext}`)
  fs.writeFileSync(from, buffer)
  if (magenta) fs.writeFileSync(magentaFile(id), '')
  return start({ id, name, look: look && name ? `${name}——${look}` : look, magenta, from, onlyA })
}

/** 已經有 A 表、還沒到齊的角色（自己上傳的，或 fox 這種手動先生的）：補完 B～F 再切 */
export function finishHero({ id, look, magenta }) {
  if (!ID.test(id ?? '')) fail(400, '代號不對')
  if (!fs.existsSync(path.join(SHEETS, `${id}-A.png`))) fail(404, `${id} 還沒有 A 表`)
  if (fs.existsSync(path.join(HEROES, `${id}.cut.json`))) fail(409, `${id} 已經是固定明星了；要重畫哪張表請照 assets/hero-sheets/README.md 手動來`)
  const finalLook = (look || readLookDraft(id) || '').trim()
  if (!finalLook.includes('——')) fail(400, '角色描述要寫成「名字——長相」，例如「小狐狸——橘色的小狐狸男孩……」')
  return start({ id, look: finalLook, magenta: magenta ?? fs.existsSync(magentaFile(id)) })
}

export function cancelJob() {
  if (job?.status !== 'running') return job
  job.cancelled = true
  try { if (job.child) process.kill(-job.child.pid, 'SIGTERM') } catch { job.child?.kill('SIGTERM') }
  return currentJob()
}
