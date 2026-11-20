import { useMutation } from '@tanstack/react-query'
import { reorderQuestions } from '@/entities/game'
import { GAME_QUESTIONS_QUERY, type Question } from '@/entities/question'
import { notifyApiError, queryClient } from '@/shared/api'

/** FR-54: optimistic reorder — the new order is applied immediately and
    rolled back when the server rejects it */
export const useReorderQuestionsMutation = (gameId: string) =>
  useMutation({
    mutationFn: (questionIds: string[]) =>
      reorderQuestions(gameId, questionIds),
    onMutate: async (questionIds) => {
      const queryKey = GAME_QUESTIONS_QUERY.queryKey(gameId)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Question[]>(queryKey)
      if (previous) {
        const byId = new Map(
          previous.map((question) => [question.id, question]),
        )
        queryClient.setQueryData(
          queryKey,
          questionIds
            .map((id) => byId.get(id))
            .filter((question): question is Question => Boolean(question)),
        )
      }
      return { previous }
    },
    onError: (error, _questionIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          GAME_QUESTIONS_QUERY.queryKey(gameId),
          context.previous,
        )
      }
      notifyApiError(error)
    },
    onSettled: () => {
      GAME_QUESTIONS_QUERY.invalidate(gameId)
    },
  })
