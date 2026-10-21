import type { CharEntry } from '../src/types'

export const LINES: {
  townHello: (char: string) => string
  townWord: (char: string, word: string) => string
  feedAsk: (char: string) => string
  feedNotThis: (char: string) => string
  puzzleAsk: (char: string, word: string) => string
  puzzleAll: (char: string) => string
  riverJump: (char: string) => string
}
export const FIXED_LINES: Record<'feedHungry' | 'feedFull' | 'feedRecap' | 'feedSwell' | 'feedBoom' | 'feedAgain' | 'feedSleepy' | 'feedSnore' | 'feedWake' | 'feedBloat' | 'feedBurp' | 'feedFly' | 'feedWarm' | 'feedMagic' | 'feedRainbow' | 'riverStart' | 'riverArrive' | 'riverRecap' | 'riverPerfect' | 'guessWho' | 'guessFast' | 'spyRecap' | 'spyPerfect'
  | 'nudgeFirst' | 'nudgeToday' | 'nudgeLab' | 'nudgeTrain' | 'nudgePuzzle' | 'nudgeMore'
  | 'nudgeFeedDue' | 'nudgeRiverDue' | 'nudgeChest' | 'nudgeStars' | 'nudgeNearly'
  | 'nudgeDoWatch' | 'nudgeDoWrite' | 'nudgeDoRecall' | 'nudgeDoPuzzle' | 'nudgeDoBrew'
  | 'labHello' | 'trainHello' | 'chestOpen' | 'crownFull' | 'questsDone' | 'puzzleHello' | 'puzzleRecap' | 'puzzleNew' | 'puzzlePicture' | 'puzzlePerfect', string>
export function linesForEntry(entry: Pick<CharEntry, 'char' | 'words' | 'concept'>): string[]
