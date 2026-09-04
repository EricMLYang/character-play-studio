import { useEffect, useState } from 'react'
import type { CharEntry, Library } from '../types'
import { addCharacter, getLibrary, getPrompt, importFile, sendFeedback } from '../lib/api'

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
  const [prompt, setPrompt] = useState<string>('')
  const [toast, setToast] = useState('')
  const [filter, setFilter] = useState<'all' | 'seed' | 'prompted' | 'live'>('all')

  const reload = () => getLibrary().then(setLib)
  useEffect(() => { reload() }, [])

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const pick = async (char: string) => {
    setSel(char)
    const p = await getPrompt(char)
    setPrompt(p.formatted)
    reload()
  }

  const copy = async () => {
    await navigator.clipboard.writeText(prompt)
    flash('已複製，貼到你的影片 AI 就好')
  }

  const drop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (!sel) return flash('先在左邊選一個字')
    const f = e.dataTransfer.files[0]
    if (!f) return
    await importFile(sel, f)
    flash(`「${sel}」的影片已入庫並上架 ✅`)
    reload()
  }

  if (!lib) return <div className="st-boot">載入中…</div>

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
            <h3>今天要生的 3 個字</h3>
            <div className="st-queue-row">
              {lib.queue.map((c) => (
                <button key={c} className={'st-q' + (sel === c ? ' on' : '')} onClick={() => pick(c)}>{c}</button>
              ))}
              {!lib.queue.length && <span className="st-dim">字庫都做完了 🎉</span>}
            </div>
            <p className="st-hint">每天 3 支影片額度，按一個字就拿到 prompt。</p>
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

          <AddChar onAdd={async (b) => { await addCharacter(b); reload(); flash('已加入字庫') }} />
        </aside>

        <main className="st-main">
          {!entry ? (
            <div className="st-empty">← 選一個字開始</div>
          ) : (
            <>
              <div className="st-head">
                <span className="st-head-char">{entry.char}</span>
                <div>
                  <div className="st-head-line">{entry.emoji} {entry.zhuyin} · {entry.meaning}</div>
                  <div className="st-dim">{entry.concept.hook}</div>
                </div>
              </div>

              <section className="st-card">
                <div className="st-card-bar">
                  <h4>影片 Prompt</h4>
                  <button className="st-btn" onClick={copy}>複製</button>
                </div>
                <textarea className="st-prompt" readOnly value={prompt} />
              </section>

              <section className="st-card">
                <div className="st-card-bar"><h4>影片 / 圖片</h4></div>
                <div className="st-drop" onDragOver={(e) => e.preventDefault()} onDrop={drop}>
                  把下載好的檔案拖進來 → 自動改名、入庫、上架給「{entry.char}」
                </div>
                {!!entry.media?.length && (
                  <div className="st-media">
                    {entry.media.map((m) => (
                      <div key={m.file} className="st-media-item">
                        {m.kind === 'video'
                          ? <video src={`/media/${encodeURIComponent(m.file)}`} controls muted />
                          : <img src={`/media/${encodeURIComponent(m.file)}`} alt="" />}
                        <span>{m.file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="st-card">
                <div className="st-card-bar">
                  <h4>看完的回饋</h4>
                  <span className="st-dim">累積起來會自動改 prompt 規則</span>
                </div>
                <div className="st-tags">
                  {TAGS.map((t) => (
                    <button key={t.id} className="st-tag"
                      onClick={async () => { await sendFeedback(entry.char, [t.id]); reload(); flash('記下了') }}>
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

function AddChar({ onAdd }: { onAdd: (b: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ char: '', zhuyin: '', meaning: '', emoji: '', object: '', morph: '', hook: '' })
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  if (!open) return <button className="st-add" onClick={() => setOpen(true)}>+ 加一個字</button>
  return (
    <div className="st-form">
      <input placeholder="字（例：雲）" value={f.char} onChange={set('char')} />
      <input placeholder="注音（ㄩㄣˊ）" value={f.zhuyin} onChange={set('zhuyin')} />
      <input placeholder="英文意思 (cloud)" value={f.meaning} onChange={set('meaning')} />
      <input placeholder="emoji ☁️" value={f.emoji} onChange={set('emoji')} />
      <input placeholder="登場物件 (英文)" value={f.object} onChange={set('object')} />
      <input placeholder="形變方式 (英文)" value={f.morph} onChange={set('morph')} />
      <input placeholder="一句話設計概念（中文）" value={f.hook} onChange={set('hook')} />
      <div className="st-form-row">
        <button className="st-btn" onClick={() => { onAdd(f); setOpen(false) }}>加入</button>
        <button className="st-btn ghost" onClick={() => setOpen(false)}>取消</button>
      </div>
    </div>
  )
}
