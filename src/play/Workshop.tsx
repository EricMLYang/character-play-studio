import { useEffect, useMemo, useRef, useState } from 'react'
import type { Progress } from '../types'
import { preloadVoice, say, sayAll, stopSpeech, voiceDuration } from '../lib/audio'
import { boing, cheer, ladder, snap, tap } from '../lib/sfx'
import { RADICAL_FIXED, RADICALS } from '../../shared/radicals.mjs'
import { loadChar } from './Strokes'
import { partsOf } from './parts'
import { BUILD_ROUNDS, boxOf, pickBuilds, restChar, splitOf, type Box, type Build, type Split, type StrokeData } from './building'
import type { Family } from './families'
import { useDrag } from './useDrag'
import MeaningFx from './MeaningFx'
import { Confetti, hueVar } from './ui'
import type { NextStop } from './Roots'

/**
 * 蓋字工坊（building.ts 有為什麼）：格子裡放著字的一半，下面三塊部首積木，哪一塊放上去會變成那個字？
 * 拖上去或點一下都可以；放對了部首從它那一邊滑進來「喀」一聲合體，接著演它的意思（水滴下來）。
 */
const lasts = (text: string) => (voiceDuration(text) ?? 0.3 * [...text].length + 0.5) * 1000
const RATE = 0.8
const BEAT = 360
const RADICAL_COLOR = '#0F7FA8'
/** 他多久沒動作就先給一句提示（那個字住這裡的原因），再久一點就讓對的那塊發亮 */
const HINT_AFTER = 6000

type Loaded = { strokes: Map<string, StrokeData>; splits: Map<string, Split> }

/** 抓這幾家需要的筆順檔、算出每個字怎麼切（抓不到的字就是切不開，不出題） */
async function loadSplits(families: Family[]): Promise<Loaded> {
  const strokes = new Map<string, StrokeData>()
  const splits = new Map<string, Split>()
  const grab = async (c: string) => {
    try { const d = await loadChar(c) as StrokeData; strokes.set(c, d); return d } catch { return null }
  }
  await Promise.all(families.filter((f) => f.kind === 'radical').map(async (f) => {
    const form = await grab(f.forms[f.forms.length - 1])
    if (!form) return
    await Promise.all(f.list.map(async (c) => {
      const split = splitOf(await grab(c.char), form.strokes.length)
      if (split) splits.set(c.char, split)
    }))
  }))
  return { strokes, splits }
}

export default function Workshop({ family, families, progress, hue, onFind, onAgain, onHall, next }: {
  next?: NextStop
  family: Family
  families: Family[]
  progress: Progress
  hue: number
  onFind: (family: string, char: string, ok: boolean) => void
  onAgain: () => void
  onHall: () => void
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [builds, setBuilds] = useState<Build[]>([])
  const [index, setIndex] = useState(0)
  const [tried, setTried] = useState<string[]>([])
  const [merged, setMerged] = useState(false)
  const [hint, setHint] = useState(false)
  const [built, setBuilt] = useState<string[]>([])
  const timers = useRef<number[]>([])
  const voice = useRef<(() => void) | null>(null)
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const board = useRef<HTMLDivElement>(null)
  const pickRef = useRef<(id: string) => void>(() => {})
  const drag = useDrag({ target: () => board.current, onDrop: (id) => pickRef.current(id) })
  const streak = useRef(0)

  useEffect(() => {
    let alive = true
    loadSplits(families).then((l) => {
      if (!alive) return
      setLoaded(l)
      setBuilds(pickBuilds(family, families, progress, l.splits))
    })
    return () => { alive = false; clear(); voice.current?.(); stopSpeech() }
  }, [])

  const build = builds[index]
  const nameOf = (id: string) => RADICALS.find((r) => r.id === id)?.name ?? ''
  // 三塊積木（對的一塊＋兩塊干擾），每題洗一次位置
  const pieces = useMemo(() => {
    if (!build) return []
    const list = [{ family: build.family, char: build.char }, ...build.decoys]
    return list.map((p) => ({ ...p, id: `${p.family}:${p.char}`, sort: Math.random() })).sort((a, b) => a.sort - b.sort)
  }, [build])

  const ask = (b: Build) => {
    voice.current?.()
    voice.current = sayAll([RADICAL_FIXED.buildAsk, b.char], RATE, 120)
    later(() => { voice.current?.(); voice.current = sayAll([family.members[b.char]], RATE) }, HINT_AFTER)
    later(() => setHint(true), HINT_AFTER * 1.8)
  }
  useEffect(() => {
    if (!build) return
    preloadVoice([RADICAL_FIXED.buildAsk, build.char, family.members[build.char], RADICAL_FIXED.buildPlus, RADICAL_FIXED.buildMake,
      RADICAL_FIXED.buildNot, family.name, ...build.decoys.map((d) => nameOf(d.family))])
    clear()
    if (index === 0) {
      say(RADICAL_FIXED.buildHello, RATE)
      later(() => ask(build), lasts(RADICAL_FIXED.buildHello) + BEAT)
    } else ask(build)
  }, [build])

  const pick = (id: string) => {
    if (!build || merged || tried.includes(id)) return
    clear()
    voice.current?.()
    setHint(false)
    const [fam] = id.split(':')
    if (fam !== build.family) {
      // 放錯：那塊搖一搖、說它是哪一家，再試一次
      boing()
      streak.current = 0
      setTried((t) => [...t, id])
      voice.current = sayAll([nameOf(fam), RADICAL_FIXED.buildNot], RATE, 160)
      later(() => setHint(true), 2600)
      return
    }
    const first = tried.length === 0
    setMerged(true)
    snap()
    if (first) { streak.current += 1; later(() => ladder(streak.current), 160) }
    onFind(family.id, build.char, first)
    const rest = restChar(partsOf(build.char), build.split)
    const line = rest ? [family.name, RADICAL_FIXED.buildPlus, rest, RADICAL_FIXED.buildMake, build.char] : [RADICAL_FIXED.buildMake, build.char]
    let t = 500
    later(() => { voice.current = sayAll(line, RATE, 140) }, t)
    t += line.reduce((n, s) => n + lasts(s) + 140, 0) + BEAT
    later(() => { voice.current = sayAll([family.members[build.char]], RATE) }, t)
    t += lasts(family.members[build.char]) + 900
    later(() => {
      setBuilt((b) => [...b, build.char])
      setMerged(false)
      setTried([])
      if (index + 1 >= builds.length) {
        cheer()
        say(RADICAL_FIXED.buildDone, RATE)
        if (next) later(() => say(next.say, RATE), lasts(RADICAL_FIXED.buildDone) + BEAT)
        setIndex(builds.length)
        return
      }
      setIndex(index + 1)
    }, t)
  }
  pickRef.current = pick

  if (!loaded) return <div className="ws"><p className="ws-loading">準備積木中…</p></div>
  if (!builds.length) {
    return (
      <div className="ws">
        <p className="ws-loading">這一家的字還沒辦法拆開來蓋，換一家試試看！</p>
        <div className="roots-actions"><button className="roots-btn" onClick={() => { tap(); onHall() }}>🏠 換一家</button></div>
      </div>
    )
  }
  if (!build) {
    return (
      <div className="ws ws-done" style={{ ['--hue' as any]: hueVar(hue) }}>
        <Confetti />
        <p className="ws-done-title">你自己蓋出了這些字！</p>
        <div className="ws-done-row">{built.map((c) => (
          <span key={c} className="ws-done-char"><Glyph data={loaded.strokes.get(c)!} rad={loaded.splits.get(c)!.rad} /></span>
        ))}</div>
        <div className="roots-actions">
          {next && <button className="roots-btn go" onClick={() => { tap(); next.go() }}>{next.label}</button>}
          <button className={'roots-btn' + (next ? '' : ' go')} onClick={() => { tap(); onAgain() }}>🔨 再蓋一次</button>
          <button className="roots-btn" onClick={() => { tap(); onHall() }}>🏠 換一家</button>
        </div>
      </div>
    )
  }

  const data = loaded.strokes.get(build.char)!
  const { rad, rest, layout } = build.split
  return (
    <div className="ws" style={{ ['--hue' as any]: hueVar(hue) }}>
      <p className="ws-step" aria-hidden>{Array.from({ length: Math.min(BUILD_ROUNDS, builds.length) }, (_, i) => (
        <span key={i} className={i < index ? 'on' : i === index ? 'now' : ''} />
      ))}</p>
      <div ref={board} className={'ws-board' + (merged ? ' merged' : '')}>
        <MeaningFx family={family.id} on={merged} playKey={index}>
          <svg viewBox="0 0 1024 1024" className="ws-grid" aria-label={merged ? build.char : `${build.char}的一半`}>
            <g className="ws-guides"><line x1="512" y1="0" x2="512" y2="1024" /><line x1="0" y1="512" x2="1024" y2="512" /></g>
            <g transform="scale(1, -1) translate(0, -900)">
              {rest.map((i) => <path key={i} d={data.strokes[i]} className="ws-rest" />)}
              {merged
                ? <g className={`ws-rad in-${layout}`}>{rad.map((i) => <path key={i} d={data.strokes[i]} />)}</g>
                : <SlotBox box={boxOf(data, rad)} />}
            </g>
          </svg>
        </MeaningFx>
      </div>
      <div className="ws-tray" aria-label="部首積木">
        {pieces.map((p) => {
          const d = loaded.strokes.get(p.char)
          const sp = loaded.splits.get(p.char)
          if (!d || !sp) return null
          const right = p.family === build.family
          return (
            <button key={`${index}-${p.id}`} {...drag(p.id)} disabled={merged || tried.includes(p.id)}
              className={'ws-piece' + (tried.includes(p.id) ? ' nope' : '') + (hint && right && !merged ? ' hint' : '') + (merged && right ? ' used' : '')}
              onClick={() => pick(p.id)} aria-label={nameOf(p.family)}>
              <Piece data={d} strokes={sp.rad} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** 部首要放的那一格：虛線框，一直輕輕閃 */
function SlotBox({ box }: { box: Box }) {
  const pad = 70
  return <rect className="ws-slot" x={box[0] - pad} y={box[1] - pad} width={box[2] - box[0] + pad * 2} height={box[3] - box[1] + pad * 2} rx="60" />
}

/** 一塊積木：只畫那幾筆，框框剪到剛好包住 */
function Piece({ data, strokes }: { data: StrokeData; strokes: number[] }) {
  const b = boxOf(data, strokes)
  const pad = 110
  const w = b[2] - b[0] + pad * 2
  const h = b[3] - b[1] + pad * 2
  const side = Math.max(w, h)
  // viewBox 在翻過來的座標裡：y' = 900 - y
  const x = (b[0] + b[2]) / 2 - side / 2
  const y = 900 - (b[1] + b[3]) / 2 - side / 2
  return (
    <svg viewBox={`${x} ${y} ${side} ${side}`} className="ws-piece-svg" aria-hidden>
      <g transform="scale(1, -1) translate(0, -900)">{strokes.map((i) => <path key={i} d={data.strokes[i]} fill={RADICAL_COLOR} />)}</g>
    </svg>
  )
}

/** 蓋好的字：部首藍色、其餘深色 */
function Glyph({ data, rad }: { data: StrokeData; rad: number[] }) {
  return (
    <svg viewBox="0 0 1024 1024" aria-hidden>
      <g transform="scale(1, -1) translate(0, -900)">
        {data.strokes.map((d, i) => <path key={i} d={d} fill={rad.includes(i) ? RADICAL_COLOR : '#2E2A26'} />)}
      </g>
    </svg>
  )
}
