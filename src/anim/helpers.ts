import type { Move } from './clip'

/** 頭上頂著東西的角色被壓扁時，上面那一疊要跟著往下沉，不然會懸空。 */
export function pressStack(at: number, dur: number, amount: number, size: number, ids: string[]): Move[] {
  const sink = size * 0.86 * amount
  return ids.map((actor) => ({ at, dur, actor, do: 'hop' as const, amount: -sink }))
}

/**
 * 坐在車上的角色：回傳車子的動作，再抄一份給他（位置往上 dy），車子壓扁時他跟著往下沉。
 * 只抄 carMoves 裡的；他自己跳下車、車子自己彈走的動作另外寫，不要放進來。
 */
export function ride(carMoves: Move[], rider: string, dy: number, carSize: number): Move[] {
  const up = (v?: Move['to']) => v && { x: v.x, y: v.y + dy }
  return carMoves.flatMap((m): Move[] => m.do === 'squash'
    ? [m, ...pressStack(m.at, m.dur ?? 0.3, m.amount ?? 0.2, carSize, [rider])]
    : [m, { ...m, actor: rider, to: up(m.to), from: up(m.from) }])
}
