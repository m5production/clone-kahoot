import { httpClient } from '@/shared/api'
import type { AnswerOption, RawAnswerOption } from './answer-option.types'

export const fetchAnswerOptions = async (questionId: string) => {
  const { data } = await httpClient.get<AnswerOption[]>('/options', {
    params: { questionId },
  })

  return data
}

/** BR-86: the whole option set is replaced at once; 2-4 items, one correct */
export const replaceAnswerOptions = async (
  questionId: string,
  options: RawAnswerOption[],
) => {
  const { data } = await httpClient.put<AnswerOption[]>('/options/', options, {
    params: { questionId },
  })

  return data
}
