import { useQuery } from "@tanstack/react-query"
import { axiosInstance } from "@/constants"
import { AcceptedAnswer } from "@/types/AcceptedAnswer"
import { AxiosError } from "axios"
import { toast } from "react-toastify"

const getAcceptedAnswersByQuestionId = async (questionId: string) => {
  try {
    const query = new URLSearchParams({ questionId })
    const questionData = await axiosInstance.get<AcceptedAnswer[]>(
      `/accepted-answers?${query.toString()}`
    )

    return questionData.data
  } catch (e) {
    if (!(e instanceof AxiosError)) {
      throw e
    }

    toast(String(e.response?.data))

    return
  }
}

export const useGetAcceptedAnswersByQuestionId = <T = AcceptedAnswer[]>(
  questionId?: string,
  select?: (data: AcceptedAnswer[] | undefined) => T
) =>
  useQuery({
    enabled: Boolean(questionId),
    queryKey: ["accepted-answers", questionId],
    queryFn: () => getAcceptedAnswersByQuestionId(questionId!),
    select,
  })
