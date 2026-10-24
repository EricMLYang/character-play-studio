import type { CharEntry, Progress } from '../types'
import { summarize } from './summary'
import { pathDone, todayPath } from '../play/today'

/**
 * 沒選字時 Studio 主區顯示的「孩子的學習小結」：看字、認字（餵大怪獸／跳石頭過河／小偵探，三個記同一種紀錄）、
 * 詞彙（詞語拼圖）、小鎮、星星與夥伴。
 * 最後給家長一兩句可以在生活裡問孩子的話——字要跟生活連起來才記得住。
 */
export default function LearningSummary({ progress, characters, onPick }: {
  progress: Progress
  characters: CharEntry[]
  onPick: (char: string) => void
}) {
  const s = summarize(progress, characters)
  // 孩子端首頁的「今天的路」：家長看得到他走到哪一站，才接得上話
  const stops = todayPath(characters.filter((c) => !c.hidden), progress)
  const tiles = [
    { label: '看過的字', value: s.watched, note: s.watchedToday ? `今天看了 ${s.watchedToday} 個` : '今天還沒看' },
    { label: '認得的字', value: s.known, note: s.dueToday ? `今天該複習 ${s.dueToday} 個（餵大怪獸／過河／小偵探）` : '今天沒有要複習的' },
    { label: '收集的詞', value: s.words, note: s.wordsToday ? `今天新拼了 ${s.wordsToday} 個（詞語拼圖）` : '詞語拼圖' },
    { label: '小鎮居民', value: s.traced, note: '描過的字' },
    // 孩子端他自己在追的那條線：看過、憑記憶寫、認出來、在詞裡讀到、找到牠的家各一顆星
    { label: '⭐ 星星', value: s.stars, note: s.toNextPartner === null ? `夥伴收齊了（${s.partners} 位）` : `再 ${s.toNextPartner} 顆開寶箱（已有 ${s.partners} 位夥伴）` },
    { label: '👑 集滿星星', value: s.full.length, note: s.full.length ? s.full.slice(0, 8).join('、') : '五件事都做過的字' },
  ]
  return (
    <div className="st-learn">
      <h2 className="st-learn-title">孩子的學習小結</h2>
      <p className="st-dim">從孩子端的遊戲紀錄整理。要編輯字卡，從左邊選一個字。</p>

      {stops.length > 1 && (
        <p className="st-quests">
          <b>今天的路：</b>
          {stops.map((q) => (
            <span key={q.id} className={q.done >= q.need ? 'done' : ''}>
              {q.done >= q.need ? '✅' : q.icon} {q.title}{q.chars.length ? `（${q.chars.join('、')}）` : ''} {q.need > 1 ? `${q.done}/${q.need}` : ''}
            </span>
          ))}
          {pathDone(stops) && <span className="done">🎉 走完了</span>}
        </p>
      )}

      <div className="st-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="st-tile">
            <span className="st-tile-label">{t.label}</span>
            <b className="st-tile-value">{t.value}</b>
            <span className="st-tile-note">{t.note}</span>
          </div>
        ))}
      </div>

      {s.nearly.length > 0 && (
        <section className="st-card st-nearly">
          <h4>⭐ 只差一顆就集滿</h4>
          <p className="st-dim">
            孩子端那隻角色也會挑一個講，這裡一次看得到全部。點字可以編輯它；
            孩子自己在字卡右上角那排星星點「去 →」，就會直接到那個遊戲，而且第一題就出這個字。
          </p>
          <ul className="st-nearly-list">
            {s.nearly.map((n) => (
              <li key={n.char}>
                <button className="st-nearly-char" onClick={() => onPick(n.char)}>{n.char}</button>
                <span>還差「{n.deed}」</span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
          ) : <p className="st-dim">認字的遊戲裡還沒有找錯過的字。</p>}
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
