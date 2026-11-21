import { ListTodo, SquarePen } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'
import type { EditorSection, SelectedQuestion } from './quiz-editor.types'

type Props = {
  section: EditorSection
  onSectionChange: (section: EditorSection) => void
  selectedQuestion: SelectedQuestion | undefined
  /** not game-ready questions, shown as a badge on the Questions tab (FR-90) */
  incompleteCount: number
}

/** D-10, FR-88: the bottom app bar switching between the question list and the
    selected question on narrow screens; tap zones ≥44px (NFR-U7) */
export function EditorNavBar({
  section,
  onSectionChange,
  selectedQuestion,
  incompleteCount,
}: Props) {
  return (
    <nav
      data-testid="editor-nav-bar"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex h-16">
        <NavTab
          testId="questions-tab"
          active={section === 'questions'}
          onClick={() => onSectionChange('questions')}
        >
          <ListTodo />
          <span className="flex items-center gap-1.5">
            Questions
            {incompleteCount > 0 && (
              <span className="rounded-full bg-amber-500 min-w-5 px-1 py-0.5 text-center text-[10px] leading-none font-bold text-white">
                {incompleteCount}
              </span>
            )}
          </span>
        </NavTab>
        <NavTab
          testId="question-tab"
          active={section === 'question'}
          onClick={() => onSectionChange('question')}
        >
          <SquarePen />
          <span className="truncate">
            {selectedQuestion
              ? `Question ${selectedQuestion.number}`
              : 'Question'}
          </span>
        </NavTab>
      </div>
    </nav>
  )
}

function NavTab({
  testId,
  active,
  onClick,
  children,
}: {
  testId: string
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium [&_svg]:size-5',
        active ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      {children}
    </button>
  )
}
