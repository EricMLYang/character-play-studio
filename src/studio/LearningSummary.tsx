import type { CharEntry, Progress } from '../types'
import { summarize } from './summary'

/**
 * 沒選字時 Studio 主區顯示的「孩子的學習小結」：看字、認字（餵大怪獸）、詞彙（詞語拼圖）、小鎮。
 * 最後給家長一兩句可以在生活裡問孩子的話——字要跟生活連起來才記得住。
 */
export default function LearningSummary({ progress, characters, onPick }: {
  progress: Progress
  characters: CharEntry[]
  onPick: (char: string) => void
}) {
  const s = summarize(progress, characters)
  const tiles = [
    { label: '看過的字', value: s.watched, note: s.watchedToday ? `今天看了 ${s.watchedToday} 個` : '今天還沒看' },
    { label: '認得的字', value: s.known, note: s.dueToday ? `今天該複習 ${s.dueToday} 個（餵大怪獸）` : '今天沒有要複習的' },
    { label: '收集的詞', value: s.words, note: s.wordsToday ? `今天新拼了 ${s.wordsToday} 個（詞語拼圖）` : '詞語拼圖' },
    { label: '小鎮居民', value: s.traced, note: '描過的字' },
  ]
  return (
    <div className="st-learn">
      <h2 className="st-learn-title">孩子的學習小結</h2>
      <p className="st-dim">從孩子端的遊戲紀錄整理。要編輯字卡，從左邊選一個字。</p>

      <div className="st-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="st-tile">
            <span className="st-tile-label">{t.label}</span>
            <b className="st-tile-value">{t.value}</b>
            <span className="st-tile-note">{t.note}</span>
          </div>
        ))}
      </div>

      {s.talk.length > 0 && (
        <section className="st-card st-talk">
          <h4>💬 今天可以問他</h4>
          {s.talk.map((t) => <p key={t.word}>「你在哪裡看過<b>{t.emoji} {t.word}</b>？」</p>)}
          <p className="st-dim">這些是他最近在詞語拼圖收集的詞。讓他用手指、說一說或畫出來，字和生活連起來才記得牢。</p>
        </section>
      )}

      <div className="st-learn-cols">
        <section className="st-card">
          <h4>常找錯的字</h4>
          {s.tricky.length ? (
            <ul className="st-learn-list">
              {s.tricky.map((t) => (
                <li key={t.char}>
                  <button className="st-learn-char" onClick={() => onPick(t.char)} title="打開這個字">{t.char}</button>
                  <span className="st-dim">找錯 {t.wrong} 次、找對 {t.right} 次</span>
                </li>
              ))}
            </ul>
          ) : <p className="st-dim">餵大怪獸還沒有找錯過的字。</p>}
        </section>

        <section className="st-card">
          <h4>還要再練的詞</h4>
          {s.firstTry !== null && <p className="st-dim">詞語拼圖第一下就找對：{Math.round(s.firstTry * 100)}%</p>}
          {s.practice.length ? (
            <ul className="st-learn-list">
              {s.practice.map((p) => (
                <li key={p.word}>
                  <button className="st-learn-char" onClick={() => onPick(p.char)} title={`打開「${p.char}」`}>{p.char}</button>
                  <span>{p.word}</span>
                </li>
              ))}
            </ul>
          ) : <p className="st-dim">{s.words ? '最近拼的詞都是自己找對的。' : '還沒玩過詞語拼圖。'}</p>}
          {s.practice.length > 0 && <p className="st-dim">這些詞下一輪拼圖會先回來複習。</p>}
        </section>
      </div>
    </div>
  )
}
