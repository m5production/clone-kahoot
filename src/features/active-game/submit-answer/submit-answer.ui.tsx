import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useActiveGame } from '@/entities/active-game'
import { findPlayerAnswer } from '@/entities/player'
import { getSessionUserId } from '@/entities/session'
import { Button, Input } from '@/shared/ui'

interface AnswerValues {
  answer: string
}

const defaultValues: AnswerValues = { answer: '' }

export function SubmitAnswerForm() {
  const { activeQuestion, players, sendMessage } = useActiveGame()
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false)
  // The server never returns the answer text, so the player's own answers are kept locally
  const myAnswers = useRef(new Map<string, string>())

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues })

  useEffect(() => {
    const userId = getSessionUserId()
    const currentPlayer = players.find(({ id }) => userId && userId === id)

    if (!currentPlayer) {
      return
    }

    const currentAnswer = activeQuestion
      ? findPlayerAnswer(currentPlayer, activeQuestion.id)
      : undefined
    const remembered = activeQuestion
      ? (myAnswers.current.get(activeQuestion.id) ?? '')
      : ''

    reset({ answer: remembered })
    setIsQuestionAnswered(Boolean(currentAnswer ?? remembered))
  }, [activeQuestion])

  const handleSend = ({ answer }: AnswerValues) => {
    if (!activeQuestion) return

    myAnswers.current.set(activeQuestion.id, answer)
    sendMessage?.({
      type: 'ANSWER_QUESTION',
      payload: { questionId: activeQuestion.id, answer },
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        data-testid="answer-input"
        className="h-12 text-lg"
        aria-invalid={Boolean(errors.answer)}
        placeholder="Type your answer here!"
        disabled={isQuestionAnswered}
        {...register('answer', { required: "You can't submit empty answer" })}
        type="text"
      />
      {errors.answer && (
        <p className="text-destructive">
          "Please enter your answer. It is not allowed to submit empty answer"
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        After submitting the answer you will not be able to change it.
      </p>
      <Button
        data-testid="submit-answer-button"
        disabled={isQuestionAnswered}
        type="button"
        size="lg"
        className="w-full font-bold"
        onClick={handleSubmit(handleSend)}
      >
        Send
      </Button>
    </div>
  )
}
