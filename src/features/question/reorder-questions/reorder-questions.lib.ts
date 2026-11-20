import type { Question } from '@/entities/question'

/** FR-54: the reordered id list after moving the item at `index` one step,
    or null when the move is out of bounds */
export const moveQuestion = (
  questions: Pick<Question, 'id'>[],
  index: number,
  direction: -1 | 1,
): string[] | null => {
  const target = index + direction
  if (index < 0 || target < 0 || target >= questions.length) return null

  const ids = questions.map(({ id }) => id)
  const moved = ids[index]
  ids[index] = ids[target]
  ids[target] = moved
  return ids
}
