import { useEffect, useMemo, useRef, useState } from 'react'
import type { CharEntry, Progress } from '../types'
import { preloadVoice, say, stopSpeech, voiceDuration } from '../lib/audio'
import { boing, cheer, drum, gulp, hic, tap } from '../lib/sfx'
import { taiwanDay } from '../../shared/domain.mjs'
import { FIXED_LINES, LINES } from '../../shared/voice-lines.mjs'
import { BURST, DISHES, fillBelly, mysteryIndex, pickDishes, plateFor, recallLevel, recap, requeue } from './dishes'
import { forgetServeRequest, partnersAt, serveLine, skyFor, waiterFor } from './partners'
import InkReveal from './InkReveal'
import { Confetti, SubBar } from './ui'
import { FINALES, FINALE_IDS, pickFinale, type FinaleId } from './finales'
import { exampleWord } from './puzzles'
import type { Stop, StopGo } from './today'

/**
 * 餵大怪獸：怪獸說「我要吃火！」，孩子從兩張只有字的卡片裡找出來餵牠。
 * 卡片上沒有圖、沒有顏色：要靠讀字，不是看圖。找對了，卡片上才變出圖，怪獸把那個圖吃掉，那是獎勵。
 * 找錯不是錯：怪獸說「這是水耶！」，翻開給他看那是什麼，再提示正確的那張，一定吃得到；
 * 這個字隔兩道菜會再上一次，讓他自己再找一次。
 * 自己找到的字會把肚子越撐越大，塞滿 BURST 個就發生一件大事（爆炸、睡著、打嗝飛上天、變彩虹，見 finales.ts），再回來繼續吃。
 * 最後怪獸只把他自己找對的字一個一個唸出來，靠提示才吃到的放在旁邊「再去看看」。
 *
 * 2026-10-24 把跳石頭過河與小偵探併進來（三個考的都是同一件事、記同一份紀錄）：
 * - 盤子上幾張卡跟著他走（dishes.ts 的 recallLevel：常找錯整輪兩張，認得順第二道起三張）
 * - 第三道是**神秘料理**（原本的小偵探）：怪獸不說字，盤子上一筆一筆把字畫出來，他看字形認
 * - 每一輪由一位**夥伴來端菜**（原本在河邊等他的那幾位），一位夥伴一種天色
 *
 * 2026-10-26 結尾順一點：結算唸字時點一下畫面就跳到最後；按鈕的位置一開始就留好，不會唸完才把版面擠上去；
 * 今天的路「想起來」這一站做完了，主按鈕就是「下一站」並唸出下一站要做什麼，還沒做完就是「再餵一次」。
 */
type Phase = 'hello' | 'ask' | 'oops' | 'got' | 'chomp' | 'yum' | 'swell' | 'climax' | 'back' | 'recap' | 'full'

const POSE: Record<Phase, string> = { hello: 'roar', ask: 'idle', oops: 'oops', got: 'surprised', chomp: 'surprised', yum: 'happy', swell: 'stuffed', climax: 'surprised', back: 'dizzy', recap: 'happy', full: 'happy' }
/** 這句話大概要唸多久（有音檔就用音檔長度），下一句才不會蓋掉它 */
const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000
/** 句子之間的空拍：固定長度，聽起來才有節奏 */
const BEAT = 380
/** 點完菜他還沒選，隔多久再提醒一次、最多提醒幾次 */
const REMIND_AFTER = 4500
const REMINDERS = 2
/** 提醒完還是沒點：再等這麼久，就讓對的那張發亮（算沒自己找到，這個字等一下再上一次） */
const HINT_AFTER = 4000

type Served = { char: string; ok: boolean }

/** 結局袋子跨輪保留：再餵一次也不會馬上又是同一種 */
let finaleBag: FinaleId[] = []
let lastFinale: FinaleId | null = null

export default function Feed({ library, progress, stars, want, onRecall, onPick, onBack, path, onWalk }: {
  library: CharEntry[]
  progress: Progress
  /** 總共幾顆星星：決定他收集到哪幾位夥伴，輪流來端菜（partners.ts） */
  stars: number
  /** 他為了哪個字來的（字卡上的「去 →」）：第一道菜就出這個字 */
  want?: string
  /** 這個字第一次就找對了沒有（每個字每輪只記一次） */
  onRecall: (char: string, ok: boolean) => void
  onPick: (char: string) => void
  onBack: () => void
  /** 今天的路（today.ts）：吃完看「想起來」這一站做完沒、下一站是哪 */
  path: Stop[]
  onWalk: (go: StopGo) => void
}) {
  const byChar = useMemo(() => new Map(library.map((c) => [c.char, c])), [library])
  // 只考他看過的字
  const pool = useMemo(() => library.filter((c) => progress.watched[c.char]).map((c) => c.char), [library, progress.watched])
  const everyone = useMemo(() => library.map((c) => c.char), [library])
  const newDishes = () => pickDishes(pool, progress, taiwanDay())
  // 進來的第一輪才認 want：按「再餵一次」的時候他已經在玩了，不是為了那個字來的
  const [dishes, setDishes] = useState(() => pickDishes(pool, progress, taiwanDay(), Math.random, DISHES, want))
  // 這一輪實際上的菜：點錯的字會再插進來一次
  const [queue, setQueue] = useState(dishes)
  /** 第幾輪：夥伴照這個輪流來端菜 */
  const [rounds, setRounds] = useState(0)
  const [waiter, setWaiter] = useState(() => waiterFor(0, partnersAt(stars)))
  /** 盤子上放幾張卡跟著他走；這一輪的第幾道是神秘料理（怪獸不說字，一筆一筆畫出來） */
  const level = useMemo(() => recallLevel(progress), [dishes])
  const mystery = mysteryIndex(dishes.length)
  /** 神秘料理的字沒有筆順資料：退回一般的點菜 */
  const [inkFailed, setInkFailed] = useState(false)
  const [at, setAt] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [phase, setPhase] = useState<Phase>('hello')
  const [missed, setMissed] = useState(false)
  const [wrong, setWrong] = useState<string | null>(null)
  const [served, setServed] = useState<Served[]>([])
  /** 肚子裡塞了幾個自己找到的字（塞滿 BURST 個就爆炸） */
  const [belly, setBelly] = useState(0)
  /** 爆炸時噴出來的東西：剛剛吃下去的那幾個圖 */
  const [burst, setBurst] = useState<string[]>([])
  /** 這次撐滿演哪一種 */
  const [finale, setFinale] = useState<FinaleId>('boom')
  /** 結算時正在唸第幾個字 */
  const [reading, setReading] = useState(-1)
  const recorded = useRef(new Set<string>())
  const timers = useRef<number[]>([])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const target = queue[at]
  // 排好的提醒觸發時要看「現在」是第幾道、有沒有提示過（排的時候的值可能已經舊了）
  const now = useRef({ at, missed })
  now.current = { at, missed }
  /** 找對時唸的詞：每一輪替每道菜換一個（具體的詞優先），多聽到幾個詞 */
  const dishWords = useMemo(() => new Map(dishes.map((c) => [c, byChar.get(c) ? exampleWord(byChar.get(c)!) : undefined])), [dishes, byChar])
  const wordOf = (c: string) => dishWords.get(c)?.text ?? c
  // 今天的路上「想起來」這一站，跟它後面第一個還沒做完的站（從「自己逛逛」進來、字還太少時沒有這一站）
  const stop = path.find((s) => s.id === 'recall')
  const nextStop = stop ? path.slice(path.indexOf(stop) + 1).find((s) => s.done < s.need) : undefined
  const stopDone = Boolean(stop && stop.done >= stop.need)
  // 吃飽那一下是排好的計時器觸發的，要看「現在」這一站做完沒（紀錄是一道一道記進去的）
  const walk = useRef({ stopDone, nextStop })
  walk.current = { stopDone, nextStop }
  const record = (char: string, ok: boolean) => {
    if (recorded.current.has(char)) return
    recorded.current.add(char)
    onRecall(char, ok)
  }

  /**
   * 有節奏地點菜：咚、咚 →「我要吃火！」→「火！」→「火！」。
   * 題目字一次唸三遍，他還沒點就隔一下整段再唸，最多提醒 REMINDERS 次。
   */
  const ask = (char: string, reminders = REMINDERS, lead = 0) => {
    let t = lead
    later(drum, t)
    later(drum, t + 200)
    t += 520
    for (const text of [LINES.feedAsk(char), char, char]) {
      later(() => say(text, 0.8), t)
      t += lasts(text) + BEAT
    }
    if (reminders > 0) later(() => ask(char, reminders - 1), t + REMIND_AFTER)
    else later(() => showHint(char), t + HINT_AFTER)
  }

  /** 唸了好幾次他還是沒點：對的那張發亮，不要讓他一直卡著 */
  const showHint = (char: string) => {
    if (now.current.missed) return
    const i = now.current.at
    record(char, false)
    setQueue((q) => requeue(q, i, char))
    setMissed(true)
    tap()
  }

  /** 這一道是不是神秘料理（點錯再上一次的那道照一般點菜） */
  const isMystery = (i: number, list: string[]) => i === mystery && list.indexOf(list[i]) === i && !inkFailed

  const serve = (list: string[], i: number) => {
    const char = list[i]
    setAt(i)
    setOptions(plateFor(char, i, pool, everyone, level))
    setMissed(false)
    setWrong(null)
    setPhase('ask')
    // 神秘料理：不說字，盤子上一筆一筆畫（InkReveal 畫完才排提示）
    if (isMystery(i, list)) { later(() => say(FIXED_LINES.guessWho, 0.8), 350); return }
    ask(char, REMINDERS, 350)
  }

  /** 吃飽了：打個嗝說謝謝；今天的路這一站做完了，接著唸下一站要做什麼 */
  const full = () => {
    setReading(-1)
    setPhase('full')
    hic()
    say(FIXED_LINES.feedFull, 0.8)
    const { stopDone, nextStop } = walk.current
    if (stopDone && nextStop) later(() => say(nextStop.say, 0.85), lasts(FIXED_LINES.feedFull) + BEAT)
  }

  /** 結算唸字唸到一半他點了畫面：不用等，直接吃飽、出按鈕 */
  const skipRecap = () => {
    if (phase !== 'recap') return
    clear()
    stopSpeech()
    full()
  }

  /** 結算畫面上點一個字去看：先把還沒唸完的停掉，不然字卡打開了怪獸還在背後唸 */
  const openChar = (c: string) => {
    clear()
    stopSpeech()
    if (phase === 'recap') { setReading(-1); setPhase('full') }
    onPick(c)
  }

  /** 吃完了：「我吃到了這些字！」，再把他自己找對的字一個一個唸出來，最後打個嗝說吃飽了 */
  const finish = (all: Served[]) => {
    const { good } = recap(all)
    cheer()
    if (!good.length) { setPhase('full'); later(full, 500); return }
    setPhase('recap')
    let t = 500
    later(() => say(FIXED_LINES.feedRecap, 0.8), t)
    t += lasts(FIXED_LINES.feedRecap) + BEAT
    good.forEach((c, i) => {
      later(() => { setReading(i); say(c, 0.8) }, t)
      t += Math.max(lasts(c), 500) + BEAT
    })
    later(full, t + 200)
  }

  // 一進來先喊肚子餓，再點第一道菜
  useEffect(() => {
    // 不到兩道菜時畫面是「先去看幾個字」，不要在背後喊肚子餓、點菜
    if (dishes.length < 2) return
    preloadVoice([serveLine(waiter), FIXED_LINES.feedHungry, FIXED_LINES.feedFull, FIXED_LINES.feedRecap, FIXED_LINES.guessWho, ...FINALE_IDS.flatMap((id) => [FINALES[id].swell, FINALES[id].climax, FINALES[id].back]), ...dishes.flatMap((c) => [LINES.feedAsk(c), c, wordOf(c)])])
    forgetServeRequest()
    recorded.current = new Set()
    setQueue(dishes)
    setAt(0)
    setServed([])
    setBelly(0)
    setBurst([])
    setReading(-1)
    setPhase('hello')
    // 夥伴先報到，怪獸再喊餓
    say(serveLine(waiter), 0.8)
    const lead = lasts(serveLine(waiter)) + BEAT
    later(() => say(FIXED_LINES.feedHungry, 0.8), lead)
    later(() => serve(dishes, 0), lead + lasts(FIXED_LINES.feedHungry) + 300)
    return () => { clear(); stopSpeech() }
  }, [dishes])

  const pick = (char: string) => {
    // 點錯之後怪獸還在說「這是○耶！」：他馬上改點對的那張也要收，不能按了沒反應
    const fixing = phase === 'oops' && char === target
    if ((phase !== 'ask' && !fixing) || char === wrong) return
    clear()   // 還沒唸完的題目與提醒都停掉
    if (char === target) {
      record(target, !missed)
      // 找到了：卡片上變出圖，唸一個有這個字的詞，把字放回他會說的話
      const word = wordOf(target)
      const all = [...served, { char: target, ok: !missed }]
      setPhase('got')
      say(word, 0.8)
      const shown = Math.max(1300, lasts(word) + 300)
      // 怪獸把圖吃掉，盤子上出現那個圖
      later(() => { setPhase('chomp'); gulp() }, shown)
      const fill = fillBelly(belly, !missed)
      const next = () => (at + 1 < queue.length ? serve(queue, at + 1) : finish(all))
      let t = shown + 650
      later(() => { setServed(all); setBelly(fill.boom ? BURST : fill.belly); setPhase('yum') }, t)
      t += 900
      if (!fill.boom) { later(next, t); return }
      // 塞滿了：抽一種結局。撐得發抖 → 大事發生（爆炸／睡著／飛上天／變彩虹）→ 縮回原本大小，再繼續吃
      const pickd = pickFinale(finaleBag, lastFinale)
      finaleBag = pickd.bag
      lastFinale = pickd.id
      const f = FINALES[pickd.id]
      const eaten = all.filter((s) => s.ok).slice(-BURST).map((s) => byChar.get(s.char)?.emoji || '✨')
      later(() => { setFinale(pickd.id); setPhase('swell'); f.swellSfx(); say(f.swell, 0.8) }, t)
      t += Math.max(1200, lasts(f.swell) + 200)
      later(() => { setBurst(eaten); setBelly(0); setPhase('climax'); f.climaxSfx(later); say(f.climax, 0.8) }, t)
      t += Math.max(f.climaxMs, lasts(f.climax) + 300)
      later(() => { setPhase('back'); say(f.back, 0.8) }, t)
      t += lasts(f.back) + BEAT
      later(next, t)
      return
    }
    // 點錯：怪獸說那是什麼字，翻開給他看，再點一次菜；正確的那張發亮。這個字等一下會再上一次
    record(target, false)
    if (!missed) setQueue((q) => requeue(q, at, target))
    setMissed(true)
    setWrong(char)
    setPhase('oops')
    boing()
    say(LINES.feedNotThis(char), 0.8)
    const pause = lasts(LINES.feedNotThis(char)) + BEAT
    later(() => setPhase('ask'), pause)
    // 神秘料理：畫還在繼續，不用再唸一次題目
    if (!isMystery(at, queue)) ask(target, REMINDERS, pause)
  }

  const again = () => {
    tap()
    clear()
    setInkFailed(false)
    setRounds((r) => r + 1)
    setWaiter(waiterFor(rounds + 1, partnersAt(stars)))
    setDishes(newDishes())
  }

  if (dishes.length < 2) {
    return (
      <div className="feed">
        <SubBar title="🍽️ 餵大怪獸" onBack={onBack} />
        <div className="feed-empty">
          <img className="feed-monster" src="/hero/monster/idle.png" alt="" />
          <p>大怪獸只吃你看過的字。<br />先去看幾個字，再回來餵牠！</p>
          <button className="nav-btn primary" onClick={onBack}>去看字 →</button>
        </div>
      </div>
    )
  }

  const { good, again: review } = recap(served)
  const pose = phase === 'swell' || phase === 'climax' || phase === 'back' ? FINALES[finale].pose[phase] : POSE[phase]
  const done = phase === 'recap' || phase === 'full'
  /** 這道是剛剛點錯、再上一次的字 */
  const encore = queue.indexOf(target) < at

  const mysteryNow = target !== undefined && isMystery(at, queue)
  return (
    <div className={`feed sky-${skyFor(waiter)}`}>
      <SubBar title="🍽️ 餵大怪獸" stat={`餵了 ${served.length} / ${queue.length} 道`} onBack={onBack} />
      <div className="feed-plates" aria-label={`已經餵了 ${served.length} 道`}>
        {queue.map((c, i) => (
          <span key={i} className={'feed-plate' + (i < served.length ? ' done' : '') + (queue.indexOf(c) < i ? ' encore' : '')}>
            {i < served.length ? byChar.get(served[i].char)?.emoji || '✨' : ''}
          </span>
        ))}
      </div>

      <div className={`feed-main phase-${phase} finale-${finale}` + (belly === BURST - 1 ? ' nearly' : '')} onClick={skipRecap}>
        <section className="feed-stage" aria-live="polite" style={{ ['--belly' as any]: belly / BURST }}>
          <div className="feed-bubble">
            {phase === 'hello' && '我肚子好餓喔！'}
            {phase === 'ask' && !mysteryNow && (
              <button className="feed-ask" onClick={() => { tap(); clear(); ask(target, 1) }} aria-label="再聽一次要吃什麼">
                我要吃…<span aria-hidden>🔊</span>
              </button>
            )}
            {phase === 'ask' && mysteryNow && (
              <button className="feed-ask" onClick={() => { tap(); say(FIXED_LINES.guessWho, 0.8) }} aria-label="再聽一次">
                猜猜我要吃誰？<span aria-hidden>🔊</span>
              </button>
            )}
            {phase === 'oops' && wrong && <>這是「<b>{wrong}</b>」耶！</>}
            {phase === 'got' && '哇！'}
            {phase === 'chomp' && '啊嗚～'}
            {phase === 'yum' && (belly >= BURST ? '我的肚子…' : '好好吃！')}
            {(phase === 'swell' || phase === 'climax' || phase === 'back') && FINALES[finale][phase]}
            {phase === 'recap' && (reading >= 0 ? <>「<b>{good[reading]}</b>」！</> : '我吃到了這些字！')}
            {phase === 'full' && '我吃飽了！謝謝你！'}
          </div>
          <img className="feed-monster" src={`/hero/monster/${pose}.png`} alt="大怪獸" />
          {/* 端菜的夥伴：他收集到的那幾位輪流來，一位一種天色 */}
          <img className="feed-waiter" src={`/hero/${waiter.id}/${phase === 'got' || phase === 'yum' ? 'happy' : 'idle'}.png`} alt={waiter.name} title={serveLine(waiter)} />
          {phase === 'climax' && <FinaleFx id={finale} eaten={burst} />}
          <div className={'feed-belly' + (belly === BURST - 1 ? ' nearly' : '')} aria-label={`肚子裡有 ${belly} 個字，${BURST} 個就會爆炸`} role="img">
            {Array.from({ length: BURST }, (_, i) => <span key={i} className={i < belly ? 'full' : ''} />)}
          </div>
          {/* 預先載入其他表情，換的時候不會閃 */}
          <span className="feed-preload" aria-hidden>
            {[...new Set([...Object.values(POSE), ...FINALE_IDS.flatMap((id) => Object.values(FINALES[id].pose))])].map((p) => <img key={p} src={`/hero/monster/${p}.png`} alt="" />)}
          </span>
        </section>

        <section className="feed-table" aria-label="盤子上的字">
          {done ? (
            <div className="feed-reveal feed-done" role="status">
              {good.length > 0 ? <>
                <p className="feed-done-title">你自己找到的字：</p>
                <div className="feed-done-row">
                  {good.map((c, i) => (
                    <button key={c} className={'feed-done-char' + (i === reading ? ' reading' : '')} onClick={(e) => { e.stopPropagation(); openChar(c) }} aria-label={`去看「${c}」`}>
                      <span aria-hidden>{byChar.get(c)?.emoji}</span>{c}
                    </button>
                  ))}
                </div>
              </> : <p className="feed-done-title">下次再來找找看！</p>}
              {/* 下面這些唸完才出現，但位置一開始就留好：不會唸完才把上面那排擠上去 */}
              {review.length > 0 && (
                <div className={'feed-review feed-later' + (phase === 'full' ? ' shown' : '')}>
                  <span>再去看看 👀</span>
                  {review.map((c) => (
                    <button key={c} className="feed-review-char" onClick={() => openChar(c)} aria-label={`去看「${c}」`}>{c}</button>
                  ))}
                </div>
              )}
              <div className={'game-actions feed-later' + (phase === 'full' ? ' shown' : '')}>
                {stopDone && nextStop ? <>
                  <button className="nav-btn primary" onClick={() => { tap(); clear(); stopSpeech(); onWalk(nextStop.go) }}>下一站：{nextStop.icon} {nextStop.title} →</button>
                  <button className="nav-btn" onClick={again}>🍽️ 再餵一次</button>
                </> : <>
                  <button className="nav-btn primary" onClick={again}>🍽️ 再餵一次</button>
                  <button className="nav-btn" onClick={onBack}>回首頁</button>
                </>}
              </div>
              {/* 想起來這一站還差幾個：一個點一個字，他讀不到「還差 1 個」也看得懂 */}
              {stop && !stopDone && (
                <div className={'feed-stop feed-later' + (phase === 'full' ? ' shown' : '')} aria-label={`想起來：${stop.done} / ${stop.need}`}>
                  <span aria-hidden>{stop.icon}</span>
                  {Array.from({ length: stop.need }, (_, i) => <span key={i} className={i < stop.done ? 'on' : ''} />)}
                </div>
              )}
              {phase === 'full' && good.length > 0 && <Confetti />}
            </div>
          ) : ['yum', 'swell', 'climax', 'back'].includes(phase) ? null : (
            <div className={'feed-pick' + (mysteryNow ? ' mystery' : '')}>
              {mysteryNow && (phase === 'ask' || phase === 'oops') && (
                <InkReveal char={target} running={phase === 'ask'}
                  onDrawn={() => later(() => showHint(target), HINT_AFTER)}
                  onUnavailable={() => { setInkFailed(true); ask(target, REMINDERS, 200) }} />
              )}
              <div className="feed-cards">
                {options.map((c) => {
                  const flipped = c === wrong
                  const hint = missed && c === target && phase === 'ask'
                  const mine = c === target && (phase === 'got' || phase === 'chomp')
                  const gone = c !== target && (phase === 'got' || phase === 'chomp')
                  return (
                    <button key={`${at}-${c}`}
                      className={'feed-card' + (flipped ? ' flipped' : '') + (hint ? ' hint' : '') + (mine ? ' got' : '') + (mine && phase === 'chomp' ? ' eaten' : '') + (gone ? ' gone' : '')}
                      disabled={(phase !== 'ask' && !(phase === 'oops' && c === target)) || flipped} onClick={() => pick(c)} aria-label={flipped ? `這是「${c}」` : `餵「${c}」`}>
                      {(flipped || mine) && <span className="feed-card-emoji" aria-hidden>{byChar.get(c)?.emoji}</span>}
                      <span className="feed-card-char">{c}</span>
                    </button>
                  )
                })}
              </div>
              {phase === 'got' && target && dishWords.get(target) && (
                <span className="feed-got-word" role="status">{dishWords.get(target)!.emoji} {dishWords.get(target)!.text}</span>
              )}
            </div>
          )}
        </section>
      </div>
      {phase === 'ask' && !missed && at === 0 && <p className="game-hint feed-tip">聽聽看牠要吃哪個字，點那一張餵牠！</p>}
      {phase === 'ask' && !missed && mysteryNow && <p className="game-hint feed-tip">神秘料理！看牠一筆一筆畫出哪個字，猜到就點那一張！</p>}
      {phase === 'ask' && encore && !missed && <p className="game-hint feed-tip">剛剛那個字又來了，這次自己找找看！</p>}
      {phase === 'ask' && missed && !wrong && <p className="game-hint feed-tip">找找看發亮的那一張！</p>}
    </div>
  )
}

/** 大事發生那一拍的畫面效果：每種結局各自一組，樣式在 feed.css 的 .feed-fx-<id> */
function FinaleFx({ id, eaten }: { id: FinaleId; eaten: string[] }) {
  if (id === 'boom') {
    const bits = [...eaten, '⭐', '✨', '💥', ...eaten, '⭐', '✨', '🌟', ...eaten, '⭐', '💫']
    return (
      <div className="feed-fx feed-fx-boom" aria-hidden>
        {bits.map((e, i) => <span key={i} style={{ ['--a' as any]: `${(i * 360) / bits.length}deg`, ['--d' as any]: `${180 + (i % 3) * 60}px` }}>{e}</span>)}
      </div>
    )
  }
  if (id === 'sleep') {
    return (
      <div className="feed-fx feed-fx-sleep" aria-hidden>
        <span className="moon">🌙</span>
        {['⭐', '✨', '⭐', '✨', '⭐'].map((e, i) => <span key={i} className="star" style={{ ['--i' as any]: i }}>{e}</span>)}
        {['z', 'Z', 'Z', 'z', 'Z'].map((e, i) => <span key={i} className="zzz" style={{ ['--i' as any]: i }}>{e}</span>)}
      </div>
    )
  }
  if (id === 'rocket') {
    return (
      <div className="feed-fx feed-fx-rocket" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => <span key={i} className="puff" style={{ ['--i' as any]: i }}>💨</span>)}
        {eaten.map((e, i) => <span key={`e${i}`} className="crumb" style={{ ['--i' as any]: i }}>{e}</span>)}
      </div>
    )
  }
  return (
    <div className="feed-fx feed-fx-rainbow" aria-hidden>
      <span className="arc" />
      {Array.from({ length: 12 }, (_, i) => <span key={i} className="spark" style={{ ['--i' as any]: i }}>{['✨', '🌟', '💖', '⭐'][i % 4]}</span>)}
    </div>
  )
}
