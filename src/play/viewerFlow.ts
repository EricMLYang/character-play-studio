/**
 * 觀看層的流程：看素材（或字卡動畫一段段演）→ 看完 → 換他描字 → 描完搬進小鎮 → 再看一次。
 * 全部狀態收在一個 reducer：每一步會改到哪些東西一眼看得到，要在中間插一段新的（例如看完接小遊戲）
 * 也是在這裡加一種動作，不用在元件裡追十幾個 useState。
 *
 * 字卡動畫（沒有任何素材的字）的階段：emoji 登場 → 變成國字 → 定格 → 一筆一畫寫出來。
 */
export type Phase = 'object' | 'morph' | 'hold' | 'write' | 'finished'
export type Moved = 'in' | 'grow' | 'crown'

export type Flow = {
  /** 第幾輪；「再看一次」+1，素材與計時器跟著重來 */
  round: number
  phase: Phase
  /** 這一輪已經算看過一次 */
  done: boolean
  /** 描字面板開著（有素材的字看完自動開，也可以手動切） */
  trace: boolean
  /** 這一輪描完了 */
  traced: boolean
  /** 描完那一刻要說什麼：搬進小鎮、長大一號、戴皇冠；null＝這次沒有要講的（照著再描一次） */
  moved: Moved | null
  /** 這個字沒有筆順資料，退回純字卡動畫 */
  noStrokes: boolean
}

export type FlowAction =
  | { type: 'phase'; phase: Phase }
  | { type: 'finish' }
  | { type: 'trace'; on?: boolean }
  | { type: 'traced'; moved: Moved | null }
  | { type: 'noStrokes' }
  | { type: 'replay' }

export const initialFlow: Flow = { round: 0, phase: 'object', done: false, trace: false, traced: false, moved: null, noStrokes: false }

export function flow(state: Flow, action: FlowAction): Flow {
  switch (action.type) {
    case 'phase': return { ...state, phase: action.phase }
    // 'write' 要留著：描字面板就掛在這個階段，換成 finished 會在示範播完的瞬間把它收掉
    case 'finish': return { ...state, done: true, phase: state.phase === 'write' ? 'write' : 'finished' }
    case 'trace': return { ...state, trace: action.on ?? !state.trace }
    case 'traced': return { ...state, traced: true, moved: action.moved }
    case 'noStrokes': return { ...state, noStrokes: true }
    case 'replay': return { ...initialFlow, round: state.round + 1 }
  }
}
