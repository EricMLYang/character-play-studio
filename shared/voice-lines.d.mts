import type { CharEntry } from '../src/types'

export const LINES: {
  townHello: (char: string) => string
  townWord: (char: string, word: string) => string
  feedAsk: (char: string) => string
  feedNotThis: (char: string) => string
  puzzleAsk: (char: string, word: string) => string
  puzzleAll: (char: string) => string
  }
export const FIXED_LINES: Record<'feedHungry' | 'feedFull' | 'feedRecap' | 'feedSwell' | 'feedBoom' | 'feedAgain' | 'feedSleepy' | 'feedSnore' | 'feedWake' | 'feedBloat' | 'feedBurp' | 'feedFly' | 'feedWarm' | 'feedMagic' | 'feedRainbow' | 'guessWho' | 'guessFast'
  | 'nudgeFirst' | 'nudgeToday' | 'nudgeLab' | 'nudgeTrain' | 'nudgePuzzle' | 'nudgeMore'
  | 'nudgeFeedDue' | 'nudgeChest' | 'nudgeStars' | 'nudgeNearly'
  | 'nudgeDoWatch' | 'nudgeDoWrite' | 'nudgeDoRecall' | 'nudgeDoPuzzle' | 'nudgeDoBrew' | 'nudgeDoFamily' | 'recallAsk' | 'blindInvite' | 'wroteBlind'
  | 'labHello' | 'trainHello' | 'chestOpen' | 'crownFull' | 'pathRecall' | 'pathNew' | 'pathFamily' | 'pathRead' | 'pathHome' | 'pathAllDone'
  | 'movedIn' | 'movedGrow' | 'movedCrown' | 'puzzleHello' | 'puzzleRecap' | 'puzzleNew' | 'puzzlePicture' | 'puzzlePerfect', string>
export const PARTNER_SERVES: string[]
export function linesForEntry(entry: Pick<CharEntry, 'char' | 'words' | 'concept'>): string[]
