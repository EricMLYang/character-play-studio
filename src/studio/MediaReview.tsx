import { useEffect, useRef, useState } from 'react'
import type { CharEntry, Media } from '../types'
import { reviewMedia } from '../lib/api'
import { say, stopSpeech } from '../lib/audio'
import { useVideoVoice } from '../lib/useVideoVoice'
import { isPublished } from '../../shared/domain.mjs'

export default function MediaReview({ entry, media, busy, run, onSaved }: {
  entry: CharEntry; media: Media; busy: boolean
  run: (action: () => Promise<unknown>) => Promise<boolean>
  onSaved: () => Promise<void>
}) {
  const [audioMode, setAudioMode] = useState(media.audioMode || (media.kind === 'image' ? 'narration' : 'original'))
  const [volume, setVolume] = useState(media.volume ?? 0.7)
  const [checks, setChecks] = useState({ shape: false, pronunciation: false, volume: false })
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [previewed, setPreviewed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [playError, setPlayError] = useState('')
  const video = useRef<HTMLVideoElement>(null)
  const voice = useVideoVoice(entry.char, audioMode === 'narration', volume)
  useEffect(() => {
    if (video.current) { video.current.pause(); video.current.currentTime = 0; video.current.volume = volume }
    setChecks({ shape: false, pronunciation: false, volume: false }); setPreviewed(false)
    setElapsed(0); setPlaying(false); setPlayError('')
  }, [audioMode, volume])
  const src = `/media/${encodeURIComponent(media.file)}`
  const enabled = ready && previewed && !failed && Object.values(checks).every(Boolean)
  const remaining = ['字形', '發音', '音量'].filter((_, i) => !Object.values(checks)[i])
  const preview = async () => {
    const player = video.current
    if (!player) return
    setPlayError('')
    if (player.ended) { player.currentTime = 0; voice.reset() }
    try { await player.play() } catch { setPlayError('無法開始播放，請再按一次「播放預覽」，或使用影片內的播放鍵。') }
  }
  const publish = () => run(async () => {
    video.current?.pause(); stopSpeech()
    await reviewMedia({ char: entry.char, file: media.file, action: 'publish', audioMode, volume, checks })
    await onSaved()
  })
  return <article className="st-review">
    <div className="st-review-heading">
      <b>{media.kind === 'video' ? '影片' : '圖片'} · {isPublished(media) ? '使用中' : media.review === 'draft' ? '待確認' : '已停用'}</b>
      <span>{new Date(media.addedAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</span>
    </div>
    {media.kind === 'video' ? <video ref={video} src={src} aria-label={`${entry.char} 影片預覽`} controls muted={audioMode === 'narration'} preload="metadata"
      onLoadedData={(e) => { setReady(true); e.currentTarget.volume = volume }}
      onError={() => { setFailed(true); setReady(false) }}
      onPlaying={(e) => { setPlaying(true); setPlayError(''); document.querySelectorAll('video').forEach((v) => { if (v !== e.currentTarget) v.pause() }); voice.update(e.currentTarget) }}
      onTimeUpdate={(e) => { setElapsed(Math.floor(e.currentTarget.currentTime)); voice.update(e.currentTarget) }}
      onPause={() => { setPlaying(false); voice.stop() }}
      onVolumeChange={(e) => { e.currentTarget.muted = audioMode === 'narration'; e.currentTarget.volume = volume }}
      onSeeking={() => { voice.reset(); stopSpeech() }} onEnded={() => { voice.stop(); setPlaying(false); setPreviewed(true) }} />
      : <img src={src} alt={entry.char} onLoad={() => setReady(true)} onError={() => { setFailed(true); setReady(false) }} />}
    {failed && <p className="st-error">這個檔案無法播放，請重新匯入可用的版本。</p>}
    {media.kind === 'video' && <div className="st-preview-actions">
      <button className="st-btn ghost" disabled={busy || failed} onClick={() => playing ? video.current?.pause() : void preview()}>
        {playing ? '暫停預覽' : previewed ? '重新預覽' : '播放預覽'}
      </button>
      <span>{playing ? `播放中 · ${elapsed} 秒，請看到結尾` : previewed ? '已播放到結尾 ✓' : elapsed > 0 ? '預覽已暫停，請繼續看到結尾' : '尚未預覽'}</span>
    </div>}
    {playError && <p className="st-error" role="alert">{playError}</p>}
    <label className="st-field">發音方式
      <select value={audioMode} disabled={busy || media.kind === 'image'} onChange={(e) => setAudioMode(e.target.value as 'original' | 'narration')}>
        {media.kind === 'video' && <option value="original">保留影片原音</option>}
        <option value="narration">系統朗讀（影片靜音）</option>
      </select>
    </label>
    <label className="st-field">音量 {Math.round(volume * 100)}%
      <input aria-label={`${entry.char} 預覽音量`} type="range" min="0" max="1" step="0.05" value={volume} disabled={busy} onChange={(e) => setVolume(Number(e.target.value))} />
    </label>
    {media.kind === 'image' && <button className="st-btn ghost" disabled={!ready || failed} onClick={() => { say(entry.char, 0.75, volume); setPreviewed(true) }}>試聽「{entry.char}」</button>}
    <p className="st-hint">{media.kind === 'video' ? '請先播放到結尾，再確認。更改發音或音量後，請重新預覽。' : '請看過圖片並試聽發音，再確認。'}系統朗讀使用這台 Mac 的中文語音。</p>
    <div className="st-checks">
      {(['shape', 'pronunciation', 'volume'] as const).map((key, i) => <label key={key}>
        <input type="checkbox" checked={checks[key]} disabled={busy || !ready || !previewed || failed}
          onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })} />
        {['字形正確清楚', '發音正確', '音量舒服'][i]}
      </label>)}
    </div>
    <div className="st-review-actions">
      <button className="st-btn" disabled={busy || !enabled} onClick={publish}>{isPublished(media) ? '確認並儲存設定' : '確認上架，使用此版本'}</button>
      {isPublished(media) && <button className="st-btn ghost" disabled={busy} onClick={() => run(async () => {
        video.current?.pause(); stopSpeech()
        await reviewMedia({ char: entry.char, file: media.file, action: 'pause' }); await onSaved()
      })}>暫停使用</button>}
    </div>
    {!failed && <p className="st-review-next" role="status">
      {!previewed ? media.kind === 'video' ? '下一步：按「播放預覽」，播完後下方三項確認才會解鎖。' : '下一步：看過圖片後按「試聽」，即可勾選三項確認。'
        : !ready ? '正在載入預覽，請稍候。'
        : remaining.length ? `下一步：勾選確認${remaining.join('、')}，就能${isPublished(media) ? '儲存設定' : '上架'}。`
        : isPublished(media) ? '三項已確認，可以儲存設定。' : '三項已確認，可以按「確認上架，使用此版本」。'}
    </p>}
    <details className="st-history"><summary>檔案與製作來源</summary>
      <p>{media.file}</p>
      {media.prompt ? <><p>模板 v{media.prompt.templateVersion}</p><pre>{media.prompt.formatted}</pre></> : <p>外部素材，未連結製作 prompt。</p>}
    </details>
  </article>
}
