import type { Clip } from '../clip'

// 太：沙灘上大家都在曬太陽，雪人也想曬！牠戴上墨鏡、躺下來——開始流汗、變矮、越來越小……
// 太陽一看嚇到了，趕快躲到雲後面，雲的影子和陽光變成「太」。雪人只剩一顆小雪球，還是戴著墨鏡很滿足。太、太、太陽
const clip: Clip = {
  char: '太',
  meta: { theme: '海灘', cast: '雪人＋太陽＋雲', gags: ['不適合的人想做', '越曬越小', '太陽自己嚇到躲起來'] },
  duration: 10,
  bg: { top: '#BDE7FF', bottom: '#E8F6FF', floor: '#F2D9A0', scenery: 'sea' },
  actors: [
    { id: 'sun', emoji: '🌞', x: 128, y: 18, size: 18, hidden: true, float: true },
    { id: 'cloud', emoji: '☁️', x: 180, y: 20, size: 22, hidden: true, float: true },
    { id: 'umb', emoji: '⛱️', x: 140, y: 64, size: 22, hidden: true },
    { id: 'snow', emoji: '⛄', x: 34, y: 66, size: 24, hidden: true },
    { id: 'shades', emoji: '🕶️', x: 34, y: 58, size: 9, hidden: true, float: true },
  ],
  moves: [
    { at: 0, actor: 'sun', do: 'pop' },
    { at: 0.1, actor: 'umb', do: 'pop' },
    { at: 0.3, actor: 'snow', do: 'enter', from: { x: -16, y: 66 }, dur: 0.7 },
    // 戴上墨鏡、躺下來
    { at: 1.4, actor: 'shades', do: 'enter', from: { x: 34, y: 20 }, dur: 0.4 },
    { at: 2.1, actor: 'snow', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 2.1, actor: 'shades', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    // 開始流汗、變矮、越來越小
    { at: 3.0, actor: 'sun', do: 'flash', dur: 1.6 },
    { at: 3.2, actor: 'snow', do: 'scaleTo', amount: 0.75, dur: 0.8 },
    { at: 3.2, actor: 'shades', do: 'moveTo', to: { x: 34, y: 62.5 }, dur: 0.8 },
    { at: 3.2, actor: 'shades', do: 'scaleTo', amount: 0.8, dur: 0.8 },
    { at: 4.2, actor: 'snow', do: 'scaleTo', amount: 0.6, dur: 0.8 },
    { at: 4.2, actor: 'shades', do: 'moveTo', to: { x: 34, y: 68 }, dur: 0.8 },
    { at: 4.2, actor: 'shades', do: 'scaleTo', amount: 0.75, dur: 0.8 },
    // 太陽嚇到——躲到雲後面
    { at: 5.2, actor: 'sun', do: 'shake', amount: 1.5, dur: 0.4 },
    { at: 5.4, actor: 'cloud', do: 'moveTo', to: { x: 128, y: 20 }, dur: 0.6 },
    { at: 5.4, actor: 'cloud', do: 'pop', dur: 0.2 },
    { at: 6.0, actor: 'sun', do: 'vanish', dur: 0.2 },
    // 雪人只剩一顆小雪球，還是很滿足
    { at: 8.4, actor: 'snow', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
    { at: 8.4, actor: 'shades', do: 'bounce', amount: 2, times: 2, dur: 0.6 },
  ],
  builds: [
    // 陽光 → 大；雲的影子 → 一點
    { at: 5.6, dur: 0.6, strokes: [0, 1, 2], from: 'sun', color: '#F5A623' },
    { at: 6.1, dur: 0.4, strokes: [3], style: 'drop', from: { x: 80, y: 0 }, color: '#3D8BEF' },
  ],
  glyph: [{ at: 6.6, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.9, kind: 'bubble', actor: 'snow', emoji: '😎', dur: 0.8 },
    { at: 3.3, kind: 'sweat', actor: 'snow', dur: 0.8 },
    { at: 4.0, kind: 'rain', actor: 'snow', emoji: '💧', n: 4, dur: 0.9, dy: 6 },
    { at: 5.2, kind: 'pop', actor: 'sun', emoji: '😱', dur: 0.6, dx: -16, dy: 12 },
    { at: 8.5, kind: 'pop', actor: 'snow', emoji: '😌', dur: 0.8 },
  ],
  camera: [
    { at: 3.8, dur: 1.2, do: 'punch', amount: 0.2, to: { x: 36, y: 62 } },
  ],
  cues: [
    { at: 1.0, say: '太' },
    { at: 1.6, sfx: 'clink' },
    { at: 3.2, sfx: 'deflate' },
    { at: 4.2, sfx: 'deflate' },
    { at: 5.4, sfx: 'whoosh' },
    { at: 6.65, say: '太' },
    { at: 7.6, say: '太陽' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
