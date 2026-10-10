import { memo } from 'react'
import { FLOOR, type Scenery as Kind } from './clip'

/**
 * 背景場景：像繪本插畫一樣分三層——遠景（霧氣、輕微模糊）、中景、地面，
 * 顏色從劇本的 bg 推出來（遠的東西混進天空色，近的東西比較飽和），所以每支配色不同但都有景深。
 * 不會動的部分用 memo 畫一次；會動的（雲、泡泡、雪、星星、螢火蟲）只看 t。
 */
type Props = { kind?: Kind; t: number; floor: string; sky: string; bottom: string; uid: string }

export default function Scenery({ kind = 'hills', t, floor, sky, bottom, uid }: Props) {
  const c = palette(floor, sky, bottom)
  return <g aria-hidden>
    <SceneDefs uid={uid} c={c} />
    <StaticBack kind={kind} c={c} uid={uid} />
    {MOVING_BACK[kind]?.(t, c, uid)}
    <StaticMid kind={kind} c={c} uid={uid} />
  </g>
}

/** 地面：漸層、地平線的亮邊、地上的小東西。畫在角色後面。 */
export const Ground = memo(function Ground({ kind = 'hills', floor, sky, bottom, uid }: Omit<Props, 't'>) {
  const c = palette(floor, sky, bottom)
  return <g aria-hidden>
    <rect x="-20" y={FLOOR} width="200" height="40" fill={`url(#gnd${uid})`} />
    {/* 地平線：一條柔和的反光，再往下一點點暗，地面才像往後延伸 */}
    <rect x="-20" y={FLOOR - 0.3} width="200" height="1.4" fill="#fff" opacity=".45" />
    <rect x="-20" y={FLOOR + 1.1} width="200" height="3" fill={`url(#gndAo${uid})`} />
    {FRONT[kind]?.(c)}
  </g>
})

/** 會動的地面裝飾（海草、螢火蟲），畫在角色後面。 */
export function FloorDecor({ kind = 'hills', t }: { kind?: Kind; t: number }) {
  return <g aria-hidden>{MOVING_FRONT[kind]?.(t)}</g>
}

/** 最前景：畫在所有角色前面、邊角的一點點東西（葉子、草、泡泡），讓畫面有前後層次。 */
export function Foreground({ kind = 'hills', t, floor, sky, bottom }: Omit<Props, 'uid'>) {
  const c = palette(floor, sky, bottom)
  return <g aria-hidden pointerEvents="none">{FORE[kind]?.(t, c)}</g>
}

// ---------- 顏色 ----------
type Pal = { floor: string; sky: string; bottom: string; far: string; mid: string; near: string; dark: string; haze: string; light: string }

const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255] }
const toHex = (rgb: number[]) => '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
export const mix = (a: string, b: string, k: number) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * k)) }
const dark = (a: string, k: number) => toHex(hex(a).map((v) => v * (1 - k)))

function palette(floor: string, sky: string, bottom: string): Pal {
  return {
    floor, sky, bottom,
    // 遠的東西保留地面的色相、變淡、帶一點天空色（空氣透視）；不要混成灰色
    far: mix(mix(floor, '#ffffff', 0.38), sky, 0.3),
    mid: mix(floor, '#ffffff', 0.12),
    near: dark(floor, 0.08),
    dark: dark(floor, 0.35),
    haze: mix(bottom, '#ffffff', 0.55),
    light: mix(sky, '#ffffff', 0.7),
  }
}

const SceneDefs = memo(function SceneDefs({ uid, c }: { uid: string; c: Pal }) {
  return <defs>
    <linearGradient id={`gnd${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={mix(c.floor, c.bottom, 0.25)} />
      <stop offset=".35" stopColor={c.floor} />
      <stop offset="1" stopColor={dark(c.floor, 0.22)} />
    </linearGradient>
    <linearGradient id={`gndAo${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity=".07" />
      <stop offset="1" stopColor="#000" stopOpacity="0" />
    </linearGradient>
    {/* 遠景霧氣：越靠近地平線越白 */}
    <linearGradient id={`haze${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={c.haze} stopOpacity="0" />
      <stop offset="1" stopColor={c.haze} stopOpacity=".5" />
    </linearGradient>
    <radialGradient id={`sun${uid}`}>
      <stop offset="0" stopColor="#FFFDF0" stopOpacity=".95" />
      <stop offset=".25" stopColor="#FFF4C8" stopOpacity=".55" />
      <stop offset="1" stopColor="#FFF4C8" stopOpacity="0" />
    </radialGradient>
    <linearGradient id={`cloud${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" />
      <stop offset=".6" stopColor="#fff" />
      <stop offset="1" stopColor={mix(c.sky, '#9AA7C7', 0.35)} />
    </linearGradient>
    <linearGradient id={`hillM${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={mix(c.mid, '#fff', 0.18)} />
      <stop offset="1" stopColor={c.mid} />
    </linearGradient>
    <linearGradient id={`hillF${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={mix(c.far, '#fff', 0.15)} />
      <stop offset="1" stopColor={c.far} />
    </linearGradient>
    <radialGradient id={`leaf${uid}`} cx=".35" cy=".3" r=".8">
      <stop offset="0" stopColor={mix(c.mid, '#F4FFB0', 0.35)} />
      <stop offset="1" stopColor={dark(c.mid, 0.12)} />
    </radialGradient>
    <linearGradient id={`ray${uid}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity=".38" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </linearGradient>
    <filter id={`far${uid}`} x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".45" /></filter>
    <filter id={`soft${uid}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4" /></filter>
  </defs>
})

// ---------- 小零件 ----------

/** 一朵有體積的雲：上面亮、底部帶一點天空的藍灰。 */
function Cloud({ x, y, k = 1, uid, o = 0.95 }: { x: number; y: number; k?: number; uid: string; o?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${k})`} opacity={o}>
    <ellipse cx="0" cy="1.6" rx="12" ry="2.4" fill="#fff" opacity=".35" filter={`url(#soft${uid})`} />
    <g fill={`url(#cloud${uid})`}>
      <ellipse cx="0" cy="0" rx="11" ry="3.6" />
      <circle cx="-5" cy="-2.2" r="4.2" />
      <circle cx="1.4" cy="-4" r="5.4" />
      <circle cx="6.6" cy="-1.6" r="3.6" />
    </g>
  </g>
}

const drift = (t: number, speed: number, start: number) => ((start + t * speed) % 210) - 25
const twinkle = (t: number, i: number) => 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + i * 2.3))

function Clouds({ t, uid, o = 0.95 }: { t: number; uid: string; o?: number }) {
  return <>{[[1.6, 20, 14, 1], [0.9, 120, 9, 0.7], [1.2, 75, 22, 0.55]].map(([speed, start, y, k], i) => (
    <Cloud key={i} x={drift(t, speed, start)} y={y} k={k} uid={uid} o={o * (0.7 + k * 0.3)} />
  ))}</>
}

function Sun({ x, y, r = 6, uid }: { x: number; y: number; r?: number; uid: string }) {
  return <g>
    <circle cx={x} cy={y} r={r * 5} fill={`url(#sun${uid})`} />
    <circle cx={x} cy={y} r={r} fill="#FFFBE6" />
  </g>
}

/** 平滑的山丘輪廓：給一串高度，畫成柔和的曲線。 */
function ridge(heights: number[], base: number, w = 200, x0 = -20) {
  const step = w / (heights.length - 1)
  let d = `M${x0},${base + 30} L${x0},${base - heights[0]}`
  for (let i = 1; i < heights.length; i++) {
    const xa = x0 + step * (i - 1), xb = x0 + step * i
    const ya = base - heights[i - 1], yb = base - heights[i]
    d += ` C${xa + step / 2},${ya} ${xb - step / 2},${yb} ${xb},${yb}`
  }
  return d + ` L${x0 + w},${base + 30} Z`
}

function RoundTree({ x, base, h, r, uid, trunk = '#8A5A3B' }: { x: number; base: number; h: number; r: number; uid: string; trunk?: string }) {
  return <g>
    <rect x={x - r * 0.12} y={base - h} width={r * 0.24} height={h} rx={r * 0.1} fill={trunk} />
    <circle cx={x} cy={base - h - r * 0.4} r={r} fill={`url(#leaf${uid})`} />
    <circle cx={x - r * 0.55} cy={base - h + r * 0.15} r={r * 0.62} fill={`url(#leaf${uid})`} />
    <circle cx={x + r * 0.6} cy={base - h + r * 0.1} r={r * 0.66} fill={`url(#leaf${uid})`} />
  </g>
}

function Pine({ x, base, h, fill, snow }: { x: number; base: number; h: number; fill: string; snow?: boolean }) {
  const w = h * 0.42
  return <g>
    <rect x={x - h * 0.03} y={base - h * 0.18} width={h * 0.06} height={h * 0.18} fill="#6B4A35" />
    {[0, 1, 2].map((i) => {
      const top = base - h + i * h * 0.24, bot = base - h * 0.15 - (2 - i) * h * 0.12
      const ww = w * (0.55 + i * 0.25)
      return <g key={i}>
        <path d={`M${x},${top} L${x + ww},${bot} Q${x},${bot + h * 0.05} ${x - ww},${bot} Z`} fill={fill} />
        <path d={`M${x},${top} L${x - ww},${bot} Q${x - ww * 0.4},${bot + h * 0.03} ${x},${bot + h * 0.02} Z`} fill="#000" opacity=".1" />
        {snow && <path d={`M${x},${top} L${x + ww * 0.45},${top + (bot - top) * 0.45} Q${x},${top + (bot - top) * 0.6} ${x - ww * 0.45},${top + (bot - top) * 0.45} Z`} fill="#fff" opacity=".92" />}
      </g>
    })}
  </g>
}

// ---------- 遠景（不會動） ----------
const StaticBack = memo(function StaticBack({ kind, c, uid }: { kind: Kind; c: Pal; uid: string }) {
  return <>{BACK[kind]?.(c, uid)}</>
})

const BACK: Partial<Record<Kind, (c: Pal, uid: string) => JSX.Element>> = {
  hills: (c, uid) => <>
    <Sun x={128} y={18} uid={uid} />
    <g filter={`url(#far${uid})`}>
      <path d={ridge([16, 24, 19, 28, 22, 17, 25, 20], FLOOR)} fill={`url(#hillF${uid})`} />
    </g>
    <rect x="-20" y={FLOOR - 30} width="200" height="30" fill={`url(#haze${uid})`} />
  </>,

  forest: (c, uid) => <>
    <Sun x={34} y={14} r={5} uid={uid} />
    <g filter={`url(#far${uid})`} opacity=".8">
      {Array.from({ length: 14 }, (_, i) => <Pine key={i} x={-14 + i * 14 + (i % 3) * 3} base={FLOOR} h={30 + ((i * 7) % 11)} fill={c.far} />)}
    </g>
    <rect x="-20" y={FLOOR - 40} width="200" height="40" fill={`url(#haze${uid})`} />
  </>,

  snow: (c, uid) => <>
    <g filter={`url(#far${uid})`}>
      <path d={`M-20,${FLOOR} L10,${FLOOR - 38} L28,${FLOOR - 26} L52,${FLOOR - 46} L80,${FLOOR - 20} L104,${FLOOR - 40} L128,${FLOOR - 24} L150,${FLOOR - 44} L180,${FLOOR} Z`}
        fill={mix(c.far, '#8FA3C8', 0.35)} />
      {/* 山頂的雪 */}
      {[[10, 38], [52, 46], [104, 40], [150, 44]].map(([x, h], i) => (
        <path key={i} d={`M${x},${FLOOR - h} L${x + 7},${FLOOR - h + 9} L${x + 3},${FLOOR - h + 7} L${x},${FLOOR - h + 10} L${x - 3},${FLOOR - h + 7} L${x - 7},${FLOOR - h + 9} Z`} fill="#fff" opacity=".95" />
      ))}
    </g>
    <rect x="-20" y={FLOOR - 30} width="200" height="30" fill={`url(#haze${uid})`} />
  </>,

  desert: (c, uid) => <>
    <circle cx="124" cy="20" r="40" fill={`url(#sun${uid})`} opacity=".7" />
    <g filter={`url(#far${uid})`}>
      {/* 平頂山 */}
      <path d={`M-20,${FLOOR} L-20,${FLOOR - 14} L6,${FLOOR - 14} L10,${FLOOR - 22} L34,${FLOOR - 22} L40,${FLOOR - 12} L60,${FLOOR - 10} L64,${FLOOR} Z`} fill={mix(c.far, '#D9825B', 0.3)} />
      <path d={`M96,${FLOOR} L102,${FLOOR - 18} L126,${FLOOR - 18} L130,${FLOOR - 26} L150,${FLOOR - 26} L156,${FLOOR - 12} L180,${FLOOR - 12} L180,${FLOOR} Z`} fill={mix(c.far, '#D9825B', 0.22)} />
    </g>
    <rect x="-20" y={FLOOR - 30} width="200" height="30" fill={`url(#haze${uid})`} />
  </>,

  city: (c, uid) => <>
    <Sun x={136} y={14} r={5} uid={uid} />
    {/* 遠方天際線：霧霧的一排 */}
    <g filter={`url(#far${uid})`} fill={mix(c.far, '#7F8DB3', 0.4)} opacity=".75">
      {[[-20, 26], [-6, 34], [6, 22], [18, 40], [30, 28], [44, 46], [56, 30], [70, 36], [84, 24], [96, 42], [110, 32], [124, 38], [138, 26], [150, 34], [164, 28]].map(([x, h], i) => (
        <rect key={i} x={x} y={FLOOR - h} width="13" height={h} />
      ))}
    </g>
    <rect x="-20" y={FLOOR - 40} width="200" height="40" fill={`url(#haze${uid})`} />
  </>,

  night: (c, uid) => <>
    <g>
      <circle cx="132" cy="16" r="26" fill={`url(#sun${uid})`} opacity=".45" />
      <circle cx="132" cy="16" r="6.5" fill="#FFF6D6" />
      <circle cx="129.5" cy="14.5" r="1.3" fill="#E9DDB4" opacity=".7" />
      <circle cx="134" cy="18.5" r="0.9" fill="#E9DDB4" opacity=".6" />
    </g>
    <path d={ridge([14, 20, 16, 24, 18, 13, 21, 17], FLOOR)} fill={mix(c.floor, '#0E1030', 0.55)} />
  </>,

  space: (c, uid) => <>
    {/* 星雲：幾團糊糊的彩色光 */}
    <g filter={`url(#soft${uid})`} opacity=".5">
      <ellipse cx="40" cy="22" rx="30" ry="10" fill="#B07CFF" opacity=".35" />
      <ellipse cx="118" cy="34" rx="34" ry="12" fill="#4FC3FF" opacity=".25" />
    </g>
    <g>
      <circle cx="22" cy="18" r="7" fill="#FFB86B" />
      <circle cx="20" cy="16" r="7" fill="#FFD9A6" opacity=".5" />
      <ellipse cx="22" cy="18" rx="12" ry="2.6" fill="none" stroke="#FFE7C2" strokeWidth=".9" opacity=".8" transform="rotate(-16 22 18)" />
      <circle cx="146" cy="12" r="3" fill="#B9E3FF" />
      <circle cx="145" cy="11" r="2.2" fill="#E2F4FF" opacity=".6" />
    </g>
  </>,

  ocean: (c, uid) => <>
    {/* 海面的亮光從上面灑下來 */}
    <rect x="-20" y="-20" width="200" height="34" fill="#fff" opacity=".12" />
    <g filter={`url(#far${uid})`} fill={mix(c.far, '#2B5D8C', 0.35)} opacity=".65">
      <path d={ridge([8, 16, 10, 22, 12, 9, 18, 11], FLOOR)} />
    </g>
  </>,

  room: (c) => <>
    {/* 牆：上半淡色壁紙，下半護牆板 */}
    {Array.from({ length: 18 }, (_, i) => <rect key={i} x={-20 + i * 12} y="-20" width="6" height={FLOOR - 16 + 20} fill="#fff" opacity=".1" />)}
    <rect x="-20" y={FLOOR - 16} width="200" height="16" fill={mix(c.bottom, '#8B6A4E', 0.3)} />
    <rect x="-20" y={FLOOR - 16} width="200" height="1.4" fill="#fff" opacity=".35" />
    {Array.from({ length: 11 }, (_, i) => <rect key={i} x={-16 + i * 18} y={FLOOR - 13} width="14" height="10" rx="1" fill="none" stroke="#000" strokeOpacity=".08" strokeWidth=".6" />)}
    {/* 窗戶：外面是藍天，旁邊有窗簾 */}
    <g>
      <rect x="10" y="10" width="26" height="22" rx="1.2" fill="#9FD8FF" />
      <rect x="10" y="10" width="26" height="9" fill="#C9ECFF" />
      <ellipse cx="18" cy="17" rx="5" ry="1.8" fill="#fff" opacity=".9" />
      <rect x="10" y="10" width="26" height="22" rx="1.2" fill="none" stroke="#fff" strokeWidth="1.6" />
      <line x1="23" y1="10" x2="23" y2="32" stroke="#fff" strokeWidth="1.1" />
      <line x1="10" y1="21" x2="36" y2="21" stroke="#fff" strokeWidth="1.1" />
      <path d="M6,8 L14,8 Q12,22 15,34 L6,34 Z" fill="#F59AA8" />
      <path d="M32,8 L40,8 L40,34 L31,34 Q34,22 32,8 Z" fill="#F59AA8" />
      <path d="M6,8 L14,8 Q12,22 15,34 L12,34 Q9,22 10,8 Z" fill="#000" opacity=".08" />
      <rect x="4" y="6.5" width="38" height="2" rx="1" fill="#B88A5E" />
    </g>
    {/* 畫框與架子 */}
    <g>
      <rect x="128" y="12" width="20" height="15" rx="0.8" fill="#C9A06A" />
      <rect x="130" y="14" width="16" height="11" fill="#FFF3D6" />
      <path d={`M131,24 L136,18 L140,22 L142,20 L145,24 Z`} fill="#7BC47F" />
      <circle cx="142" cy="17" r="1.5" fill="#FFC94D" />
      <rect x="120" y="40" width="30" height="1.6" rx=".6" fill="#A87A52" />
      <rect x="123" y="34" width="3" height="6" fill="#6FA8DC" /><rect x="126.4" y="35" width="2.6" height="5" fill="#F3B562" />
      <rect x="129.4" y="33.5" width="3.2" height="6.5" fill="#E57373" /><circle cx="143" cy="37.5" r="2.5" fill="#81C784" />
    </g>
    {/* 屋頂燈打下來的暖光 */}
    <ellipse cx="80" cy="10" rx="70" ry="40" fill="#FFF3C9" opacity=".22" />
  </>,

  track: (c, uid) => <>
    <Sun x={30} y={12} r={5} uid={uid} />
    {/* 看台：一階一階，觀眾是彩色小點 */}
    <g>
      <path d={`M-20,${FLOOR - 26} L180,${FLOOR - 26} L180,${FLOOR} L-20,${FLOOR} Z`} fill={mix(c.far, '#6D7FA6', 0.35)} />
      {[0, 1, 2, 3].map((r) => <rect key={r} x="-20" y={FLOOR - 26 + r * 6} width="200" height="0.8" fill="#fff" opacity=".2" />)}
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 44 }, (_, i) => (
        <g key={`${r}-${i}`} opacity=".6">
          <circle cx={-18 + i * 4.6 + (r % 2) * 2.3} cy={FLOOR - 23.5 + r * 6} r="1.4"
            fill={['#FF8A80', '#80D8FF', '#FFE57F', '#B9F6CA', '#E1BEE7', '#FFCC80'][(i * 7 + r * 3) % 6]} />
          <circle cx={-18 + i * 4.6 + (r % 2) * 2.3} cy={FLOOR - 25.6 + r * 6} r="0.9" fill="#F2C9A0" />
        </g>
      )))}
      <rect x="-20" y={FLOOR - 3} width="200" height="3" fill="#2E7D4F" />
    </g>
    <rect x="-20" y={FLOOR - 30} width="200" height="30" fill={`url(#haze${uid})`} opacity=".45" />
  </>,
}

// ---------- 會動的遠景 ----------
const MOVING_BACK: Partial<Record<Kind, (t: number, c: Pal, uid: string) => JSX.Element>> = {
  hills: (t, _c, uid) => <Clouds t={t} uid={uid} />,
  forest: (t, _c, uid) => <Clouds t={t} uid={uid} o={0.7} />,
  desert: (t, _c, uid) => <Clouds t={t} uid={uid} o={0.45} />,
  city: (t, _c, uid) => <Clouds t={t} uid={uid} o={0.75} />,
  track: (t, _c, uid) => <Clouds t={t} uid={uid} o={0.8} />,
  snow: (t) => <Snow t={t} far />,
  night: (t) => <Stars t={t} n={30} />,
  space: (t) => <Stars t={t} n={44} />,
  ocean: (t, _c, uid) => <>
    {/* 光束：從水面斜斜打下來，慢慢晃 */}
    {[14, 52, 96, 136].map((x, i) => (
      <polygon key={i} points={`${x - 5},-20 ${x + 5},-20 ${x + 22 + Math.sin(t * 0.8 + i) * 3},${FLOOR} ${x + 8 + Math.sin(t * 0.8 + i) * 3},${FLOOR}`}
        fill={`url(#ray${uid})`} opacity={0.7 + 0.3 * Math.sin(t * 1.3 + i * 2)} />
    ))}
    {Array.from({ length: 12 }, (_, i) => {
      const x = (i * 17 + 8) % 160 + Math.sin(t * 2 + i) * 1.5
      const y = FLOOR - (((t * (5 + (i % 3) * 3) + i * 9) % 84))
      const r = 0.5 + (i % 3) * 0.45
      return <g key={i} opacity=".75">
        <circle cx={x} cy={y} r={r} fill="#fff" fillOpacity=".12" stroke="#fff" strokeWidth=".3" />
        <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.28} fill="#fff" />
      </g>
    })}
  </>,
}

function Stars({ t, n }: { t: number; n: number }) {
  return <>{Array.from({ length: n }, (_, i) => {
    const x = (i * 37.3 + 11) % 160, y = (i * 23.7 + 5) % 52
    const big = i % 7 === 0
    const o = twinkle(t, i)
    return big
      ? <g key={i} opacity={o} transform={`translate(${x} ${y})`}>
          <circle r="1.6" fill="#fff" opacity=".25" />
          <path d="M0,-1.6 L0.3,-0.3 L1.6,0 L0.3,0.3 L0,1.6 L-0.3,0.3 L-1.6,0 L-0.3,-0.3 Z" fill="#fff" />
        </g>
      : <circle key={i} cx={x} cy={y} r={i % 3 ? 0.35 : 0.55} fill="#fff" opacity={o} />
  })}</>
}

function Snow({ t, far }: { t: number; far?: boolean }) {
  const n = far ? 26 : 10
  return <>{Array.from({ length: n }, (_, i) => {
    const speed = far ? 4 + (i % 4) * 1.5 : 9 + (i % 3) * 2
    const x = ((i * 29 + (far ? 7 : 3)) % 175) - 8 + Math.sin(t * 1.3 + i) * 2.4
    const y = ((t * speed + i * 13) % 100) - 8
    const r = far ? 0.35 + (i % 3) * 0.2 : 0.9 + (i % 2) * 0.4
    return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={far ? 0.75 : 0.9} />
  })}</>
}

// ---------- 中景（不會動） ----------
const StaticMid = memo(function StaticMid({ kind, c, uid }: { kind: Kind; c: Pal; uid: string }) {
  return <>{MID[kind]?.(c, uid)}</>
})

const MID: Partial<Record<Kind, (c: Pal, uid: string) => JSX.Element>> = {
  hills: (c, uid) => <>
    <path d={ridge([6, 12, 9, 4, 3, 5, 11, 7], FLOOR, 200)} fill={`url(#hillM${uid})`} />
    <RoundTree x={10} base={FLOOR - 6} h={6} r={5} uid={uid} />
    <RoundTree x={150} base={FLOOR - 7} h={7} r={6} uid={uid} />
    <RoundTree x={140} base={FLOOR - 5} h={4} r={3.6} uid={uid} />
  </>,
  forest: (c, uid) => <>
    {[[-6, 40, '#2F6B45'], [12, 34, '#3A7A50'], [140, 38, '#2F6B45'], [158, 32, '#3A7A50'], [126, 28, '#44875A']].map(([x, h, f], i) => (
      <Pine key={i} x={x as number} base={FLOOR + 1} h={h as number} fill={mix(f as string, c.mid, 0.35)} />
    ))}
    <RoundTree x={30} base={FLOOR} h={8} r={5} uid={uid} />
  </>,
  snow: (c) => <>
    <path d={ridge([5, 9, 6, 3, 2, 4, 8, 6], FLOOR, 200)} fill="#fff" opacity=".85" />
    {[[4, 30], [16, 24], [140, 28], [154, 22]].map(([x, h], i) => <Pine key={i} x={x} base={FLOOR + 1} h={h} fill={mix('#2F6B55', c.far, 0.25)} snow />)}
  </>,
  desert: (c) => <>
    <path d={ridge([4, 9, 6, 2, 2, 3, 8, 5], FLOOR, 200)} fill={mix(c.floor, '#fff', 0.15)} />
    <Cactus x={5} base={FLOOR + 1} h={15} />
    <Cactus x={157} base={FLOOR + 1} h={12} />
  </>,
  city: (c) => <>
    {/* 近一點的大樓：有明暗面、會亮的窗戶 */}
    {[[-14, 36, 18], [6, 28, 14], [126, 32, 16], [144, 42, 20]].map(([x, h, w], i) => {
      const base = mix(c.mid, '#8090B8', 0.45)
      return <g key={i}>
        <rect x={x} y={FLOOR - h} width={w} height={h} fill={base} />
        <rect x={x + w * 0.62} y={FLOOR - h} width={w * 0.38} height={h} fill="#000" opacity=".12" />
        <rect x={x} y={FLOOR - h} width={w} height="1.2" fill="#fff" opacity=".35" />
        {Array.from({ length: Math.floor((h - 4) / 6) }, (_, r) => Array.from({ length: Math.floor(w / 4.6) }, (_, k) => (
          <rect key={`${r}-${k}`} x={x + 1.4 + k * 4.4} y={FLOOR - h + 3.5 + r * 6} width="2.4" height="3"
            fill={(r * 3 + k + i) % 4 ? '#DDEBFF' : '#FFE9A8'} opacity={(r * 3 + k + i) % 4 ? 0.55 : 0.9} />
        )))}
      </g>
    })}
    {/* 路燈 */}
    {[40, 120].map((x) => <g key={x}>
      <rect x={x - 0.4} y={FLOOR - 20} width=".8" height="20" fill="#56607A" />
      <path d={`M${x},${FLOOR - 20} q3,-1.5 5,0`} fill="none" stroke="#56607A" strokeWidth=".8" />
      <circle cx={x + 5} cy={FLOOR - 19.4} r="1.1" fill="#FFF3B0" />
    </g>)}
  </>,
  night: (c) => <>
    <path d={ridge([5, 9, 7, 3, 2, 4, 9, 6], FLOOR, 200)} fill={mix(c.floor, '#0E1030', 0.35)} />
    {[[8, 22], [150, 26], [138, 18]].map(([x, h], i) => <Pine key={i} x={x} base={FLOOR + 1} h={h} fill={mix(c.floor, '#0E1030', 0.5)} />)}
  </>,
  space: (c) => <>
    <path d={ridge([6, 3, 8, 4, 2, 6, 3, 7], FLOOR, 200)} fill={mix(c.floor, '#fff', 0.1)} />
  </>,
  ocean: (c) => <>
    {/* 珊瑚礁 */}
    {[[6, '#FF8A80'], [16, '#FFB74D'], [146, '#F48FB1'], [156, '#FF8A65']].map(([x, f], i) => (
      <g key={i} fill={f as string}>
        <rect x={(x as number) - 0.8} y={FLOOR - 10} width="1.6" height="10" rx=".8" />
        <rect x={(x as number) - 3.6} y={FLOOR - 7} width="1.4" height="5" rx=".7" transform={`rotate(-25 ${x} ${FLOOR})`} />
        <rect x={(x as number) + 2.2} y={FLOOR - 8} width="1.4" height="6" rx=".7" transform={`rotate(25 ${x} ${FLOOR})`} />
        <circle cx={x as number} cy={FLOOR - 10} r="1.4" />
      </g>
    ))}
  </>,
  track: () => <></>,
  room: () => <></>,
}

function Cactus({ x, base, h }: { x: number; base: number; h: number }) {
  const w = h * 0.2
  return <g>
    <rect x={x - w / 2} y={base - h} width={w} height={h} rx={w / 2} fill="#5E9C4E" />
    <path d={`M${x - w / 2},${base - h * 0.5} h${-w * 0.9} a${w * 0.45},${w * 0.45} 0 0 1 ${-w * 0.45},${-w * 0.45} v${-h * 0.18}`} fill="none" stroke="#5E9C4E" strokeWidth={w * 0.8} strokeLinecap="round" />
    <path d={`M${x + w / 2},${base - h * 0.62} h${w * 0.8} a${w * 0.45},${w * 0.45} 0 0 0 ${w * 0.45},${-w * 0.45} v${-h * 0.12}`} fill="none" stroke="#5E9C4E" strokeWidth={w * 0.8} strokeLinecap="round" />
    <rect x={x + w * 0.05} y={base - h} width={w * 0.45} height={h} rx={w / 4} fill="#000" opacity=".12" />
  </g>
}

// ---------- 地面裝飾 ----------
const FRONT: Partial<Record<Kind, (c: Pal) => JSX.Element>> = {
  hills: (c) => <><Grass c={c} /><Flowers /></>,
  forest: (c) => <><Grass c={c} /><Pebbles color={dark(c.floor, 0.3)} /></>,
  desert: (c) => <Pebbles color={dark(c.floor, 0.28)} n={30} />,
  snow: () => <>{[12, 50, 104, 140].map((x, i) => <ellipse key={i} cx={x} cy={FLOOR + 6 + (i % 2) * 6} rx="10" ry="1.6" fill="#9DB4D8" opacity=".25" />)}</>,
  space: (c) => <>{[[20, 6, 4], [62, 12, 2.6], [110, 7, 3.4], [146, 13, 2.2]].map(([x, y, r], i) => (
    <g key={i}><ellipse cx={x} cy={FLOOR + y} rx={r} ry={r * 0.35} fill={dark(c.floor, 0.25)} /><ellipse cx={x} cy={FLOOR + y - r * 0.08} rx={r * 0.8} ry={r * 0.22} fill={dark(c.floor, 0.12)} /></g>
  ))}</>,
  ocean: (c) => <Pebbles color={dark(c.floor, 0.25)} n={22} />,
  track: () => <>
    {[3, 9, 15].map((y) => <rect key={y} x="-20" y={FLOOR + y} width="200" height=".5" fill="#fff" opacity=".75" />)}
  </>,
  city: () => <>
    <rect x="-20" y={FLOOR} width="200" height="5" fill="#fff" opacity=".18" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 18 + 2} y={FLOOR + 10} width="9" height=".9" fill="#fff" opacity=".6" />)}
  </>,
  room: (c) => <>
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-20 + i * 18} y1={FLOOR} x2={-20 + i * 18 - 10} y2={90} stroke="#000" strokeWidth=".35" opacity=".1" />)}
    <ellipse cx="80" cy={FLOOR + 9} rx="58" ry="5" fill={mix(c.floor, '#E57373', 0.35)} opacity=".45" />
  </>,
  night: () => <></>,
}

function Grass({ c }: { c: Pal }) {
  const g = dark(c.floor, 0.28)
  return <>{Array.from({ length: 22 }, (_, i) => {
    const x = (i * 23.7 + 4) % 168 - 4, y = FLOOR + 3 + ((i * 7) % 13)
    const s = 0.45 + (y - FLOOR) / 26
    return <path key={i} d={`M${x - 1.4 * s},${y} q${0.4 * s},${-2 * s} ${0.2 * s},${-3 * s} M${x},${y} q0,${-2.4 * s} ${0.6 * s},${-3.6 * s} M${x + 1.2 * s},${y} q${-0.2 * s},${-1.8 * s} ${0.6 * s},${-2.6 * s}`}
      fill="none" stroke={g} strokeWidth={0.22 * s} strokeLinecap="round" opacity=".4" />
  })}</>
}

function Flowers() {
  return <>{[[18, 8, '#FF8FB1'], [46, 13, '#FFE066'], [112, 10, '#FFFFFF'], [138, 14, '#FF8FB1'], [70, 15, '#B39DFF']].map(([x, y, f], i) => (
    <g key={i} transform={`translate(${x} ${FLOOR + (y as number)})`}>
      {[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={Math.cos(k * 1.256) * 0.8} cy={Math.sin(k * 1.256) * 0.8 - 0.4} r=".6" fill={f as string} />)}
      <circle cx="0" cy="-0.4" r=".45" fill="#FFB300" />
    </g>
  ))}</>
}

function Pebbles({ color, n = 18 }: { color: string; n?: number }) {
  return <>{Array.from({ length: n }, (_, i) => {
    const y = FLOOR + 3 + (i * 7) % 14
    const r = 0.3 + (y - FLOOR) / 40
    return <ellipse key={i} cx={(i * 31 + 5) % 168 - 4} cy={y} rx={r * 1.4} ry={r * 0.7} fill={color} opacity=".45" />
  })}</>
}

const MOVING_FRONT: Partial<Record<Kind, (t: number) => JSX.Element>> = {
  ocean: (t) => <>
    {[10, 24, 136, 150].map((x, i) => (
      <path key={i} d={`M${x},${FLOOR + 2} q${2 + Math.sin(t * 2 + i) * 1.6},-5 0,-10 q${-2 + Math.sin(t * 2 + i + 1) * 1.6},-5 0,-10 q${2 + Math.sin(t * 2 + i + 2) * 1.2},-4 0,-7`}
        fill="none" stroke={i % 2 ? '#3FA36B' : '#2E8B57'} strokeWidth="1.6" strokeLinecap="round" />
    ))}
    {/* 沙地上的水波光紋 */}
    {Array.from({ length: 6 }, (_, i) => (
      <ellipse key={i} cx={(i * 31 + t * 3) % 180 - 10} cy={FLOOR + 5 + (i % 3) * 4} rx="6" ry=".6" fill="#fff" opacity={0.18 + 0.12 * Math.sin(t * 2 + i)} />
    ))}
  </>,
  night: (t) => <>
    {Array.from({ length: 7 }, (_, i) => {
      const x = (i * 23 + 10 + Math.sin(t * 0.7 + i) * 6) % 160
      const y = FLOOR - 6 - (i % 4) * 5 + Math.sin(t * 1.1 + i * 2) * 2
      const o = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i))
      return <g key={i} opacity={o}><circle cx={x} cy={y} r="1.6" fill="#FFF59D" opacity=".25" /><circle cx={x} cy={y} r=".5" fill="#FFFDE7" /></g>
    })}
  </>,
}

// ---------- 最前景 ----------
const FORE: Partial<Record<Kind, (t: number, c: Pal) => JSX.Element>> = {
  snow: (t) => <Snow t={t} />,
  hills: (t, c) => <Bush x={-4} c={c} t={t} />,
  forest: (t, c) => <><Bush x={-4} c={c} t={t} /><Bush x={164} c={c} t={t} flip /></>,
}

function Bush({ x, c, t, flip }: { x: number; c: Pal; t: number; flip?: boolean }) {
  const sway = Math.sin(t * 1.4 + x) * 1.2
  const f = dark(c.floor, 0.18)
  return <g transform={`translate(${x} 90) scale(${flip ? -1 : 1} 1) rotate(${sway})`}>
    <circle cx="0" cy="-4" r="7" fill={f} />
    <circle cx="6" cy="-1" r="5" fill={dark(c.floor, 0.1)} />
    <circle cx="-2" cy="-8" r="4" fill={mix(f, '#fff', 0.12)} />
  </g>
}
