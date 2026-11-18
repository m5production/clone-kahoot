import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Input } from '@/shared/ui'
import { useActiveGame } from '@/entities/active-game'
import { findPlayerAnswer } from '@/entities/player'
import { getSessionUserId } from '@/entities/session'

interface AnswerValues {
  answer: string
}

const defaultValues: AnswerValues = { answer: '' }

export function SubmitAnswerForm() {
  const { activeQuestion, players, sendMessage } = useActiveGame()
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { isSubmitSuccessful, errors },
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

    reset({ answer: currentAnswer?.text || '' })
    setIsQuestionAnswered(Boolean(currentAnswer))
  }, [activeQuestion])

  useEffect(() => {
    reset()
  }, [isSubmitSuccessful])

  const handleSend = ({ answer }: AnswerValues) => {
    sendMessage?.({
      type: 'ANSWER_QUESTION',
      payload: {
        questionId: activeQuestion?.id,
        answer,
        playerId: getSessionUserId(),
      },
    })
  }

  return (
    <>
      <Input
        data-testid="answer-input"
        aria-invalid={Boolean(errors.answer)}
        placeholder="Type your answer here!"
        disabled={isQuestionAnswered}
        {...register('answer', { required: "You can't submit empty answer" })}
        type="text"
      />
      {errors.answer && (
        <p className="text-red-300">
          "Please enter your answer. It is not allowed to submit empty answer"
        </p>
      )}
      <p>After submitting the answer you will not be able to change it.</p>
      <Button
        data-testid="submit-answer-button"
        disabled={isQuestionAnswered}
        type="button"
        onClick={handleSubmit(handleSend)}
      >
        Send
      </Button>
    </>
  )
}
