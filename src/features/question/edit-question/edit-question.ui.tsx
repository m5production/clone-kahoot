import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ACCEPTED_ANSWERS_QUERY } from '@/entities/accepted-answer'
import { QUESTION_QUERY } from '@/entities/question'
import { Button, ImgWithPlaceholder, Input, Label } from '@/shared/ui'
import {
  duplicateAnswerIndexes,
  EMPTY_QUESTION_FORM,
  type QuestionFormValues,
  toAcceptedAnswersPayload,
  toQuestionFormValues,
  toQuestionPayload,
} from './edit-question.lib'
import {
  useReplaceAcceptedAnswersMutation,
  useUpdateQuestionMutation,
} from './edit-question.mutation'

type Props = Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  questionId: string
  questionNumber: number
}

export function EditQuestionForm({
  questionId,
  questionNumber,
  ...props
}: Props) {
  const { mutate: updateQuestion } = useUpdateQuestionMutation()
  const { mutate: replaceAcceptedAnswers } = useReplaceAcceptedAnswersMutation()

  const { data: question } = useQuery(QUESTION_QUERY.queryOptions(questionId))
  const { data: answers } = useQuery(
    ACCEPTED_ANSWERS_QUERY.queryOptions(questionId),
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<QuestionFormValues>({ defaultValues: EMPTY_QUESTION_FORM })

  const { fields, append, remove } = useFieldArray({ control, name: 'answers' })

  const imageUrl = watch('img')

  // The question whose data the form shows; until then the form is busy and edits would be lost
  const [filledQuestionId, setFilledQuestionId] = useState<string>()

  useEffect(() => {
    if (question && answers) {
      reset(toQuestionFormValues(question, answers))
      setFilledQuestionId(question.id)
    }
  }, [question, answers])

  const handleSave = (values: QuestionFormValues) => {
    if (!values.answers.length) {
      setError('answers', {
        type: 'required',
        message: 'There should be at least one correct answer',
      })
      return
    }

    const duplicates = duplicateAnswerIndexes(values)
    for (const index of duplicates) {
      setError(`answers.${index}.answerText`, {
        type: 'validate',
        message: 'This answer duplicates another one',
      })
    }
    if (duplicates.length) return

    updateQuestion(toQuestionPayload(values, { id: questionId }), {
      onSuccess: () => {
        toast.success('Question updated successfully')
      },
    })

    replaceAcceptedAnswers(
      {
        questionId,
        gameId: question?.gameId,
        answers: toAcceptedAnswersPayload(values, questionId),
      },
      {
        onSuccess: () => {
          toast.success('Accepted answers updated successfully')
        },
      },
    )
  }

  const handleAddAnswerClick = () => {
    clearErrors('answers')
    append({ answerText: '' })
  }

  return (
    <form
      data-testid="question-form"
      aria-busy={filledQuestionId !== questionId}
      {...props}
      onSubmit={handleSubmit(handleSave)}
    >
      <h3 className="text-2xl font-bold">Question #{questionNumber}</h3>
      <Input
        data-testid="question-image-input"
        className="h-11"
        placeholder="Insert image url"
        {...register('img')}
      />

      {imageUrl && (
        <ImgWithPlaceholder
          className="mx-auto rounded-xl"
          alt="Question illustration"
          width={400}
          height={400}
          src={imageUrl}
        />
      )}

      <Label className="flex flex-col gap-1">
        <Input
          data-testid="question-text-input"
          className="h-12 text-lg font-medium"
          placeholder="Type in question text"
          {...register('text', {
            required: 'Question text must present',
            maxLength: {
              value: 300,
              message: 'Question text must be at most 300 characters',
            },
          })}
          aria-invalid={Boolean(errors.text)}
        />
        {errors.text && (
          <p className="self-start text-destructive">{errors.text.message}</p>
        )}
      </Label>

      <Label className="flex w-fit flex-col gap-1 text-sm font-medium">
        Time to answer
        <select
          data-testid="question-time-limit-select"
          className="h-9 rounded-md border bg-background px-3"
          {...register('timeLimitSec')}
        >
          {[10, 20, 30, 60, 90, 120].map((seconds) => (
            <option key={seconds} value={seconds}>
              {seconds} seconds
            </option>
          ))}
        </select>
      </Label>

      <section className="flex flex-col gap-4">
        <h4 className="text-lg font-semibold">Accepted answers</h4>

        {errors.answers?.message && (
          <p className="text-destructive">{errors.answers.message}</p>
        )}

        <ul data-testid="accepted-answers-list" className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <li
              key={field.id}
              data-testid={`accepted-answer-item-${index}`}
              className="flex items-start gap-2"
            >
              <Label className="flex flex-1 flex-col gap-1">
                <Input
                  data-testid="accepted-answer-input"
                  className="h-11"
                  placeholder="Accepted answer"
                  {...register(`answers.${index}.answerText`, {
                    required: 'Empty answer is not accepted',
                    maxLength: {
                      value: 100,
                      message: 'Answer must be at most 100 characters',
                    },
                    validate: (value) =>
                      value.trim().length > 0 || 'Empty answer is not accepted',
                  })}
                  aria-invalid={Boolean(errors.answers?.[index]?.answerText)}
                />
                {errors.answers?.[index]?.answerText && (
                  <p className="self-start text-destructive">
                    {errors.answers[index].answerText.message}
                  </p>
                )}
              </Label>

              <Button
                data-testid="remove-answer-button"
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <Button
          data-testid="add-answer-button"
          type="button"
          variant="outline"
          className="w-fit border-dashed"
          disabled={fields.length >= 10}
          title={
            fields.length >= 10
              ? 'A question can have at most 10 accepted answers'
              : undefined
          }
          onClick={handleAddAnswerClick}
        >
          Add one more answer
        </Button>
      </section>

      <Button
        data-testid="save-question-button"
        type="submit"
        size="lg"
        className="w-fit font-bold"
      >
        Save question
      </Button>
    </form>
  )
}
