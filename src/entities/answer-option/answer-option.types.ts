/** D-11: an answer option of a 'choice' question, shown in a fixed order (D-13) */
export interface AnswerOption {
  id: string
  questionId: string
  order: number
  text: string
  isCorrect: boolean
}

export type RawAnswerOption = Pick<AnswerOption, 'text' | 'isCorrect'>

/** A mark on an option shown after the reveal: correct and/or the viewer's pick */
export interface OptionMark {
  text: string
  correct?: boolean
  selected?: boolean
}
