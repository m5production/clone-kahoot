export interface SelectedQuestion {
  id: string
  number: number
}

/** D-10: the mobile editor shows one section at a time — the question list or
    the editor of the selected question */
export type EditorSection = 'questions' | 'question'

export interface EditorLayoutProps {
  gameId: string
  isReady: boolean
  selectedQuestion: SelectedQuestion | undefined
  onSelectQuestion: (question: SelectedQuestion) => void
  onDeleteSelected: () => void
}
