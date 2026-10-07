import { FLOOR, type Scenery as Kind } from './clip'

/**
 * 背景場景：都畫在地板後面、淡淡的不搶戲，會動的部分（雲、泡泡、星星、雪）也只看 t。
 * 每種場景另外有一點地板花紋（草、沙、跑道線），讓舞台不是一整片色塊。
 */
export default function Scenery({ kind = 'hills', t, floor, sky }: { kind?: Kind; t: number; floor: string; sky: string }) {
  return <g aria-hidden>{BACK[kind](t, floor, sky)}</g>
}

export function FloorDecor({ kind = 'hills', t }: { kind?: Kind; t: number }) {
  return <g aria-hidden>{FRONT[kind]?.(t)}</g>
}

const drift = (t: number, speed: number, start: number) => ((start + t * speed) % 200) - 20
const twinkle = (t: number, i: number) => 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + i * 2.3))

function Clouds({ t, opacity = 0.7 }: { t: number; opacity?: number }) {
  return <>{[[2.2, 30, 14, 1], [1.4, 120, 9, 0.75], [1.8, 80, 22, 0.6]].map(([speed, start, y, k], i) => (
    <g key={i} transform={`translate(${drift(t, speed, start)} ${y}) scale(${k})`} fill="#fff" opacity={opacity}>
      <ellipse rx="9" ry="3.6" />
      <circle cx="-3" cy="-2.4" r="3.6" />
      <circle cx="2.6" cy="-3" r="4.4" />
    </g>
  ))}</>
}

function Hills({ floor, opacity = 0.5 }: { floor: string; opacity?: number }) {
  return <>
    <ellipse cx="22" cy={FLOOR + 6} rx="46" ry="18" fill={floor} opacity={opacity + 0.05} />
    <ellipse cx="142" cy={FLOOR + 8} rx="52" ry="20" fill={floor} opacity={opacity - 0.05} />
  </>
}

function Stars({ t, n = 18, color = '#fff' }: { t: number; n?: number; color?: string }) {
  return <>{Array.from({ length: n }, (_, i) => {
    const x = (i * 37.3 + 11) % 160, y = (i * 23.7 + 5) % 50
    return <circle key={i} cx={x} cy={y} r={i % 4 ? 0.45 : 0.8} fill={color} opacity={twinkle(t, i)} />
  })}</>
}

const BACK: Record<Kind, (t: number, floor: string, sky: string) => JSX.Element> = {
  hills: (t, floor) => <><Hills floor={floor} /><Clouds t={t} /></>,

  city: (t) => <>
    <Clouds t={t} opacity={0.55} />
    {[[0, 30, 14], [16, 22, 12], [30, 38, 16], [48, 26, 11], [61, 44, 13], [76, 30, 15], [93, 36, 12], [107, 24, 14], [123, 40, 13], [138, 28, 12], [150, 34, 14]].map(([x, h, w], i) => (
      <g key={i}>
        <rect x={x} y={FLOOR - h} width={w} height={h} fill="#000" opacity=".06" rx="0.8" />
        {Array.from({ length: Math.floor(h / 7) }, (_, r) => Array.from({ length: Math.floor(w / 5) }, (_, c) => (
          <rect key={`${r}-${c}`} x={x + 1.6 + c * 4.6} y={FLOOR - h + 3 + r * 6.5} width="1.8" height="2.4" fill="#fff"
            opacity={(r + c + i) % 3 ? 0.35 : 0.65} />
        )))}
      </g>
    ))}
  </>,

  ocean: (t) => <>
    {[20, 62, 104, 140].map((x, i) => (
      <polygon key={i} points={`${x - 4},-5 ${x + 4},-5 ${x + 18},${FLOOR} ${x + 6},${FLOOR}`} fill="#fff"
        opacity={0.1 + 0.05 * Math.sin(t * 1.3 + i)} />
    ))}
    {Array.from({ length: 10 }, (_, i) => {
      const x = (i * 17 + 8) % 160 + Math.sin(t * 2 + i) * 1.5
      const y = FLOOR - (((t * (6 + (i % 3) * 3) + i * 9) % 80))
      return <circle key={i} cx={x} cy={y} r={0.6 + (i % 3) * 0.4} fill="none" stroke="#fff" strokeWidth=".35" opacity=".6" />
    })}
  </>,

  space: (t) => <>
    <Stars t={t} n={28} />
    <g opacity=".55">
      <circle cx="18" cy="16" r="6" fill="#FFB86B" />
      <ellipse cx="18" cy="16" rx="10" ry="2.2" fill="none" stroke="#FFE1A8" strokeWidth=".8" transform="rotate(-18 18 16)" />
    </g>
    <circle cx="146" cy="12" r="2.5" fill="#B9E3FF" opacity=".6" />
  </>,

  snow: (t, floor) => <>
    <Hills floor={floor} opacity={0.9} />
    {Array.from({ length: 22 }, (_, i) => {
      const x = ((i * 29 + 7) % 170) - 5 + Math.sin(t * 1.5 + i) * 2
      const y = ((t * (5 + (i % 4) * 2) + i * 13) % 85) - 5
      return <circle key={i} cx={x} cy={y} r={0.5 + (i % 3) * 0.3} fill="#fff" opacity=".85" />
    })}
  </>,

  desert: (t, floor) => <>
    <circle cx="140" cy="16" r="7" fill="#FFE38A" opacity=".55" />
    <ellipse cx="30" cy={FLOOR + 4} rx="56" ry="13" fill={floor} opacity=".7" />
    <ellipse cx="128" cy={FLOOR + 6} rx="60" ry="15" fill={floor} opacity=".55" />
    <g fill="#5E8C4A" opacity=".35">
      <rect x="10" y={FLOOR - 12} width="2.4" height="12" rx="1.2" />
      <rect x="7.4" y={FLOOR - 9} width="2" height="5" rx="1" />
      <rect x="12.6" y={FLOOR - 10} width="2" height="4" rx="1" />
    </g>
    <Clouds t={t} opacity={0.4} />
  </>,

  room: () => <>
    {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 10} y="0" width="5" height={FLOOR} fill="#fff" opacity=".12" />)}
    <g opacity=".75">
      <rect x="10" y="12" width="22" height="18" rx="1" fill="#CDEBFF" stroke="#fff" strokeWidth="1.4" />
      <line x1="21" y1="12" x2="21" y2="30" stroke="#fff" strokeWidth="1" />
      <line x1="10" y1="21" x2="32" y2="21" stroke="#fff" strokeWidth="1" />
    </g>
    <rect x="132" y="14" width="16" height="12" rx="1" fill="#FFE7A8" stroke="#C9A06A" strokeWidth="1" opacity=".7" />
    <rect x="-20" y={FLOOR - 2} width="200" height="2" fill="#fff" opacity=".5" />
  </>,

  night: (t, floor, sky) => <>
    <Stars t={t} n={22} />
    <circle cx="140" cy="15" r="6" fill="#FFF3C4" opacity=".9" />
    <circle cx="143" cy="13" r="5.2" fill={sky} />
    <Hills floor={floor} opacity={0.6} />
  </>,

  forest: (t, floor) => <>
    <Clouds t={t} opacity={0.5} />
    {[[6, 26], [20, 34], [34, 24], [124, 30], [138, 38], [152, 26]].map(([x, h], i) => (
      <polygon key={i} points={`${x},${FLOOR - h} ${x - 8},${FLOOR} ${x + 8},${FLOOR}`} fill="#2F7D4A" opacity={0.16 + (i % 2) * 0.06} />
    ))}
    <Hills floor={floor} opacity={0.35} />
  </>,

  track: (t) => <>
    <Clouds t={t} opacity={0.6} />
    <rect x="-20" y={FLOOR - 16} width="200" height="16" fill="#000" opacity=".05" />
    {Array.from({ length: 40 }, (_, i) => (
      <circle key={i} cx={i * 4 + 2} cy={FLOOR - 10 + (i % 3) * 3} r="1.3" fill={['#FF8A80', '#80D8FF', '#FFE57F', '#B9F6CA'][i % 4]} opacity=".45" />
    ))}
  </>,
}

const FRONT: Partial<Record<Kind, (t: number) => JSX.Element>> = {
  hills: () => <Tufts color="#5FA347" />,
  forest: () => <Tufts color="#3F8A4F" />,
  desert: () => <Dots color="#B98A55" />,
  ocean: (t) => <>
    <Dots color="#C9A86A" />
    {[12, 40, 118, 148].map((x, i) => (
      <path key={i} d={`M${x},${FLOOR + 1} q${2 + Math.sin(t * 2 + i) * 1.5},-4 0,-8 q${-2 + Math.sin(t * 2 + i + 1) * 1.5},-4 0,-8`}
        fill="none" stroke="#3FA36B" strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
    ))}
  </>,
  track: () => <>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 18 + 2} y={FLOOR + 8} width="9" height="1.2" fill="#fff" opacity=".7" />)}</>,
  city: () => <>{Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 18 + 2} y={FLOOR + 9} width="9" height="1" fill="#fff" opacity=".55" />)}</>,
  room: () => <>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 20} y1={FLOOR} x2={i * 20 - 6} y2={90} stroke="#000" strokeWidth=".3" opacity=".1" />)}</>,
}

function Tufts({ color }: { color: string }) {
  return <>{[8, 26, 44, 63, 97, 116, 134, 152].map((x, i) => (
    <path key={i} d={`M${x - 1.5},${FLOOR + 6 + (i % 3) * 3} l1,-2 l0.5,1.6 l1,-2.2 l0.6,2.6`} fill="none" stroke={color} strokeWidth=".45" opacity=".55" />
  ))}</>
}

function Dots({ color }: { color: string }) {
  return <>{Array.from({ length: 26 }, (_, i) => (
    <circle key={i} cx={(i * 31 + 5) % 160} cy={FLOOR + 3 + (i * 7) % 13} r=".45" fill={color} opacity=".5" />
  ))}</>
}
