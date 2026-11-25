export type StoryOption = { char: string; emoji: string; text: string; ok?: boolean }
export type ReadPage = { id: string; text: string }
export type ChoicePage = { id: string; ask: string; options: StoryOption[]; all?: boolean }
export type StoryPage = ReadPage | ChoicePage
/** hero：public/hero/ 的主角（封面、今天的路）；cover：主演只有道具圖時封面改用這兩張（'prop:<名字>'） */
export type Story = { id: string; title: string; hero: string; cover?: { idle: string; happy: string }; emoji: string; pages: StoryPage[] }
export type Sticker = { beat: string; char: string; emoji: string }

export const BLANK: string
export const STORIES: Story[]
export function storyById(id: string): Story | undefined
export function coverOf(story: Story, open?: boolean): string
export const STORY_NAMES: string[]
export function isChoice(page: StoryPage): page is ChoicePage
export function beatOf(page: StoryPage, option?: StoryOption): string
export function filled(page: ChoicePage, option: StoryOption): string
export function askLead(page: ChoicePage): string
export function advances(page: ChoicePage, option: StoryOption): boolean
export function beatsOf(story: Story): string[]
export function stickersOf(story: Story): Sticker[]
export function choiceChars(story: Story): string[]
export function storyChars(story: Story): string[]
export function storiesNeeding(char: string): Story[]
export const STORY_FIXED: {
  storyHello: string; storyChoose: string; storyChooseShort: string; storyAgain: string; storyMore: string; storyDone: string
  storyNewSticker: string; storyUnseen: string; storyAll: string; storyYourTurn: string; storyLocked: string; storyTapChar: string
}
export function storyLines(): string[]
export function validStory(event: { char?: unknown; beat?: unknown; done?: unknown }): boolean
