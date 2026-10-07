import type { Move } from './clip'

/** 頭上頂著東西的角色被壓扁時，上面那一疊要跟著往下沉，不然會懸空。 */
export function pressStack(at: number, dur: number, amount: number, size: number, ids: string[]): Move[] {
  const sink = size * 0.86 * amount
  return ids.map((actor) => ({ at, dur, actor, do: 'hop' as const, amount: -sink }))
}
