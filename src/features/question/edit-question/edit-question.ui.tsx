import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ACCEPTED_ANSWERS_QUERY } from '@/entities/accepted-answer'
import { ANSWER_OPTIONS_QUERY } from '@/entities/answer-option'
import { QUESTION_QUERY, type QuestionType } from '@/entities/question'
import { cn } from '@/shared/lib'
import { Button, ImgWithPlaceholder, Input, Label } from '@/shared/ui'
import {
  duplicateAnswerIndexes,
  duplicateOptionIndexes,
  EMPTY_QUESTION_FORM,
  type QuestionFormValues,
  toAcceptedAnswersPayload,
  toAnswerOptionsPayload,
  toQuestionFormValues,
  toQuestionPayload,
} from './edit-question.lib'
import { useSaveQuestionMutation } from './edit-question.mutation'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 4
const MAX_ACCEPTED_ANSWERS = 10

type Props = Omit<React.ComponentProps<'form'>, 'onSubmit'> & {
  questionId: string
  questionNumber: number
}

export function EditQuestionForm({
  questionId,
  questionNumber,
  ...props
}: Props) {
  const { mutate: saveQuestion, isPending: isSaving } =
    useSaveQuestionMutation()

  const { data: question } = useQuery(QUESTION_QUERY.queryOptions(questionId))
  const { data: answers } = useQuery(
    ACCEPTED_ANSWERS_QUERY.queryOptions(questionId),
  )
  const { data: options } = useQuery(
    ANSWER_OPTIONS_QUERY.queryOptions(questionId),
  )

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<QuestionFormValues>({ defaultValues: EMPTY_QUESTION_FORM })

  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray({ control, name: 'answers' })
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control, name: 'options' })

  const imageUrl = watch('img')
  const type = watch('type')
  const watchedOptions = watch('options')

  // The question whose data the form shows; until then the form is busy and edits would be lost
  const [filledQuestionId, setFilledQuestionId] = useState<string>()
  // D-12: switching the type with a non-empty other set asks for confirmation
  const [pendingType, setPendingType] = useState<QuestionType | null>(null)

  useEffect(() => {
    if (question && answers && options) {
      reset(toQuestionFormValues(question, answers, options))
      setFilledQuestionId(question.id)
    }
  }, [question, answers, options])

  const handleTypeClick = (next: QuestionType) => {
    if (next === type) return
    // the set of the type being left is dropped on save — ask first when the
    // editor holds any data in it
    const otherHasData =
      next === 'choice'
        ? getValues('answers').some(({ answerText }) => answerText.trim())
        : getValues('options').some(({ optionText }) => optionText.trim())
    if (otherHasData) {
      setPendingType(next)
    } else {
      setValue('type', next)
    }
  }

  const handleTypeConfirm = () => {
    setValue('type', pendingType ?? type)
    setPendingType(null)
  }

  const markCorrect = (index: number) => {
    getValues('options').forEach((_, i) => {
      setValue(`options.${i}.isCorrect`, i === index, {
        shouldValidate: false,
      })
    })
  }

  const handleSave = (values: QuestionFormValues) => {
    if (values.type === 'choice') {
      // FR-100/BR-86: 2-4 options, exactly one correct, no duplicates
      if (values.options.length < MIN_OPTIONS) {
        setError('options', {
          type: 'required',
          message: 'A choice question needs at least two options',
        })
        return
      }
      if (!values.options.some((option) => option.isCorrect)) {
        setError('options', {
          type: 'validate',
          message: 'Mark one option as correct',
        })
        return
      }
      const duplicates = duplicateOptionIndexes(values)
      for (const index of duplicates) {
        setError(`options.${index}.optionText`, {
          type: 'validate',
          message: 'This option duplicates another one',
        })
      }
      if (duplicates.length) return

      saveQuestion(
        {
          question: toQuestionPayload(values, { id: questionId }),
          options: toAnswerOptionsPayload(values),
        },
        {
          onSuccess: () => {
            toast.success('Question saved successfully')
          },
        },
      )
      return
    }

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

    saveQuestion(
      {
        question: toQuestionPayload(values, { id: questionId }),
        answers: toAcceptedAnswersPayload(values, questionId),
      },
      {
        onSuccess: () => {
          toast.success('Question saved successfully')
        },
      },
    )
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
        aria-label="Image url"
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
          aria-label="Question text"
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
          <p role="alert" className="self-start text-destructive">
            {errors.text.message}
          </p>
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

      {/* FR-98: the question type decides which answers the host edits — a
          free-text list or 2-4 options with one correct */}
      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-medium">Answer type</h4>
        <fieldset
          data-testid="question-type-tabs"
          aria-label="Question type"
          className="flex w-fit gap-1 rounded-lg border p-1"
        >
          <button
            type="button"
            data-testid="open-tab"
            aria-pressed={type === 'open'}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              type === 'open'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
            onClick={() => handleTypeClick('open')}
          >
            Text answer
          </button>
          <button
            type="button"
            data-testid="choice-tab"
            aria-pressed={type === 'choice'}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              type === 'choice'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
            onClick={() => handleTypeClick('choice')}
          >
            Multiple choice
          </button>
        </fieldset>
        {pendingType && (
          <p
            data-testid="type-switch-confirm"
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            Switching the type removes the{' '}
            {pendingType === 'choice' ? 'accepted answers' : 'answer options'}.
            <Button
              data-testid="confirm-type-switch-button"
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleTypeConfirm}
            >
              Switch
            </Button>
            <Button
              data-testid="cancel-type-switch-button"
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setPendingType(null)}
            >
              Cancel
            </Button>
          </p>
        )}
      </section>

      {type === 'choice' ? (
        <section className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold">Answer options</h4>

          {errors.options?.message && (
            <p role="alert" className="text-destructive">
              {errors.options.message}
            </p>
          )}

          <ul data-testid="answer-options-list" className="flex flex-col gap-3">
            {optionFields.map((field, index) => (
              <li
                key={field.id}
                data-testid={`answer-option-item-${index}`}
                className="flex items-start gap-2"
              >
                <input
                  type="radio"
                  data-testid="correct-option-input"
                  name="correct-option"
                  aria-label={`Option ${index + 1} is correct`}
                  className="mt-3 size-5 shrink-0 accent-success"
                  checked={watchedOptions[index]?.isCorrect ?? false}
                  onChange={() => markCorrect(index)}
                />
                <Label className="flex flex-1 flex-col gap-1">
                  <Input
                    data-testid="answer-option-input"
                    className="h-11"
                    placeholder={`Option ${index + 1}`}
                    aria-label={`Option ${index + 1}`}
                    {...register(`options.${index}.optionText`, {
                      required: 'Empty option is not accepted',
                      maxLength: {
                        value: 100,
                        message: 'Option must be at most 100 characters',
                      },
                      validate: (value) =>
                        value.trim().length > 0 ||
                        'Empty option is not accepted',
                    })}
                    aria-invalid={Boolean(errors.options?.[index]?.optionText)}
                  />
                  {errors.options?.[index]?.optionText && (
                    <p role="alert" className="self-start text-destructive">
                      {errors.options[index].optionText.message}
                    </p>
                  )}
                </Label>

                <Button
                  data-testid="remove-option-button"
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={optionFields.length <= MIN_OPTIONS}
                  title={
                    optionFields.length <= MIN_OPTIONS
                      ? 'A choice question needs at least two options'
                      : undefined
                  }
                  onClick={() => removeOption(index)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
          <Button
            data-testid="add-option-button"
            type="button"
            variant="outline"
            className="w-fit border-dashed"
            disabled={optionFields.length >= MAX_OPTIONS}
            title={
              optionFields.length >= MAX_OPTIONS
                ? 'A choice question can have at most 4 options'
                : undefined
            }
            onClick={() => {
              clearErrors('options')
              appendOption({ optionText: '', isCorrect: false })
            }}
          >
            Add one more option
          </Button>
        </section>
      ) : (
        <section className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold">Accepted answers</h4>

          {errors.answers?.message && (
            <p role="alert" className="text-destructive">
              {errors.answers.message}
            </p>
          )}

          <ul
            data-testid="accepted-answers-list"
            className="flex flex-col gap-3"
          >
            {answerFields.map((field, index) => (
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
                    aria-label={`Accepted answer ${index + 1}`}
                    {...register(`answers.${index}.answerText`, {
                      required: 'Empty answer is not accepted',
                      maxLength: {
                        value: 100,
                        message: 'Answer must be at most 100 characters',
                      },
                      validate: (value) =>
                        value.trim().length > 0 ||
                        'Empty answer is not accepted',
                    })}
                    aria-invalid={Boolean(errors.answers?.[index]?.answerText)}
                  />
                  {errors.answers?.[index]?.answerText && (
                    <p role="alert" className="self-start text-destructive">
                      {errors.answers[index].answerText.message}
                    </p>
                  )}
                </Label>

                <Button
                  data-testid="remove-answer-button"
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeAnswer(index)}
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
            disabled={answerFields.length >= MAX_ACCEPTED_ANSWERS}
            title={
              answerFields.length >= MAX_ACCEPTED_ANSWERS
                ? 'A question can have at most 10 accepted answers'
                : undefined
            }
            onClick={() => {
              clearErrors('answers')
              appendAnswer({ answerText: '' })
            }}
          >
            Add one more answer
          </Button>
        </section>
      )}

      <Button
        data-testid="save-question-button"
        type="submit"
        size="lg"
        className="w-fit font-bold"
        disabled={isSaving}
      >
        Save question
      </Button>
    </form>
  )
}
