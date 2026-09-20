import { useEffect, useRef, useState } from 'react'
import type { CharEntry, Library } from '../types'
import { addCharacter, updateCharacter, deleteCharacter, suggestCharacter } from '../lib/api'

export default function CharacterEditor({ entry, providers, disabled, onSaved, onDeleted }: {
  entry?: CharEntry
  providers: Library['cliProviders']
  disabled: boolean
  onSaved: (char: string) => Promise<void>
  onDeleted?: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  return open ? <CharacterForm entry={entry} providers={providers} disabled={disabled}
    onSaved={onSaved} onDeleted={onDeleted} onClose={() => setOpen(false)} />
    : <button className={entry ? 'st-btn ghost' : 'st-add'} disabled={disabled} onClick={() => setOpen(true)}>
      {entry ? '✏️ 編輯字卡資料／刪除' : '+ 加一個字（可用 AI 補齊）'}
    </button>
}

function CharacterForm({ entry, providers, disabled, onSaved, onDeleted, onClose }: {
  entry?: CharEntry; providers: Library['cliProviders']; disabled: boolean
  onSaved: (char: string) => Promise<void>; onDeleted?: () => Promise<void>; onClose: () => void
}) {
  const [fields, setFields] = useState({ char: entry?.char || '', zhuyin: entry?.zhuyin || '',
    meaning: entry?.meaning || '', emoji: entry?.emoji === '✨' ? '' : entry?.emoji || '',
    words: (entry?.words || []).join('、'),
    object: entry?.concept.object || '', morph: entry?.concept.morph || '', hook: entry?.concept.hook || '' })
  const [provider, setProvider] = useState(providers.find((p) => p.installed)?.id || '')
  const [model, setModel] = useState('')
  const [busy, setBusy] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const request = useRef<AbortController | null>(null)
  const working = useRef(false)
  useEffect(() => () => request.current?.abort(), [])
  const locked = busy || disabled
  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFields((previous) => key === 'char'
      ? { char: value, zhuyin: '', meaning: '', emoji: '', words: '', object: '', morph: '', hook: '' }
      : { ...previous, [key]: value })
    setNote('')
  }
  const run = async (action: () => Promise<void>) => {
    if (working.current || disabled) return
    working.current = true; setBusy(true); setError('')
    try { await action() } catch (e) {
      setError((e as Error).name === 'AbortError' ? '已取消，原本填寫的內容仍保留。' : (e as Error).message)
    } finally { working.current = false; setBusy(false); setGenerating(false) }
  }
  const suggest = () => run(async () => {
    setGenerating(true); setNote('')
    request.current = new AbortController()
    const result = await suggestCharacter({ char: fields.char.trim(), provider, model }, request.current.signal)
    setFields((previous) => ({ ...previous,
      zhuyin: previous.zhuyin.trim() || result.zhuyin,
      meaning: previous.meaning.trim() || result.meaning,
      emoji: previous.emoji.trim() || result.emoji,
      words: previous.words.trim() || result.words,
    }))
    setNote('AI 建議已填入空白欄位，尚未儲存。請確認讀音、圖示與語詞，尤其是多音字——語詞的讀音要跟你要教的一致。')
  })
  return <section className="st-character-form">
    <h4>{entry ? `編輯「${entry.char}」` : '新增字卡'}</h4>
    <p className="st-hint">只需填國字，再讓 AI 補齊注音、英文意思、圖示與語詞。已有內容會保留；想重選的欄位可先清空。</p>
    {error && <div className="st-error" role="alert">{error}</div>}
    <fieldset disabled={locked}>
      <label className="st-field">國字<input value={fields.char} readOnly={Boolean(entry)} onChange={set('char')} placeholder="例：忍" /></label>
      <div className="st-ai-options">
        <label className="st-field">補齊工具<select value={provider} onChange={(e) => { setProvider(e.target.value); setModel('') }}>
          {!provider && <option value="">沒有可用的 AI 工具</option>}
          {providers.map((p) => <option key={p.id} value={p.id} disabled={!p.installed}>{p.name}{p.installed ? '' : '（未安裝）'}</option>)}
        </select></label>
        <label className="st-field">模型（選填）<input value={model} onChange={(e) => setModel(e.target.value)} maxLength={120} placeholder="使用工具預設模型" /></label>
      </div>
      <button className="st-btn" disabled={!provider || !/^\p{Script=Han}$/u.test(fields.char.trim()) || [fields.zhuyin, fields.meaning, fields.emoji, fields.words].every((v) => v.trim())} onClick={suggest}>
        {generating ? 'AI 正在補齊…' : '✨ AI 補齊注音、圖示與語詞'}
      </button>
      {!provider && <p className="st-hint">尚未找到已安裝的 AI 工具，可以先手動填寫或只加入國字。</p>}
      <p className="st-hint">產生文字建議，不會製作影片，也不占每日三支影片額度。</p>
      <div className="st-metadata-fields">
        <label className="st-field">注音<input value={fields.zhuyin} onChange={set('zhuyin')} placeholder="ㄖㄣˇ" maxLength={80} /></label>
        <label className="st-field">圖示（emoji）<input value={fields.emoji} onChange={set('emoji')} placeholder="選一個圖示" maxLength={32} /></label>
        <label className="st-field">英文意思<input value={fields.meaning} onChange={set('meaning')} placeholder="例如 endure" maxLength={300} /></label>
      </div>
      <label className="st-field">語詞（最多四個，用、分隔）
        <input value={fields.words} onChange={set('words')} placeholder="例：生日、日出" maxLength={200} />
      </label>
      <p className="st-hint">孩子端會把這些詞顯示在字卡旁邊並唸出來，把字放回他已經會說的話裡。每個詞都必須含這個字，讀音也要跟上面的注音一致。</p>
      <details><summary>動畫概念（選填，可留給影片 AI 設計）</summary>
        <label className="st-field">登場物件（英文）<input value={fields.object} onChange={set('object')} maxLength={3000} /></label>
        <label className="st-field">形變方式（英文）<input value={fields.morph} onChange={set('morph')} maxLength={3000} /></label>
        <label className="st-field">設計概念（中文）<input value={fields.hook} onChange={set('hook')} maxLength={3000} /></label>
      </details>
    </fieldset>
    {generating && <button className="st-btn ghost" onClick={() => request.current?.abort()}>取消 AI 補齊</button>}
    {note && <p className="st-hint" role="status">{note}</p>}
    <div className="st-character-preview" aria-label="字卡預覽">
      <span>{fields.emoji || '✨'}</span><b>{fields.char || '字'}</b><span>{fields.zhuyin || '尚未填注音'}</span>
    </div>
    {!entry && <p className="st-hint">新增後先在孩子端隱藏，確認資料與素材後再開放。</p>}
    <div className="st-form-row">
      <button className="st-btn" disabled={locked || !/^\p{Script=Han}$/u.test(fields.char.trim())} onClick={() => run(async () => {
        await (entry ? updateCharacter : addCharacter)(fields)
        await onSaved(fields.char.trim()); onClose()
      })}>{entry ? '儲存字卡資料' : '加入字庫'}</button>
      <button className="st-btn ghost" disabled={locked} onClick={onClose}>取消</button>
      {entry && <button className="st-btn st-danger" disabled={locked} onClick={() => setConfirmDelete(true)}>刪除這個字</button>}
    </div>
    {confirmDelete && <div className="st-delete-confirm" role="group" aria-label="確認刪除">
      <p>將「{entry?.char}」移到已刪除清單？孩子將看不到它，原有影片與紀錄會保留，可隨時還原。</p>
      <button className="st-btn st-danger" disabled={locked} onClick={() => run(async () => {
        await deleteCharacter(entry!.char); await onDeleted?.(); onClose()
      })}>確認刪除「{entry?.char}」</button>
      <button className="st-btn ghost" disabled={locked} onClick={() => setConfirmDelete(false)}>保留這個字</button>
    </div>}
  </section>
}
