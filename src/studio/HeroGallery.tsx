import { useEffect, useMemo, useState } from 'react'
import { cancelHeroJob, finishHero, getHeroes, uploadHero, type HeroInfo, type HeroJob } from '../lib/api'

/**
 * 角色九宮格：所有主角的姿勢表（assets/hero-sheets/ 的原圖，格子上標姿勢名）與切好的姿勢圖，一個一個點來看。
 * 也可以上傳一張圖，請 Codex 照圖裡的主角畫成 A～F 六張表、切好、登記成固定明星（伺服器在背景跑，server/hero-maker.mjs）。
 */
const SHEET_TITLE: Record<string, string> = {
  A: '表情', B: '動作', C: '道具與生活動作', D: '全身動作', E: '吃東西與身體反應', F: '身體狀況與反應', G: '專屬',
}
const kindOf = (h: HeroInfo) => h.star ? '明星' : h.sheets.length ? '還沒接進引擎' : '舊主角'
/** 一次做完整套大約幾分鐘（Codex 一張 1～2 分鐘，再加切圖） */
const ETA = 12

export default function HeroGallery({ onClose }: { onClose: () => void }) {
  const [heroes, setHeroes] = useState<HeroInfo[]>([])
  const [job, setJob] = useState<HeroJob | null>(null)
  const [sel, setSel] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  /** 圖換了要重抓：工作每往前一步就換一次 */
  const [bust, setBust] = useState(0)

  const load = () => getHeroes().then((r) => {
    setHeroes(r.heroes)
    setJob(r.job)
    setSel((s) => s || r.heroes.find((h) => h.star)?.id || r.heroes[0]?.id || '')
  }, (e) => setError(e.message))
  useEffect(() => { load() }, [])
  // 背景在做的時候每幾秒看一次進度；做完再抓一次清單（新的表、切好的圖）
  useEffect(() => {
    if (job?.status !== 'running') return
    const t = setInterval(async () => {
      const r = await getHeroes().catch(() => null)
      if (!r) return
      setJob((old) => { if (old?.step !== r.job?.step) setBust(Date.now()); return r.job })
      setHeroes(r.heroes)
    }, 4000)
    return () => clearInterval(t)
  }, [job?.status])

  const hero = heroes.find((h) => h.id === sel)
  const groups = useMemo(() => (['明星', '還沒接進引擎', '舊主角'] as const).map((k) => [k, heroes.filter((h) => kindOf(h) === k)] as const), [heroes])
  const started = (j: HeroJob) => { setJob(j); setSel(j.id); setAdding(false); setBust(Date.now()); load() }

  return (
    <div className="st-gallery" role="dialog" aria-label="角色九宮格">
      <div className="st-gallery-card st-heroes">
        <header className="st-gallery-head">
          <h3>🧸 角色九宮格</h3>
          <p className="st-dim">所有主角的姿勢表與切好的姿勢。上傳一張圖，就能把圖裡的主角做成劇本用得到的新明星（{ETA} 分鐘左右）。</p>
          <button className="st-gallery-close" disabled={job?.status === 'running'} onClick={() => { setAdding((v) => !v); setError('') }}>
            {adding ? '取消上傳' : '＋ 上傳圖片做新角色'}
          </button>
          <button className="st-gallery-close" onClick={onClose}>關閉</button>
        </header>
        {error && <div className="st-error" role="alert">{error}</div>}
        {job && <JobBanner job={job} onCancel={() => cancelHeroJob().then((j) => setJob(j), (e) => setError(e.message))} />}
        {adding && <UploadForm taken={heroes.map((h) => h.id)} onStarted={started} onError={setError} />}

        <nav className="st-hero-list">
          {groups.map(([k, list]) => !!list.length && (
            <div key={k} className="st-hero-group">
              <span className="st-dim">{k}（{list.length}）</span>
              {list.map((h) => (
                <button key={h.id} className={'st-hero-chip' + (h.id === sel ? ' on' : '')} onClick={() => setSel(h.id)}>
                  {h.poses.includes('idle') ? <img src={`/hero/${h.id}/idle.png?${bust}`} alt="" /> : <span>🖼️</span>}
                  {h.name}{h.custom ? ' ✨' : ''}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {hero && <HeroDetail key={hero.id} hero={hero} bust={bust} busy={job?.status === 'running'} onStarted={started} onError={setError} />}
      </div>
    </div>
  )
}

function JobBanner({ job, onCancel }: { job: HeroJob; onCancel: () => void }) {
  const [, tick] = useState(0)
  useEffect(() => { if (job.status !== 'running') return; const t = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(t) }, [job.status])
  const secs = Math.round(((job.finishedAt ? Date.parse(job.finishedAt) : Date.now()) - Date.parse(job.startedAt)) / 1000)
  const icon = { running: '⏳', done: '✅', failed: '⚠️' }[job.status]
  return (
    <div className={'st-hero-job ' + job.status} aria-live="polite">
      <b>{icon} {job.id}：{job.step}</b>
      <span className="st-dim">{Math.floor(secs / 60)} 分 {secs % 60} 秒</span>
      {job.status === 'running' && <button className="st-btn ghost" onClick={onCancel}>取消</button>}
      {!!job.log.length && <details><summary>過程</summary><pre>{job.log.slice(-30).join('\n')}</pre></details>}
    </div>
  )
}

function HeroDetail({ hero, bust, busy, onStarted, onError }: { hero: HeroInfo; bust: number; busy: boolean; onStarted: (j: HeroJob) => void; onError: (m: string) => void }) {
  const [look, setLook] = useState(hero.look)
  const [magenta, setMagenta] = useState(hero.magenta)
  return (
    <section className="st-hero-detail">
      <h4>{hero.name} <code>hero:{hero.id}</code> <span className="st-dim">{kindOf(hero)}{hero.custom ? '・Studio 上傳做的' : ''}</span></h4>
      {hero.look && <p className="st-dim">{hero.look}</p>}

      {!!hero.missing.length && (
        <div className="st-hero-finish">
          <p>還缺 {hero.missing.join('、')} 表，補齊後才會切圖、變成劇本能用的明星（{ETA} 分鐘左右，會送 Codex 生圖）。</p>
          <label>角色描述（「名字——長相」，補表時給 Codex 看）
            <textarea rows={2} value={look} onChange={(e) => setLook(e.target.value)} placeholder="小狐狸——橘色的小狐狸男孩，白色的臉頰與肚子……" />
          </label>
          <label className="st-hero-check"><input type="checkbox" checked={magenta} onChange={(e) => setMagenta(e.target.checked)} /> 角色本身是綠色的（改用洋紅底）</label>
          <button className="st-btn" disabled={busy || !look.includes('——')} onClick={() => finishHero({ id: hero.id, look, magenta }).then(onStarted, (e) => onError(e.message))}>
            補齊 {hero.missing.join('')} 並切圖
          </button>
        </div>
      )}

      {hero.sheets.map((s) => (
        <figure key={s.file} className="st-hero-sheet">
          <figcaption>{s.tag} 表・{SHEET_TITLE[s.tag] ?? SHEET_TITLE.G}</figcaption>
          <div className="st-hero-sheet-img">
            <img src={`/hero-sheets/${s.file}?${bust}`} alt={`${hero.name} ${s.tag} 表`} loading="lazy" />
            <ol>{Array.from({ length: 9 }, (_, i) => <li key={i} title={s.cells[i] ?? ''}><span>{s.poses[i] ?? ''}</span></li>)}</ol>
          </div>
        </figure>
      ))}

      {!!hero.poses.length && <>
        <h4>切好的姿勢（{hero.poses.length}）<span className="st-dim">劇本寫 hero:{hero.id}/姿勢名</span></h4>
        <div className="st-hero-poses">
          {hero.poses.map((p) => (
            <figure key={p}><img src={`/hero/${hero.id}/${p}.png?${bust}`} alt="" loading="lazy" /><figcaption>{p}</figcaption></figure>
          ))}
        </div>
      </>}
      {!hero.sheets.length && !hero.poses.length && <p className="st-dim">還沒有任何圖。</p>}
    </section>
  )
}

function UploadForm({ taken, onStarted, onError }: { taken: string[]; onStarted: (j: HeroJob) => void; onError: (m: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [look, setLook] = useState('')
  const [magenta, setMagenta] = useState(false)
  const [onlyA, setOnlyA] = useState(false)
  const [agree, setAgree] = useState(false)
  const [sending, setSending] = useState(false)
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const idOk = /^[a-z][a-z0-9]{1,15}$/.test(id) && !taken.includes(id)
  const submit = async () => {
    if (!file) return
    setSending(true)
    try { onStarted(await uploadHero(file, { id, name, look, magenta, onlyA })) } catch (e) { onError((e as Error).message) } finally { setSending(false) }
  }
  return (
    <div className="st-hero-upload">
      <label className="st-hero-drop">
        {preview ? <img src={preview} alt="上傳的圖" /> : <span>選一張圖<br /><small>PNG、JPG、WebP，主角清楚、一隻就好</small></span>}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => {
          const f = e.target.files?.[0] ?? null
          setFile(f)
          setPreview(f ? URL.createObjectURL(f) : '')
        }} />
      </label>
      <div className="st-hero-fields">
        <label>代號（劇本裡寫 hero:代號）
          <input value={id} onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))} placeholder="puppy" maxLength={16} />
          {id && !idOk && <small className="st-redo">{taken.includes(id) ? '這個代號用過了' : '小寫英文開頭、2～16 個字'}</small>}
        </label>
        <label>名字（可空白，Codex 會取一個）<input value={name} onChange={(e) => setName(e.target.value)} placeholder="小黃狗" /></label>
        <label>長相（可空白，Codex 看圖寫）
          <textarea rows={2} value={look} onChange={(e) => setLook(e.target.value)} placeholder="黃色的小狗，垂耳朵，戴紅色項圈，用兩隻腳站立，大頭小身體的 Q 版比例。" />
        </label>
        <label className="st-hero-check"><input type="checkbox" checked={magenta} onChange={(e) => setMagenta(e.target.checked)} /> 主角本身是綠色的（改用洋紅底，不然身體會被當背景去掉）</label>
        <label className="st-hero-check"><input type="checkbox" checked={onlyA} onChange={(e) => setOnlyA(e.target.checked)} /> 只先做 A 表（表情九宮格，約 2 分鐘），看過長相再補齊</label>
        <label className="st-hero-check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> 我知道這張圖會送到 Codex（OpenAI）生圖；是真人照片也會照樣送出</label>
        <button className="st-btn" disabled={!file || !idOk || !agree || sending} onClick={submit}>
          {sending ? '送出中…' : onlyA ? '開始做 A 表' : `開始做整套 A～F（約 ${ETA} 分鐘）`}
        </button>
      </div>
    </div>
  )
}
