import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useActiveGame, useQuestionCountdown } from '@/entities/active-game'
import { findPlayer } from '@/entities/player'
import { getSessionUserId } from '@/entities/session'
import { Button, Input } from '@/shared/ui'

interface AnswerValues {
  answer: string
}

const defaultValues: AnswerValues = { answer: '' }

export function SubmitAnswerForm() {
  const { session, myAnswer, sendMessage } = useActiveGame()
  const remaining = useQuestionCountdown()
  const timeUp = remaining === 0
  // The server never broadcasts answer texts before the reveal, so the player's
  // own answers are kept locally to survive a reconnect
  const myAnswers = useRef(new Map<string, string>())

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues })

  const question = session?.question ?? null
  const isOpen = session?.state === 'question_open'
  const me = findPlayer(session?.players ?? [], getSessionUserId())
  // after a reload the local map is empty, but the server echoes the stored
  // answer on rejoin (ANSWER_ACCEPTED)
  const remembered = question
    ? (myAnswers.current.get(question.id) ??
      (myAnswer?.questionId === question.id ? myAnswer.text : ''))
    : ''
  const answered = Boolean(
    (question && myAnswer?.questionId === question.id) ||
      me?.answered ||
      remembered,
  )

  useEffect(() => {
    reset({ answer: remembered })
  }, [question?.id, myAnswer?.text])

  const handleSend = ({ answer }: AnswerValues) => {
    if (!question || !isOpen || timeUp) return

    myAnswers.current.set(question.id, answer)
    sendMessage?.({
      type: 'ANSWER_QUESTION',
      payload: { questionId: question.id, answer },
    })
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(handleSend)}>
      <Input
        data-testid="answer-input"
        className="h-12 text-lg"
        aria-invalid={Boolean(errors.answer)}
        placeholder="Type your answer here!"
        disabled={!isOpen || answered || timeUp}
        {...register('answer', { required: "You can't submit empty answer" })}
        type="text"
      />
      {errors.answer && (
        <p role="alert" className="text-destructive">
          {errors.answer.message}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {timeUp && !answered
          ? 'Time is up — the question is closed.'
          : answered
            ? 'Your answer has been accepted.'
            : 'After submitting the answer you will not be able to change it.'}
      </p>
      <Button
        data-testid="submit-answer-button"
        disabled={!isOpen || answered || timeUp}
        type="submit"
        size="lg"
        className="w-full font-bold"
      >
        Send
      </Button>
    </form>
  )
}
