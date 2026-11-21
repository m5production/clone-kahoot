import { useState } from 'react'
import { useActiveGame, useQuestionCountdown } from '@/entities/active-game'
import { optionColorClass } from '@/entities/answer-option'
import { findPlayer } from '@/entities/player'
import { getSessionUserId } from '@/entities/session'
import { cn } from '@/shared/lib'

/** FR-101/US-36: the choice question is answered by picking one of the colored
    option buttons — one tap sends the pick and locks the whole set (BR-87) */
export function AnswerOptionButtons() {
  const { session, myAnswer, sendMessage } = useActiveGame()
  const remaining = useQuestionCountdown()
  const timeUp = remaining === 0
  // the server never broadcasts picks before the reveal, so the player's own
  // choice is kept locally to lock the buttons instantly and survive a redraw
  const [pick, setPick] = useState<{
    questionId: string
    optionId: string
  } | null>(null)

  const question = session?.question ?? null
  const isOpen = session?.state === 'question_open'
  const me = findPlayer(session?.players ?? [], getSessionUserId())
  // after a reload the local pick is empty, but the server echoes the stored
  // one on rejoin (ANSWER_ACCEPTED with optionId)
  const picked = question
    ? ((pick?.questionId === question.id ? pick.optionId : undefined) ??
      (myAnswer?.questionId === question.id ? myAnswer.optionId : undefined))
    : undefined
  const answered = Boolean(
    (question && myAnswer?.questionId === question.id) ||
      me?.answered ||
      picked,
  )

  const options = question?.type === 'choice' ? (question.options ?? []) : []

  const handlePick = (optionId: string) => {
    if (!question || !isOpen || answered || timeUp) return

    setPick({ questionId: question.id, optionId })
    sendMessage?.({
      type: 'ANSWER_QUESTION',
      payload: { questionId: question.id, optionId },
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, index) => (
          <li key={option.id}>
            <button
              type="button"
              data-testid={`answer-option-${index}`}
              disabled={!isOpen || answered || timeUp}
              aria-pressed={picked === option.id}
              className={cn(
                'w-full rounded-xl px-4 py-4 text-center text-lg font-bold text-white shadow-md transition',
                optionColorClass(index),
                'enabled:hover:brightness-110 disabled:opacity-60',
                picked === option.id && 'ring-4 ring-white/80',
              )}
              onClick={() => handlePick(option.id)}
            >
              {option.text}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        {timeUp && !answered
          ? 'Time is up — the question is closed.'
          : answered
            ? 'Your answer has been accepted.'
            : 'After submitting the answer you will not be able to change it.'}
      </p>
    </div>
  )
}
