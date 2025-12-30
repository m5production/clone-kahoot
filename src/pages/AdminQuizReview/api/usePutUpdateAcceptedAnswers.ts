import { axiosInstance } from "@/constants"
import { AcceptedAnswer, RawAcceptedAnswer } from "@/types/AcceptedAnswer"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "react-toastify"

export const putUpdateAcceptedAnswers = async (
  questionId: string,
  newAnswers: RawAcceptedAnswer[]
) => {
  const query = new URLSearchParams({ questionId })

  const questionData = await axiosInstance.put<AcceptedAnswer[]>(
    `/accepted-answers/?${query.toString()}`,
    newAnswers
  )

  return questionData.data
}

type MutateVars = { questionId: string; newAnswers: RawAcceptedAnswer[] }

export const usePutUpdateAcceptedAnswers = () => {
  const queryClient = useQueryClient()

  return useMutation<AcceptedAnswer[], AxiosError, MutateVars>({
    mutationFn: ({ questionId, newAnswers }) =>
      putUpdateAcceptedAnswers(questionId, newAnswers),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["accepted-answers", questionId],
      })
    },
    onError: (e) => {
      toast(String(e.response?.data))
    },
  })
}
