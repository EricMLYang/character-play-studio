/**
 * 部件 → 固定顏色與來歷（動畫片型 v2，docs/clip-v2-plan.md）。
 *
 * 同一個部件在每一支動畫裡都是同一個顏色、盡量同一種來歷：「木」永遠是樹上掉下來的咖啡色、「氵」永遠是藍色的水滴。
 * 小孩看了幾支以後，看到顏色就認得「這塊是木」，部件才會在不同的字之間串起來。
 *
 * 寫劇本前先查這張表：builds 的 color 寫 partColor('木')，筆畫從 from 說的那種東西飛出來。
 * 表裡沒有的部件先登記再用（顏色要跟表裡的分得開、在淺色背景上夠深：跟最淺的背景至少 2.7 倍對比）。
 */

export type Part = {
  /** 筆畫顏色（#RRGGBB；播放器會自己調暗做積木的厚度） */
  color: string
  /** 一句來歷：這個部件在故事裡從哪裡來（例：樹上掉下來的） */
  from: string
}

export const PARTS = {
  木: { color: '#6B4423', from: '樹上掉下來的樹枝、木頭' },
  艹: { color: '#2B9348', from: '地上冒出來的小草' },
  田: { color: '#6A8A00', from: '一塊一塊的田地，從土裡翻起來' },
  土: { color: '#B07A12', from: '地上挖起來、揚起來的泥土' },
  山: { color: '#3D6B3A', from: '遠方的山，一座一座站起來' },
  氵: { color: '#1C6FD0', from: '濺起來的水滴' },
  雨: { color: '#6466D8', from: '雲裡落下來的雨' },
  火: { color: '#D62828', from: '噴出來的火花' },
  日: { color: '#DE7C00', from: '太陽、陽光' },
  月: { color: '#7B2FBE', from: '晚上的月亮' },
  口: { color: '#C2185B', from: '張開的嘴巴（叫出來、吃下去）' },
  心: { color: '#F2559A', from: '心裡冒出來的愛心' },
  言: { color: '#5C6170', from: '說出來的話（對話框）' },
  目: { color: '#0A86A8', from: '睜大的眼睛' },
  女: { color: '#C048B8', from: '女生（媽媽、姊姊）' },
  亻: { color: '#0E8C8C', from: '站著的人' },
  扌: { color: '#8A3A12', from: '伸出來的手' },
  足: { color: '#1B3A66', from: '踩下去的腳' },
  豸: { color: '#D0561A', from: '長背的野獸（貓、豹），從牠身上跳出來' },
} as const satisfies Record<string, Part>

export type PartName = keyof typeof PARTS

/** 同一個部件的別的寫法：顏色、來歷跟本尊一樣 */
export const PART_ALIASES = {
  手: '扌', 水: '氵', 人: '亻', 犭: '豸', 忄: '心', 灬: '火', 罒: '目',
} as const satisfies Record<string, PartName>

/**
 * 常見的組合部件：可以拆成兩組（各用各的顏色），也可以合成一組（用第一個部件的顏色）。
 * 苗＝艹＋田：田裡長出來的小草苗（「貓」的聲音也從這裡來）。
 */
export const PART_COMBOS = {
  苗: ['艹', '田'],
} as const satisfies Record<string, readonly PartName[]>

type Name = PartName | keyof typeof PART_ALIASES | keyof typeof PART_COMBOS

/** 查部件：別的寫法、組合部件都可以查（組合部件給第一個部件） */
export function partOf(name: Name): Part {
  if (name in PART_ALIASES) return PARTS[PART_ALIASES[name as keyof typeof PART_ALIASES]]
  if (name in PART_COMBOS) return PARTS[PART_COMBOS[name as keyof typeof PART_COMBOS][0]]
  return PARTS[name as PartName]
}

/** 部件的固定顏色（劇本 builds 的 color 用這個） */
export const partColor = (name: Name) => partOf(name).color
