import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ACCEPTED_ANSWERS_QUERY } from '@/entities/accepted-answer'
import { QUESTION_QUERY } from '@/entities/question'
import { Button, ImgWithPlaceholder, Input, Label } from '@/shared/ui'
import {
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

    updateQuestion(toQuestionPayload(values, { id: questionId }), {
      onSuccess: () => {
        toast.success('Question updated successfully')
      },
    })

    replaceAcceptedAnswers(
      { questionId, answers: toAcceptedAnswersPayload(values, questionId) },
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
      <h3 className="text-4xl mt-4">Question #{questionNumber}</h3>
      <Input
        data-testid="question-image-input"
        placeholder="Insert image url"
        {...register('img')}
      />

      {imageUrl && (
        <ImgWithPlaceholder
          className="mx-auto"
          alt="Question illustration"
          width={400}
          height={400}
          src={imageUrl}
        />
      )}

      <Label className="flex flex-col">
        <Input
          data-testid="question-text-input"
          placeholder="Type in question text"
          {...register('text', { required: 'Question text must present' })}
        />
        {errors.text && (
          <p className="self-start text-red-400">{errors.text.message}</p>
        )}
      </Label>

      <section className="flex flex-col gap-4">
        <h4 className="text-2xl">Type accepted answers</h4>

        {errors.answers?.message && (
          <p className="text-red-400">{errors.answers.message}</p>
        )}

        <ul data-testid="accepted-answers-list" className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <li
              key={field.id}
              data-testid={`accepted-answer-item-${index}`}
              className="flex gap-4"
            >
              <Label className="flex flex-col">
                <Input
                  data-testid="accepted-answer-input"
                  placeholder="Accepted answer"
                  {...register(`answers.${index}.answerText`, {
                    required: 'Empty answer is not accepted',
                  })}
                />
                {errors.answers?.[index]?.answerText && (
                  <p className="self-start text-red-400">
                    {errors.answers[index].answerText.message}
                  </p>
                )}
              </Label>

              <Button
                data-testid="remove-answer-button"
                type="button"
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
          className="w-50"
          onClick={handleAddAnswerClick}
        >
          Add one more answer
        </Button>
      </section>

      <Button data-testid="save-question-button" type="submit">
        Add (update) question to the Quiz
      </Button>
    </form>
  )
}
