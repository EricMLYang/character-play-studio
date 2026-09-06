import { useEffect, useRef, useState } from 'react'
import type { CharEntry, Library, Prompt } from '../types'
import { addCharacter, getLibrary, getPrompt, importFile, sendFeedback, recordSubmission, markSubmissionFailed, generatePrompt, selectPrompt } from '../lib/api'
import MediaReview from './MediaReview'

const STATUS: Record<string, string> = {
  seed: '待生成', prompted: '已出 prompt', live: '已上架',
}
const TAGS = [
  { id: 'love', label: '😍 他超愛' },
  { id: 'clear', label: '👍 字很清楚' },
  { id: 'unclear', label: '🔍 字看不清' },
  { id: 'noisy', label: '🌀 太吵太亂' },
  { id: 'confusing', label: '❓ 形變沒看懂' },
  { id: 'fast', label: '⏩ 太快了' },
]

export default function StudioApp() {
  const [lib, setLib] = useState<Library | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [toast, setToast] = useState('')
  const [filter, setFilter] = useState<'all' | 'seed' | 'prompted' | 'live'>('all')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const working = useRef(false)
  const selection = useRef(0)
  const submissionId = useRef(crypto.randomUUID())
  const [copiedHash, setCopiedHash] = useState('')
  const [attemptId, setAttemptId] = useState('')
  const [feedbackFile, setFeedbackFile] = useState('')
  const [provider, setProvider] = useState('codex')
  const [model, setModel] = useState('')
  const [direction, setDirection] = useState('')
  const [generating, setGenerating] = useState(false)
  const generation = useRef<AbortController | null>(null)
  useEffect(() => () => generation.current?.abort(), [])

  const reload = () => getLibrary().then(setLib)
  useEffect(() => { reload().catch((e) => setError(e.message)) }, [])
  useEffect(() => {
    const refresh = () => { if (!working.current) reload().catch((e) => setError(e.message)) }
    const timer = setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [])

  const run = async (action: () => Promise<unknown>) => {
    if (working.current) return false
    working.current = true; setBusy(true); setError('')
    try { await action(); return true } catch (e) { setError((e as Error).name === 'AbortError' ? '已取消生成，先前版本仍保留。' : (e as Error).message); return false }
    finally { working.current = false; setBusy(false) }
  }

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const pick = async (char: string) => {
    if (working.current) return
    const request = ++selection.current
    setSel(char)
    setPrompt(null); setCopiedHash(''); setAttemptId(''); setFeedbackFile(''); setError('')
    submissionId.current = crypto.randomUUID()
    try {
      const p = await getPrompt(char)
      if (request === selection.current) setPrompt(p)
      await reload()
    } catch (e) { if (request === selection.current) setError((e as Error).message) }
  }

  const copy = async () => {
    if (!prompt?.id || prompt.stale) return
    await navigator.clipboard.writeText(prompt.formatted)
    setCopiedHash(prompt.hash)
    flash('已複製，貼到你的影片 AI 就好')
  }

  const createPrompt = () => run(async () => {
    if (!sel) return
    generation.current = new AbortController()
    setGenerating(true)
    try {
      const next = await generatePrompt({ char: sel, provider, model, direction }, generation.current.signal)
      setPrompt(next); setCopiedHash(''); submissionId.current = crypto.randomUUID()
      await reload(); flash('新創意已生成並保存，可直接複製')
    } finally { setGenerating(false); generation.current = null }
  })

  const drop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!sel) return flash('先在左邊選一個字')
    const f = e.dataTransfer.files[0]
    if (!f) return
    await upload(f)
  }

  const upload = async (file: File) => {
    if (!sel) return
    await run(async () => {
      await importFile(sel, file, attemptId)
      setAttemptId('')
      flash(`「${sel}」已入庫，請預覽並確認上架`)
      await reload()
    })
  }

  if (!lib) return <div className="st-boot">{error || '載入中…'}</div>

  const entry: CharEntry | undefined = lib.characters.find((c) => c.char === sel)
  const list = lib.characters.filter((c) => filter === 'all' || c.status === filter)
  const stats = {
    live: lib.characters.filter((c) => c.status === 'live').length,
    prompted: lib.characters.filter((c) => c.status === 'prompted').length,
    total: lib.characters.length,
  }

  return (
    <div className="st">
      <header className="st-top">
        <b>Character Play Studio</b>
        <span className="st-stats">已上架 {stats.live} · 待餵 AI {stats.prompted} · 字庫 {stats.total}</span>
        <a className="st-play" href="/">▶ 開小孩模式</a>
      </header>

      <div className="st-body">
        <aside className="st-side">
          <section className="st-queue">
            <h3>{lib.production.date} · 今日建議</h3>
            <div className="st-queue-row">
              {lib.queue.map((c) => (
                <button key={c} className={'st-q' + (sel === c ? ' on' : '')} onClick={() => pick(c)}>{c}</button>
              ))}
              {!lib.queue.length && <span className="st-dim">沒有新的待製作字，可先處理待匯入與待確認版本。</span>}
            </div>
            <p className="st-hint">今日已送出 {lib.production.attempts.length} / {lib.production.limit} 支 · 台灣時間</p>
            <p className="st-hint">清單整天固定；複製不扣額度，按「已送出 AI」才記錄。</p>
            {!!lib.pendingAttempts.length && <div className="st-pending">
              <h3>已送出，等影片匯入</h3>
              {lib.pendingAttempts.map((a) => <div key={a.id}><button onClick={() => pick(a.char)}>
                {a.char} · {new Date(a.at).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' })}
              </button><button disabled={busy} onClick={() => run(async () => {
                await markSubmissionFailed(a.id); await reload(); flash('已標記無可用影片，額度紀錄保留，可重新製作')
              })}>沒有可用影片</button></div>)}
            </div>}
          </section>

          <div className="st-filters">
            {(['all', 'seed', 'prompted', 'live'] as const).map((f) => (
              <button key={f} className={'st-chip' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>
                {f === 'all' ? '全部' : STATUS[f]}
              </button>
            ))}
          </div>

          <div className="st-list">
            {list.map((c) => (
              <button key={c.char} className={'st-item' + (sel === c.char ? ' on' : '')} onClick={() => pick(c.char)}>
                <span className="st-item-char">{c.char}</span>
                <span className="st-item-meta">
                  <span>{c.emoji} {c.zhuyin}</span>
                  <span className={'st-badge b-' + c.status}>{STATUS[c.status]}</span>
                </span>
                {c.needsRedo && <span className="st-redo">要重做</span>}
              </button>
            ))}
          </div>

          <AddChar busy={busy} onAdd={(b) => run(async () => { await addCharacter(b); await reload(); flash('已加入字庫') })} />
        </aside>

        <main className="st-main">
          {error && <div className="st-error" role="alert">{error}</div>}
          {!entry ? (
            <div className="st-empty">← 選一個字開始</div>
          ) : (
            <>
              <div className="st-head">
                <span className="st-head-char">{entry.char}</span>
                <div>
                  <div className="st-head-line">{entry.emoji} {entry.zhuyin} · {entry.meaning}</div>
                  <div className="st-dim">{prompt?.id ? prompt.conceptZh : entry.concept.hook}</div>
                </div>
              </div>

              <section className="st-card">
                <div className="st-card-bar">
                  <h4>影片 Prompt</h4>
                  <button className="st-btn" disabled={busy || !prompt?.id || prompt.stale} onClick={() => run(copy)}>複製</button>
                </div>
                <div className="st-ai-options">
                  <label className="st-field">生成工具<select value={provider} disabled={busy} onChange={(e) => { setProvider(e.target.value); setModel('') }}>
                    {lib.cliProviders.map((p) => <option key={p.id} value={p.id} disabled={!p.installed}>{p.name}{p.installed ? '' : '（未安裝）'}</option>)}
                    <option value="template">本機模板（備用）</option>
                  </select></label>
                  {provider !== 'template' && <label className="st-field">模型（選填）<input aria-label="模型名稱" value={model} disabled={busy} onChange={(e) => setModel(e.target.value)} placeholder="留空使用工具預設模型" maxLength={120} /></label>}
                </div>
                <label className="st-field">這次想怎麼拍？（選填）
                  <textarea className="st-direction" value={direction} disabled={busy} onChange={(e) => setDirection(e.target.value)} maxLength={3000}
                    placeholder="例如：他喜歡工程車。山可以用積木搭起來，最後要看得清楚；這次不要果凍彈跳。" />
                </label>
                <div className="st-generation-actions">
                  <button className="st-btn" disabled={busy || (provider !== 'template' && !lib.cliProviders.find((p) => p.id === provider)?.installed)} onClick={createPrompt}>
                    {generating ? '正在設計動畫…' : provider === 'template' ? '產生備用模板' : prompt?.id ? '換個創意，重新生成' : '用 AI 設計影片 prompt'}
                  </button>
                  {generating && <button className="st-btn ghost" onClick={() => generation.current?.abort()}>取消生成</button>}
                </div>
                <p className="st-hint" aria-live="polite">{generating ? '正在參考字義、你的回饋與過往版本；通常需要數十秒到數分鐘。' : '透過本機 CLI 的登入帳號生成文字；不計入每日三支影片額度。'}</p>
                {prompt?.stale && <p className="st-error">生成規則、字義或回饋已有更新，請重新生成，把新方向交給 AI。</p>}
                {prompt?.id && <p className="st-hint">來源：{prompt.provider} · {prompt.actualModel || prompt.requestedModel || '工具預設模型'}{prompt.generatedAt ? ` · ${new Date(prompt.generatedAt).toLocaleString('zh-TW')}` : ''}</p>}
                {prompt?.creativeAngle && <p className="st-angle">{prompt.creativeAngle}</p>}
                <textarea className="st-prompt" aria-label="影片 Prompt" readOnly value={prompt?.id ? prompt.formatted : '選擇工具後按「用 AI 設計影片 prompt」。只填國字也可以開始。'} />
                {!!prompt?.id && !!prompt.appliedFeedback.length && <p className="st-hint">已參考回饋：{prompt.appliedFeedback.map((tag) => TAGS.find((t) => t.id === tag)?.label).join('、')}</p>}
                {!!entry.promptVersions?.length && <label className="st-field">已保存的創意版本
                  <select disabled={busy} value={prompt?.id || ''} onChange={(e) => run(async () => {
                    setPrompt(await selectPrompt(entry.char, e.target.value)); setCopiedHash(''); await reload()
                  })}>
                    {[...entry.promptVersions].reverse().map((p, i, all) => <option key={p.id} value={p.id}>版本 {all.length - i} · {p.provider} · {p.conceptZh}</option>)}
                  </select>
                </label>}
                <div className="st-submit">
                  <span>貼到 AI 並實際送出後，記錄一次。再次生成同一字也算一支。</span>
                  <button className="st-btn" disabled={busy || !prompt?.id || prompt.stale || copiedHash !== prompt.hash || lib.production.attempts.length >= lib.production.limit}
                    onClick={() => run(async () => {
                      if (!prompt) return
                      await recordSubmission(entry.char, prompt.hash, submissionId.current)
                      submissionId.current = crypto.randomUUID(); setCopiedHash('')
                      await reload(); flash('已記錄 1 支，並保存這次 prompt')
                    })}>已送出 AI，記 1 支</button>
                </div>
                {!!lib.production.attempts.length && <details className="st-history">
                  <summary>今天的 {lib.production.attempts.length} 次製作紀錄</summary>
                  {lib.production.attempts.map((a, i) => <details key={a.id}>
                    <summary>第 {i + 1} 支 · {a.char} · {a.mediaFile ? '已匯入' : a.failedAt ? '無可用影片' : '待匯入'}</summary>
                    <pre>{a.prompt.formatted}</pre>
                  </details>)}
                </details>}
              </section>

              <section className="st-card">
                <div className="st-card-bar"><h4>影片 / 圖片</h4></div>
                <label className="st-field">這次匯入對應的製作紀錄
                  <select value={attemptId} onChange={(e) => setAttemptId(e.target.value)} disabled={busy}>
                    <option value="">外部已有素材／圖片（未連結 prompt）</option>
                    {lib.pendingAttempts.filter((a) => a.char === entry.char).map((a) =>
                      <option key={a.id} value={a.id}>{new Date(a.at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })} · {a.char}</option>)}
                  </select>
                </label>
                <div className="st-drop" onDragOver={(e) => e.preventDefault()} onDrop={drop}>
                  把一個檔案拖進來 → 入庫給「{entry.char}」，確認後才上架
                  <label className="st-file">或選擇檔案<input type="file" aria-label="匯入影片或圖片" accept=".mp4,.webm,.mov,.png,.jpg,.jpeg,.webp" disabled={busy}
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = '' }} /></label>
                </div>
                {!!entry.media?.length && (
                  <div className="st-media">
                    {entry.media.map((m) => (
                      <MediaReview key={`${m.file}-${m.review}`} entry={entry} media={m} busy={busy}
                        run={run} onSaved={async () => { await reload(); flash('已更新觀看版本') }} />
                    ))}
                  </div>
                )}
              </section>

              <section className="st-card">
                <div className="st-card-bar">
                  <h4>看完的回饋</h4>
                  <span className="st-dim">回饋會交給 AI 設計下一個版本</span>
                </div>
                <label className="st-field">回饋對象
                  <select value={feedbackFile} onChange={(e) => setFeedbackFile(e.target.value)} disabled={busy}>
                    <option value="">這個字的整體概念</option>
                    {entry.media.map((m, i) => <option key={m.file} value={m.file}>版本 {entry.media.length - i} · {m.kind === 'video' ? '影片' : '圖片'} · {m.review || 'published'}</option>)}
                  </select>
                </label>
                <div className="st-tags">
                  {TAGS.map((t) => (
                    <button key={t.id} className="st-tag" disabled={busy || !prompt}
                      onClick={() => run(async () => {
                        await sendFeedback(entry.char, [t.id], feedbackFile || undefined)
                        setPrompt(await getPrompt(entry.char)); setCopiedHash('')
                        await reload(); flash('已記下；按重新生成，讓 AI 根據回饋重設計')
                      })}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {!!entry.feedback?.length && (
                  <div className="st-fb">
                    {entry.feedback.slice(-6).reverse().map((f, i) => (
                      <span key={i}>{f.tags.map((t) => TAGS.find((x) => x.id === t)?.label ?? t).join(' ')}</span>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {toast && <div className="st-toast">{toast}</div>}
    </div>
  )
}

function AddChar({ onAdd, busy }: { onAdd: (b: Record<string, string>) => Promise<boolean>; busy: boolean }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ char: '', zhuyin: '', meaning: '', emoji: '', object: '', morph: '', hook: '' })
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  if (!open) return <button className="st-add" onClick={() => setOpen(true)}>+ 加一個字</button>
  return (
    <div className="st-form">
      <input placeholder="字（例：雲）" value={f.char} onChange={set('char')} />
      <p className="st-hint">只填國字即可加入；選字後用 AI 生成，會補齊注音、意思與動畫概念。</p>
      <details><summary>選填字義與自己的概念</summary>
      <input placeholder="注音（ㄩㄣˊ）" value={f.zhuyin} onChange={set('zhuyin')} />
      <input placeholder="英文意思 (cloud)" value={f.meaning} onChange={set('meaning')} />
      <input placeholder="emoji ☁️" value={f.emoji} onChange={set('emoji')} />
      <input placeholder="登場物件 (英文)" value={f.object} onChange={set('object')} />
      <input placeholder="形變方式 (英文)" value={f.morph} onChange={set('morph')} />
      <input placeholder="一句話設計概念（中文）" value={f.hook} onChange={set('hook')} />
      </details>
      <div className="st-form-row">
        <button className="st-btn" disabled={busy} onClick={async () => { if (await onAdd(f)) { setOpen(false); setF({ char: '', zhuyin: '', meaning: '', emoji: '', object: '', morph: '', hook: '' }) } }}>加入</button>
        <button className="st-btn ghost" onClick={() => setOpen(false)}>取消</button>
      </div>
    </div>
  )
}
