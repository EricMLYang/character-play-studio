import type { Clip, Move, Vec } from '../clip'

// 脫：發條鯊魚和橡膠恐龍穿大雨鞋、圍長圍巾，拿泡棉劍決鬥。鯊魚撲過去咬錯，把恐龍的雨鞋咬掉；恐龍單腳跳、手太短只好整個身體揮，揮空兩個一起轉圈；
// 頭昏昏撞頭「啵」——雨鞋、圍巾、泡棉劍全被震飛，落成「脫」。鯊魚把尾巴上最後一隻雨鞋也甩掉，雨鞋翻一圈倒扣在恐龍頭上。脫、脫、脫掉
type Kit = Record<string, Vec>
// 身上的東西跟著主人走（moveTo 照偏移、hop／shake／bounce 照抄）
const withKit = (kit: Kit, ms: Move[]): Move[] => ms.flatMap((m) => [m, ...Object.entries(kit).flatMap(([id, o]): Move[] => {
  if (m.do === 'moveTo' && m.to) return [{ ...m, actor: id, to: { x: m.to.x + o.x, y: m.to.y + o.y } }]
  if (m.do === 'hop' || m.do === 'bounce' || m.do === 'shake') return [{ ...m, actor: id }]
  if (m.do === 'spin' || m.do === 'tilt') return [{ at: m.at, dur: m.dur, actor: id, do: 'shake', amount: 2 }]
  return []
})])
const SK: Kit = { sscarf: { x: 2, y: -7 }, ssword: { x: 8, y: -6 }, sboot: { x: -6, y: 2 } }
const DK: Kit = { dscarf: { x: -2, y: -8 }, dsword: { x: -8, y: -7 } }
const FLY = ['sscarf', 'ssword', 'dscarf', 'dsword', 'dboot']

const clip: Clip = {
  char: '脫',
  meta: { theme: '雨鞋圍巾決鬥', cast: '發條鯊魚＋橡膠恐龍＋雨鞋＋圍巾＋泡棉劍', gags: ['咬錯咬掉雨鞋', '手太短整個身體揮空', '一起轉圈撞頭', '雨鞋倒扣在頭上'] },
  duration: 10,
  bg: { top: '#FFF6D8', bottom: '#EAF4FF', floor: '#D7E9F7', scenery: 'snow' },
  actors: [
    { id: 'shark', emoji: 'hero:shark/idle', x: 40, y: 71.1, size: 14, flip: true },
    { id: 'sboot', emoji: '👢', x: 34, y: 73, size: 6 },
    { id: 'sscarf', emoji: '🧣', x: 42, y: 64, size: 6, float: true },
    { id: 'ssword', emoji: '🗡️', x: 48, y: 65, size: 7, float: true, flip: true },
    { id: 'dino', emoji: 'hero:dino/idle', x: 120, y: 70.7, size: 15 },
    { id: 'dboot', emoji: '👢', x: 123, y: 73.2, size: 6 },
    { id: 'dscarf', emoji: '🧣', x: 118, y: 62.7, size: 6, float: true },
    { id: 'dsword', emoji: '🗡️', x: 112, y: 63.7, size: 7, float: true },
  ],
  moves: [
    ...withKit(SK, [
      // 盯著恐龍的劍，蓄力撲過去
      { at: 0.9, actor: 'shark', do: 'squash', amount: -0.3, dur: 0.3 },
      { at: 1.2, actor: 'shark', do: 'moveTo', to: { x: 99, y: 71.1 }, dur: 0.35, anticipate: 4, ease: 'in' },
      // 咬到雨鞋，往回扯
      { at: 1.8, actor: 'shark', do: 'moveTo', to: { x: 62, y: 71.1 }, dur: 0.4, ease: 'out' },
      { at: 2.9, actor: 'shark', do: 'spin', times: 1, dur: 0.5 },
      // 頭昏昏撞在一起
      { at: 3.9, actor: 'shark', do: 'moveTo', to: { x: 72, y: 71.1 }, dur: 0.4, ease: 'in' },
      { at: 4.35, actor: 'shark', do: 'moveTo', to: { x: 26, y: 71.1 }, dur: 0.5, ease: 'out' },
    ]),
    { at: 0.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/chomp' },
    { at: 1.55, actor: 'dboot', do: 'moveTo', to: { x: 107, y: 66 }, dur: 0.1 },
    { at: 1.8, actor: 'dboot', do: 'moveTo', to: { x: 70, y: 66 }, dur: 0.4, ease: 'out' },
    { at: 2.9, actor: 'dboot', do: 'shake', amount: 2, dur: 0.5 },
    { at: 3.9, actor: 'dboot', do: 'moveTo', to: { x: 80, y: 66 }, dur: 0.4, ease: 'in' },
    { at: 2.3, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    ...withKit(DK, [
      // 少一隻雨鞋，單腳跳
      { at: 1.7, actor: 'dino', do: 'bounce', amount: 4, times: 3, dur: 0.8 },
      // 手太短，整個身體揮——揮空
      { at: 2.55, actor: 'dino', do: 'tilt', amount: -35, dur: 0.35 },
      { at: 2.9, actor: 'dino', do: 'spin', times: -1, dur: 0.5 },
      { at: 3.9, actor: 'dino', do: 'moveTo', to: { x: 88, y: 70.7 }, dur: 0.4, ease: 'in' },
      { at: 4.35, actor: 'dino', do: 'moveTo', to: { x: 134, y: 70.7 }, dur: 0.5, ease: 'out' },
    ]),
    { at: 1.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    { at: 2.5, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 3.4, actor: 'shark', do: 'swap', emoji: 'hero:shark/dizzy' },
    { at: 3.4, actor: 'dino', do: 'swap', emoji: 'hero:dino/dizzy' },
    { at: 3.4, actor: 'shark', do: 'tilt', amount: 10, dur: 0.5 },
    { at: 3.4, actor: 'dino', do: 'tilt', amount: -10, dur: 0.5 },
    // 啵！撞頭
    { at: 4.3, actor: 'shark', do: 'squash', amount: 0.4, dur: 0.3 },
    { at: 4.3, actor: 'dino', do: 'squash', amount: 0.4, dur: 0.3 },
    // 所有東西被震飛
    { at: 4.35, actor: 'sscarf', do: 'moveTo', to: { x: 58, y: 14 }, dur: 0.35, ease: 'out' },
    { at: 4.35, actor: 'ssword', do: 'moveTo', to: { x: 70, y: 6 }, dur: 0.35, ease: 'out' },
    { at: 4.35, actor: 'dboot', do: 'moveTo', to: { x: 82, y: 4 }, dur: 0.35, ease: 'out' },
    { at: 4.35, actor: 'dscarf', do: 'moveTo', to: { x: 100, y: 10 }, dur: 0.35, ease: 'out' },
    { at: 4.35, actor: 'dsword', do: 'moveTo', to: { x: 110, y: 18 }, dur: 0.35, ease: 'out' },
    ...FLY.map((id) => ({ at: 4.35, actor: id, do: 'spin' as const, times: 2, dur: 0.6 })),
    { at: 4.95, actor: 'sscarf', do: 'vanish', dur: 0.2 },
    { at: 4.95, actor: 'ssword', do: 'vanish', dur: 0.2 },
    { at: 5.5, actor: 'dboot', do: 'vanish', dur: 0.2 },
    { at: 5.5, actor: 'dscarf', do: 'vanish', dur: 0.2 },
    { at: 5.5, actor: 'dsword', do: 'vanish', dur: 0.2 },
    // 一屁股坐下，傻笑
    { at: 4.85, actor: 'shark', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 4.85, actor: 'dino', do: 'squash', amount: 0.25, dur: 0.3 },
    { at: 5.9, actor: 'shark', do: 'swap', emoji: 'hero:shark/happy' },
    { at: 5.9, actor: 'dino', do: 'swap', emoji: 'hero:dino/happy' },
    // 鯊魚把尾巴上最後一隻雨鞋也甩掉——翻一圈倒扣在恐龍頭上
    { at: 6.85, actor: 'shark', do: 'tilt', amount: 25, dur: 0.3 },
    { at: 6.95, actor: 'sboot', do: 'moveTo', to: { x: 134, y: 57 }, arc: 30, dur: 0.6, ease: 'linear' },
    { at: 6.95, actor: 'sboot', do: 'rotateTo', amount: 540, dur: 0.6 },
    { at: 7.55, actor: 'dino', do: 'squash', amount: 0.3, dur: 0.25 },
    { at: 7.6, actor: 'dino', do: 'swap', emoji: 'hero:dino/surprised' },
    // 恐龍想握手，手太短，整個身體往前傾——還是好遠
    { at: 8.3, actor: 'dino', do: 'swap', emoji: 'hero:dino/reach' },
    { at: 8.3, actor: 'dino', do: 'tilt', amount: -30, dur: 0.7 },
    { at: 8.3, actor: 'sboot', do: 'tilt', amount: -30, dur: 0.7 },
    { at: 9.0, actor: 'shark', do: 'swap', emoji: 'hero:shark/spin' },
    { at: 9.05, actor: 'shark', do: 'spin', times: 1, dur: 0.6 },
  ],
  builds: [
    // 鯊魚的圍巾和劍 → 月；恐龍的雨鞋、圍巾和劍 → 兌
    { at: 4.95, dur: 0.55, strokes: [0, 1, 2, 3], from: 'sscarf', color: '#1971C2' },
    { at: 5.5, dur: 0.9, strokes: [4, 5, 6, 7, 8, 9, 10], from: 'dboot', color: '#1864AB' },
  ],
  glyph: [{ at: 6.4, dur: 0.4, do: 'wobble' }, { at: 9.4, dur: 0.6, do: 'pulse' }],
  fx: [
    { at: 0.35, kind: 'pop', actor: 'shark', emoji: '😋', dur: 0.5 },
    { at: 1.6, kind: 'pop', actor: 'dino', emoji: '❗', dur: 0.5 },
    { at: 2.55, kind: 'sweat', actor: 'dino', dur: 0.5 },
    { at: 3.4, kind: 'dizzy', actor: 'shark', dur: 0.9 },
    { at: 3.4, kind: 'dizzy', actor: 'dino', dur: 0.9 },
    { at: 4.3, kind: 'burst', actor: 'shark', dx: 8, dur: 0.4 },
    { at: 4.85, kind: 'puff', actor: 'shark', dur: 0.4 },
    { at: 4.85, kind: 'puff', actor: 'dino', dur: 0.4 },
    { at: 7.6, kind: 'pop', actor: 'shark', emoji: '😆', dur: 0.6 },
    { at: 8.4, kind: 'sweat', actor: 'dino', dur: 0.6 },
  ],
  camera: [
    { at: 1.2, dur: 0.3, do: 'follow', actor: 'shark', amount: 1.3 },
    { at: 1.9, dur: 0.4, do: 'zoom', amount: 1 },
    { at: 4.3, dur: 0.45, do: 'punch', amount: 0.18, to: { x: 80, y: 62 } },
  ],
  cues: [
    { at: 0.3, sfx: 'tap' },
    { at: 1.25, say: '脫' },
    { at: 1.55, sfx: 'gulp' },
    { at: 1.7, sfx: 'boing' },
    { at: 2.55, sfx: 'whoosh' },
    { at: 2.9, sfx: 'whoosh' },
    { at: 4.3, sfx: 'boing' },
    { at: 6.45, say: '脫' },
    { at: 7.0, say: '脫掉' },
    { at: 7.55, sfx: 'plop' },
    { at: 9.5, sfx: 'cheer' },
  ],
}

export default clip
